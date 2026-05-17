import { motion } from 'framer-motion'
import { AlertTriangle, Lightbulb, Sparkles, XCircle, CheckCircle2 } from 'lucide-react'

interface Card1Data {
  problem: React.ReactNode
  solution: React.ReactNode
  impact: React.ReactNode
}

interface Card2Data {
  title?: string
  leftTitle: string
  leftContent: React.ReactNode
  rightTitle: string
  rightContent: React.ReactNode
}

interface ShowcaseComparisonCardsProps {
  card1: Card1Data
  card2: Card2Data
  isCompact?: boolean
}

export default function ShowcaseComparisonCards({ card1, card2, isCompact = false }: ShowcaseComparisonCardsProps) {
  return (
    <div className={`${isCompact ? 'space-y-3 mb-2' : 'space-y-6 mb-8'} relative z-10 w-full`}>
      {/* CARD 1: Full-width Problem, Solution, Impact */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`glass-panel bg-white/40 border border-slate-200/50 shadow-sm rounded-2xl w-full ${isCompact ? 'p-3 sm:p-4' : 'p-6'}`}
      >
        <div className={`grid grid-cols-1 md:grid-cols-3 ${isCompact ? 'gap-3' : 'gap-6'}`}>
          {/* Problem */}
          <div className={`rounded-xl bg-rose-500/5 border border-rose-500/10 flex flex-col justify-between ${isCompact ? 'p-3' : 'p-4'}`}>
            <div>
              <div className={`flex items-center gap-2 text-rose-600 ${isCompact ? 'mb-1.5' : 'mb-3'}`}>
                <AlertTriangle size={isCompact ? 14 : 18} />
                <span className="font-extrabold text-sm uppercase tracking-wider">ปัญหา (Problem)</span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">{card1.problem}</p>
            </div>
          </div>

          {/* Solution */}
          <div className={`rounded-xl bg-primary/5 border border-primary/10 flex flex-col justify-between ${isCompact ? 'p-3' : 'p-4'}`}>
            <div>
              <div className={`flex items-center gap-2 text-primary ${isCompact ? 'mb-1.5' : 'mb-3'}`}>
                <Lightbulb size={isCompact ? 14 : 18} />
                <span className="font-extrabold text-sm uppercase tracking-wider">ทางออก (Solution)</span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">{card1.solution}</p>
            </div>
          </div>

          {/* Impact */}
          <div className={`rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col justify-between ${isCompact ? 'p-3' : 'p-4'}`}>
            <div>
              <div className={`flex items-center gap-2 text-emerald-600 ${isCompact ? 'mb-1.5' : 'mb-3'}`}>
                <Sparkles size={isCompact ? 14 : 18} />
                <span className="font-extrabold text-sm uppercase tracking-wider">ผลลัพธ์ (Impact)</span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">{card1.impact}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CARD 2: Full-width 2-Side Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className={`glass-panel bg-white/40 border border-slate-200/50 shadow-sm rounded-2xl w-full ${isCompact ? 'p-3 sm:p-4' : 'p-6'}`}
      >
        {card2.title && (
          <h4 className={`font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2 ${isCompact ? 'text-xs mb-2.5' : 'text-sm mb-4'}`}>
            <span>📊 {card2.title}</span>
          </h4>
        )}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${isCompact ? 'gap-3' : 'gap-6'}`}>
          {/* Left Side: Without Pattern */}
          <div className={`rounded-xl bg-slate-100/50 border border-slate-200 flex flex-col justify-between ${isCompact ? 'p-3' : 'p-5'}`}>
            <div>
              <div className={`flex items-center gap-2 text-slate-500 ${isCompact ? 'mb-2.5' : 'mb-4'}`}>
                <XCircle size={isCompact ? 14 : 18} className="text-rose-500" />
                <span className="font-extrabold text-xs uppercase tracking-wider">{card2.leftTitle}</span>
              </div>
              <div className="text-slate-600 text-xs leading-relaxed space-y-2">
                {card2.leftContent}
              </div>
            </div>
          </div>

          {/* Right Side: With Pattern */}
          <div className={`rounded-xl bg-emerald-500/5 border border-emerald-500/20 shadow-sm flex flex-col justify-between ${isCompact ? 'p-3' : 'p-5'}`}>
            <div>
              <div className={`flex items-center gap-2 text-emerald-700 ${isCompact ? 'mb-2.5' : 'mb-4'}`}>
                <CheckCircle2 size={isCompact ? 14 : 18} className="text-emerald-500" />
                <span className="font-extrabold text-xs uppercase tracking-wider">{card2.rightTitle}</span>
              </div>
              <div className="text-slate-600 text-xs leading-relaxed space-y-2">
                {card2.rightContent}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
