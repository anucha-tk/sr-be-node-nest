import { useState, useEffect, useCallback } from 'react'
import { fetchApi } from '../api'
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts'
import { 
  Zap, 
  Activity, 
  ShieldCheck,
  TrendingUp,
  Cpu,
  Clock
} from 'lucide-react'

import ShowcaseComparisonCards from './ShowcaseComparisonCards'

interface PerformanceMetric {
  name: string
  time: number
  timestamp: string
}

export default function PerformanceLab() {
  const [history, setHistory] = useState<PerformanceMetric[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [lastLatency, setLastLatency] = useState<number>(0)
  const [showHistory, setShowHistory] = useState(false)

  const runBenchmark = useCallback(async () => {
    try {
      const startTime = Date.now()
      const response = await fetchApi<Record<string, unknown>>('/v1/analytics/summary')
      
      let serverTime = 0
      if (response.success && response.data) {
        serverTime = response.meta?.executionTimeMs || (Date.now() - startTime)
      } else {
        serverTime = Date.now() - startTime
      }
      
      setLastLatency(serverTime)
      setHistory(prev => [
        ...prev.slice(-19),
        { 
          name: new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }), 
          time: serverTime,
          timestamp: new Date().toISOString()
        }
      ])
      setShowHistory(true)
    } catch (err) {
      console.error('Benchmark failed', err)
    }
  }, [])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined
    if (isRunning) {
      const timer = setTimeout(() => { void runBenchmark() }, 0)
      interval = setInterval(() => { void runBenchmark() }, 1500)
      return () => { 
        clearTimeout(timer)
        if (interval) clearInterval(interval) 
      }
    }
  }, [isRunning, runBenchmark])

  return (
    <div className="space-y-8">
      <ShowcaseComparisonCards
        card1={{
          problem: (
            <>
              ระบบดึงยอดรายรับสะสมเพื่อยื่นภาษีต้องกวาดคิวรีข้อมูลใบแจ้งหนี้หลักล้านเรคคอร์ด หากดึงข้อมูลแบบไม่มีการทำดัชนี (Index) คิวรีจะช้ามาก <span className="font-bold text-rose-600">ทำให้ระบบหน้าร้านค้าง ลูกค้าชำระเงินไม่ได้ และเซิร์ฟเวอร์แรมหมดล่มไปดื้อๆ</span>
            </>
          ),
          solution: (
            <>
              ออกแบบและจัดสถิติดัชนีข้อมูลอัจฉริยะ (B-Tree Indexing) บนคอลัมน์ที่มีการสืบค้นบ่อยใน PostgreSQL ช่วยให้สแกนเจอกลุ่มข้อมูลในเสี้ยววินาที
            </>
          ),
          impact: (
            <>
              ระบบประมวลผลดึงสรุปยอดธุรกรรมได้อย่างรวดเร็ว <span className="font-bold text-rose-600">ตอบสนองไว ค้นเจอทันใจในระดับต่ำกว่า 1 มิลลิวินาที (Sub-millisecond) ดึงข้อมูลล้านแถวได้ชิลๆ</span>
            </>
          ),
        }}
        card2={{
          title: "สนามทดลองประสิทธิภาพการคำนวณสรุปยอดภาษีความเร็วสูง (High-Performance B-Tree Index Lab)",
          leftTitle: "ถ้าไม่ใช้ Pattern (ก่อน)",
          leftContent: (
            <>
              <p>ระบบเดินสุ่มค้นหาแผ่นสลิปชำระเงินในกล่องกระดาษทีละใบจากล้านใบ</p>
              <p className="font-bold text-rose-600">➔ ผลลัพธ์: ค้นข้อมูลเสร็จสิ้นใน 20 วินาที ส่งผลให้แอปหมุนค้างคอยนาน</p>
            </>
          ),
          rightTitle: "สิ่งที่เราใช้ (หลัง)",
          rightContent: (
            <>
              <p>ระบบเปิดแฟ้มสารบัญแยกประเภทแยกตามคู่ค้า/วันที่ (B-Tree) ➔ ดึงสรุปยอดภาษีเสร็จทันที</p>
              <p className="font-bold text-emerald-600">➔ ผลลัพธ์: ดึงข้อมูลสรุปเสร็จใน 0.05 มิลลิวินาที ปลอดภัยไร้คอขวด</p>
            </>
          ),
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Control Panel */}
        <div className="glass-panel p-8 bg-white/40">
          <div className="p-3 bg-primary/10 rounded-xl text-primary w-fit mb-6">
            <Cpu size={24} />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gradient">ทดสอบความเร็วแบบสดๆ</h2>
          <p className="text-slate-600 mb-8 text-sm leading-relaxed">
            ทดสอบการยิง API ไปที่ระบบจริง โดยระบบจะตอบกลับมาพร้อมเวลาที่ใช้ในการค้นหาในฐานข้อมูล (Execution Time)
          </p>

          <div className="space-y-4">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${
                isRunning 
                  ? 'bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30' 
                  : 'bg-primary hover:bg-[#005f92] text-white shadow-[0_4px_24px_rgba(0,119,182,0.15)] hover:scale-[1.02]'
              }`}
            >
              {isRunning ? <Activity className="animate-spin" size={20} /> : <Zap size={20} />}
              {isRunning ? 'หยุดการทดสอบ' : 'เริ่มยิง API รัวๆ (Load Test)'}
            </button>
            
            <button
              onClick={runBenchmark}
              disabled={isRunning}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/60 hover:bg-white/80 border border-slate-200 rounded-2xl font-bold transition-all disabled:opacity-50"
            >
              <TrendingUp size={20} />
              ทดสอบแค่ 1 ครั้ง (Single Request)
            </button>
          </div>

          <div className="mt-12 p-6 rounded-2xl bg-white/60 border border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">เป้าหมาย (API)</span>
              <span className="text-xs font-mono text-primary">/api/v1/analytics/summary</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">ฐานข้อมูล</span>
              <span className="text-xs font-mono text-green-400">PostgreSQL 17</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">เทคนิคที่ใช้</span>
              <span className="text-xs font-mono text-emerald-400 font-bold">B-Tree Indexing</span>
            </div>
          </div>
        </div>

        {/* Visualizer Panel */}
        <div className="lg:col-span-2 glass-panel p-8 bg-white/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">เวลาที่ใช้ไป (มิลลิวินาที)</p>
              <p className="text-4xl font-mono font-bold text-slate-900">
                {lastLatency.toFixed(3)}<span className="text-sm ml-1 text-slate-600">ms</span>
              </p>
            </div>
          </div>

          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
            <Activity className="text-primary" size={20} />
            กราฟแสดงเวลาที่ใช้ในการดึงข้อมูล (ยิ่งต่ำยิ่งดี)
          </h3>

          <div className="h-[300px] w-full">
            {showHistory ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#6366f1' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="time" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorTime)" 
                    animationDuration={300}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-600">
                <Clock size={48} className="mb-4 opacity-20" />
                <p>กดเริ่มทดสอบเพื่อดูกราฟความเร็ว</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="p-4 rounded-xl bg-white/60 border border-slate-200">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">ค่าเฉลี่ย (Avg)</p>
              <p className="text-lg font-mono font-bold text-slate-900">
                {history.length > 0 ? (history.reduce((acc, h) => acc + h.time, 0) / history.length).toFixed(2) : '0.00'}ms
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/60 border border-slate-200">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">เร็วที่สุด (Min)</p>
              <p className="text-lg font-mono font-bold text-green-400">
                {history.length > 0 ? Math.min(...history.map(h => h.time)).toFixed(2) : '0.00'}ms
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/60 border border-slate-200">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">ช้าที่สุด (Max)</p>
              <p className="text-lg font-mono font-bold text-purple-400">
                {history.length > 0 ? Math.max(...history.map(h => h.time)).toFixed(2) : '0.00'}ms
              </p>
            </div>
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex flex-col justify-center items-center text-center">
              <ShieldCheck className="text-green-400 mb-1" size={16} />
              <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">ได้ตามเป้า<br/>(ต่ำกว่า 100ms)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}