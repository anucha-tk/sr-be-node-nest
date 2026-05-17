import { FileText, Hash, User, Search, Activity } from 'lucide-react'
import type { SearchResult } from '../../hooks/useCommandPalette'
import { VirtualizedList } from './VirtualizedList'

interface SearchResultTableProps {
  results: SearchResult[]
  selectedIndex: number
  onSelect: (result: SearchResult) => void
}

export function SearchResultTable({
  results,
  selectedIndex,
  onSelect,
}: SearchResultTableProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'invoice':
        return <FileText className="w-3.5 h-3.5" />
      case 'api-key':
        return <Hash className="w-3.5 h-3.5" />
      case 'supplier':
        return <User className="w-3.5 h-3.5" />
      case 'action':
        return <Activity className="w-3.5 h-3.5" />
      default:
        return <Search className="w-3.5 h-3.5" />
    }
  }

  const getTypeBadgeStyles = (type: string) => {
    switch (type) {
      case 'invoice':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
      case 'api-key':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/50'
      case 'supplier':
        return 'bg-amber-50 text-amber-700 border-amber-200/50'
      case 'action':
        return 'bg-purple-50 text-purple-700 border-purple-200/50'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200/50'
    }
  }

  const formatValue = (result: SearchResult) => {
    if (result.type === 'invoice' && typeof result.amount === 'number') {
      return `$${result.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    if (result.type === 'api-key' && result.status) {
      return result.status
    }
    return ''
  }

  const renderRow = (result: SearchResult, _index: number, isSelected: boolean) => {
    const formattedId = result.type === 'action'
      ? `NAV: ${result.id}`
      : result.id.startsWith('inv_') || result.id.startsWith('key_') || result.id.startsWith('sup_')
        ? result.id
        : result.id.slice(0, 8) + '...'

    return (
      <div
        onClick={() => onSelect(result)}
        className={`
          flex items-center px-4 py-2.5 gap-4 cursor-pointer transition-all duration-150 border-b border-slate-50/50 select-none
          ${isSelected ? 'bg-primary/10 border-primary/20 ring-1 ring-primary/10' : 'hover:bg-slate-50'}
        `}
        style={{ height: 44 }}
      >
        {/* Column 1: Type Badge */}
        <div className="flex-grow-0 shrink-0 w-24 sm:w-28 flex items-center gap-1.5">
          <span className={`
            p-1 rounded-md shrink-0
            ${isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}
          `}>
            {getIcon(result.type)}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-tight px-2 py-0.5 rounded-full border ${getTypeBadgeStyles(result.type)}`}>
            {result.type}
          </span>
        </div>

        {/* Column 2: Key/ID */}
        <div className="flex-grow-0 shrink-0 w-28 sm:w-36 font-mono text-[10px] text-slate-400 truncate">
          {result.invoiceNumber || formattedId}
        </div>

        {/* Column 3: Title / Primary Info */}
        <div className={`flex-1 text-xs truncate ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-700 font-semibold'}`}>
          {result.title || result.name || result.supplierName || 'Untitled'}
        </div>

        {/* Column 4: Context / Description */}
        <div className="flex-grow-0 shrink-0 w-44 sm:w-56 text-xs text-slate-400 truncate hidden md:block">
          {result.description || '-'}
        </div>

        {/* Column 5: Details / Value */}
        <div className={`
          flex-grow-0 shrink-0 w-16 sm:w-20 text-right text-xs font-mono font-bold
          ${result.type === 'invoice' ? 'text-emerald-600' : 'text-slate-500'}
        `}>
          {formatValue(result)}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full border border-slate-100 rounded-xl overflow-hidden bg-white">
      {/* Table Header */}
      <div className="flex items-center px-4 py-2 gap-4 bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
        <div className="flex-grow-0 shrink-0 w-24 sm:w-28">Type</div>
        <div className="flex-grow-0 shrink-0 w-28 sm:w-36">ID / Key</div>
        <div className="flex-1">Title</div>
        <div className="flex-grow-0 shrink-0 w-44 sm:w-56 hidden md:block">Description</div>
        <div className="flex-grow-0 shrink-0 w-16 sm:w-20 text-right">Details</div>
      </div>

      {/* Virtualized Body */}
      <div className="divide-y divide-slate-100">
        <VirtualizedList
          items={results}
          itemHeight={44}
          height={Math.min(results.length * 44, 300)}
          selectedIndex={selectedIndex}
          renderItem={renderRow}
        />
      </div>
    </div>
  )
}
