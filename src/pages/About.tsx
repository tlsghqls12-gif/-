import { motion } from "motion/react";
import { Info, CheckCircle2, ShieldCheck, Award, TrendingUp, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function About() {
  const [aboutImage, setAboutImage] = useState("https://images.unsplash.com/photo-1516937941344-00b4e0337589?q=80&w=2000&auto=format&fit=crop");

  useEffect(() => {
    const fetchSettings = async () => {
      const settingsDoc = await getDoc(doc(db, "settings", "app"));
      if (settingsDoc.exists() && settingsDoc.data().aboutImageUrl) {
        setAboutImage(settingsDoc.data().aboutImageUrl);
      }
    };
    fetchSettings();
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <main className="container max-w-[1000px] mx-auto px-5 py-12 md:py-20">
      <motion.div {...fadeIn}>
        <div className="section-indicator">회사소개</div>
        <h1 className="text-[32px] md:text-[44px] font-black text-slate-900 mb-12 leading-[1.1] tracking-tight">
          자원 순환의 새로운 가치를 창출하는<br />
          <span className="text-brand-green">태리자원</span>입니다.
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 items-center">
          <div className="space-y-6 text-slate-600 leading-relaxed font-pretendard text-[17px]">
            <p className="font-bold text-slate-800 text-[19px]">
              "우리는 투명한 거래를 통해<br /> 지속 가능한 미래를 만듭니다."
            </p>
            <p>
              태리자원은 경남 김해 지역을 중심으로 고철, 비철, 특수금속 등 각종 금속 자원을 전문적으로 매입하는 선도 기업입니다.
            </p>
            <p>
              우리는 자원 순환의 가치를 최우선으로 여기며, 정직한 측정과 투명한 시세 반영을 통해 고객님의 자산에 정당한 가치를 부여합니다. 지역사회와 함께 성장하며 신뢰받는 파트너가 되겠습니다.
            </p>
          </div>
          <div className="relative aspect-[4/3] rounded-[40px] overflow-hidden shadow-2xl shadow-green-900/10 group">
            <img 
              src={aboutImage} 
              alt="태리자원 현합" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-10">
              <div>
                <p className="text-white font-black text-[20px] mb-1">정직과 신뢰의 가치</p>
                <p className="text-white/70 text-sm font-medium">태리자원은 고객과 함께합니다.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-24">
          <div className="bg-white rounded-[32px] p-10 text-center shadow-xl shadow-slate-200/50 border border-slate-50 group hover:-translate-y-2 transition-all">
            <div className="w-16 h-16 bg-brand-green/10 rounded-[20px] flex items-center justify-center text-brand-green mx-auto mb-6 group-hover:bg-brand-green group-hover:text-white transition-all">
              <ShieldCheck size={32} />
            </div>
            <h4 className="text-[20px] font-black text-slate-900 mb-3 tracking-tight">신뢰 경영</h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">최첨단 계량 시스템을 통한<br />정직한 측정과 정가 매입을 보장합니다.</p>
          </div>
          <div className="bg-white rounded-[32px] p-10 text-center shadow-xl shadow-slate-200/50 border border-slate-50 group hover:-translate-y-2 transition-all">
            <div className="w-16 h-16 bg-brand-lime/10 rounded-[20px] flex items-center justify-center text-brand-lime mx-auto mb-6 group-hover:bg-brand-lime group-hover:text-white transition-all">
              <TrendingUp size={32} />
            </div>
            <h4 className="text-[20px] font-black text-slate-900 mb-3 tracking-tight">최고 단가</h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">LME 전국 시세를 즉각 반영하여<br />당일 기준 최고의 가치를 제공합니다.</p>
          </div>
          <div className="bg-white rounded-[32px] p-10 text-center shadow-xl shadow-slate-200/50 border border-slate-50 group hover:-translate-y-2 transition-all">
            <div className="w-16 h-16 bg-brand-blue/10 rounded-[20px] flex items-center justify-center text-brand-blue mx-auto mb-6 group-hover:bg-brand-blue group-hover:text-white transition-all">
              <Award size={32} />
            </div>
            <h4 className="text-[20px] font-black text-slate-900 mb-3 tracking-tight">전문 솔루션</h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">대량 매각부터 특수금속까지<br />분야별 전문 상담 인력이 대응합니다.</p>
          </div>
        </div>

        {/* Map Section */}
        <div className="pt-20 border-t border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
            <div>
              <h3 className="text-[28px] md:text-[34px] font-black text-slate-900 mb-4 flex items-center gap-4 tracking-tight">
                <MapPin size={32} className="text-brand-green" /> 오시는 길
              </h3>
              <p className="text-slate-500 font-medium">태리자원의 오프라인 사업장 위치를 안내해 드립니다.</p>
            </div>
            <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 text-[15px] font-bold text-slate-700">
              경남 김해시 전하로123번길 6-19
            </div>
          </div>
          
          <div className="rounded-[48px] h-[500px] bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden relative shadow-inner">
            <div className="text-center z-10 bg-white/80 backdrop-blur-md px-10 py-8 rounded-[32px] shadow-2xl border border-white/50">
              <MapPin size={48} className="mx-auto mb-4 text-brand-green animate-bounce" />
              <p className="font-black text-slate-900 text-xl mb-2 tracking-tight">현재 지도 서비스 준비 중입니다</p>
              <p className="text-slate-500 font-medium">방문 전 고객센터로 문의주시면 상세히 안내해 드리겠습니다.</p>
              <div className="mt-8">
                <a href="tel:010-5555-2620" className="inline-block bg-brand-green text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-brand-green/20">전화 안내 받기</a>
              </div>
            </div>
            {/* Decorative Map Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none grayscale">
              <img 
                src="https://picsum.photos/seed/location/1200/800" 
                alt="map background" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
