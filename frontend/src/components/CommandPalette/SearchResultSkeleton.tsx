import { motion } from 'framer-motion'

export function SearchResultSkeleton() {
  const skeletonRows = Array.from({ length: 5 })

  return (
    <div className="w-full animate-pulse border-collapse text-left">
      <div className="border-b border-slate-100/50 bg-slate-50/50 px-4 py-2 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        <div className="w-16 h-3 bg-slate-200 rounded" />
        <div className="w-24 h-3 bg-slate-200 rounded" />
        <div className="w-48 h-3 bg-slate-200 rounded" />
        <div className="w-32 h-3 bg-slate-200 rounded" />
      </div>
      <div className="divide-y divide-slate-100">
        {skeletonRows.map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.15 }}
            className="flex items-center px-4 py-3 gap-4"
          >
            {/* Type badge placeholder */}
            <div className="w-20 h-6 bg-slate-200 rounded-full shrink-0" />
            
            {/* ID/Key placeholder */}
            <div className="w-24 h-4 bg-slate-200 rounded shrink-0 font-mono" />
            
            {/* Title / Name placeholder */}
            <div className="flex-1 h-4 bg-slate-200 rounded" />
            
            {/* Description placeholder */}
            <div className="w-40 h-4 bg-slate-200 rounded shrink-0" />

            {/* Price/Metadata placeholder */}
            <div className="w-16 h-4 bg-slate-200 rounded shrink-0" />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
