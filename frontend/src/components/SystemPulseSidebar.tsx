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
  const [events, setEvents] = useState<PulseEvent[]>([]);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on('system_pulse', (event: any) => {
      setEvents((prev) => [
        { ...event, id: Math.random().toString(36).substr(2, 9) },
        ...prev.slice(0, 19),
      ]);
    });

    return () => {
      socket.off('system_pulse');
    };
  }, [socket]);

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
        className="glass-panel p-2 -mr-1 rounded-l-xl border-r-0 shadow-[-4px_0_15px_rgba(0,0,0,0.1)] hover:bg-white/20 transition-colors"
      >
        {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      <motion.aside
        initial={false}
        animate={{ width: isOpen ? 320 : 0, opacity: isOpen ? 1 : 0 }}
        className="glass-panel h-[calc(100vh-2rem)] m-4 ml-0 overflow-hidden flex flex-col border-l-primary/20"
      >
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
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
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
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeSidebarTab === 'guide'
                ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                : 'text-slate-500 hover:bg-white/40'
            }`}
          >
            <Command size={12} />
            Cmd+K Guide
          </button>
        </div>

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
                    className="p-3 rounded-lg bg-white/40 border border-white/20 shadow-sm hover:border-primary/30 transition-all group mb-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-md bg-white/60 shadow-inner flex-shrink-0 group-hover:scale-110 transition-transform">
                        {getIcon(event.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">
                          {event.type.replace('_', ' ')}
                        </p>
                        <p className="text-xs font-medium text-slate-900 leading-tight">
                          {event.label}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-[9px] text-slate-400">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </p>
                          {event.traceId && (
                            <a
                              href={`http://localhost:16686/trace/${event.traceId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[9px] font-bold text-primary hover:text-primary/70 transition-colors bg-primary/10 px-1.5 py-0.5 rounded"
                            >
                              <span>DEEP DIVE</span>
                              <ExternalLink size={8} />
                            </a>
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
                    <span><strong>Invoices (ใบแจ้งหนี้):</strong> ค้นหาด้วยรหัสใบแจ้งหนี้ (เช่น <code>inv_sim_...</code>) หรือสถานะเงินโอน</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span><strong>Suppliers (ร้านค้า):</strong> ค้นหาด้วยรหัสร้านค้า หรือชื่อร้านค้าในระบบ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span><strong>API Keys:</strong> ค้นหาด้วยชื่อคีย์ของ API Key ต่างๆ ที่บันทึกในฐานข้อมูล</span>
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
                    <span><strong>Edge N-Gram Autocomplete:</strong> ซอยย่อยตัวอักษรเพื่อผลลัพธ์แบบ Type-Ahead ทันทีขณะเริ่มพิมพ์</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <span><strong>Weighted Search:</strong> ให้คะแนน <code>invoiceNumber^3</code> และ <code>name^3</code> ค้นพบก่อนฟิลด์อื่น</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <span><strong>Fuzziness (AUTO):</strong> ค้นพบได้แม้มิสสะกดคำผิดเล็กน้อย (Fuzzy Logic)</span>
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
                    <kbd className="px-1.5 py-0.5 border rounded bg-white font-mono shadow-sm text-[8px]">Cmd+K</kbd>
                    <span>เปิดค้นหา</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 border rounded bg-white font-mono shadow-sm text-[8px]">↑↓</kbd>
                    <span>เลือกแถว</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 border rounded bg-white font-mono shadow-sm text-[8px]">Enter</kbd>
                    <span>ไปหน้านั้น</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 border rounded bg-white font-mono shadow-sm text-[8px]">ESC</kbd>
                    <span>ปิดหน้า</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-4 bg-primary/5 border-t border-white/10 text-center">
          <p className="text-[10px] text-slate-500 font-medium">
            Enterprise Distributed Tracing v1.0
          </p>
        </div>
      </motion.aside>
    </div>
  );
}
