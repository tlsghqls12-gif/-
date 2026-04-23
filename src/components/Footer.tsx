import { PHONE_NUMBER } from "./Navbar";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16 md:py-20 mt-auto overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-green via-brand-lime to-brand-blue opacity-50" />
      <div className="container max-w-[1200px] mx-auto px-5 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-6">
            <div>
              <h4 className="text-white text-[20px] font-black tracking-tight mb-2 uppercase">Taeri Resources</h4>
              <p className="text-brand-lime text-[13px] font-bold">태리자원</p>
            </div>
            <div className="text-[14px] leading-relaxed space-y-1 font-medium">
              <p>사업장 소재지: 경남 김해시 전하로123번길 6-19</p>
              <p>대표번호: {PHONE_NUMBER} | 개인정보관리책임자: 대표이사</p>
              <p className="pt-4 text-slate-500 font-mono text-[11px]">© 2024 Taeri Resources. 모든 권리는 당사에 있습니다.</p>
            </div>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-6 w-full md:w-auto">
            <div className="bg-white/5 backdrop-blur-md rounded-[32px] p-8 border border-white/5 w-full md:w-auto">
              <p className="text-[12px] font-black text-brand-lime uppercase tracking-[0.2em] mb-2">Customer Center</p>
              <a 
                href={`tel:${PHONE_NUMBER}`} 
                className="text-[28px] md:text-[36px] font-bold text-white hover:text-brand-lime transition-colors block leading-none"
              >
                {PHONE_NUMBER}
              </a>
              <p className="text-[13px] text-slate-500 mt-3 font-medium">평일/토요일 09:00 - 18:00 (공휴일 제외)</p>
            </div>
            
            <div className="flex gap-4">
              <button className="text-[13px] font-bold hover:text-white transition-colors">이용약관</button>
              <span className="text-slate-700">|</span>
              <button className="text-[13px] font-bold text-brand-lime hover:text-white transition-colors">개인정보처리방침</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Brand Accent */}
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-brand-green/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-brand-blue/10 rounded-full blur-[100px] pointer-events-none" />
    </footer>
  );
}
