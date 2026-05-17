import { LayoutDashboard, ShieldCheck, Activity, BarChart3, Zap, FileText, Code, Repeat, Play } from 'lucide-react'

export interface PageConfig {
  id: string
  title: string
  subLabel: string
  desc: string
  keywords: string[]
  icon: any
}

export const PAGES: PageConfig[] = [
  {
    id: 'intro',
    title: 'Intro & Architecture',
    subLabel: 'ภาพรวมสถาปัตยกรรมระบบ',
    desc: 'ภาพรวมระบบและเทคโนโลยีหลักที่ใช้',
    keywords: [
      'intro',
      'architecture',
      'สถาปัตยกรรม',
      'ภาพรวม',
      'สายพานลำเลียงพัสดุ',
      'สายพาน',
      'พัสดุ',
      'kafka',
      'elasticsearch',
      'postgres',
      'nestjs',
      'cdc'
    ],
    icon: LayoutDashboard,
  },
  {
    id: 'security',
    title: 'Identity & Shield',
    subLabel: 'ระบบความปลอดภัยและตัวตน',
    desc: 'ระบบความปลอดภัยและตัวตน',
    keywords: [
      'security',
      'identity',
      'shield',
      'keycloak',
      'auth',
      'jwt',
      'rbac',
      'guard',
      'api key',
      'supplier',
      'role',
      'masking',
      'ความปลอดภัย',
      'Scalar'
    ],
    icon: ShieldCheck,
  },
  {
    id: 'event-flow',
    title: 'Event Pulse',
    subLabel: 'การประมวลผลแบบ Event-Driven',
    desc: 'การประมวลผลแบบ Event-Driven (Kafka)',
    keywords: [
      'event',
      'pulse',
      'driven',
      'kafka',
      'topic',
      'producer',
      'consumer',
      'cdc',
      'sync',
      'real-time',
      'คิว',
      'เหตุการณ์'
    ],
    icon: Activity,
  },
  {
    id: 'observability',
    title: 'Infrastructure Pulse',
    subLabel: 'สถานะและการทำงานของระบบ',
    desc: 'สถานะและการใช้ทรัพยากรของระบบในรูปแบบ Prometheus Metrics',
    keywords: [
      'observability',
      'prometheus',
      'metrics',
      'grafana',
      'pulse',
      'status',
      'health',
      'lag',
      'monitor',
      'ทรัพยากร',
      'สถานะ'
    ],
    icon: BarChart3,
  },
  {
    id: 'performance',
    title: 'Warp Speed',
    subLabel: 'ประสิทธิภาพข้อมูลขนาดใหญ่',
    desc: 'ประสิทธิภาพการประมวลผลข้อมูล 1M+ เรคคอร์ด',
    keywords: [
      'performance',
      'warp',
      'speed',
      'million',
      '1m',
      'benchmark',
      'elastic',
      'postgres',
      'index',
      'virtualized',
      'ความเร็ว',
      'ประสิทธิภาพ'
    ],
    icon: Zap,
  },
  {
    id: 'audit',
    title: 'Paper Trail',
    subLabel: 'ความโปร่งใสของข้อมูล',
    desc: 'ความถูกต้องและความโปร่งใสของข้อมูล (Audit Log)',
    keywords: [
      'audit',
      'paper',
      'trail',
      'log',
      'history',
      'immutable',
      'compliance',
      'invoice',
      'financial',
      'ความถูกต้อง',
      'ความโปร่งใส'
    ],
    icon: FileText,
  },
  {
    id: 'api-docs',
    title: 'Dev Portal',
    subLabel: 'หน้าต่างสำหรับนักพัฒนา',
    desc: 'หน้าต่างเชื่อมต่อสำหรับนักพัฒนา (Scalar/OpenAPI)',
    keywords: [
      'api',
      'docs',
      'portal',
      'scalar',
      'openapi',
      'swagger',
      'endpoint',
      'version',
      'v1',
      'developer',
      'นักพัฒนา'
    ],
    icon: Code,
  },
  {
    id: 'idempotency',
    title: 'Safety Guard',
    subLabel: 'ระบบป้องกันการจ่ายเงินซ้ำ',
    desc: 'การป้องกันความผิดพลาดและระบบ Idempotency',
    keywords: [
      'idempotency',
      'safety',
      'guard',
      'deduplication',
      'processedevent',
      'p2002',
      'kafka',
      'double',
      'payment',
      'จ่ายเงินซ้ำ',
      'ป้องกัน'
    ],
    icon: Repeat,
  },
  {
    id: 'presentation',
    title: 'Presentation Mode',
    subLabel: 'เริ่มการนำเสนอฉบับเต็ม',
    desc: 'สไลด์แนะนำระบบแบบทีละขั้นตอน (Interactive Slideshow)',
    keywords: [
      'presentation',
      'slide',
      'demo',
      'showcase',
      'tutorial',
      'การนำเสนอ',
      'แนะนำ'
    ],
    icon: Play,
  },
]
