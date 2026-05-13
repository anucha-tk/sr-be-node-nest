import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileSearch, Clock, CheckCircle2, Lock } from 'lucide-react'
import { fetchApi } from '../api'

export default function AuditTrailView() {
  const [audits, setAudits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    const res = await fetchApi<any>('/v1/suppliers/audit-logs')
    if (res.success && Array.isArray(res.data)) {
      setAudits(res.data.map((item: any) => ({
        id: item.id,
        correlationId: item.correlationId,
        action: 'UPDATE_BALANCE',
        details: `เพิ่มเงิน $${item.amount} (ยอดเดิม: $${item.previousBalance} ➔ ยอดใหม่: $${item.newBalance})`,
        time: new Date(item.createdAt).toLocaleTimeString(),
        status: 'success'
      })))
    } else if (res.data && Array.isArray(res.data)) { // fallback if success isn't strictly true but data is an array
      setAudits(res.data.map((item: any) => ({
        id: item.id,
        correlationId: item.correlationId,
        action: 'UPDATE_BALANCE',
        details: `เพิ่มเงิน $${item.amount} (ยอดเดิม: $${item.previousBalance} ➔ ยอดใหม่: $${item.newBalance})`,
        time: new Date(item.createdAt).toLocaleTimeString(),
        status: 'success'
      })))
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-8">
      {/* Explanation for Non-Tech */}
      <div className="glass-panel p-6 bg-amber-50 border-amber-200">
        <h3 className="text-xl font-bold text-amber-600 mb-2">เปรียบเทียบการทำงาน (Analogy)</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          ระบบ <span className="font-bold">Audit Log</span> แบบ <span className="text-amber-600 font-bold">Immutable (แก้ไขไม่ได้)</span> เปรียบเสมือน <span className="text-rose-600 font-bold">"สมุดข่อยโบราณที่เขียนด้วยหมึกฝังลึก"</span> 
          ทุกครั้งที่มีการเปลี่ยนตัวเลขยอดเงินในบัญชี ระบบจะบังคับให้จดประวัติลงสมุดเล่มนี้เสมอ โดยบันทึกว่า ใครทำอะไร ยอดเดิมเท่าไหร่ และยอดใหม่เท่าไหร่ 
          ซึ่ง <span className="text-emerald-600 font-bold">ไม่มีใครสามารถกลับมาลบ หรือแก้ไขประวัติบรรทัดที่เขียนไปแล้วได้ (แม้แต่โปรแกรมเมอร์เองก็ตาม)</span> 
          เพื่อความโปร่งใสและใช้ตรวจสอบย้อนหลังได้ 100%
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
              <FileSearch size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">สมุดบันทึกประวัติที่แก้ไขไม่ได้ (Immutable Audit Log)</h3>
              <p className="text-sm text-slate-600">เทคโนโลยี: WORM (Write Once, Read Many) Storage Concept</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border border-slate-100 text-sm">
            <Lock size={14} className="text-rose-600" />
            <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">Locked (Read-Only)</span>
          </div>
        </div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 text-sm">
                <th className="py-3 px-4 font-medium">เวลา (Time)</th>
                <th className="py-3 px-4 font-medium">รหัสอ้างอิง (Ref ID)</th>
                <th className="py-3 px-4 font-medium">รายละเอียดการเปลี่ยนแปลง (Details)</th>
                <th className="py-3 px-4 font-medium">สถานะ</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading && audits.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-slate-600">กำลังดึงข้อมูลสมุดบันทึก...</td></tr>
              ) : audits.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-slate-600">ยังไม่มีประวัติการทำรายการ</td></tr>
              ) : audits.map((log) => (
                <motion.tr 
                  initial={{ opacity: 0, backgroundColor: 'rgba(245, 158, 11, 0.2)' }}
                  animate={{ opacity: 1, backgroundColor: 'rgba(0, 0, 0, 0)' }}
                  transition={{ duration: 1 }}
                  key={log.id} 
                  className="border-b border-slate-100 hover:bg-white/60 transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock size={14} /> {log.time}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-primary">
                    {log.correlationId?.split('-')[0]}...
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono text-xs">{log.details}</td>
                  <td className="py-3 px-4">
                    {log.status === 'success' && <span className="text-emerald-600 flex items-center gap-1 font-bold text-xs uppercase"><CheckCircle2 size={12}/> Verified</span>}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

