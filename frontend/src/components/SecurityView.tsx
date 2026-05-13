import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Key, Lock, CheckCircle2, Info, X, FileJson } from 'lucide-react'
import { fetchApi } from '../api'

export default function SecurityView() {
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [loadingKeys, setLoadingKeys] = useState(true)
  
  const [showJwtModal, setShowJwtModal] = useState(false)
  const [jwtData, setJwtData] = useState<any>(null)
  const [loadingJwt, setLoadingJwt] = useState(false)

  useEffect(() => {
    const loadApiKeys = async () => {
      setLoadingKeys(true)
      // Call the real endpoint we just added
      const res = await fetchApi<any[]>('/v1/auth/api-keys')
      if (res.success && Array.isArray(res.data)) {
        setApiKeys(res.data)
      } else if (res.data) {
        // If data is returned directly or inside an object
        setApiKeys(Array.isArray(res.data) ? res.data : [])
      }
      setLoadingKeys(false)
    }
    loadApiKeys()
  }, [])

  const handleInspectJwt = async () => {
    setShowJwtModal(true)
    setLoadingJwt(true)
    // Fetch the actual current payload the backend sees
    const res = await fetchApi<any>('/auth-test/protected')
    if (res.success && res.data) {
      setJwtData(res.data.user)
    } else {
      setJwtData({ error: "Failed to fetch JWT context from backend" })
    }
    setLoadingJwt(false)
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* OIDC Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
            ทำหน้าที่เสมือน <span className="text-primary font-bold">"พนักงานรักษาความปลอดภัยหน้าตึก"</span> คอยตรวจสอบว่าคนที่เข้ามาเป็นพนักงานตัวจริงหรือไม่ และมีสิทธิ์เข้าถึงข้อมูลระดับไหน เพื่อป้องกันผู้บุกรุก
          </p>
          
          <div className="bg-white/60 p-4 rounded-xl border border-slate-100 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600">สถานะระบบการตรวจ</span>
              <span className="flex items-center gap-1 text-emerald-400 text-sm font-bold">
                <CheckCircle2 size={14} /> ทำงานปกติ (Active)
              </span>
            </div>
            <div className="text-xs font-mono text-slate-600 break-all flex items-center gap-2">
              <Info size={14} className="text-primary" />
              ศูนย์ออกบัตร: auth.internal.corp
            </div>
          </div>

          <button 
            onClick={handleInspectJwt}
            className="w-full flex items-center justify-center gap-2 py-2 bg-white/60 hover:bg-white/80 rounded-lg text-sm font-medium transition-colors border border-slate-200"
          >
            <FileJson size={16} />
            สุ่มตรวจสอบข้อมูลบัตรผ่าน (Inspect JWT)
          </button>
        </motion.div>

        {/* API Key Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 flex flex-col"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400">
              <Key size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">กุญแจผ่านทางสำหรับระบบ</h3>
              <p className="text-sm text-slate-600">เทคโนโลยี: API Key Security</p>
            </div>
          </div>

          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            เวลา <span className="text-emerald-400 font-bold">"ระบบคอมพิวเตอร์ด้วยกันเอง"</span> ต้องการขอข้อมูล จะใช้กุญแจพิเศษนี้แทนการพิมพ์รหัสผ่าน โดยเราสามารถระบุได้ว่ากุญแจแต่ละดอกทำอะไรได้บ้าง
          </p>

          <div className="space-y-3 flex-1 overflow-y-auto pr-2">
            {loadingKeys ? (
              <div className="text-center text-slate-600 text-sm py-4">กำลังโหลดข้อมูลกุญแจ...</div>
            ) : apiKeys.length === 0 ? (
              <div className="text-center text-slate-600 text-sm py-4">ไม่พบกุญแจในระบบ</div>
            ) : (
              apiKeys.map((key) => (
                <div key={key.id} className="flex flex-col p-3 bg-white/60 rounded-lg border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Lock size={14} className="text-slate-600" />
                      <span className="text-sm font-bold text-slate-600">{key.name}</span>
                    </div>
                    {key.isActive && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-600 uppercase font-bold tracking-wider">
                        <CheckCircle2 size={10} /> Active
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {key.scopes?.map((scope: string) => (
                      <span key={scope} className={`text-xs px-2 py-1 rounded ${
                        scope === 'admin' ? 'bg-primary/10 text-primary' : 'bg-slate-500/20 text-slate-600'
                      }`}>
                        สิทธิ์: {scope}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* JWT Inspection Modal */}
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
                <h3 className="text-xl font-bold">ข้อมูลบัตรผ่านที่ถูกแกะรอย (Decoded JWT/Context)</h3>
              </div>
              
              <p className="text-slate-600 text-sm mb-6">
                นี่คือข้อมูลที่ระบบ Backend มองเห็นเมื่อมีการยืนยันตัวตนเข้ามา ซึ่งจะใช้ในการพิจารณาสิทธิ์การเข้าถึง API
              </p>

              <div className="bg-black/50 p-4 rounded-xl border border-slate-100 overflow-x-auto">
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
    </>
  )
}
