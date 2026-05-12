import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronRight, 
  ChevronLeft, 
  Shield, 
  Zap, 
  Share2, 
  Database, 
  Award,
  X,
  MessageSquare,
  Terminal,
  Activity,
  History
} from 'lucide-react'

const SLIDES = [
  {
    id: 'challenge',
    title: 'The Challenge',
    content: 'sr-be-node-nest: An enterprise-grade engine designed to handle financial revenue processing at scale, ensuring zero-defect delivery for million-record datasets.',
    icon: Award,
    takeaways: ['Scale: 1M+ Records', 'Strict ACID Compliance', 'Security-First Architecture'],
    talkingPoints: [
      "Explain the complexity of fintech data integrity.",
      "Mention: We use Zod for Kafka message validation to prevent 'poisoned pills'."
    ],
    color: 'indigo'
  },
  {
    id: 'security',
    title: 'Identity & Security',
    content: 'Zero-trust architecture utilizing Keycloak OIDC for identity and unified HMAC-signed API keys for secure service-to-service communication.',
    icon: Shield,
    takeaways: ['Keycloak OIDC Integration', 'Unified Auth Guards', 'HMAC Signature Validation'],
    talkingPoints: [
      "Show how the API is protected globally.",
      "Mention: The unified guard handles both JWT and API Key contexts seamlessly."
    ],
    color: 'purple'
  },
  {
    id: 'kafka',
    title: 'Event-Driven Heart',
    content: 'Distributed event processing with Apache Kafka. Our consumer engine guarantees exactly-once processing and handles failure with DLQs.',
    icon: Share2,
    takeaways: ['Idempotency Logic', 'Prisma Transactions', 'Automated Dead-Letter Queues'],
    talkingPoints: [
      "Highlight the 'ProcessedEvent' table used for idempotency.",
      "Mention: All database operations are wrapped in atomic transactions."
    ],
    color: 'blue'
  },
  {
    id: 'performance',
    title: 'Performance Lab',
    content: 'Real-time analytical queries optimized for ultra-low latency. We leverage B-Tree indexes to maintain high performance even as datasets grow to millions of records.',
    icon: Zap,
    takeaways: ['Live Backend Timing', 'B-Tree Indexing', 'SQL Execution Profiling'],
    talkingPoints: [
      "Mention: Every metric shown in the lab is a real request to the NestJS backend.",
      "Show: The executionTimeMs metadata returned in the standard response envelope."
    ],
    color: 'pink'
  },
  {
    id: 'audit',
    title: 'Audit & Integrity',
    content: 'An immutable audit trail records every financial movement. This provides a transparent, tamper-proof history for compliance and troubleshooting.',
    icon: History,
    takeaways: ['Immutable Revenue Logs', 'Compliance Readiness', 'Transaction Tracing'],
    talkingPoints: [
      "Show the 'RevenueAuditLog' schema in Prisma.",
      "Explain how audit logs are triggered within the same transaction."
    ],
    color: 'green'
  }
]

export default function PresentationMode({ onClose }: { onClose: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slide = SLIDES[currentSlide]

  const next = () => setCurrentSlide((prev) => Math.min(prev + 1, SLIDES.length - 1))
  const prev = () => setCurrentSlide((prev) => Math.max(prev - 1, 0))

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-obsidian-950/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8 overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/30 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/30 blur-[120px] rounded-full" />
      </div>

      <button 
        onClick={onClose}
        className="absolute top-8 right-8 p-3 hover:bg-white/10 rounded-full transition-all group z-[110]"
      >
        <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-4 gap-12 items-stretch">
        {/* Slide Content */}
        <div className="lg:col-span-3 flex flex-col justify-between py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                  <slide.icon className="text-indigo-400" size={48} />
                </div>
                <div>
                  <div className="text-indigo-400 font-bold uppercase tracking-[0.3em] text-xs mb-2">Slide {currentSlide + 1}</div>
                  <h1 className="text-7xl font-black tracking-tight text-white">{slide.title}</h1>
                </div>
              </div>

              <p className="text-3xl text-slate-300 leading-tight max-w-3xl font-medium">
                {slide.content}
              </p>

              <div className="grid grid-cols-3 gap-4 max-w-4xl pt-8">
                {slide.takeaways.map((takeaway, i) => (
                  <motion.div
                    key={takeaway}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm"
                  >
                    <Activity size={16} className="text-indigo-500 mb-3" />
                    <span className="text-sm font-bold text-slate-200">{takeaway}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-8 mt-20">
            <div className="flex gap-4">
              <button
                onClick={prev}
                disabled={currentSlide === 0}
                className="p-5 rounded-2xl glass-card disabled:opacity-20 transition-all hover:scale-110 active:scale-90"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={next}
                disabled={currentSlide === SLIDES.length - 1}
                className="p-5 rounded-2xl glass-card bg-indigo-500 text-white border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-20 transition-all hover:scale-110 active:scale-90"
              >
                <ChevronRight size={32} />
              </button>
            </div>
            
            <div className="flex gap-3">
              {SLIDES.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    i === currentSlide ? 'w-16 bg-indigo-500' : 'w-4 bg-white/10 hover:bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Interviewer Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-8 bg-white/[0.02] border-white/10 flex flex-col"
        >
          <div className="flex items-center gap-3 mb-8">
            <MessageSquare className="text-indigo-400" size={20} />
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Interviewer Notes
            </h3>
          </div>

          <div className="flex-1 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {slide.talkingPoints.map((point, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="mt-1">
                      <Terminal size={14} className="text-slate-600 group-hover:text-indigo-500 transition-colors" />
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed italic group-hover:text-slate-200 transition-colors">
                      {point}
                    </p>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-auto pt-8 border-t border-white/5">
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <p className="text-[10px] text-indigo-400 font-bold uppercase mb-2">Technical Depth</p>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentSlide + 1) / SLIDES.length) * 100}%` }}
                  className="h-full bg-indigo-500"
                />
              </div>
            </div>
            
            {currentSlide === SLIDES.length - 1 && (
              <button
                onClick={onClose}
                className="w-full mt-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all"
              >
                Finalize Presentation
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

