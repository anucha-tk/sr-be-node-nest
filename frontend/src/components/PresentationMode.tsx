import { useState, useEffect, useCallback } from 'react'
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
  History,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Terminal,
  Cpu,
  ArrowRight
} from 'lucide-react'

// Futuristic premium slides metadata
const SLIDES = [
  {
    id: 'challenge',
    badge: '01 / PIPELINE ARCHITECTURE',
    title: 'ท่อส่งธุรกรรมและเกราะกำบังข้อมูลรายได้องค์กร',
    subtitle: 'Smart Revenue Pipeline & Zero-Defect Gateway',
    icon: Award,
    problem: 'เน็ตหลุด ข้อมูลภาษีเพี้ยน หรือคิวพังกลางทาง ส่งผลให้คู่ค้าสูญเสียผลประโยชน์และเกิดข้อผิดพลาดทางบัญชีภาษีรุนแรง',
    solution: 'วางระบบ Closed-Loop Enterprise Pipeline ครอบธุรกรรมทุกรายการด้วยรหัสสากล (Correlation ID) และตรวจสอบโครงสร้างไฟล์ด้วย Zod schema ก่อนบันทึก',
    tools: ['NestJS 11', 'PostgreSQL', 'Zod Validation', 'Correlation ID Tracking'],
    beforeTitle: 'ระบบเก่า (LEGACY SYSTEM)',
    beforeDesc: 'ส่งข้อมูลดิบตรงเข้าฐานข้อมูลทันที ไร้เครื่องคัดกรอง',
    beforeLogs: [
      '[WARN] Database connection timeout during bulk insert',
      '[FAIL] Invalid JSON payload from Supplier B - System Crashed!',
      '[FATAL] Revenue imbalance detected: Diff $120,450.00'
    ],
    afterTitle: 'ระบบใหม่ (SMART PIPELINE)',
    afterDesc: 'คัดกรองพาสแกนโครงสร้างระดับเสี้ยววินาที',
    afterLogs: [
      '[OK] correlation_id: "tx_9a8f2c3d" schema verified (Zod)',
      '[OK] Ingested 150,000 revenue records securely.',
      '[SYSTEM] Pipeline status: 100% stable. Zero discrepancies.'
    ],
    metricBefore: 'เสี่ยงข้อมูลพัง 15%',
    metricAfter: 'ความถูกต้อง 100%',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'security',
    badge: '02 / ENTERPRISE SECURITY',
    title: 'ป้อมปราการความปลอดภัยสิทธิเข้าใช้งานและข้อมูลภาษี',
    subtitle: 'Zero-Trust Identity & HMAC Security Shield',
    icon: Shield,
    problem: 'การเชื่อมต่อ API ทั่วไปเสี่ยงต่อการแฮกเกอร์ขโมยข้อมูลใบแจ้งหนี้คู่ค้า หรือถล่มยิงคำขอจนระบบหลักล่มและล่าช้า',
    solution: 'เชื่อมระบบ Keycloak OIDC ระดับความปลอดภัยสูงสุด พร้อมควบคุมความถี่ในการยิง API ด้วย Redis Rate Limiter และพิสูจน์สิทธิด้วย HMAC Signature',
    tools: ['Keycloak OIDC', 'HMAC Signatures', 'Redis Rate Limiter', 'NestJS Guards'],
    beforeTitle: 'ระบบเก่า (NO GATEWAY SHIELD)',
    beforeDesc: 'ไม่มีระบบสกัดสิทธิ หรือใช้กุญแจ API แบบส่งดิบไร้การเข้ารหัส',
    beforeLogs: [
      '[ATTACK] IP 103.45.2.1 flooding /api/v1/invoices (15k req/s)',
      '[WARN] Data Leak: Unsigned request extracted billing records.',
      '[FATAL] CPU load 99% - API Service Unresponsive!'
    ],
    afterTitle: 'ระบบใหม่ (ZERO-TRUST SECURITY)',
    afterDesc: 'คุ้มครอง 3 ชั้นด้วยสิทธิ Keycloak + HMAC + Rate Limiter',
    afterLogs: [
      '[SECURE] keycloak_token: Verified (Role: SUPPLIER_PARTNER)',
      '[BLOCKED] IP 103.45.2.1 rate-limited (HTTP 429 Too Many Requests)',
      '[SYSTEM] API gateway safe. Active HMAC signature check: Passed.'
    ],
    metricBefore: 'โดนยิงถล่มจนระบบล่ม',
    metricAfter: 'สกัดการโจมตี 100%',
    color: 'from-purple-500 to-pink-600'
  },
  {
    id: 'kafka',
    badge: '03 / EVENT-DRIVEN HEART',
    title: 'สายพานส่งข้อมูลธุรกรรมและการันตีการทำรายการครั้งเดียว',
    subtitle: 'High-Throughput Kafka & Exactly-Once Conveyor',
    icon: Share2,
    problem: 'ระบบปลายทางล่มระหว่างบันทึกเงินโอน ทำให้ยอดเงินหลุดหายถาวร หรือคิวเครือข่ายส่งซ้ำทำให้บวกยอดเงินซ้ำซ้อนสองรอบ',
    solution: 'สายพานลำเลียง Apache Kafka ประมวลผลแบบ Exactly-Once การันตีบันทึกรายการครั้งเดียวด้วย Idempotency และพักรายการเสียลง DLQ',
    tools: ['Apache Kafka', 'Prisma Transactions', 'ProcessedEvent Engine', 'Idempotency Shield'],
    beforeTitle: 'ระบบเก่า (SYNCHRONOUS WRITER)',
    beforeDesc: 'อัปเดตยอดเงินแบบตรงๆ หากเครื่องปลายทางล่ม ข้อมูลจะสาบสูญ',
    beforeLogs: [
      '[FAIL] Connection lost during balance write back.',
      '[WARN] Retry transaction ying duplicated count: +$50,000 (Double charge!)',
      '[FAIL] Missing invoice match. Transaction discarded.'
    ],
    afterTitle: 'ระบบใหม่ (EXACTLY-ONCE CONVEYOR)',
    afterDesc: 'พักคิวใน Kafka สำรองข้อมูลตลอดเวลา พร้อมระบบสกัดคิวซ้ำ',
    afterLogs: [
      '[QUEUE] Ingesting Kafka message "evt_b8d3c12a" to queue...',
      '[SYSTEM] Duplicate detected: eventId "evt_b8d3c12a" already exists.',
      '[SKIPPED] HTTP 200 OK - Skipped double-payment safely in 1ms!'
    ],
    metricBefore: 'ยอดเงินหายหรือจ่ายเบิ้ล',
    metricAfter: 'ประมวลผลแม่นยำ 100%',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'performance',
    badge: '04 / WARP-SPEED SEARCH',
    title: 'ระบบสืบค้นข้อมูลธุรกรรมความเร็วสูงและคำแนะนำอัจฉริยะ',
    subtitle: 'Elasticsearch Warp-Speed Fuzzy Search Engine',
    icon: Zap,
    problem: 'การค้นหาชื่อคู่ค้าหรือหมายเลขใบแจ้งหนี้แบบทั่วไป (SQL LIKE) ล่าช้ามากเมื่อข้อมูลเพิ่มจำนวน และค้นหาไม่เจอหากสะกดผิดหรือพิมพ์ตกหล่นแม้ตัวเดียว',
    solution: 'ทำดัชนีผ่าน Elasticsearch พร้อมออกแบบ Edge N-Gram Tokenizer และ Fuzzy Search ช่วยสืบค้นข้อมูลธุรกรรมล้านรายการได้เสี้ยววินาที แม้จะพิมพ์ผิด',
    tools: ['Elasticsearch 8', 'Kibana Console', 'Edge N-Gram Tokenizer', 'Fuzzy Multi-Match Query'],
    beforeTitle: 'ระบบเก่า (SQL LIKE SEQUENTIAL SCAN)',
    beforeDesc: 'ยิง Query ค้นหาข้อมูลแบบกวาดดูทีละบรรทัด ค้นหาล้มเหลวหากสะกดคำผิด',
    beforeLogs: [
      '[SQL] SELECT * FROM "Invoices" WHERE "supplier" LIKE \'%anucha%\'',
      '[WARN] Sequential Scan triggered: scanned 1,245,690 rows in progress...',
      '[FAIL] Query returned 0 results for typo query "anuchaa" (No Fuzzy Search!)'
    ],
    afterTitle: 'ระบบใหม่ (ELASTICSEARCH FUZZY SEARCH)',
    afterDesc: 'ค้นผ่านดัชนีคำกลับด้าน (Inverted Index) ตอบสนองความเร็วคงที่',
    afterLogs: [
      '[ES Query] GET /invoices/_search with Fuzzy logic ("anuchaa" -> "Anucha TK")',
      '[OK] Elasticsearch inverted index scan completed in 0.04 ms.',
      '[SYSTEM] Match found: supplier: "Anucha TK" (Fuzzy score: 8.45)'
    ],
    metricBefore: 'ใช้เวลา 18.25 วิ & ค้นหาล้มเหลว',
    metricAfter: 'ดึงผลลัพธ์ใน 0.04 ms + สะกดผิด 100%',
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'audit',
    badge: '05 / AUDIT & COMPLIANCE',
    title: 'สมุดบันทึกตรวจสอบธุรกรรมถาวรสะท้อนความโปร่งใส',
    subtitle: 'Immutable Audit Ledger & Integrity Shield',
    icon: History,
    problem: 'ยอดเงินบัญชีอาจถูกดัดแปลง ย้อนหลังหรือถูกลบประวัติโดยผู้ไม่หวังดี ทำให้ประวัติการโอนคลาดเคลื่อนและผิดต่อกฎหมายควบคุมภาษี',
    solution: 'สมุดบันทึกรายรับแบบบันทึกเพิ่มได้อย่างเดียวห้ามแก้ไขทับ (WORM Concept) บังคับผูกประวัติไปพร้อมกับ Correlation ID เสมอ',
    tools: ['Prisma ORM', 'Immutable RevenueAuditLog', 'WORM Concept', 'Database Transactions'],
    beforeTitle: 'ระบบเก่า (MUTABLE BALANCES)',
    beforeDesc: 'ตารางบันทึกยอดเงินทั่วไปที่ใครก็สามารถเข้าแทรกแซงแก้ไขตัวเลขได้',
    beforeLogs: [
      '[SQL] UPDATE "Balances" SET "amount" = 50000 WHERE "id" = \'sup_1\'',
      '[WARN] Historical balance updated without record. Audit trail: None.',
      '[FATAL] Auditor found discrepancy: Real cash does not match DB!'
    ],
    afterTitle: 'ระบบใหม่ (IMMUTABLE AUDIT LEDGER)',
    afterDesc: 'ล็อกยอดเงินธุรกรรมแบบห้ามเขียนทับ ยืนยันความโปร่งใส 100%',
    afterLogs: [
      '[LEDGER] Created immutable audit block "log_c8e9d2f1"',
      '[SECURE] correlation_id: "tx_3b7a8f9c" signed and locked.',
      '[OK] Balance verification: Audit ledger integrity matches cash 100%'
    ],
    metricBefore: 'เสี่ยงโดนแอบแก้บัญชีถาวร',
    metricAfter: 'ตรวจสอบย้อนกลับได้ใน 1 วินาที',
    color: 'from-emerald-500 to-teal-600'
  }
]

export default function PresentationMode({ onClose }: { onClose: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const slide = SLIDES[currentSlide]

  const next = useCallback(() => setCurrentSlide((prev) => Math.min(prev + 1, SLIDES.length - 1)), [])
  const prev = useCallback(() => setCurrentSlide((prev) => Math.max(prev - 1, 0)), [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [next, prev, onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-3xl text-slate-800 flex flex-col items-center justify-between p-4 sm:p-8 overflow-hidden font-sans select-none"
    >
      {/* Background Animated Neon Blobs (Consistent with main dashboard blur backgrounds) */}
      <div className="absolute inset-0 -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[350px] sm:w-[550px] h-[350px] sm:h-[550px] bg-primary/20 blur-[100px] sm:blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-cyan/20 blur-[80px] sm:blur-[110px] rounded-full" />
      </div>

      {/* Header aligned to main theme */}
      <header className="w-full max-w-7xl flex justify-between items-center z-10 py-2 sm:py-4 border-b border-slate-200/60 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center shadow-md">
            <Cpu size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
              SMART REVENUE INTERCASE PRESENTATION
            </h2>
            <p className="text-[9px] text-slate-500 font-mono hidden sm:block">ARCHITECTURAL OVERVIEW & KEY PERFORMANCE METRICS</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 bg-slate-100 hover:bg-rose-50 border border-slate-200/60 hover:border-rose-200/60 rounded-xl transition-all duration-300 group shadow-sm"
          title="Press ESC to close"
        >
          <X size={16} className="text-slate-500 group-hover:text-rose-500 group-hover:rotate-90 transition-all duration-300" />
        </button>
      </header>

      {/* Cinematic Main Viewport */}
      <main className="w-full max-w-7xl flex-1 flex flex-col justify-center min-h-0 my-4 sm:my-6 z-10 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ type: "spring", stiffness: 100, damping: 18 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 h-full items-center min-h-0"
          >
            {/* LEFT COLUMN: Highly Impactful Business Value Presentation */}
            <div className="lg:col-span-5 space-y-4 sm:space-y-6 flex flex-col justify-center">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[9px] sm:text-xs font-mono font-bold text-primary uppercase tracking-widest mb-3 sm:mb-4">
                  <Activity size={12} className="animate-pulse text-primary" /> {slide.badge}
                </span>
                <h1 className="text-2xl sm:text-4xl lg:text-[2.5rem] font-black tracking-tight text-slate-900 leading-tight">
                  {slide.title}
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-2 font-mono">
                  {slide.subtitle}
                </p>

                {/* Tech Tools Badges under Heading */}
                <div className="flex flex-wrap gap-1.5 mt-3.5">
                  {(slide as any).tools.map((tool: string) => (
                    <span 
                      key={tool} 
                      className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100/60 text-[9px] font-mono font-extrabold text-indigo-700 shadow-sm transition-transform hover:scale-105"
                    >
                      🛠️ {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Business Value Metrics card (Light glass theme) */}
              <div className="glass-panel p-4 bg-white/70 border border-slate-200 shadow-sm rounded-2xl space-y-3">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-600 flex items-center gap-2">
                    <AlertTriangle size={14} /> ปัญหาก่อนปรับปรุง (Pain Point)
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm mt-1.5 leading-relaxed">
                    {slide.problem}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200/60">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 flex items-center gap-2">
                    <CheckCircle2 size={14} /> สิ่งที่เราใช้แก้ไข (Solution)
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm mt-1.5 leading-relaxed">
                    {slide.solution}
                  </p>
                </div>
              </div>

              {/* Dynamic Micro-Metric Badge */}
              <div className="flex gap-4 items-center">
                <div className="flex -space-x-1 shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 font-mono">
                  สถาปัตยกรรมระดับองค์กรที่ช่วยยกระดับความน่าเชื่อถือทางบัญชีของบริษัทคู่ค้า
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN: Futuristic Diagnostics Comparison Terminal */}
            <div className="lg:col-span-7 flex flex-col justify-center min-h-0 h-full">
              <div className="glass-panel bg-slate-50/90 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-md relative overflow-hidden min-h-0 max-h-[50vh] sm:max-h-[55vh]">
                {/* Visual Title */}
                <div className="flex justify-between items-center border-b border-slate-200/80 pb-3 mb-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-slate-500" />
                    <span className="font-mono text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Live Architectural Comparison Board
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-rose-400" />
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                </div>

                {/* Single column stacked list */}
                <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-1 min-h-0 custom-scrollbar">
                  {/* BEFORE BLOCK - Legacy System */}
                  <div className="p-3 sm:p-3.5 rounded-xl bg-rose-50/60 border border-rose-200/80 transition-all flex flex-col space-y-2 relative group shrink-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pr-20">
                      <div className="flex items-center gap-2">
                        <XCircle size={14} className="text-rose-500 shrink-0" />
                        <h4 className="text-xs font-extrabold text-rose-700 uppercase tracking-wider">
                          {slide.beforeTitle}
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium font-mono hidden sm:inline">—</span>
                      <p className="text-[10px] text-slate-500 font-semibold flex-1 sm:pl-2">
                        {slide.beforeDesc}
                      </p>
                    </div>
                    
                    <div className="absolute top-3 right-3 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-[8px] font-mono text-rose-600 uppercase tracking-widest font-extrabold">
                      Legacy System
                    </div>

                    {/* Simulated terminal warnings */}
                    <div className="bg-slate-950 rounded-lg p-2 sm:p-2.5 font-mono text-[9px] leading-relaxed text-rose-300 border border-rose-500/20 space-y-1 overflow-x-auto select-text shadow-inner">
                      {slide.beforeLogs.map((log, i) => (
                        <p key={i} className="whitespace-pre group-hover:translate-x-1 transition-transform duration-200">{log}</p>
                      ))}
                    </div>
                    
                    <div className="pt-1.5 border-t border-rose-200/50 flex justify-between items-center text-[10px] font-mono text-rose-700 shrink-0">
                      <span>ดัชนีตรวจวัดความเสี่ยง:</span>
                      <span className="font-bold underline decoration-rose-500/40 underline-offset-4">{slide.metricBefore}</span>
                    </div>
                  </div>

                  {/* AFTER BLOCK - High Performance System */}
                  <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 transition-all flex flex-col space-y-2 relative group shrink-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pr-20">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                        <h4 className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider">
                          {slide.afterTitle}
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium font-mono hidden sm:inline">—</span>
                      <p className="text-[10px] text-slate-500 font-semibold flex-1 sm:pl-2">
                        {slide.afterDesc}
                      </p>
                    </div>

                    <div className="absolute top-3 right-3 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-mono text-emerald-600 uppercase tracking-widest font-extrabold">
                      Smart Active
                    </div>

                    {/* Simulated terminal active logs */}
                    <div className="bg-slate-950 rounded-lg p-2 sm:p-2.5 font-mono text-[9px] leading-relaxed text-emerald-300 border border-emerald-500/20 space-y-1 overflow-x-auto select-text shadow-inner">
                      {slide.afterLogs.map((log, i) => (
                        <p key={i} className="whitespace-pre group-hover:translate-x-1 transition-transform duration-200">{log}</p>
                      ))}
                    </div>
                    
                    <div className="pt-1.5 border-t border-emerald-200/50 flex justify-between items-center text-[10px] font-mono text-emerald-700 shrink-0">
                      <span>ดัชนีผลลัพธ์เชิงบวก:</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-1 animate-pulse">
                        🛡️ {slide.metricAfter}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Control Panel */}
      <footer className="w-full max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 py-3 sm:py-5 border-t border-slate-200/60 shrink-0 z-10">
        {/* Navigation Indicator Pills */}
        <div className="flex gap-2.5 items-center">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(i)}
              className="relative p-1 group focus:outline-none"
              title={`สไลด์หน้าที่ ${i + 1}`}
            >
              <div className={`h-1.5 rounded-full transition-all duration-500 ${
                i === currentSlide ? 'w-8 bg-primary shadow-md shadow-primary/20' : 'w-2 sm:w-3 bg-slate-200 hover:bg-slate-300'
              }`} />
            </button>
          ))}
          <span className="text-[10px] font-mono text-slate-400 ml-2 hidden sm:inline">
            [กดลูกศร ซ้าย-ขวา บนคีย์บอร์ดเพื่อเปลี่ยนหน้า]
          </span>
        </div>

        {/* Action button controller */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              disabled={currentSlide === 0}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 disabled:opacity-20 transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100 shadow-sm"
              title="ก่อนหน้า"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              disabled={currentSlide === SLIDES.length - 1}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 disabled:opacity-20 transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100 shadow-sm"
              title="ถัดไป"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {currentSlide === SLIDES.length - 1 ? (
              <motion.button
                key="finish-btn"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={onClose}
                className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg hover:scale-105 active:scale-95"
              >
                จบการนำเสนอ (Finish)
              </motion.button>
            ) : (
              <motion.button
                key="next-btn"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={next}
                className="px-6 py-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-550 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center gap-1.5"
              >
                หน้าถัดไป <ArrowRight size={12} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </footer>
    </motion.div>
  )
}
