import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  Activity, 
  CheckCircle2,
  Zap,
  RefreshCw,
  Box,
  Truck,
  ShieldAlert,
  Server
} from 'lucide-react'
import { fetchApi } from '../api'
import { useWebSockets } from '../hooks/useWebSockets'

export default function MetricsDashboard() {
  const [balance, setBalance] = useState<number | null>(null)
  const [latency, setLatency] = useState<number | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [events, setEvents] = useState<Array<{ id: string; amount: number; status: string; time: string }>>([])
  const [amountInput, setAmountInput] = useState<string>('500')
  const [activeStep, setActiveStep] = useState<number | null>(null)

  const { subscribe } = useWebSockets()

  const fetchBalance = useCallback(async () => {
    const res = await fetchApi<{ balance: number }>('/v1/suppliers/me/revenue')
    if (res.success && res.data) {
      setBalance(res.data.balance)
      setLatency(res.meta?.executionTimeMs || 0)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchBalance()
    }, 0)
    return () => { clearTimeout(timer) }
  }, [fetchBalance])

  useEffect(() => {
    const unsubscribe = subscribe('balance_updated', (data: { supplierId: string; balance: number }) => {
      setBalance(data.balance)
    })
    return unsubscribe
  }, [subscribe])

  const simulateTransaction = async () => {
    if (isSimulating) return
    const amountVal = parseFloat(amountInput) || 500
    setIsSimulating(true)
    setActiveStep(1) // Step 1 Active

    // Call the backend endpoint to trigger a Kafka event with custom amount
    const res = await fetchApi<{ message: string; data: { eventId: string; amount: number } }>('/v1/suppliers/simulate-payment', { 
      method: 'POST',
      body: JSON.stringify({ amount: amountVal })
    })
    
    if (res.success && res.data?.data) {
      const payload = res.data.data;
      // Add event to UI timeline
      const newEvent = {
        id: payload.eventId,
        amount: payload.amount,
        status: 'sending',
        time: new Date().toLocaleTimeString()
      }
      setEvents(prev => [newEvent, ...prev].slice(0, 5))

      // Simulate the flow through the system
      setTimeout(() => {
        setEvents(prev => prev.map(e => e.id === newEvent.id ? { ...e, status: 'checking' } : e))
        setActiveStep(2) // Step 2 Active
      }, 1000)

      setTimeout(() => {
        setEvents(prev => prev.map(e => e.id === newEvent.id ? { ...e, status: 'saved' } : e))
        setActiveStep(3) // Step 3 Active
        void fetchBalance() // Fallback balance refresh
      }, 2500)

      setTimeout(() => {
        setActiveStep(null) // Reset active steps
        setIsSimulating(false)
      }, 4000)
    } else {
      setIsSimulating(false)
      setActiveStep(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Explanation for Non-Tech */}
      <div className="glass-panel p-6 bg-primary/5 border-primary/10">
        <h3 className="text-xl font-bold text-primary mb-2">เปรียบเทียบการทำงาน (Analogy)</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          ระบบ <span className="font-bold">Event-Driven (Kafka)</span> เปรียบเสมือน <span className="text-emerald-400 font-bold">"สายพานลำเลียงพัสดุขนาดใหญ่"</span> 
          เมื่อมีเงินโอนเข้ามา (พัสดุ) ระบบจะไม่รบกวนการทำงานของหน้าร้าน แต่จะโยนลงสายพานทันที 
          จากนั้นจะมี <span className="text-amber-400 font-bold">"พนักงานตรวจรับ (Idempotency)"</span> คอยเช็คว่าพัสดุชิ้นนี้เคยรับไปแล้วหรือยัง เพื่อป้องกันการบวกเงินซ้ำซ้อน 
          ก่อนจะนำไปเก็บลงคลัง (Database) อย่างปลอดภัย
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Step 1: The Conveyor Belt (Kafka) */}
        <motion.div className={`glass-panel p-6 flex flex-col items-center text-center transition-all duration-300 ${
          activeStep === 1 ? 'ring-2 ring-primary border-primary shadow-[0_0_15px_rgba(0,119,182,0.25)] scale-[1.02]' : ''
        }`}>
          <div className="p-4 bg-blue-500/20 rounded-full text-blue-400 mb-4 relative">
            <Truck size={32} />
            {isSimulating && (
              <motion.div 
                animate={{ x: [0, 50, 0] }} 
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute -bottom-2 -right-2 text-slate-900 bg-blue-500 rounded-full p-1 shadow-lg"
              >
                <Box size={14} />
              </motion.div>
            )}
          </div>
          <h4 className="font-bold text-lg mb-1">1. สายพานรับข้อมูล</h4>
          <p className="text-xs text-slate-600 mb-4">เทคโนโลยี: Apache Kafka</p>
          <p className="text-sm text-slate-600 mb-6">รองรับรายการโอนเงินนับแสนรายการต่อวินาที โดยไม่ทำให้ระบบล่ม</p>
          
          <div className="w-full mb-4">
            <label className="block text-left text-xs font-bold text-slate-600 mb-1">
              ระบุจำนวนเงิน ($)
            </label>
            <input
              type="number"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              disabled={isSimulating}
              placeholder="500"
              className="w-full px-3 py-2 bg-white/60 border border-slate-200 rounded-lg text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
            />
          </div>

          <button
            onClick={simulateTransaction}
            disabled={isSimulating}
            className={`mt-auto w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              isSimulating ? 'bg-slate-700 text-slate-300 cursor-not-allowed' : 'bg-primary hover:bg-[#005f92] text-white shadow-[0_4px_16px_rgba(0,119,182,0.15)]'
            }`}
          >
            {isSimulating ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
            {isSimulating ? 'กำลังลำเลียงข้อมูล...' : `จำลองมีเงินโอนเข้า ${amountInput || '500'}$`}
          </button>
        </motion.div>

        {/* Step 2: The Inspector (Idempotency) */}
        <motion.div className={`glass-panel p-6 flex flex-col items-center text-center relative overflow-hidden transition-all duration-300 ${
          activeStep === 2 ? 'ring-2 ring-primary border-primary shadow-[0_0_15px_rgba(0,119,182,0.25)] scale-[1.02]' : ''
        }`}>
          <div className={`p-4 rounded-full mb-4 transition-colors duration-500 ${
            events[0]?.status === 'checking' ? 'bg-amber-500/40 text-amber-500 scale-110 shadow-[0_4px_24px_rgba(245,158,11,0.3)]' : 'bg-slate-100 text-slate-500'
          }`}>
            <ShieldAlert size={32} />
          </div>
          <h4 className="font-bold text-lg mb-1">2. ตรวจสอบความซ้ำซ้อน</h4>
          <p className="text-xs text-slate-600 mb-4">เทคโนโลยี: Idempotency Key</p>
          <p className="text-sm text-slate-600">ตรวจสอบว่ารายการโอนเงินนี้ (รหัสอ้างอิง) เคยถูกบวกเข้าบัญชีไปแล้วหรือไม่ ถ้าซ้ำจะปัดตกทันที</p>
        </motion.div>

        {/* Step 3: The Vault (Database) */}
        <motion.div className={`glass-panel p-6 flex flex-col items-center text-center border-t-4 border-emerald-500 transition-all duration-300 ${
          activeStep === 3 ? 'ring-2 ring-primary border-primary shadow-[0_0_15px_rgba(0,119,182,0.25)] scale-[1.02]' : ''
        }`}>
          <div className={`p-4 rounded-full mb-4 transition-colors duration-500 ${
            events[0]?.status === 'saved' ? 'bg-emerald-500/40 text-emerald-600 scale-110 shadow-[0_4px_24px_rgba(16,185,129,0.3)]' : 'bg-emerald-100 text-emerald-600'
          }`}>
            <Server size={32} />
          </div>
          <h4 className="font-bold text-lg mb-1">3. ยอดเงินสุทธิในคลัง</h4>
          <p className="text-xs text-slate-600 mb-4">เทคโนโลยี: PostgreSQL Transaction</p>

          <div className="w-full mt-auto bg-white/60 p-4 rounded-xl border border-emerald-500/20">
            <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
              <TrendingUp size={12} /> ยอดเงินล่าสุด
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {balance === null ? '---' : `$${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            </div>
            <div className="text-xs text-slate-600 mt-2 flex items-center justify-center gap-1">
              <Activity size={12} /> อัปเดตใช้เวลา {latency || 0} ms
            </div>
          </div>
        </motion.div>
      </div>

      {/* Event Log */}
      <div className="glass-panel p-6">
        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Activity className="text-primary" size={20} />
          ประวัติเหตุการณ์บนสายพาน (Live Event Log)
        </h4>
        <div className="space-y-2">
          <AnimatePresence>
            {events.length === 0 && (
              <div className="text-center text-slate-600 py-4 text-sm">ยังไม่มีรายการ กรุณากดจำลองโอนเงิน</div>
            )}
            {events.map(evt => (
              <motion.div 
                key={evt.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-600">{evt.time}</span>
                  <span className="text-sm font-mono text-slate-600">{evt.id}</span>
                  <span className="text-emerald-600 font-bold">+${evt.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div>
                  {evt.status === 'sending' && <span className="text-xs bg-blue-500/20 text-blue-600 px-2 py-1 rounded flex items-center gap-1"><Truck size={12}/> วิ่งบนสายพาน</span>}
                  {evt.status === 'checking' && <span className="text-xs bg-amber-500/20 text-amber-600 px-2 py-1 rounded flex items-center gap-1"><ShieldAlert size={12}/> กำลังคัดกรอง</span>}
                  {evt.status === 'saved' && <span className="text-xs bg-emerald-500/20 text-emerald-600 px-2 py-1 rounded flex items-center gap-1"><CheckCircle2 size={12}/> บันทึกสำเร็จ</span>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
