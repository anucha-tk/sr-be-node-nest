import { motion, AnimatePresence } from 'framer-motion'
import { Search, Command, X, FileText } from 'lucide-react'
import { useCommandPalette } from '../../hooks/useCommandPalette'
import { SearchResultSkeleton } from './SearchResultSkeleton'
import { SearchResultTable } from './SearchResultTable'

export function CommandPalette() {
  const {
    isOpen,
    setIsOpen,
    query,
    setQuery,
    results,
    isLoading,
    error,
    selectedIndex,
    handleKeyDown,
    handleSelect,
  } = useCommandPalette()

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 sm:px-6 md:px-8">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        {/* Palette */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-4xl overflow-hidden glass-panel !rounded-2xl shadow-2xl bg-white/95 border border-white/40 ring-1 ring-black/5"
        >
          <div className="flex items-center px-4 border-b border-slate-100">
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <input
              autoFocus
              className="w-full h-14 bg-transparent outline-none text-slate-900 text-lg placeholder:text-slate-400"
              placeholder="Search anything (Invoices, API Keys, Suppliers...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="flex items-center gap-1.5 ml-2">
              <kbd className="hidden sm:flex h-6 items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 font-mono text-[10px] font-medium text-slate-500 opacity-100">
                <span className="text-xs">ESC</span>
              </kbd>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden p-2 custom-scrollbar">
            {isLoading ? (
              <div className="py-2">
                <SearchResultSkeleton />
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <X className="w-6 h-6" />
                </div>
                <p className="text-slate-900 font-bold">{error}</p>
                <p className="text-slate-400 text-sm">Please try again later or contact support.</p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-2 p-1">
                <p className="px-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Search Results ({results.length})
                </p>
                <SearchResultTable
                  results={results}
                  selectedIndex={selectedIndex}
                  onSelect={handleSelect}
                />
              </div>
            ) : query.trim() ? (
              <div className="py-12 text-center">
                <Search className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No results found for "{query}"</p>
                <p className="text-slate-400 text-sm">Try searching for something else</p>
              </div>
            ) : (
              <div className="py-8 px-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Quick Actions
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <QuickActionItem
                    icon={<Command className="w-4 h-4" />}
                    title="Launch Demo"
                    desc="Open presentation mode"
                  />
                  <QuickActionItem
                    icon={<FileText className="w-4 h-4" />}
                    title="View API Docs"
                    desc="Explore Scalar reference"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-t border-slate-100 text-[10px] text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border bg-white px-1 font-sans">↑↓</kbd> Navigate
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border bg-white px-1 font-sans">Enter</kbd> Select
              </span>
            </div>
            <div className="flex items-center gap-1">
              Powered by <span className="font-bold text-primary">Elasticsearch</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

function QuickActionItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-center p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 cursor-pointer group transition-all">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors mr-3">
        {icon}
      </div>
      <div>
        <h5 className="text-xs font-bold text-slate-700">{title}</h5>
        <p className="text-[10px] text-slate-400">{desc}</p>
      </div>
    </div>
  )
}
