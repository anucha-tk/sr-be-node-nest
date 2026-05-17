import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Key, X, FileJson, Zap, AlertTriangle, ShieldAlert } from 'lucide-react'
import { fetchApi } from '../api'

import ShowcaseComparisonCards from './ShowcaseComparisonCards'

interface ApiKey {
  id: string;
  name: string;
  isActive: boolean;
  scopes: string[];
}

interface RateLimitLog {
  id: number;
  status: number;
  message: string;
  time: string;
}

interface ProtectedResponse {
  user: Record<string, unknown>;
}

export default function SecurityView() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loadingKeys, setLoadingKeys] = useState(true)
  
  const [showJwtModal, setShowJwtModal] = useState(false)
  const [jwtData, setJwtData] = useState<Record<string, unknown> | null>(null)
  const [loadingJwt, setLoadingJwt] = useState(false)

  // Rate Limit Demo State
  const [rateLimitLogs, setRateLimitLogs] = useState<RateLimitLog[]>([])
  const [isAttacking, setIsAttacking] = useState(false)
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())

  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetchApi<ApiKey[]>('/v1/auth/api-keys')
      if (mountedRef.current) {
        if (res.success && Array.isArray(res.data)) {
          setApiKeys(res.data)
        } else if (res.data && Array.isArray(res.data)) {
          setApiKeys(res.data as ApiKey[])
        }
        setLoadingKeys(false)
      }
    }
    const timer = setTimeout(() => {
      void fetchData()
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const handleInspectJwt = async () => {
    setShowJwtModal(true)
    setLoadingJwt(true)
    const res = await fetchApi<ProtectedResponse>('/auth-test/protected')
    if (mountedRef.current) {
      if (res.success && res.data) {
        setJwtData(res.data.user)
      } else {
        setJwtData({ error: "Failed to fetch JWT context from backend" })
      }
      setLoadingJwt(false)
    }
  }

  const simulateAttack = useCallback(async () => {
    if (isAttacking) return
    setIsAttacking(true)
    
    // Attempt 10 rapid requests
    for (let i = 0; i < 10; i++) {
      try {
        const res = await fetchApi<{ message: string }>('/v1/security-showcase/rate-limit-test')
        
        if (mountedRef.current) {
          const status = res.status || 200;
          const message = status === 429 
            ? 'BLOCK: Rate Limit Exceeded' 
            : (res.data?.message || 'Allowed');

          setRateLimitLogs(prev => [{
            id: Date.now() + i,
            status: status,
            message: message,
            time: new Date().toLocaleTimeString()
          }, ...prev.slice(0, 9)])

          if (status === 429) {
            setBlockedUntil(Date.now() + 60000)
            break
          }
        }
      } catch (err: unknown) {
        console.error(err)
      }
      await new Promise(resolve => setTimeout(resolve, 150))
    }
    
    if (mountedRef.current) {
      setIsAttacking(false)
    }
  }, [isAttacking])

  useEffect(() => {
    const timer = setInterval(() => {
      const currentNow = Date.now()
      if (mountedRef.current) {
        setNow(currentNow)
        if (blockedUntil && currentNow > blockedUntil) {
          setBlockedUntil(null)
        }
      }
    }, 1000)
    return () => { clearInterval(timer) }
  }, [blockedUntil])

  return (
    <div className="space-y-8">
      <ShowcaseComparisonCards
        card1={{
          problem: (
            <>
              ยอดรายรับของบริษัทและข้อมูลสลิปคู่ค้าเป็นข้อมูลความลับสูง หากไม่มีการสกัดกัน แฮกเกอร์อาจยิงบอทสุ่มเจาะดึงข้อมูลบิล หรือพนักงานแอบดูยอดเงินหลังบ้าน <span className="font-bold text-rose-600">ทำให้ข้อมูลความลับทางการค้ารั่วไหลและเสียชื่อเสียงทางธุรกิจ</span>
            </>
          ),
          solution: (
            <>
              ติดตั้งระบบสิทธิ์ Keycloak ควบคุมการล็อกอิน และกำหนดสิทธิ์เรียกใช้ผ่าน API Key Scopes คู่กับระบบตรวจความเร็วยิงสุ่ม (Rate Limiting) ป้องกันบอท
            </>
          ),
          impact: (
            <>
              ข้อมูลทางการเงินและใบแจ้งหนี้ปลอดภัยสูงสุด <span className="font-bold text-rose-600">สกัดการแอบดึงข้อมูลการเงินและการโจมตีกระหน่ำยิงรัวได้ 100%</span> พร้อมบดบังยอดเงินตามสิทธิ์
            </>
          ),
        }}
        card2={{
          title: "การควบคุมความปลอดภัยห้องนิรภัยทางการเงิน (Multi-layered Financial Vault Security)",
          leftTitle: "ถ้าไม่ใช้ Pattern (ก่อน)",
          leftContent: (
            <>
              <p>ไม่มีด่านคัดกรอง ➔ บอทยิงสุ่มค้นหาเลขใบแจ้งหนี้ดึงรายได้คู่ค้าไปได้โดยตรง</p>
              <p className="font-bold text-rose-600">➔ ผลลัพธ์: ข้อมูลความลับรั่วไหล ละเมิดกฎหมายความเป็นส่วนตัวการเงิน</p>
            </>
          ),
          rightTitle: "สิ่งที่เราใช้ (หลัง)",
          rightContent: (
            <>
              <p>ผู้ใช้งานทั่วไปจะเห็นยอดเงินถูกปิดบัง (Masked: ฿*,***.**) ➔ หากบอทยิงถี่เกิน 5 ครั้ง/นาที</p>
              <p className="font-bold text-emerald-600">➔ ผลลัพธ์: ระบบสั่งล็อกพอร์ตบล็อกการเชื่อมต่อทันทีใน 1 มิลลิวินาที (HTTP 429)</p>
            </>
          ),
        }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">ระบบตรวจบัตรพนักงาน</h3>
                <p className="text-sm text-slate-600">เทคโนโลยี: Keycloak OIDC</p>
              </div>
            </div>

            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              ทำหน้าที่เสมือน <span className="text-primary font-bold">"พนักงานรักษาความปลอดภัยหน้าตึก"</span> ตรวจสอบว่าพนักงานมีสิทธิ์เข้าถึงข้อมูลระดับไหน
            </p>
            
            <button 
              onClick={() => { void handleInspectJwt() }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white/60 hover:bg-white/80 rounded-xl text-sm font-bold transition-all border border-slate-200"
            >
              <FileJson size={16} />
              สุ่มตรวจสอบข้อมูลบัตรผ่าน (Inspect JWT)
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-600">
                <Key size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">กุญแจผ่านทางสำหรับระบบ</h3>
                <p className="text-sm text-slate-600">เทคโนโลยี: API Key Security</p>
              </div>
            </div>

            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {loadingKeys ? (
                <div className="text-center text-slate-600 text-sm py-4">กำลังโหลดข้อมูลกุญแจ...</div>
              ) : (
                apiKeys.map((key) => (
                  <div key={key.id} className="p-3 bg-white/40 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold">{key.name}</span>
                      <span className="text-[10px] text-emerald-600 font-bold">ACTIVE</span>
                    </div>
                    <div className="flex gap-1">
                      {key.scopes?.map(s => (
                        <span key={s} className="text-[9px] bg-slate-200 px-1.5 py-0.5 rounded uppercase">{s}</span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-6 flex flex-col"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-rose-500/10 rounded-lg text-rose-600">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">ระบบป้องกันการโจมตี</h3>
              <p className="text-sm text-slate-600">เทคโนโลยี: Smart Rate Limiting (429)</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
            <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Zap size={14} className="text-amber-500" /> 
              โจทย์: ลองถล่มยิง API รัวๆ (Brute Force Simulation)
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              ระบบกำหนดให้ยิงได้ไม่เกิน <span className="font-bold text-rose-600">5 ครั้งต่อนาที</span> 
              หากยิงเกิน ระบบจะส่ง <span className="font-bold text-rose-600">HTTP 429 Too Many Requests</span> กลับมาทันทีเพื่อเซฟเครื่อง Server
            </p>
          </div>

          <button
            disabled={isAttacking || !!blockedUntil}
            onClick={() => { void simulateAttack() }}
            className={`w-full py-4 rounded-xl font-bold transition-all mb-6 flex items-center justify-center gap-2 ${
              blockedUntil 
                ? 'bg-rose-100 text-rose-600 cursor-not-allowed' 
                : 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200'
            }`}
          >
            {blockedUntil ? (
              <>
                <AlertTriangle size={18} /> ติดโทษแบน: รอ {Math.ceil((blockedUntil - now) / 1000)} วินาที
              </>
            ) : (
              <>
                <Zap size={18} /> เริ่มการโจมตี (Flood API)
              </>
            )}
          </button>

          <div className="flex-1 bg-slate-900 rounded-xl p-4 font-mono text-[11px] overflow-hidden flex flex-col">
            <div className="text-slate-500 mb-2 border-b border-slate-800 pb-2 flex justify-between">
              <span>RATE_LIMIT_FIREWALL_LOG</span>
              <span className="animate-pulse text-emerald-500">● LIVE</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
              <AnimatePresence initial={false}>
                {rateLimitLogs.map(log => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex justify-between items-center ${log.status === 429 ? 'text-rose-400 font-bold' : 'text-slate-400'}`}
                  >
                    <span>[{log.time}] GET /rate-limit-test</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] ${log.status === 429 ? 'bg-rose-500 text-white' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {log.status}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
              {rateLimitLogs.length === 0 && (
                <div className="h-full flex items-center justify-center text-slate-700 italic">
                  No activity detected
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showJwtModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative"
            >
              <button 
                onClick={() => setShowJwtModal(false)}
                className="absolute top-4 right-4 text-slate-600 hover:text-slate-900"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <FileJson className="text-primary" size={24} />
                <h3 className="text-xl font-bold">Decoded Security Context</h3>
              </div>
              
              <div className="bg-black/80 p-4 rounded-xl border border-slate-100 overflow-x-auto">
                {loadingJwt ? (
                  <div className="text-center text-slate-600 py-8">กำลังถอดรหัสข้อมูล...</div>
                ) : (
                  <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
                    {JSON.stringify(jwtData, null, 2)}
                  </pre>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
