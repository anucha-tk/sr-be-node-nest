import { motion, AnimatePresence } from 'framer-motion'
import { Search, Command, X, FileText, User, Hash, Loader2 } from 'lucide-react'
import { useCommandPalette, type SearchResult } from '../../hooks/useCommandPalette'

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
          className="relative w-full max-w-2xl overflow-hidden glass-panel !rounded-2xl shadow-2xl bg-white/95 border border-white/40 ring-1 ring-black/5"
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
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Searching across millions of records...</p>
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
              <div className="space-y-1">
                <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Search Results ({results.length})
                </p>
                {results.map((result, index) => (
                  <SearchResultItem
                    key={result.id}
                    result={result}
                    isSelected={index === selectedIndex}
                    onClick={() => handleSelect(result)}
                  />
                ))}
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

function SearchResultItem({
  result,
  isSelected,
  onClick,
}: {
  result: SearchResult
  isSelected: boolean
  onClick: () => void
}) {
  const getIcon = () => {
    switch (result.type) {
      case 'invoice': return <FileText className="w-4 h-4" />
      case 'api-key': return <Hash className="w-4 h-4" />
      case 'supplier': return <User className="w-4 h-4" />
      default: return <Search className="w-4 h-4" />
    }
  }

  return (
    <div
      onClick={onClick}
      className={`
        group flex items-center px-3 py-3 rounded-xl cursor-pointer transition-all duration-200
        ${isSelected ? 'bg-primary/10 border-primary/20 ring-1 ring-primary/20' : 'hover:bg-slate-50'}
      `}
    >
      <div className={`
        w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-colors
        ${isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-primary'}
      `}>
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className={`text-sm font-semibold truncate ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
            {result.invoiceNumber || result.name || result.title || 'Untitled'}
          </h4>
          <span className={`text-[10px] font-bold uppercase tracking-tight px-2 py-0.5 rounded-full border ${
            isSelected ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-slate-100 border-slate-200 text-slate-400'
          }`}>
            {result.type}
          </span>
        </div>
        {result.description && (
          <p className={`text-xs truncate ${isSelected ? 'text-slate-600' : 'text-slate-400'}`}>
            {result.description}
          </p>
        )}
      </div>
    </div>
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
