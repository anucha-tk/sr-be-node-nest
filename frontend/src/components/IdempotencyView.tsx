import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Repeat, ShieldCheck, AlertCircle, Play, CheckCircle2, Terminal } from 'lucide-react'
import ShowcaseComparisonCards from './ShowcaseComparisonCards'
import { fetchApi } from '../api'

interface ProcessResult {
  status: 'processed' | 'skipped' | 'failed';
  message: string;
}

interface LogEntry {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  msg: string;
  raw?: unknown;
}

export default function IdempotencyView() {
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [lastPayload, setLastPayload] = useState<Record<string, unknown> | null>(null)

  const addLog = useCallback((type: 'info' | 'success' | 'warning' | 'error', msg: string, raw?: unknown) => {
    setLogs(prev => [{ id: Date.now(), type, msg, raw }, ...prev.slice(0, 9)])
  }, [])

  const runSimulation = async (isDuplicate = false) => {
    setLoading(true)
    
    // Prepare payload
    let payload: Record<string, unknown>;
    if (isDuplicate && lastPayload) {
      payload = lastPayload;
      addLog('info', `Simulating DUPLICATE request with Event ID: ${(payload.eventId as string).split('-')[0]}...`);
    } else {
      const eventId = `evt_${Math.random().toString(36).substring(7)}`;
      payload = {
        eventId,
        correlationId: `corr_${Math.random().toString(36).substring(7)}`,
        invoiceId: `inv_${Math.random().toString(36).substring(7)}`,
        supplierId: 'seed-supplier-001',
        amount: 100.0
      };
      setLastPayload(payload);
      addLog('info', `Simulating NEW request with Event ID: ${(payload.eventId as string).split('_')[1]}`);
    }

    try {
      const res = await fetchApi<ProcessResult>('/v1/suppliers/simulate-duplicate', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.success && res.data) {
        const result = res.data;
        if (result.status === 'processed') {
          addLog('success', `Backend: ${result.message}`, result);
        } else if (result.status === 'skipped') {
          addLog('warning', `Backend Detected Duplicate: ${result.message}`, result);
        } else {
          addLog('error', `Backend Failed: ${result.message}`, result);
        }
      } else {
        addLog('error', 'API Request failed');
      }
    } catch (err: unknown) {
      console.error(err)
      addLog('error', 'Network error');
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <ShowcaseComparisonCards
        card1={{
          problem: (
            <>
              ลูกค้ากดปุ่มชำระเงินบิลเดิมซ้ำๆ รัวๆ หรือกดจ่ายเงินตอนที่สัญญาณอินเทอร์เน็ตหลุดพอดี ทำให้ระบบส่งคำขอเงินโอนตัวเดิมเข้ามาเบิ้ล <span className="font-bold text-rose-600">ทำให้เงินปลิว คู่ค้าถูกหักยอดเงินซ้ำซ้อน 2 รอบ บัญชีติดลบ และเกิดความเสียหายรุนแรง</span>
            </>
          ),
          solution: (
            <>
              วางระบบป้องกันทำรายการซ้ำซ้อน (Idempotency Engine) บันทึกและดึงรหัสธุรกรรมจำเพาะ (eventId) ตรวจสอบกับประวัติการประมวลผลก่อนดำเนินการบันทึกยอดเงินเสมอ
            </>
          ),
          impact: (
            <>
              ขจัดความเสี่ยงจากการจ่ายเงินซ้ำซ้อนได้อย่างเด็ดขาด <span className="font-bold text-rose-600">หนึ่งคำสั่งซื้อชำระเงินเกิดขึ้นเพียงครั้งเดียวเสมอ 100% แม้จะถูกยิงรัวเข้ามา 100 รอบก็ตาม</span>
            </>
          ),
        }}
        card2={{
          title: "เกราะกำบังการโอนเงินซ้ำซ้อนและป้องกันบัญชีเบิ้ลจ่าย (Double-Payment Shield)",
          leftTitle: "ถ้าไม่ใช้ Pattern (ก่อน)",
          leftContent: (
            <>
              <p>เน็ตช้าลูกค้ากดจ่ายเงินรัวๆ 5 รอบ ➔ ระบบไล่บันทึกเงินโอนบวกเข้าบัญชีไปทั้ง 5 รอบ</p>
              <p className="font-bold text-rose-600">➔ ผลลัพธ์: หักเงินลูกค้าซ้ำ 5 เท่า ร้านต้องมานั่งทยอยทำเรื่องโอนเงินคืนวุ่นวาย</p>
            </>
          ),
          rightTitle: "สิ่งที่เราใช้ (หลัง)",
          rightContent: (
            <>
              <p>ยิงข้อมูลชำระเงินเข้ามา 5 รอบ ➔ รอบแรกผ่าน ➔ รอบที่ 2-5 คัดกรองเจอ Event ID ซ้ำ</p>
              <p className="font-bold text-emerald-600">➔ ผลลัพธ์: ระบบส่งสถานะข้าม (HTTP 200 OK - SKIPPED) ปลอดภัยไร้กังวล</p>
            </>
          ),
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Control Panel */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-6"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
              <Repeat size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">ทดลองยิงข้อมูล (Simulation Control)</h3>
              <p className="text-sm text-slate-600">เปรียบเสมือนการกดปุ่ม "จ่ายเงิน" จากหน้าแอป</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-white/40 rounded-xl border border-dashed border-slate-300">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">ขั้นตอนการทดสอบ (Test Steps)</div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">1</div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">ยิงข้อมูลชุดใหม่ (First Attempt)</p>
                    <p className="text-xs text-slate-500">ระบบจะประมวลผลและบันทึกยอดเงินเพิ่มขึ้นจริง</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">2</div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">ยิงข้อมูลเดิมซ้ำ (Double Payment)</p>
                    <p className="text-xs text-slate-500">ระบบจะตรวจจับ ID เดิมได้ และระงับการทำงานทันทีเพื่อความปลอดภัย</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                disabled={loading}
                onClick={() => { void runSimulation(false) }}
                className="flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200"
              >
                <Play size={18} /> ยิงข้อมูลใหม่
              </button>
              <button
                disabled={loading || !lastPayload}
                onClick={() => { void runSimulation(true) }}
                className="flex items-center justify-center gap-2 py-4 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-200"
              >
                <Repeat size={18} /> ยิงข้อมูลเดิมซ้ำ
              </button>
            </div>
            
            {!lastPayload && !loading && (
              <p className="text-center text-xs text-slate-400 italic">กรุณากด "ยิงข้อมูลใหม่" เพื่อเริ่มการทดสอบ</p>
            )}
          </div>
        </motion.div>

        {/* Live Logs / Terminal */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-6 bg-slate-900 text-slate-300 font-mono text-xs overflow-hidden flex flex-col h-[500px]"
        >
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4 shrink-0">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-indigo-400" />
              <span className="font-bold text-slate-400">IDEMPOTENCY_LOG_STREAM</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
            <AnimatePresence initial={false}>
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded border ${
                    log.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                    log.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                    log.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                    'bg-slate-800/50 border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {log.type === 'success' && <ShieldCheck size={14} className="mt-0.5 shrink-0" />}
                    {log.type === 'warning' && <AlertCircle size={14} className="mt-0.5 shrink-0" />}
                    {log.type === 'info' && <Play size={14} className="mt-0.5 shrink-0" />}
                    <span>{log.msg}</span>
                  </div>
                  {!!log.raw && (
                    <pre className="mt-2 p-2 bg-black/30 rounded text-[10px] overflow-x-auto text-slate-500">
                      {JSON.stringify(log.raw, null, 2)}
                    </pre>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {logs.length === 0 && (
              <div className="h-full flex items-center justify-center text-slate-600 italic">
                Waiting for simulation events...
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Visual Proof */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-4 flex items-center gap-4 border-l-4 border-l-indigo-500">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><CheckCircle2 size={20} /></div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Kafka Unique ID</p>
            <p className="text-sm font-bold">ตรวจสอบทุก Event</p>
          </div>
        </div>
        <div className="glass-panel p-4 flex items-center gap-4 border-l-4 border-l-emerald-500">
          <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><ShieldCheck size={20} /></div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Database Integrity</p>
            <p className="text-sm font-bold">กันธุรกรรมซ้อน 100%</p>
          </div>
        </div>
        <div className="glass-panel p-4 flex items-center gap-4 border-l-4 border-l-rose-500">
          <div className="p-2 bg-rose-100 rounded-lg text-rose-600"><Repeat size={20} /></div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Safe Retry</p>
            <p className="text-sm font-bold">ยิงใหม่ได้ ไม่ต้องกลัวยอดเบิ้ล</p>
          </div>
        </div>
      </div>
    </div>
  )
}
