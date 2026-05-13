import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronRight, 
  ChevronLeft, 
  Shield, 
  Zap, 
  Share2, 
  Award,
  X,
  Activity,
  History
} from 'lucide-react'

const SLIDES = [
  {
    id: 'challenge',
    title: 'โจทย์ที่ท้าทาย (The Challenge)',
    content: 'sr-be-node-nest: ออกแบบมาเพื่อเป็นระบบหลังบ้านสำหรับรับมือกับข้อมูลทางการเงินระดับองค์กร รองรับการประมวลผลข้อมูลนับล้านรายการโดยไร้ข้อผิดพลาด (Zero-defect delivery)',
    icon: Award,
    takeaways: ['รองรับ 1M+ Records', 'ความแม่นยำระดับ ACID', 'ออกแบบโดยเน้น Security-First'],
    talkingPoints: [
      "อธิบายถึงความสำคัญและความซับซ้อนของการรักษาความถูกต้องของข้อมูลทางการเงิน",
      "จุดเสริม: เราใช้ Zod ดักจับความถูกต้องของข้อมูลที่ส่งผ่าน Kafka เพื่อป้องกัน 'Poisoned Pills' ที่จะทำให้ระบบล่ม"
    ],
    color: 'indigo'
  },
  {
    id: 'security',
    title: 'ตัวตนและความปลอดภัย (Identity & Security)',
    content: 'สถาปัตยกรรมแบบ Zero-trust โดยใช้ Keycloak OIDC สำหรับจัดการตัวตน และใช้ API Keys ร่วมกับ HMAC-signed สำหรับการสื่อสารที่ปลอดภัยระหว่างระบบ',
    icon: Shield,
    takeaways: ['เชื่อมต่อ Keycloak OIDC', 'Unified Auth Guards', 'ตรวจสอบ HMAC Signature'],
    talkingPoints: [
      "แสดงให้เห็นว่า API ถูกปกป้องอย่างแน่นหนาในทุกๆ เส้นทาง",
      "จุดเสริม: เราเขียน Unified Guard ให้สามารถรองรับทั้ง JWT จาก User และ API Key จากระบบภายนอกได้แบบไร้รอยต่อ"
    ],
    color: 'purple'
  },
  {
    id: 'kafka',
    title: 'หัวใจนักขับเคลื่อน (Event-Driven Heart)',
    content: 'ประมวลผลธุรกรรมแบบ Event-Driven ด้วย Apache Kafka ระบบ Consumer ของเราการันตีว่าข้อมูลจะไม่ซ้ำซ้อน (Exactly-once) และมีระบบรับมือความผิดพลาด (DLQ)',
    icon: Share2,
    takeaways: ['ระบบป้องกันข้อมูลซ้ำ (Idempotency)', 'Prisma Transactions', 'Automated Dead-Letter Queues'],
    talkingPoints: [
      "เน้นย้ำเรื่องตาราง 'ProcessedEvent' ที่เราใช้กันข้อมูลเข้าซ้ำ",
      "จุดเสริม: การบันทึกฐานข้อมูลทุกอย่างถูกรัดด้วย Atomic Transactions เพื่อให้ข้อมูลไม่ตกหล่น"
    ],
    color: 'blue'
  },
  {
    id: 'performance',
    title: 'ห้องทดสอบความเร็ว (Performance Lab)',
    content: 'การดึงข้อมูลวิเคราะห์ถูกปรับแต่งให้มีความหน่วงต่ำที่สุด (Ultra-low latency) เราใช้ B-Tree Indexes ช่วยให้ดึงข้อมูลหลักล้านรายการได้แทบจะในพริบตา',
    icon: Zap,
    takeaways: ['จับเวลา Backend สดๆ', 'ดัชนี B-Tree Indexing', 'SQL Execution Profiling'],
    talkingPoints: [
      "จุดเสริม: ตัวเลขความเร็วที่โชว์คือความเร็วของจริงที่ยิงไปหา NestJS Backend จริงๆ ไม่ใช่ Mock",
      "ชี้ให้ดู: เวลา executionTimeMs ที่แฝงมาใน Standard Response Envelope"
    ],
    color: 'pink'
  },
  {
    id: 'audit',
    title: 'ความโปร่งใส (Audit & Integrity)',
    content: 'สมุดบันทึกที่ไม่สามารถแก้ไขได้ (Immutable Audit Trail) คอยจดทุกการเปลี่ยนแปลงทางการเงิน ทำให้ระบบตรวจสอบย้อนหลังได้ 100% ตอบโจทย์ Compliance',
    icon: History,
    takeaways: ['บันทึกรายได้ที่แก้ไขไม่ได้', 'พร้อมสำหรับงาน Compliance', 'ตรวจสอบย้อนหลังได้ถึงต้นทาง'],
    talkingPoints: [
      "แสดงให้ดูตาราง 'RevenueAuditLog' ใน Schema ของ Prisma",
      "อธิบายว่าระบบบังคับให้บันทึก Audit ทันทีใน Transaction เดียวกันเสมอ ทำให้ไม่มีวันหลุด"
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
      className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-3xl flex flex-col items-center p-4 sm:p-6 overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-40 fixed">
        <div className="absolute top-1/4 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/20 blur-[100px] sm:blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-cyan/20 blur-[80px] sm:blur-[120px] rounded-full" />
      </div>

      <button 
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 hover:bg-slate-100 rounded-full transition-all group z-[110]"
      >
        <X size={20} className="text-slate-500 group-hover:text-slate-900 group-hover:rotate-90 transition-all duration-300" />
      </button>

      <div className="max-w-5xl w-full h-full flex flex-col justify-between py-4 sm:py-6 relative">
        {/* Slide Content */}
        <div className="flex-1 flex flex-col justify-center min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 sm:space-y-8"
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-6 text-center sm:text-left">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10 shadow-sm shrink-0">
                  <slide.icon className="text-primary w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div>
                  <div className="text-primary font-bold uppercase tracking-widest text-[9px] sm:text-xs mb-1">สไลด์หน้าที่ {currentSlide + 1} / {SLIDES.length}</div>
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">{slide.title}</h1>
                </div>
              </div>

              <p className="text-lg sm:text-2xl lg:text-3xl text-slate-600 leading-tight max-w-4xl font-medium mx-auto sm:mx-0 text-center sm:text-left">
                {slide.content}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2 sm:pt-6">
                {slide.takeaways.map((takeaway, i) => (
                  <motion.div
                    key={takeaway}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                    className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white/80 border border-slate-200 backdrop-blur-md shadow-sm flex items-center gap-3 sm:flex-col sm:items-start sm:gap-0"
                  >
                    <Activity size={16} className="text-primary mb-0 sm:mb-3 shrink-0" />
                    <span className="text-xs sm:text-base font-bold text-slate-900 leading-tight">{takeaway}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-4 sm:mt-8 space-y-6 sm:space-y-8 shrink-0">
          {/* Progress & Finish Button */}
          <div className="flex flex-col items-center gap-3 sm:gap-4">
             <div className="w-full max-w-xs sm:max-w-md">
                <div className="flex justify-between items-end mb-1.5">
                  <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">Technical Depth</p>
                  <p className="text-[8px] sm:text-[10px] text-primary font-bold">{Math.round(((currentSlide + 1) / SLIDES.length) * 100)}%</p>
                </div>
                <div className="h-1 sm:h-1.5 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-300/30">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentSlide + 1) / SLIDES.length) * 100}%` }}
                    className="h-full bg-primary"
                  />
                </div>
             </div>

             {currentSlide === SLIDES.length - 1 && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={onClose}
                  className="px-8 py-2.5 sm:py-3.5 bg-slate-900 text-white rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all shadow-lg hover:scale-105 active:scale-95"
                >
                  จบการนำเสนอ (Finish)
                </motion.button>
              )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10">
            <div className="flex gap-3 sm:gap-4">
              <button
                onClick={prev}
                disabled={currentSlide === 0}
                className="p-3 sm:p-5 rounded-full bg-slate-100 border border-slate-300 text-slate-900 shadow-sm disabled:opacity-20 transition-all hover:scale-110 active:scale-90 hover:bg-white"
                title="Previous"
              >
                <ChevronLeft size={24} className="sm:w-7 sm:h-7" />
              </button>
              <button
                onClick={next}
                disabled={currentSlide === SLIDES.length - 1}
                className="p-3 sm:p-5 rounded-full bg-primary text-white shadow-md disabled:opacity-20 transition-all hover:scale-110 hover:bg-[#005f92] active:scale-90"
                title="Next"
              >
                <ChevronRight size={24} className="sm:w-7 sm:h-7" />
              </button>
            </div>
            
            <div className="flex gap-2 sm:gap-3">
              {SLIDES.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === currentSlide ? 'w-8 sm:w-10 bg-primary' : 'w-2 sm:w-3 bg-slate-200 hover:bg-primary/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
