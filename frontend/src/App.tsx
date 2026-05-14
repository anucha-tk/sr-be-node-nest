import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ArchitectureDiagram from './components/ArchitectureDiagram'
import MetricsDashboard from './components/MetricsDashboard'
import PrometheusDashboard from './components/PrometheusDashboard'
import PresentationMode from './components/PresentationMode'
import ShowcaseSidebar from './components/ShowcaseSidebar'
import PerformanceLab from './components/PerformanceLab'
import SecurityView from './components/SecurityView'
import AuditTrailView from './components/AuditTrailView'
import ApiDocsView from './components/ApiDocsView'
import IdempotencyView from './components/IdempotencyView'
import SystemPulseSidebar from './components/SystemPulseSidebar'

export default function App() {
  const [activeTab, setActiveTab] = useState('intro')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [showPresentation, setShowPresentation] = useState(false)

  const renderContent = () => {
    switch (activeTab) {
      case 'intro':
        return (
          <div className="space-y-8">
            <div className="glass-panel p-6 bg-primary/5 border-primary/10">
              <h3 className="text-xl font-bold text-primary mb-2">ยินดีต้อนรับสู่ Backend Showcase</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                ระบบนี้คือ <strong>"แดชบอร์ดจำลอง"</strong> ที่ถูกสร้างขึ้นมาเพื่อแสดงให้เห็นถึงการทำงานเบื้องหลัง (Backend) ของระบบประมวลผลธุรกรรมทางการเงิน (Revenue Engine) ที่พัฒนาด้วยสถาปัตยกรรมยุคใหม่ 
              </p>
              <ul className="list-disc list-inside text-slate-600 text-sm leading-relaxed space-y-1 ml-4">
                <li><strong>NestJS:</strong> โครงสร้างหลักของ API ที่แข็งแรงและปลอดภัย</li>
                <li><strong>Apache Kafka:</strong> ระบบคิวรองรับข้อมูลมหาศาลแบบ Event-Driven</li>
                <li><strong>PostgreSQL:</strong> ฐานข้อมูลที่รองรับ Transaction และการดึงข้อมูล 1 ล้านเรคคอร์ดในพริบตา</li>
                <li><strong>Keycloak:</strong> ระบบรักษาความปลอดภัยและระบุตัวตนระดับองค์กร</li>
              </ul>
            </div>
            <ArchitectureDiagram />
          </div>
        )
      case 'security':
        return <SecurityView />
      case 'event-flow':
        return <MetricsDashboard />
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

  const getHeaderInfo = () => {
    switch(activeTab) {
      case 'intro': return { title: 'Intro & Architecture', desc: 'ภาพรวมระบบและเทคโนโลยีหลักที่ใช้' }
      case 'security': return { title: 'Identity & Shield', desc: 'ระบบความปลอดภัยและตัวตน' }
      case 'event-flow': return { title: 'Event Pulse', desc: 'การประมวลผลแบบ Event-Driven (Kafka)' }
      case 'observability': return { title: 'Infrastructure Pulse', desc: 'สถานะและการใช้ทรัพยากรของระบบในรูปแบบ Prometheus Metrics' }
      case 'performance': return { title: 'Warp Speed', desc: 'ประสิทธิภาพการประมวลผลข้อมูล 1M+ เรคคอร์ด' }
      case 'audit': return { title: 'Paper Trail', desc: 'ความโปร่งใสและความถูกต้องของข้อมูล (Audit Log)' }
      case 'api-docs': return { title: 'Dev Portal', desc: 'หน้าต่างเชื่อมต่อสำหรับนักพัฒนา (Scalar/OpenAPI)' }
      case 'idempotency': return { title: 'Safety Guard', desc: 'การป้องกันความผิดพลาดและระบบ Idempotency' }
      default: return { title: '', desc: '' }
    }
  }

  const headerInfo = getHeaderInfo()

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
    </div>
  )
}
