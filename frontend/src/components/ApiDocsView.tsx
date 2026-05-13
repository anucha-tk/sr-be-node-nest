import { motion } from 'framer-motion'
import { BookOpen, Terminal, ExternalLink } from 'lucide-react'

export default function ApiDocsView() {
  const apiKey = import.meta.env.VITE_API_KEY || 'sk_live_12345';

  return (
    <div className="space-y-8">
      {/* Explanation for Non-Tech */}
      <div className="glass-panel p-6 bg-purple-500/10 border-purple-500/20">
        <h3 className="text-xl font-bold text-purple-400 mb-2">เปรียบเทียบการทำงาน (Analogy)</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          <span className="font-bold">API Documentation</span> เปรียบเสมือน <span className="text-emerald-400 font-bold">"เมนูอาหารของร้าน"</span> ที่บอกนักพัฒนาคนอื่นๆ (ลูกค้า) ว่าระบบเรามีเมนูอะไรให้สั่งบ้าง ต้องสั่งยังไง (ใส่ส่วนผสมอะไรบ้าง) และหน้าตาอาหารที่ได้จะเป็นแบบไหน
          โดยเราเลือกใช้มาตรฐาน <span className="text-amber-400 font-bold">OpenAPI (Swagger/Scalar)</span> ซึ่งเป็นมาตรฐานที่ทั่วโลกยอมรับ ทำให้นักพัฒนาจากบริษัทอื่นสามารถเข้ามาเชื่อมต่อระบบกับเราได้อย่างรวดเร็วและไม่ผิดพลาด
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 flex flex-col items-center justify-center text-center lg:col-span-1"
        >
          <BookOpen className="text-primary mb-6" size={48} />
          <h3 className="text-2xl font-bold mb-2">Scalar UI</h3>
          <p className="text-slate-600 text-sm mb-6">เมนูอาหารสำหรับนักพัฒนา (Interactive OpenAPI)</p>
          
          <button 
            onClick={() => window.open('http://localhost:3000/docs', '_blank')}
            className="w-full py-3 bg-primary hover:bg-[#005f92] text-white rounded-xl font-bold transition-all shadow-[0_4px_12px_rgba(0,119,182,0.15)] flex items-center justify-center gap-2"
          >
            เปิดหน้าคู่มือ API (New Tab)
            <ExternalLink size={16} />
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-0 overflow-hidden flex flex-col lg:col-span-2 relative"
        >
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal size={16} className="text-slate-600" />
              <span className="text-sm font-mono text-slate-600">ตัวอย่างการเรียกใช้งาน (cURL Example)</span>
            </div>
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">Developer View</span>
          </div>
          <div className="p-6 bg-white flex-1 font-mono text-sm leading-relaxed overflow-y-auto shadow-inner rounded-b-2xl">
            <div className="text-slate-600 mb-2">// 1. นักพัฒนาส่งคำสั่งขอข้อมูล พร้อมแนบ "กุญแจผ่านทาง"</div>
            <div className="text-primary font-bold">curl <span className="text-slate-600 font-normal">-X GET</span></div>
            <div className="text-cyan font-bold pl-4">"http://localhost:3000/v1/analytics/summary" \</div>
            <div className="text-slate-600 pl-4">-H <span className="text-slate-600">"x-api-key: {apiKey.substring(0, 15)}..."</span></div>
            <br />
            <div className="text-slate-600">// 2. ระบบตอบกลับเป็นข้อมูล JSON ที่ตกลงกันไว้ตามมาตรฐาน</div>
            <div className="text-slate-600">{'{'}</div>
            <div className="text-slate-600 pl-4">"success": <span className="text-primary font-bold">true</span>,</div>
            <div className="text-slate-600 pl-4">"data": {'{'}</div>
            <div className="text-slate-600 pl-8">"totalRevenue": <span className="text-cyan font-bold">1250000.00</span>,</div>
            <div className="text-slate-600 pl-8">"activeUsers": <span className="text-cyan font-bold">8432</span></div>
            <div className="text-slate-600 pl-4">{'}'}</div>
            <div className="text-slate-600">{'}'}</div>
          </div>
          </motion.div>
      </div>
    </div>
  )
}
