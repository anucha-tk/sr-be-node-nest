import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts'
import { 
  TrendingUp, 
  Activity, 
  BarChart3, 
  DollarSign, 
  FileText, 
  Users, 
  Search, 
  XCircle,
  RefreshCw,
  Clock
} from 'lucide-react'
import { fetchApi } from '../api'
import ShowcaseComparisonCards from './ShowcaseComparisonCards'

interface FacetItem {
  key: string
  docCount: number
}

interface TrendItem {
  period: string
  count: number
  amount: number
}

interface SearchStats {
  stats: {
    count: number
    sum: number
    avg: number
    min: number
    max: number
  }
  facets: {
    status: FacetItem[]
    supplierName: FacetItem[]
  }
  trends: TrendItem[]
}

const STATUS_COLORS: Record<string, string> = {
  PAID: '#10b981', // emerald
  PENDING: '#f59e0b', // amber
  FAILED: '#ef4444', // rose
  DRAFT: '#6b7280', // gray
}
const DEFAULT_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e']

export default function InsightsDashboard() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [supplierName, setSupplierName] = useState('')
  const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly')
  const [data, setData] = useState<SearchStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [latency, setLatency] = useState(0)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.append('q', q)
    if (status) params.append('status', status)
    if (supplierName) params.append('supplierName', supplierName)
    params.append('granularity', granularity)

    const res = await fetchApi<SearchStats>(`/v1/analytics/search-stats?${params.toString()}`)
    if (res.success && res.data) {
      setData(res.data)
      setLatency(res.meta?.executionTimeMs || 0)
    }
    setLoading(false)
  }, [q, status, supplierName, granularity])

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchStats()
    }, 300) // Debounce queries
    return () => clearTimeout(timer)
  }, [fetchStats])

  const handleResetFilters = () => {
    setQ('')
    setStatus('')
    setSupplierName('')
  }

  // Drill down functions
  const handleStatusClick = (statusKey: string) => {
    setStatus(prev => prev === statusKey ? '' : statusKey)
  }

  const handleSupplierClick = (supplierKey: string) => {
    setSupplierName(prev => prev === supplierKey ? '' : supplierKey)
  }

  // Formatting helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val)
  }

  // Prepare status distribution data
  const statusPieData = data?.facets.status.map(f => ({
    name: f.key,
    value: f.docCount
  })) || []

  // Prepare supplier distribution data
  const supplierBarData = data?.facets.supplierName.map(f => ({
    name: f.key.replace('Supplier (', '').replace(')', ''),
    fullName: f.key,
    value: f.docCount
  })) || []

  return (
    <div className="space-y-8">
      <ShowcaseComparisonCards
        card1={{
          problem: (
            <>
              การคำนวณและสรุปยอดเงินเพื่อแยกประเภทภาษี ยอดรายรับสะสมรายวัน หรือการจัดกลุ่มสถานะบิลของคู่ค้าจากประวัติธุรกรรมหลายล้านรายการบนระบบบัญชีแบบเดิม จะใช้คำสั่งที่ซับซ้อน ดึงข้อมูลนานมาก ทำให้ <span className="font-bold text-rose-600">กราฟรายงานรายได้ค้าง ข้อมูลการคำนวณภาษีล่าช้า และมองไม่เห็นกระแสเงินสดจริงของบริษัท</span>
            </>
          ),
          solution: (
            <>
              ใช้ฟังก์ชันการคำนวณสรุปยอดแบบกระจายศูนย์ความเร็วสูง (Elasticsearch Aggregations) จัดหมวดหมู่ยอดขาย คำนวณค่าเฉลี่ย และจัดสัดส่วนสถานะการชำระเงินของใบแจ้งหนี้สะสมไว้ล่วงหน้าอย่างอัตโนมัติ
            </>
          ),
          impact: (
            <>
              แดชบอร์ดสรุปวิเคราะห์ข้อมูลรายรับและสถานะบิลทางการเงิน <span className="font-bold text-rose-600">ตอบสนองไว กราฟสปีดเปลี่ยนตามตัวกรองได้ทันทีใน 20 มิลลิวินาที</span> ช่วยให้ฝ่ายการเงินสามารถวางแผนการบริหารจัดการกระแสเงินสดได้อย่างมีประสิทธิภาพ
            </>
          ),
        }}
        card2={{
          title: "เครื่องคำนวณสถิติและจำแนกข้อมูลรายได้เรียลไทม์ (Instant Revenue Aggregator & Faceting)",
          leftTitle: "ถ้าไม่ใช้ Pattern (ก่อน)",
          leftContent: (
            <>
              <p>บัญชีกดฟิลเตอร์ดูยอดเงินรวมไตรมาสล่าสุด ➔ ระบบรันคิวรีสแกนหาผลรวมเฉลี่ยยอดเงินใหม่จาก Postgres ตรงๆ</p>
              <p className="font-bold text-rose-600">➔ ผลลัพธ์: ระบบประมวลผลหมดเวลา (Timeout) กราฟการเงินค้างเติ่งไม่ยอมโหลด</p>
            </>
          ),
          rightTitle: "สิ่งที่เราใช้ (หลัง)",
          rightContent: (
            <>
              <p>ดึงผลการวิเคราะห์สะสมล่วงหน้าบนหน่วยความจำความเร็วสูงของ Elastic ➔ กราฟ Recharts อัปเดตเสร็จทันที</p>
              <p className="font-bold text-emerald-600">➔ ผลลัพธ์: กราฟ Recharts ปรับรูปรายงานเปลี่ยนยอดรายวันในเสี้ยววินาที สะดวกสบายขั้นสุด</p>
            </>
          ),
        }}
      />
      {/* Interactive Controls & Filters */}
      <div className="glass-panel p-6 bg-white/10 border-white/20 backdrop-blur-md relative overflow-visible">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Text Search */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ค้นหาข้อมูล (เลขที่ใบแจ้งหนี้, ชื่อคู่ค้า)..."
              className="w-full pl-10 pr-4 py-2 bg-white/40 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Faceted Filters */}
          <div className="flex flex-wrap gap-3 items-center w-full md:w-auto justify-end">
            
            {/* Status Select */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 py-2 bg-white/40 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="">ทุกสถานะ (All Status)</option>
              {data?.facets.status.map(f => (
                <option key={f.key} value={f.key}>{f.key} ({f.docCount})</option>
              ))}
            </select>

            {/* Supplier Select */}
            <select
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              className="px-4 py-2 bg-white/40 border border-slate-200 rounded-xl text-slate-900 max-w-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="">คู่ค้าทั้งหมด (All Suppliers)</option>
              {data?.facets.supplierName.map(f => (
                <option key={f.key} value={f.key}>{f.key} ({f.docCount})</option>
              ))}
            </select>

            {/* Granularity Selector */}
            <div className="flex bg-white/40 p-1 rounded-xl border border-slate-200">
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(g => (
                <button
                  key={g}
                  onClick={() => setGranularity(g)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    granularity === g 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Reset Filters */}
            {(q || status || supplierName) && (
              <button
                onClick={handleResetFilters}
                className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                title="ล้างตัวกรองทั้งหมด"
              >
                <XCircle size={20} />
              </button>
            )}

            {/* Syncing/Loading Indicators */}
            <button
              onClick={() => void fetchStats()}
              disabled={loading}
              className={`p-2 text-primary hover:bg-primary/10 rounded-xl transition-all ${loading ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* Latency / Execution Time Indicator */}
        <div className="absolute right-6 -bottom-6 flex items-center gap-1.5 text-xs text-slate-600 bg-white/80 border border-slate-100 px-2.5 py-1 rounded-full shadow-sm">
          <Clock size={12} className="text-primary" />
          <span>Elasticsearch Aggregations: <strong className="font-mono text-slate-900">{latency}ms</strong></span>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Count Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="glass-panel p-6 bg-gradient-to-br from-white/10 to-white/5 border-white/20 relative overflow-hidden group hover:border-primary/40 transition-all duration-300"
        >
          <div className="absolute -right-4 -bottom-4 opacity-5 text-primary group-hover:scale-110 transition-transform duration-500">
            <FileText size={120} />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">จำนวนเอกสารทั้งหมด</span>
            <span className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><FileText size={18} /></span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-1">
            {data ? data.stats.count.toLocaleString() : '---'}
          </div>
          <p className="text-xs text-slate-600">เอกสารที่ตรงตามเงื่อนไขค้นหา</p>
        </motion.div>

        {/* Sum Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="glass-panel p-6 bg-gradient-to-br from-white/10 to-white/5 border-white/20 relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300"
        >
          <div className="absolute -right-4 -bottom-4 opacity-5 text-emerald-500 group-hover:scale-110 transition-transform duration-500">
            <DollarSign size={120} />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">มูลค่ารวมสะสม</span>
            <span className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg"><DollarSign size={18} /></span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-1">
            {data ? formatCurrency(data.stats.sum) : '---'}
          </div>
          <p className="text-xs text-slate-600">มูลค่าทางธุรกรรมของชุดข้อมูลนี้</p>
        </motion.div>

        {/* Average Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="glass-panel p-6 bg-gradient-to-br from-white/10 to-white/5 border-white/20 relative overflow-hidden group hover:border-indigo-500/40 transition-all duration-300"
        >
          <div className="absolute -right-4 -bottom-4 opacity-5 text-indigo-500 group-hover:scale-110 transition-transform duration-500">
            <TrendingUp size={120} />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">มูลค่าเฉลี่ยต่อชิ้น</span>
            <span className="p-2 bg-indigo-500/10 text-indigo-600 rounded-lg"><TrendingUp size={18} /></span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-1">
            {data ? formatCurrency(data.stats.avg) : '---'}
          </div>
          <p className="text-xs text-slate-600">ค่าเฉลี่ยทางคณิตศาสตร์ (Average)</p>
        </motion.div>

        {/* Limit Bounds Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="glass-panel p-6 bg-gradient-to-br from-white/10 to-white/5 border-white/20 relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300"
        >
          <div className="absolute -right-4 -bottom-4 opacity-5 text-purple-500 group-hover:scale-110 transition-transform duration-500">
            <Activity size={120} />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">ขอบเขต ต่ำสุด-สูงสุด</span>
            <span className="p-2 bg-purple-500/10 text-purple-600 rounded-lg"><Activity size={18} /></span>
          </div>
          <div className="text-lg font-extrabold text-slate-900 mb-1 flex flex-col justify-center">
            <span>สูงสุด: {data ? formatCurrency(data.stats.max) : '---'}</span>
            <span className="text-xs font-normal text-slate-600">ต่ำสุด: {data ? formatCurrency(data.stats.min) : '---'}</span>
          </div>
        </motion.div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Area Chart (Story 4.3) */}
        <div className="glass-panel p-6 bg-white/10 border-white/20 backdrop-blur-md lg:col-span-2">
          <h4 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
            <BarChart3 className="text-primary" size={20} />
            แนวโน้มมูลค่าธุรกรรมแยกตามช่วงเวลา (Revenue Trends over Time)
          </h4>
          <div className="h-80 w-full">
            {data && data.trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trends} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="period" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={11} 
                    tickLine={false} 
                    tickFormatter={(val: number) => `$${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`} 
                  />
                  <Tooltip 
                    formatter={(val: any) => [formatCurrency(Number(val)), 'มูลค่าธุรกรรม']} 
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-600 text-sm">ไม่พบข้อมูลตามเงื่อนไขตัวกรอง</div>
            )}
          </div>
        </div>

        {/* Status Distribution Pie Chart (Story 4.3 with drill-down 4.4) */}
        <div className="glass-panel p-6 bg-white/10 border-white/20 backdrop-blur-md">
          <h4 className="font-bold text-lg text-slate-900 mb-1 flex items-center gap-2">
            <Activity className="text-emerald-500" size={20} />
            สัดส่วนตามสถานะเอกสาร
          </h4>
          <p className="text-xs text-slate-600 mb-6">คลิกแต่ละส่วนของชาร์ตเพื่อคัดกรองผลลัพธ์ (Drill-down)</p>
          <div className="h-72 w-full relative">
            {statusPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    onClick={(d: any) => handleStatusClick(String(d?.name || ''))}
                  >
                    {statusPieData.map((entry) => {
                      const color = STATUS_COLORS[entry.name] || '#9ca3af'
                      const isSelected = status === entry.name
                      return (
                        <Cell 
                          key={`cell-${entry.name}`} 
                          fill={color} 
                          stroke={isSelected ? '#ffffff' : 'none'}
                          strokeWidth={isSelected ? 4 : 0}
                          className="cursor-pointer hover:opacity-80 transition-opacity" 
                        />
                      )
                    })}
                  </Pie>
                  <Tooltip formatter={(val: any) => [Number(val), 'จำนวนเอกสาร']} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-600 text-sm">ไม่มีข้อมูลเพื่อจำแนกสถานะ</div>
            )}
          </div>
        </div>
      </div>

      {/* Supplier Performance Bar Chart (Story 4.3 with drill-down 4.4) */}
      <div className="glass-panel p-6 bg-white/10 border-white/20 backdrop-blur-md">
        <h4 className="font-bold text-lg text-slate-900 mb-1 flex items-center gap-2">
          <Users className="text-[#8b5cf6]" size={20} />
          ปริมาณธุรกรรมแยกตามกลุ่มคู่ค้า (Top Partners Volume)
        </h4>
        <p className="text-xs text-slate-600 mb-6">วิเคราะห์ปริมาณบิลที่ออกโดยคู่ค้าแต่ละราย คลิกแต่ละแท่งเพื่อวิเคราะห์เจาะลึก (Drill-down)</p>
        <div className="h-72 w-full">
          {supplierBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplierBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  formatter={(val: any, _name: any, props: any) => [val, `จำนวนบิลของ ${String(props?.payload?.fullName || '')}`]}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[8, 8, 0, 0]}
                  onClick={(d: any) => handleSupplierClick(String(d?.fullName || ''))}
                >
                  {supplierBarData.map((entry, index) => {
                    const isSelected = supplierName === entry.fullName
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={isSelected ? '#8b5cf6' : DEFAULT_COLORS[index % DEFAULT_COLORS.length]} 
                        stroke={isSelected ? '#ffffff' : 'none'}
                        strokeWidth={isSelected ? 3 : 0}
                        className="cursor-pointer hover:opacity-85 transition-opacity"
                      />
                    )
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-600 text-sm">ไม่พบคู่ค้าในชุดตัวกรองนี้</div>
          )}
        </div>
      </div>
    </div>
  )
}
