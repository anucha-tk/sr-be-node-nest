import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Database,
  Zap,
  Share2,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Command,
  Info,
  Search,
} from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { PAGES } from '../config/pages';
import { API_BASE_URL } from '../api';

interface PulseEvent {
  id: string;
  type: 'KAFKA_PRODUCED' | 'KAFKA_CONSUMED' | 'DB_COMMIT' | 'TRACE_STARTED';
  label: string;
  timestamp: string;
  traceId?: string;
  metadata?: any;
}

export default function SystemPulseSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'pulse' | 'guide'>('pulse');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [events, setEvents] = useState<PulseEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<PulseEvent | null>(null);
  const { socket, isConnected } = useSocket();

  // 1. WebSocket Live Stream Integration
  useEffect(() => {
    if (!socket) return;

    const handleSystemPulse = (event: any) => {
      // Check if event type matches filter
      if (filterType !== 'ALL' && event.type !== filterType) {
        return;
      }

      setEvents((prev) => {
        // Prevent double insertion if already received via SSE
        const isDuplicate = prev.some(
          (e) =>
            (event.metadata?.eventId && e.metadata?.eventId === event.metadata.eventId) ||
            (e.label === event.label && e.timestamp === event.timestamp)
        );
        if (isDuplicate) return prev;

        return [
          {
            ...event,
            id: event.id || Math.random().toString(36).substr(2, 9),
          },
          ...prev.slice(0, 19),
        ];
      });
    };

    socket.on('system_pulse', handleSystemPulse);

    return () => {
      socket.off('system_pulse');
    };
  }, [socket, filterType]);

  // 2. Server-Sent Events (SSE) Live Stream Integration with Dynamic Filter Query Param
  useEffect(() => {
    const sseUrl =
      filterType === 'ALL'
        ? `${API_BASE_URL}/api/v1/activity/stream`
        : `${API_BASE_URL}/api/v1/activity/stream?type=${filterType}`;

    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        setEvents((prev) => {
          // Prevent duplicates (e.g. if websocket emitted it first)
          const isDuplicate = prev.some(
            (e) =>
              (parsedData.metadata?.eventId && e.metadata?.eventId === parsedData.metadata.eventId) ||
              (e.label === parsedData.label && e.timestamp === parsedData.timestamp)
          );
          if (isDuplicate) return prev;

          return [
            {
              id: parsedData.id || Math.random().toString(36).substr(2, 9),
              type: parsedData.type,
              label: parsedData.label,
              timestamp: parsedData.timestamp,
              traceId: parsedData.traceId,
              metadata: parsedData.metadata,
            },
            ...prev.slice(0, 19),
          ];
        });
      } catch (err) {
        console.error('Failed to parse SSE event:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn('SSE connection closed or re-connecting...', err);
    };

    return () => {
      eventSource.close();
    };
  }, [filterType]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'KAFKA_PRODUCED':
        return <Share2 size={16} className="text-blue-400" />;
      case 'KAFKA_CONSUMED':
        return <Zap size={16} className="text-yellow-400" />;
      case 'DB_COMMIT':
        return <Database size={16} className="text-green-400" />;
      case 'TRACE_STARTED':
        return <Activity size={16} className="text-purple-400" />;
      default:
        return <Clock size={16} />;
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full flex items-center z-[60]">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-panel p-2 -mr-1 rounded-l-xl border-r-0 shadow-[-4px_0_15px_rgba(0,0,0,0.1)] hover:bg-white/20 transition-colors cursor-pointer"
      >
        {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      <motion.aside
        initial={false}
        animate={{ width: isOpen ? 320 : 0, opacity: isOpen ? 1 : 0 }}
        className="glass-panel h-[calc(100vh-2rem)] m-4 ml-0 overflow-hidden flex flex-col border-l-primary/20 relative"
      >
        {/* Animated Slide-In Details Drawer */}
        <AnimatePresence>
          {selectedEvent && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-0 bg-slate-900/95 backdrop-blur-md text-white z-50 p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                  <h4 className="font-bold text-sm text-primary flex items-center gap-1.5">
                    <Activity size={16} /> Trace Details
                  </h4>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-all text-xs font-bold cursor-pointer"
                  >
                    CLOSE
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                      Event Type
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 uppercase">
                      {selectedEvent.type}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                      Label / Description
                    </span>
                    <p className="text-sm font-medium text-white">
                      {selectedEvent.label}
                    </p>
                  </div>

                  {selectedEvent.traceId && (
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                        Distributed Trace ID
                      </span>
                      <code className="text-xs bg-black/40 px-2 py-1 rounded block text-primary overflow-x-auto select-all">
                        {selectedEvent.traceId}
                      </code>
                    </div>
                  )}

                  {selectedEvent.metadata && typeof selectedEvent.metadata === 'object' && !Array.isArray(selectedEvent.metadata) && (
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        Metadata Details
                      </span>
                      <div className="bg-black/30 rounded-xl p-3 border border-white/5 space-y-2 text-xs">
                        {Object.entries(selectedEvent.metadata).map(([key, val]) => (
                          <div
                            key={key}
                            className="flex justify-between gap-2 border-b border-white/5 pb-1 last:border-0 last:pb-0"
                          >
                            <span className="text-slate-400 font-mono text-[10px]">{key}:</span>
                            <span className="font-medium text-white truncate max-w-[180px]">
                              {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {selectedEvent.traceId && (
                  <a
                    href={`http://localhost:16686/trace/${selectedEvent.traceId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-primary text-white hover:bg-primary/80 transition-colors flex items-center justify-center gap-1.5 font-bold text-xs shadow-lg shadow-primary/20"
                  >
                    <span>JAEGER DEEP DIVE</span>
                    <ExternalLink size={12} />
                  </a>
                )}
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="w-full py-2 rounded-xl border border-white/20 hover:bg-white/5 transition-all text-xs font-bold text-slate-300 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity
              className={`text-primary ${isConnected ? 'animate-pulse' : 'opacity-50'}`}
              size={20}
            />
            <h3 className="font-bold text-slate-900">System Control</h3>
          </div>
          <div className="flex items-center gap-1">
            <span
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Sidebar Tabs */}
        <div className="flex border-b border-white/10 px-4 py-2 bg-white/20 gap-2">
          <button
            onClick={() => setActiveSidebarTab('pulse')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSidebarTab === 'pulse'
                ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                : 'text-slate-500 hover:bg-white/40'
            }`}
          >
            <Activity size={12} />
            Live Traces
          </button>
          <button
            onClick={() => setActiveSidebarTab('guide')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSidebarTab === 'guide'
                ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                : 'text-slate-500 hover:bg-white/40'
            }`}
          >
            <Command size={12} />
            Cmd+K Guide
          </button>
        </div>

        {/* Event Type Filter */}
        {activeSidebarTab === 'pulse' && (
          <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between gap-1 text-[11px] bg-white/10">
            <span className="text-slate-500 font-bold uppercase tracking-wider">Filter:</span>
            <div className="flex flex-wrap gap-1">
              {['ALL', 'KAFKA_PRODUCED', 'KAFKA_CONSUMED', 'DB_COMMIT'].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setFilterType(t);
                    setEvents([]);
                  }}
                  className={`px-1.5 py-0.5 rounded font-medium text-[9px] transition-all cursor-pointer ${
                    filterType === t
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white/40 text-slate-600 hover:bg-white/60'
                  }`}
                >
                  {t === 'ALL' ? 'All' : t.replace('KAFKA_', '')}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {activeSidebarTab === 'pulse' ? (
            <AnimatePresence initial={false}>
              {events.length === 0 ? (
                <div className="text-center py-12 opacity-50 space-y-2">
                  <Clock className="mx-auto" size={32} />
                  <p className="text-xs">Waiting for system pulses...</p>
                </div>
              ) : (
                events.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setSelectedEvent(event)}
                    className="p-3 rounded-lg bg-white/40 border border-white/20 shadow-sm hover:border-primary/40 hover:bg-white/60 cursor-pointer transition-all group mb-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-md bg-white/60 shadow-inner flex-shrink-0 group-hover:scale-110 transition-transform">
                        {getIcon(event.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">
                          {(event.type || 'SYSTEM_PULSE').replace('_', ' ')}
                        </p>
                        <p className="text-xs font-medium text-slate-900 leading-tight">
                          {event.label || 'System Event'}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-[9px] text-slate-400">
                            {event.timestamp ? (() => {
                              const d = new Date(event.timestamp);
                              return isNaN(d.getTime()) ? String(event.timestamp) : d.toLocaleTimeString();
                            })() : ''}
                          </p>
                          {event.traceId ? (
                            <div className="flex gap-1.5">
                              <span className="text-[8px] font-bold text-emerald-500 bg-emerald-500/10 px-1 py-0.2 rounded">
                                DETAIL
                              </span>
                              <a
                                href={`http://localhost:16686/trace/${event.traceId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-0.5 text-[8px] font-bold text-primary hover:text-primary/70 transition-colors bg-primary/10 px-1 py-0.2 rounded"
                              >
                                <span>OTEL</span>
                                <ExternalLink size={6} />
                              </a>
                            </div>
                          ) : (
                            <span className="text-[8px] font-bold text-slate-400 bg-slate-400/10 px-1 py-0.2 rounded">
                              DETAIL
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 text-slate-600 text-xs leading-relaxed"
            >
              {/* Search Capabilities */}
              <div className="glass-panel p-4 bg-primary/5 border-primary/10 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Search size={14} className="text-primary" /> Search Capabilities
                </h4>
                <p>ระบบค้นหาแบบ Full-Text Search ค้นหาได้หลายหลากมิติ:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span>
                      <strong>Invoices (ใบแจ้งหนี้):</strong> ค้นหาด้วยรหัสใบแจ้งหนี้ (เช่น{' '}
                      <code>inv_sim_...</code>) หรือสถานะเงินโอน
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span>
                      <strong>Suppliers (ร้านค้า):</strong> ค้นหาด้วยรหัสร้านค้า หรือชื่อร้านค้าในระบบ
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span>
                      <strong>API Keys:</strong> ค้นหาด้วยชื่อคีย์ของ API Key ต่างๆ ที่บันทึกในฐานข้อมูล
                    </span>
                  </li>
                </ul>
              </div>

              {/* Quick Navigation Pages */}
              <div className="glass-panel p-4 bg-primary/5 border-primary/10 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Command size={14} className="text-primary" /> Quick Navigation
                </h4>
                <p>ค้นหาชื่อหน้าหรือคีย์เวิร์ดเพื่อนำทางด่วน:</p>
                <ul className="space-y-2">
                  {PAGES.map((page) => (
                    <li key={page.id} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <span>
                        <strong>{page.title}:</strong> {page.subLabel}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technical Under the Hood */}
              <div className="glass-panel p-4 bg-amber-500/5 border-amber-500/10 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Database size={14} className="text-amber-500" /> Elastic Search Logic
                </h4>
                <p>เบื้องหลังสถาปัตยกรรมค้นหาแบบความเร็วสูง:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <span>
                      <strong>Edge N-Gram Autocomplete:</strong>{' '}
                      ซอยย่อยตัวอักษรเพื่อผลลัพธ์แบบ Type-Ahead ทันทีขณะเริ่มพิมพ์
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <span>
                      <strong>Weighted Search:</strong> ให้คะแนน <code>invoiceNumber^3</code> และ{' '}
                      <code>name^3</code> ค้นพบก่อนฟิลด์อื่น
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <span>
                      <strong>Fuzziness (AUTO):</strong> ค้นพบได้แม้มิสสะกดคำผิดเล็กน้อย (Fuzzy Logic)
                    </span>
                  </li>
                </ul>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="glass-panel p-4 bg-emerald-500/5 border-emerald-500/10 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Info size={14} className="text-emerald-500" /> Keyboard Shortcuts
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 border rounded bg-white font-mono shadow-sm text-[8px]">
                      Cmd+K
                    </kbd>
                    <span>เปิดค้นหา</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 border rounded bg-white font-mono shadow-sm text-[8px]">
                      ↑↓
                    </kbd>
                    <span>เลือกแถว</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 border rounded bg-white font-mono shadow-sm text-[8px]">
                      Enter
                    </kbd>
                    <span>ไปหน้านั้น</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 border rounded bg-white font-mono shadow-sm text-[8px]">
                      ESC
                    </kbd>
                    <span>ปิดหน้า</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-4 bg-primary/5 border-t border-white/10 text-center">
          <p className="text-[10px] text-slate-500 font-medium">Enterprise Distributed Tracing v1.0</p>
        </div>
      </motion.aside>
    </div>
  );
}
