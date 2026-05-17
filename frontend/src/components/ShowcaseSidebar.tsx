import { motion } from 'framer-motion'
import { Menu, X, Play } from 'lucide-react'

import { PAGES } from '../config/pages'

const MENU_ITEMS = PAGES.filter((p) => p.id !== 'presentation')

interface SidebarProps {
  activeTab: string
  setActiveTab: (id: string) => void
  isSidebarOpen: boolean
  setIsSidebarOpen: (isOpen: boolean) => void
  onLaunchDemo: () => void
}

export default function ShowcaseSidebar({
  activeTab,
  setActiveTab,
  isSidebarOpen,
  setIsSidebarOpen,
  onLaunchDemo
}: SidebarProps) {
  return (
    <motion.aside 
      initial={false}
      animate={{ width: isSidebarOpen ? 320 : 80 }}
      className="glass-panel h-[calc(100vh-2rem)] m-4 mr-0 flex flex-col z-50 transition-all duration-300"
    >
      <div className="p-6 flex items-center justify-between">
        {isSidebarOpen && (
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold text-gradient bg-clip-text text-transparent truncate"
          >
            Technical Showcase
          </motion.h1>
        )}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-black/5 rounded-lg transition-colors flex-shrink-0"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 overflow-y-auto overflow-x-hidden">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all mb-3 text-left ${
              activeTab === item.id 
                ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' 
                : 'hover:bg-black/5 text-slate-600'
            }`}
          >
            <div className="flex-shrink-0">
              <item.icon size={22} />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-slate-900">{item.title}</span>
                <span className="text-xs text-slate-600 truncate">{item.subLabel}</span>
              </div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4">
        <button
          onClick={onLaunchDemo}
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-[#005f92] text-white rounded-xl font-bold transition-all shadow-[0_4px_16px_rgba(0,119,182,0.2)]"
        >
          <Play size={18} fill="currentColor" />
          {isSidebarOpen && "เริ่มการนำเสนอฉบับเต็ม"}
        </button>
      </div>

      <div className="p-6 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-cyan shadow-[0_4px_10px_rgba(0,210,255,0.3)] flex-shrink-0" />
          {isSidebarOpen && (
            <div className="text-sm truncate">
              <p className="font-bold text-slate-900">SR-BE-Node-Nest</p>
              <p className="text-slate-600 text-xs truncate">Smart Revenue Pipeline</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  )
}