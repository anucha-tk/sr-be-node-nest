import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FileSearch, Clock, CheckCircle2, Lock } from 'lucide-react'
import { fetchApi } from '../api'
import { useWebSockets } from '../hooks/useWebSockets'
import ShowcaseComparisonCards from './ShowcaseComparisonCards'

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
  const { subscribe } = useWebSockets()

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
    const timer = setTimeout(() => {
      void loadData()
    }, 0)
    return () => clearTimeout(timer)
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
      <ShowcaseComparisonCards
        card1={{
          problem: (
            <>
              บัญชีรายรับและข้อมูลโอนเงินอาจถูกแก้ไข/ลบโดยมิชอบจากบุคคลภายใน หรือเกิดจากความเสียหายของข้อมูลในระบบบัญชีปกติ ทำให้ <span className="font-bold text-rose-600">ข้อมูลการโอนเงินคู่ค้าสูญหาย ยอดเงินจริงไม่ตรงกับรายงาน และขัดต่อกฎหมายภาษี</span>
            </>
          ),
          solution: (
            <>
              ออกแบบระบบจัดเก็บ Log ธุรกรรมที่แก้ไขไม่ได้ (Immutable Audit Log - WORM Concept) บังคับบันทึกประวัติการบวก/ลบเงินของแต่ละคู่ค้าคู่กับ correlationId เสมอ
            </>
          ),
          impact: (
            <>
              บัญชีและประวัติรายรับคู่ค้าโปร่งใส ตรวจสอบย้อนกลับได้ครบถ้วน <span className="font-bold text-rose-600">ป้องกันการแก้ไขข้อมูลย้อนหลังและการทุจริตยอดเงิน 100%</span> พร้อมเชื่อมต่อส่งข้อมูลแบบสดทันที
            </>
          ),
        }}
        card2={{
          title: "สมุดบันทึกตรวจสอบธุรกรรมที่ไม่มีใครสามารถแก้ไขได้ (Immutable Audit Ledger)",
          leftTitle: "ถ้าไม่ใช้ Pattern (ก่อน)",
          leftContent: (
            <>
              <p>บันทึกยอดเงินสุทธิลงตารางฐานข้อมูลปกติ ➔ แฮกเกอร์แอบแก้ค่าตัวเลขตรงๆ ในฐานข้อมูล</p>
              <p className="font-bold text-rose-600">➔ ผลลัพธ์: ไม่มีประวัติการแก้ไข บัญชีจับมือใครดมไม่ได้ สูญเสียเงินมหาศาล</p>
            </>
          ),
          rightTitle: "สิ่งที่เราใช้ (หลัง)",
          rightContent: (
            <>
              <p>ทุกการอัปเดตจะบันทึก Log ใหม่เสมอห้ามแก้ไขทับ (WORM) ➔ ตรวจสอบค่าตัวเลขสุทธิขัดแย้งกับ Log</p>
              <p className="font-bold text-emerald-600">➔ ผลลัพธ์: หากมีสิ่งผิดปกติ ระบบจะร้องเตือนทันที ตรวจสอบย้อนกลับได้ใน 1 วินาที</p>
            </>
          ),
        }}
      />

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
