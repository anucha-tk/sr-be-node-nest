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
import { Info, ExternalLink, Code2, Cpu, Database, Shield, Zap, Activity } from 'lucide-react'

// Custom Node Styling
const TechNode = ({ data }: { data: { icon?: React.ElementType; selected?: boolean; category: string; label: string } }) => {
  const Icon = data.icon || Cpu
  return (
    <div className={`px-4 py-3 rounded-xl border transition-all ${
      data.selected 
        ? 'bg-primary/10 border-primary shadow-[0_4px_16px_rgba(0,119,182,0.15)]' 
        : 'bg-white/80 border-slate-200'
    }`}>
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${data.selected ? 'bg-primary text-white' : 'bg-white/60 text-primary'}`}>
          <Icon size={18} />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-tighter text-slate-600 font-bold leading-none mb-1">
            {data.category}
          </div>
          <div className="text-sm font-bold text-slate-900">{data.label}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
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
    style: { stroke: '#0077B6' },
    type: ConnectionLineType.SmoothStep,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#0077B6' }
  },
  { 
    id: 'e2-3', 
    source: 'keycloak', 
    target: 'nestjs', 
    label: 'Auth',
    style: { stroke: '#00D2FF', strokeDasharray: '5,5' },
    type: ConnectionLineType.SmoothStep,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#00D2FF' }
  },
  { 
    id: 'e3-4', 
    source: 'nestjs', 
    target: 'prisma', 
    style: { stroke: '#0077B6' },
    type: ConnectionLineType.SmoothStep,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#0077B6' }
  },
  { 
    id: 'e4-5', 
    source: 'prisma', 
    target: 'postgres', 
    style: { stroke: '#0077B6' },
    type: ConnectionLineType.SmoothStep,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#0077B6' }
  },
]

export default function ArchitectureDiagram() {
  const [nodes, setNodes] = useState(initialNodes)
  const [edges, setEdges] = useState(initialEdges)
  const [selectedTech, setSelectedTech] = useState<{ id: string; name: string; category: string; version: string; description: string; link: string }>(TECH_STACK.find(t => t.id === 'nestjs')!)

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
    return () => { window.removeEventListener('kafka-beam', triggerBeam) }
  }, [triggerBeam])

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
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
      <div className="lg:col-span-2 glass-panel p-4 min-h-[500px] relative overflow-hidden bg-white/40">
        <div className="absolute top-6 left-6 z-10 flex gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-full">
            <Activity className="text-primary animate-pulse" size={14} />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Interactive Data Flow</span>
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
          <Background color="#cbd5e1" gap={20} size={1} />
          <Controls className="!bg-white !border-slate-200 !fill-slate-700" />
        </ReactFlow>
      </div>

      {/* Detail Panel */}
      <div className="flex flex-col gap-6">
        <h3 className="text-2xl font-bold flex items-center gap-2 text-gradient">
          <Info className="text-primary" />
          Technical Details
        </h3>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTech.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-panel p-6 flex-1 flex flex-col border-primary/10"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="px-2 py-0.5 rounded bg-primary/5 text-[10px] uppercase tracking-wider text-primary font-bold">
                {selectedTech.category}
              </span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary/5" />
              </div>
            </div>
            
            <h4 className="text-2xl font-bold mb-2 text-slate-900">{selectedTech.name}</h4>
            <div className="text-xs text-slate-600 font-mono mb-4">{selectedTech.version}</div>
            
            <p className="text-slate-600 text-sm leading-relaxed mb-8">
              {selectedTech.description}
            </p>

            <div className="space-y-4 mb-8">
              <div className="p-4 rounded-xl bg-white/60 border border-slate-100">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <Shield size={14} />
                  <span className="text-[10px] font-bold uppercase">Patterns Applied</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Idempotency', 'ACID', 'OIDC', 'DLQ'].slice(0, 3).map(p => (
                    <span key={p} className="text-[10px] px-2 py-1 rounded-md bg-white/60 text-slate-600 border border-slate-200">
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
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary hover:bg-[#005f92] text-white rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_16px_rgba(0,119,182,0.15)]"
              >
                Official Docs
                <ExternalLink size={16} />
              </a>
              <button className="flex items-center justify-center gap-2 w-full py-3 bg-white/60 hover:bg-white/80 border border-slate-200 rounded-xl text-sm font-bold transition-all text-slate-900">
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
