import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ArchitectureDiagram from './components/ArchitectureDiagram'
import MetricsDashboard from './components/MetricsDashboard'
import InsightsDashboard from './components/InsightsDashboard'
import PrometheusDashboard from './components/PrometheusDashboard'
import PresentationMode from './components/PresentationMode'
import ShowcaseSidebar from './components/ShowcaseSidebar'
import PerformanceLab from './components/PerformanceLab'
import SecurityView from './components/SecurityView'
import AuditTrailView from './components/AuditTrailView'
import ApiDocsView from './components/ApiDocsView'
import IdempotencyView from './components/IdempotencyView'
import SystemPulseSidebar from './components/SystemPulseSidebar'
import ShowcaseComparisonCards from './components/ShowcaseComparisonCards'
import { CommandPalette } from './components/CommandPalette'
import { PAGES } from './config/pages'

export default function App() {
  const [activeTab, setActiveTab] = useState('intro')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [showPresentation, setShowPresentation] = useState(false)

  const renderContent = () => {
    switch (activeTab) {
      case 'intro':
        return (
          <div className="space-y-8">
            <ShowcaseComparisonCards
              card1={{
                problem: (
                  <>
                    เมื่อบริษัทมีใบแจ้งหนี้และยอดธุรกรรมเข้ามาหลักล้านรายการ การค้นหายอดเงินหรือสรุปรายได้จากฐานข้อมูลแบบเดิมมักจะดีเลย์ ส่งผลให้ <span className="font-bold text-rose-600">ผู้บริหารมองไม่เห็นยอดเงินไหลเข้าแบบเรียลไทม์ และระบบชำระเงินปลายทางสะดุด</span>
                  </>
                ),
                solution: (
                  <>
                    แยกหน้าที่งาน! เก็บประวัติธุรกรรมไว้ในสมุดบัญชีหลัก (PostgreSql) แล้วส่งผ่านความเคลื่อนไหวทางการเงินผ่านสายพาน Kafka ไปที่ระบบสืบค้นประสิทธิภาพสูง (Elasticsearch) เพื่อคำนวณและแสดงผลเรียลไทม์
                  </>
                ),
                impact: (
                  <>
                    ทีมบัญชีและผู้บริหารสามารถเรียกดูรายงานรายได้และค้นหาใบแจ้งหนี้ได้ <span className="font-bold text-rose-600">เร็วขึ้นกว่าเดิม 10 เท่าในเวลาไม่ถึงวินาที</span> ช่วยให้ตัดสินใจทางธุรกิจได้อย่างแม่นยำ
                  </>
                ),
              }}
              card2={{
                title: "สถาปัตยกรรมตัดจ่ายเงินอัจฉริยะ (Smart Revenue Pipeline Architecture)",
                leftTitle: "ถ้าไม่ใช้ Pattern (ก่อน)",
                leftContent: (
                  <>
                    <p>ลูกค้าชำระเงิน ➔ ระบบรันคิวรีสแกนคำนวณสรุปยอดตรงๆ จาก Postgres ➔ ฐานข้อมูลทำงานหนักเกิน 100%</p>
                    <p className="font-bold text-rose-600">➔ ผลลัพธ์: ระบบจ่ายเงินสะดุด ลูกค้าชำระเงินไม่ได้ชั่วคราว</p>
                  </>
                ),
                rightTitle: "สิ่งที่เราใช้ (หลัง)",
                rightContent: (
                  <>
                    <p>ลูกค้าชำระเงิน ➔ ส่งข้อมูลบนสายพาน Kafka อัตโนมัติไป Elasticsearch ➔ ดึงวิเคราะห์เสร็จในเสี้ยววินาที</p>
                    <p className="font-bold text-emerald-600">➔ ผลลัพธ์: ระบบชำระเงินหลักทำงานได้อย่างราบรื่นและปลอดภัย 100%</p>
                  </>
                ),
              }}
            />
            <ArchitectureDiagram />
          </div>
        )
      case 'security':
        return <SecurityView />
      case 'event-flow':
        return <MetricsDashboard />
      case 'insights':
        return <InsightsDashboard />
      case 'observability':
        return <PrometheusDashboard />
      case 'performance':
        return <PerformanceLab />
      case 'audit':
        return <AuditTrailView />
      case 'api-docs':
        return <ApiDocsView />
      case 'idempotency':
        return <IdempotencyView />
      default:
        return null
    }
  }

  const activePage = PAGES.find((p) => p.id === activeTab)
  const headerInfo = activePage ? { title: activePage.title, desc: activePage.desc } : { title: '', desc: '' }

  return (
    <div className="flex min-h-screen bg-soft-bg text-slate-900 overflow-hidden">
      <AnimatePresence>
        {showPresentation && (
          <PresentationMode onClose={() => setShowPresentation(false)} />
        )}
      </AnimatePresence>

      <ShowcaseSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onLaunchDemo={() => setShowPresentation(true)}
      />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto relative">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full -z-10" />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-6xl mx-auto"
          >
            <header className="mb-12 flex items-end justify-between">
              <div>
                <h2 className="text-5xl font-extrabold mb-4 capitalize tracking-tight text-slate-900">
                  {headerInfo.title}
                </h2>
                <p className="text-slate-600 text-lg max-w-2xl">
                  {headerInfo.desc}
                </p>
              </div>
              <div className="hidden lg:block pb-2">
                <span className="px-3 py-1 rounded-full bg-white/60 border border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  Live System v1.0.4
                </span>
              </div>
            </header>

            <div className="relative z-10">
              {renderContent()}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <SystemPulseSidebar />
      <CommandPalette 
        setActiveTab={setActiveTab}
        onLaunchDemo={() => setShowPresentation(true)}
      />
    </div>
  )
}
