import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ArchitectureDiagram from './components/ArchitectureDiagram'
import MetricsDashboard from './components/MetricsDashboard'
import PresentationMode from './components/PresentationMode'
import { 
  LayoutDashboard, 
  Share2, 
  Zap, 
  ShieldCheck, 
  Presentation,
  Menu,
  X,
  Play
} from 'lucide-react'

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'architecture', label: 'Architecture', icon: Share2 },
  { id: 'performance', label: 'Performance', icon: Zap },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'presentation', label: 'Showcase', icon: Presentation },
]

import PerformanceLab from './components/PerformanceLab'

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [showPresentation, setShowPresentation] = useState(false)

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <MetricsDashboard />
      case 'architecture':
        return <ArchitectureDiagram />
      case 'performance':
        return <PerformanceLab />
      case 'presentation':
        return (
          <div className="flex flex-col items-center justify-center h-[500px] glass-panel p-12 text-center">
            <Presentation className="text-indigo-400 mb-6" size={64} />
            <h3 className="text-3xl font-bold mb-4 text-gradient">Enterprise Showcase</h3>
            <p className="text-slate-400 max-w-lg mb-8">
              Interactive project walkthrough and technical depth summary. 
              Click "Launch Demo" in the sidebar to start the presentation.
            </p>
          </div>
        )
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[500px] glass-panel p-12 text-center">
            <Zap className="text-slate-600 mb-6" size={64} />
            <h3 className="text-3xl font-bold mb-4 capitalize text-gradient">{activeTab} Module</h3>
            <p className="text-slate-500 max-w-lg">
              The {activeTab} analytics and deep-dive insights are currently in the 
              development backlog (Epic 4). Real-time data integration will be 
              implemented in the next phase.
            </p>
            <div className="mt-8 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Status: Implementation Backlog
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <AnimatePresence>
        {showPresentation && (
          <PresentationMode onClose={() => setShowPresentation(false)} />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="glass-panel h-[calc(100vh-2rem)] m-4 mr-0 flex flex-col z-50 transition-all duration-300"
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold premium-gradient bg-clip-text text-transparent"
            >
              Revenue Engine
            </motion.h1>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-4">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all mb-2 ${
                activeTab === item.id 
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                  : 'hover:bg-white/5 text-slate-400'
              }`}
            >
              <item.icon size={22} />
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4">
          <button
            onClick={() => setShowPresentation(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)]"
          >
            <Play size={18} fill="currentColor" />
            {isSidebarOpen && "Launch Demo"}
          </button>
        </div>

        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full premium-gradient shadow-[0_0_15px_rgba(168,85,247,0.3)]" />
            {isSidebarOpen && (
              <div className="text-sm">
                <p className="font-medium">Sr. Developer</p>
                <p className="text-slate-500 text-xs">Architect Mode</p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

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
                <h2 className="text-5xl font-extrabold mb-4 capitalize tracking-tight">{activeTab}</h2>
                <p className="text-slate-400 text-lg max-w-2xl">
                  {activeTab === 'dashboard' && 'Real-time performance metrics and event-driven data flow visualization.'}
                  {activeTab === 'architecture' && 'Deep dive into the distributed system components and message patterns.'}
                  {activeTab === 'performance' && 'Analysis of sub-1000ms analytical queries on million-record datasets.'}
                  {activeTab === 'security' && 'OIDC implementation and zero-trust HMAC security schemes.'}
                  {activeTab === 'presentation' && 'Executive summary of project technical depth and delivery standards.'}
                </p>
              </div>
              <div className="hidden lg:block pb-2">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
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
    </div>
  )
}
