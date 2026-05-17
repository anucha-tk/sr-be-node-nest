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
  // Quality Gate (Top Left)
  {
    id: 'testcov',
    type: 'tech',
    position: { x: 50, y: -20 },
    data: { label: 'Jest Coverage >=80%', category: 'Quality Gate', icon: Shield, id: 'testcov' },
  },
  // Ingress & Messaging
  {
    id: 'kafka',
    type: 'tech',
    position: { x: 300, y: -20 },
    data: { label: 'Apache Kafka', category: 'Messaging', icon: Zap, id: 'kafka' },
  },
  // Security & Docs (Left Column)
  {
    id: 'keycloak',
    type: 'tech',
    position: { x: 20, y: 120 },
    data: { label: 'Keycloak OIDC', category: 'Security', icon: Shield, id: 'keycloak' },
  },
  {
    id: 'swagger',
    type: 'tech',
    position: { x: 20, y: 240 },
    data: { label: 'Swagger & Scalar API', category: 'API Docs', icon: Code2, id: 'swagger' },
  },
  // Main Framework Core (Center Column)
  {
    id: 'nestjs',
    type: 'tech',
    position: { x: 300, y: 120 },
    data: { label: 'NestJS Backend', category: 'Framework', icon: Cpu, id: 'nestjs' },
  },
  {
    id: 'prisma',
    type: 'tech',
    position: { x: 300, y: 240 },
    data: { label: 'Prisma ORM', category: 'ORM', icon: Code2, id: 'prisma' },
  },
  {
    id: 'postgres',
    type: 'tech',
    position: { x: 300, y: 360 },
    data: { label: 'PostgreSQL 17', category: 'Database', icon: Database, id: 'postgres' },
  },
  // Real-Time & Search Analytics (Right Column)
  {
    id: 'socket',
    type: 'tech',
    position: { x: 580, y: 120 },
    data: { label: 'Socket.io WebSocket', category: 'Real-Time Sync', icon: Zap, id: 'socket' },
  },
  {
    id: 'elastic',
    type: 'tech',
    position: { x: 580, y: 240 },
    data: { label: 'Elasticsearch 9', category: 'Search Engine', icon: Database, id: 'elastic' },
  },
]

const initialEdges: Edge[] = [
  // 1. Kafka to NestJS event streaming
  { 
    id: 'e-kafka-nestjs', 
    source: 'kafka', 
    target: 'nestjs', 
    animated: true, 
    label: 'Events Ingestion',
    style: { stroke: '#0077B6' },
    type: ConnectionLineType.SmoothStep,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#0077B6' }
  },
  // 2. Keycloak authorization guard
  { 
    id: 'e-keycloak-nestjs', 
    source: 'keycloak', 
    target: 'nestjs', 
    label: 'OIDC Shield',
    style: { stroke: '#00D2FF', strokeDasharray: '5,5' },
    type: ConnectionLineType.SmoothStep,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#00D2FF' }
  },
  // 3. Swagger/Scalar client client calls
  { 
    id: 'e-swagger-nestjs', 
    source: 'swagger', 
    target: 'nestjs', 
    label: 'API Sandbox',
    style: { stroke: '#0077B6', strokeDasharray: '2,2' },
    type: ConnectionLineType.SmoothStep,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#0077B6' }
  },
  // 4. Quality gates on NestJS core code
  { 
    id: 'e-testcov-nestjs', 
    source: 'testcov', 
    target: 'nestjs', 
    label: 'Strict CI Gate',
    style: { stroke: '#10B981', strokeDasharray: '4,4' },
    type: ConnectionLineType.SmoothStep,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10B981' }
  },
  // 5. NestJS to Prisma database access
  { 
    id: 'e-nestjs-prisma', 
    source: 'nestjs', 
    target: 'prisma', 
    style: { stroke: '#0077B6' },
    type: ConnectionLineType.SmoothStep,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#0077B6' }
  },
  // 6. Prisma to PostgreSQL raw persistence
  { 
    id: 'e-prisma-postgres', 
    source: 'prisma', 
    target: 'postgres', 
    style: { stroke: '#0077B6' },
    type: ConnectionLineType.SmoothStep,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#0077B6' }
  },
  // 7. NestJS to Elasticsearch CQRS write path
  { 
    id: 'e-nestjs-elastic', 
    source: 'nestjs', 
    target: 'elastic', 
    animated: true,
    label: 'Sync Inverted Index',
    style: { stroke: '#F59E0B' },
    type: ConnectionLineType.SmoothStep,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#F59E0B' }
  },
  // 8. NestJS to Socket.io WebSockets real-time push
  { 
    id: 'e-nestjs-socket', 
    source: 'nestjs', 
    target: 'socket', 
    animated: true,
    label: 'WebSocket Broadcast',
    style: { stroke: '#10B981' },
    type: ConnectionLineType.SmoothStep,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10B981' }
  },
]

export default function ArchitectureDiagram() {
  const [nodes, setNodes] = useState(initialNodes)
  const [edges, setEdges] = useState(initialEdges)
  const [selectedTech, setSelectedTech] = useState<{ id: string; name: string; category: string; version: string; description: string; link: string }>(TECH_STACK.find(t => t.id === 'nestjs')!)

  const triggerBeam = useCallback(() => {
    // Stage 1: Client Request & Authentication (Swagger + Keycloak -> NestJS)
    setEdges(eds => eds.map(e => 
      e.id === 'e-swagger-nestjs' || e.id === 'e-keycloak-nestjs'
        ? { ...e, animated: true, style: { stroke: '#fbbf24', strokeWidth: 3 } } 
        : e
    ))
    
    setTimeout(() => {
      // Stage 2: Event-Driven Queueing (Kafka -> NestJS Microservice Consumer)
      setEdges(eds => eds.map(e => 
        e.id === 'e-kafka-nestjs'
          ? { ...e, animated: true, style: { stroke: '#fbbf24', strokeWidth: 3 } } 
          : e
      ))
    }, 800)

    setTimeout(() => {
      // Stage 3: Data Branching & Sync (NestJS -> Prisma & Elasticsearch & WebSockets)
      setEdges(eds => eds.map(e => 
        e.id === 'e-nestjs-prisma' || e.id === 'e-nestjs-elastic' || e.id === 'e-nestjs-socket'
          ? { ...e, animated: true, style: { stroke: '#fbbf24', strokeWidth: 3 } } 
          : e
      ))
    }, 1600)

    setTimeout(() => {
      // Stage 4: DB Ledger Commit (Prisma -> PostgreSQL)
      setEdges(eds => eds.map(e => 
        e.id === 'e-prisma-postgres'
          ? { ...e, animated: true, style: { stroke: '#fbbf24', strokeWidth: 3 } } 
          : e
      ))
    }, 2400)

    setTimeout(() => {
      // Reset to original styles
      setEdges(initialEdges)
    }, 4500)
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
