import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FileSearch, Clock, CheckCircle2, Lock, Zap } from 'lucide-react'
import { fetchApi } from '../api'
import { useWebSockets } from '../hooks/useWebSockets'

interface AuditLog {
  id: string;
  correlationId: string;
  amount: number;
  previousBalance: number;
  newBalance: number;
  createdAt: string;
}

interface MappedAudit {
  id: string;
  correlationId: string;
  action: string;
  details: string;
  time: string;
  status: string;
}

export default function AuditTrailView() {
  const [audits, setAudits] = useState<MappedAudit[]>([])
  const [loading, setLoading] = useState(true)
  const { isConnected, subscribe } = useWebSockets()

  const mapAuditItem = useCallback((item: AuditLog): MappedAudit => ({
    id: item.id,
    correlationId: item.correlationId,
    action: 'UPDATE_BALANCE',
    details: `เพิ่มเงิน $${item.amount} (ยอดเดิม: $${item.previousBalance} ➔ ยอดใหม่: $${item.newBalance})`,
    time: new Date(item.createdAt).toLocaleTimeString(),
    status: 'success'
  }), [])

  const loadData = useCallback(async () => {
    const res = await fetchApi<AuditLog[]>('/v1/suppliers/audit-logs')
    if (res.success && Array.isArray(res.data)) {
      setAudits(res.data.map(mapAuditItem))
    } else if (res.data && Array.isArray(res.data)) {
      setAudits((res.data as AuditLog[]).map(mapAuditItem))
    }
    setLoading(false)
  }, [mapAuditItem])

  useEffect(() => {
    void loadData()
  }, [loadData])

  useEffect(() => {
    const unsubscribe = subscribe('audit_log_created', (newLog: AuditLog) => {
      console.log('New audit log received via WebSocket:', newLog)
      setAudits((prev) => [mapAuditItem(newLog), ...prev.slice(0, 19)])
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [subscribe, mapAuditItem])

  return (
    <div className="space-y-8">
      {/* Explanation for Non-Tech */}
      <div className="glass-panel p-6 bg-amber-50 border-amber-200">
        <h3 className="text-xl font-bold text-amber-600 mb-2 flex items-center gap-2">
          เปรียบเทียบการทำงาน (Analogy)
          {isConnected && (
            <span className="ml-auto flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">
              <Zap size={10} /> Live WebSocket Connected
            </span>
          )}
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          ระบบ <span className="font-bold">Audit Log</span> แบบ <span className="text-amber-600 font-bold">Immutable (แก้ไขไม่ได้)</span> เปรียบเสมือน <span className="text-rose-600 font-bold">"สมุดข่อยโบราณที่เขียนด้วยหมึกฝังลึก"</span> 
          ทุกครั้งที่มีการเปลี่ยนตัวเลขยอดเงินในบัญชี ระบบจะบังคับให้จดประวัติลงสมุดเล่มนี้เสมอ 
          <span className="block mt-2 font-semibold text-primary italic">
            *ตอนนี้เปิดใช้งาน Real-time WebSocket: ข้อมูลจะเด้งขึ้นหน้าจอทันทีที่มีการบันทึกสำเร็จโดยไม่ต้องกด Refresh!
          </span>
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
                  transition={{ duration: 1.5 }}
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
