import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  Cpu, 
  Database, 
  Wifi, 
  Clock,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import { fetchApi } from '../api'
import ShowcaseComparisonCards from './ShowcaseComparisonCards'

interface MetricSummary {
  cpu: {
    usage: number;
    loadAvg: number;
  };
  memory: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
  };
  network: {
    activeConnections: number;
    requestsPerSecond: number;
  };
  timestamp: string;
}

export default function PrometheusDashboard() {
  const [history, setHistory] = useState<MetricSummary[]>([])
  const [current, setCurrent] = useState<MetricSummary | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      const res = await fetchApi<MetricSummary>('/v1/observability/metrics-summary')
      if (res.success && res.data) {
        setCurrent(res.data)
        setHistory(prev => [...prev, res.data!].slice(-20))
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 5000)
    return () => clearInterval(interval)
  }, [])

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Activity className="text-primary animate-pulse" size={48} />
        <p className="text-slate-500 animate-pulse">Initializing Pulse Monitoring...</p>
      </div>
    )
  }

  const chartData = history.map(h => ({
    time: h.timestamp ? new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A',
    cpu: h.cpu?.usage ?? 0,
    memory: h.memory?.heapUsed ?? 0,
    rps: h.network?.requestsPerSecond ?? 0,
    conn: h.network?.activeConnections ?? 0
  }))

  return (
    <div className="space-y-8 pb-12">
      <ShowcaseComparisonCards
        card1={{
          problem: (
            <>
              เมื่อเกิดปัญหาขัดข้องทางเทคนิค เช่น ฐานข้อมูลค้าง หรือระบบส่ง Kafka ช้า ฝ่ายไอทีมักจะคลำทางหาจุดบกพร่องไม่เจอ ทำให้ <span className="font-bold text-rose-600">การแก้ระบบล่มล่าช้าเป็นชั่วโมง และส่งผลต่อความน่าเชื่อถือของแบรนด์</span>
            </>
          ),
          solution: (
            <>
              วางระบบมาตรวัดสุขภาพไอที (Infrastructure Observability Metrics) ผ่าน Prometheus ดึงค่าสถานะเครื่องแบบวิเคราะห์เชิงลึก (CPU, RAM, Socket Connection) เพื่อคอยเตือนภัยล่วงหน้า
            </>
          ),
          impact: (
            <>
              ช่วยให้ฝ่ายเทคนิคสามารถระบุจุดคอขวดและจุดรั่วไหลของหน่วยความจำได้อย่างรวดเร็ว <span className="font-bold text-rose-600">รู้ปัญหาล่วงหน้าทันทีภายใน 5 วินาที ก่อนที่ลูกค้าจะพบระบบทำงานช้า</span>
            </>
          ),
        }}
        card2={{
          title: "ระบบวัดวิเคราะห์สุขภาพทางเทคนิคของเครื่องประมวลผล (Real-time Infrastructure Observability)",
          leftTitle: "ถ้าไม่ใช้ Pattern (ก่อน)",
          leftContent: (
            <>
              <p>ระบบล่มโดยไม่รู้ตัว ➔ คอยลุ้นให้คู่ค้าโทรมาแจ้งยอดชำระเงินไม่เข้า</p>
              <p className="font-bold text-rose-600">➔ ผลลัพธ์: กว่าทีมไอทีจะแกะเจอสาเหตุใช้เวลาครึ่งวัน เสียรายได้หลายแสน</p>
            </>
          ),
          rightTitle: "สิ่งที่เราใช้ (หลัง)",
          rightContent: (
            <>
              <p>ระบบวัดสแกนอัตโนมัติแจ้งเตือนทันควัน ➔ วิเคราะห์กราฟทรัพยากรตรงจุด</p>
              <p className="font-bold text-emerald-600">➔ ผลลัพธ์: ตรวจเจอและจูนเครื่องได้ทันควันใน 5 วินาที ปลอดภัยไร้กังวล</p>
            </>
          ),
        }}
      />
      {/* Real-time Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Cpu size={20} />} 
          label="CPU Usage" 
          value={`${current.cpu?.usage ?? 0}%`} 
          trend={(current.cpu?.usage ?? 0) > 25 ? 'up' : 'down'}
          color="indigo"
        />
        <StatCard 
          icon={<Database size={20} />} 
          label="Heap Memory" 
          value={`${current.memory?.heapUsed ?? 0} MB`} 
          trend="neutral"
          color="purple"
        />
        <StatCard 
          icon={<Wifi size={20} />} 
          label="Active Sockets" 
          value={(current.network?.activeConnections ?? 0).toString()} 
          trend="up"
          color="emerald"
        />
        <StatCard 
          icon={<Zap size={20} />} 
          label="Throughput" 
          value={`${current.network?.requestsPerSecond ?? 0} req/s`} 
          trend="down"
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CPU & Memory Chart */}
        <div className="glass-panel p-6 bg-white/40">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-lg flex items-center gap-2">
              <Activity className="text-indigo-500" size={20} />
              Infrastructure Pulse
            </h4>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1 text-indigo-500">
                <div className="w-2 h-2 rounded-full bg-indigo-500" /> CPU
              </span>
              <span className="flex items-center gap-1 text-purple-500">
                <div className="w-2 h-2 rounded-full bg-purple-500" /> RAM
              </span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="cpu" stroke="#6366f1" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={2} />
                <Area type="monotone" dataKey="memory" stroke="#a855f7" fillOpacity={1} fill="url(#colorMem)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic & Connections Chart */}
        <div className="glass-panel p-6 bg-white/40">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-lg flex items-center gap-2">
              <Wifi className="text-emerald-500" size={20} />
              Traffic Dynamics
            </h4>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1 text-emerald-500">
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> RPS
              </span>
              <span className="flex items-center gap-1 text-amber-500">
                <div className="w-2 h-2 rounded-full bg-amber-500" /> CONNS
              </span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line type="monotone" dataKey="rps" stroke="#10b981" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="conn" stroke="#f59e0b" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Observability Info */}
      <div className="glass-panel p-6 border-l-4 border-indigo-500 bg-indigo-500/5">
        <h4 className="font-bold mb-2 flex items-center gap-2">
          <Clock size={18} />
          Observability Insight
        </h4>
        <p className="text-sm text-slate-600 leading-relaxed">
          The metrics displayed above are aggregated from the <span className="font-mono bg-indigo-100 px-1 rounded">/metrics</span> Prometheus endpoint. 
          The backend uses <span className="font-bold text-indigo-600">OpenTelemetry</span> for tracing and <span className="font-bold text-indigo-600">Prometheus</span> for metrics, 
          providing a complete observability stack (MET). This allows for rapid identification of performance bottlenecks and resource leaks in real-time.
        </p>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, trend, color }: { 
  icon: React.ReactNode, 
  label: string, 
  value: string, 
  trend: 'up' | 'down' | 'neutral',
  color: 'indigo' | 'purple' | 'emerald' | 'amber'
}) {
  const colors = {
    indigo: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    purple: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  }

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="glass-panel p-6 bg-white/60 relative overflow-hidden group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colors[color]} border transition-transform group-hover:scale-110`}>
          {icon}
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold">
          {trend === 'up' && <span className="text-emerald-500 flex items-center gap-0.5"><ArrowUpRight size={12} /> +12%</span>}
          {trend === 'down' && <span className="text-rose-500 flex items-center gap-0.5"><ArrowDownRight size={12} /> -5%</span>}
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{label}</p>
        <h4 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h4>
      </div>
      
      {/* Subtle background decoration */}
      <div className={`absolute -bottom-2 -right-2 w-16 h-16 rounded-full opacity-5 ${colors[color].split(' ')[0]}`} />
    </motion.div>
  )
}
