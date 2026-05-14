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
} from 'lucide-react';
import { useSocket } from '../hooks/useSocket';

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
            <h3 className="font-bold text-slate-900">System Pulse</h3>
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

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
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
                  className="p-3 rounded-lg bg-white/40 border border-white/20 shadow-sm hover:border-primary/30 transition-all group"
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
