import { useState, useCallback, useEffect } from 'react'
import { 
  ReactFlow,
  Background, 
  Controls, 
  Handle,
  Position,
  ConnectionLineType,
  MarkerType,
  type Node, 
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { motion, AnimatePresence } from 'framer-motion'
import { TECH_STACK } from '../data/tech-stack'
import { Info, ExternalLink, Code2, Cpu, Database, Shield, Zap } from 'lucide-react'

// Custom Node Styling
const TechNode = ({ data }: any) => {
  const Icon = data.icon || Cpu
  return (
    <div className={`px-4 py-3 rounded-xl border transition-all ${
      data.selected 
        ? 'bg-indigo-500/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)]' 
        : 'bg-obsidian-950/80 border-white/10'
    }`}>
      <Handle type="target" position={Position.Top} className="!bg-indigo-500" />
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${data.selected ? 'bg-indigo-500 text-white' : 'bg-white/5 text-indigo-400'}`}>
          <Icon size={18} />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-tighter text-slate-500 font-bold leading-none mb-1">
            {data.category}
          </div>
          <div className="text-sm font-bold text-slate-100">{data.label}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-500" />
    </div>
  )
}

const nodeTypes = {
  tech: TechNode,
}

const initialNodes: Node[] = [
  {
    id: 'kafka',
    type: 'tech',
    position: { x: 250, y: 0 },
    data: { label: 'Apache Kafka', category: 'Messaging', icon: Zap, id: 'kafka' },
  },
  {
    id: 'keycloak',
    type: 'tech',
    position: { x: 0, y: 100 },
    data: { label: 'Keycloak OIDC', category: 'Security', icon: Shield, id: 'keycloak' },
  },
  {
    id: 'nestjs',
    type: 'tech',
    position: { x: 250, y: 120 },
    data: { label: 'NestJS Backend', category: 'Framework', icon: Cpu, id: 'nestjs' },
  },
  {
    id: 'prisma',
    type: 'tech',
    position: { x: 250, y: 240 },
    data: { label: 'Prisma ORM', category: 'ORM', icon: Code2, id: 'prisma' },
  },
  {
    id: 'postgres',
    type: 'tech',
    position: { x: 250, y: 360 },
    data: { label: 'PostgreSQL 17', category: 'Database', icon: Database, id: 'postgres' },
  },
]

const initialEdges: Edge[] = [
  { 
    id: 'e1-2', 
    source: 'kafka', 
    target: 'nestjs', 
    animated: true, 
    label: 'Events',
    style: { stroke: '#6366f1' },
    type: ConnectionLineType.SmoothStep,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
  },
  { 
    id: 'e2-3', 
    source: 'keycloak', 
    target: 'nestjs', 
    label: 'Auth',
    style: { stroke: '#a855f7', strokeDasharray: '5,5' },
    type: ConnectionLineType.SmoothStep,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' }
  },
  { 
    id: 'e3-4', 
    source: 'nestjs', 
    target: 'prisma', 
    style: { stroke: '#6366f1' },
    type: ConnectionLineType.SmoothStep,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
  },
  { 
    id: 'e4-5', 
    source: 'prisma', 
    target: 'postgres', 
    style: { stroke: '#6366f1' },
    type: ConnectionLineType.SmoothStep,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
  },
]

export default function ArchitectureDiagram() {
  const [nodes, setNodes] = useState(initialNodes)
  const [edges, setEdges] = useState(initialEdges)
  const [selectedTech, setSelectedTech] = useState<any>(TECH_STACK.find(t => t.id === 'nestjs'))

  const triggerBeam = useCallback(() => {
    // Stage 1: Kafka -> NestJS
    setEdges(eds => eds.map(e => e.id === 'e1-2' ? { ...e, animated: true, style: { stroke: '#fbbf24', strokeWidth: 3 } } : e))
    
    setTimeout(() => {
      // Stage 2: NestJS -> Prisma
      setEdges(eds => eds.map(e => e.id === 'e3-4' ? { ...e, animated: true, style: { stroke: '#fbbf24', strokeWidth: 3 } } : e))
    }, 500)

    setTimeout(() => {
      // Stage 3: Prisma -> Postgres
      setEdges(eds => eds.map(e => e.id === 'e4-5' ? { ...e, animated: true, style: { stroke: '#fbbf24', strokeWidth: 3 } } : e))
    }, 1000)

    setTimeout(() => {
      // Reset
      setEdges(initialEdges)
    }, 3000)
  }, [])

  useEffect(() => {
    window.addEventListener('kafka-beam', triggerBeam)
    return () => window.removeEventListener('kafka-beam', triggerBeam)
  }, [triggerBeam])

  const onNodeClick = useCallback((_: any, node: Node) => {
    const tech = TECH_STACK.find(t => t.id === node.data.id)
    if (tech) {
      setSelectedTech(tech)
      setNodes((nds) => 
        nds.map((n) => ({
          ...n,
          data: { ...n.data, selected: n.id === node.id }
        }))
      )
    }
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Diagram Panel */}
      <div className="lg:col-span-2 glass-panel p-4 min-h-[500px] relative overflow-hidden bg-obsidian-950/40">
        <div className="absolute top-6 left-6 z-10 flex gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            <Activity className="text-indigo-400 animate-pulse" size={14} />
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Interactive Data Flow</span>
          </div>
          <button 
            onClick={triggerBeam}
            className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full hover:bg-amber-500/20 transition-all"
          >
            <Zap className="text-amber-400" size={14} />
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Test Beam</span>
          </button>
        </div>
        
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          className="bg-transparent"
        >
          <Background color="#1e293b" gap={20} size={1} />
          <Controls className="!bg-obsidian-950 !border-white/10 !fill-white" />
        </ReactFlow>
      </div>

      {/* Detail Panel */}
      <div className="flex flex-col gap-6">
        <h3 className="text-2xl font-bold flex items-center gap-2 text-gradient">
          <Info className="text-indigo-400" />
          Technical Details
        </h3>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTech.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-panel p-6 flex-1 flex flex-col border-indigo-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-[10px] uppercase tracking-wider text-indigo-400 font-bold">
                {selectedTech.category}
              </span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40" />
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/10" />
              </div>
            </div>
            
            <h4 className="text-2xl font-bold mb-2 text-white">{selectedTech.name}</h4>
            <div className="text-xs text-slate-500 font-mono mb-4">{selectedTech.version}</div>
            
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              {selectedTech.description}
            </p>

            <div className="space-y-4 mb-8">
              <div className="p-4 rounded-xl bg-obsidian-950/50 border border-white/5">
                <div className="flex items-center gap-2 text-indigo-400 mb-2">
                  <Shield size={14} />
                  <span className="text-[10px] font-bold uppercase">Patterns Applied</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Idempotency', 'ACID', 'OIDC', 'DLQ'].slice(0, 3).map(p => (
                    <span key={p} className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-slate-400 border border-white/10">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-auto space-y-3">
              <a
                href={selectedTech.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] neon-glow"
              >
                Official Docs
                <ExternalLink size={16} />
              </a>
              <button className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all">
                View Source Code
                <Code2 size={16} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

import { Activity } from 'lucide-react'

