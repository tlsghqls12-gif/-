import { motion } from "motion/react";
import { Clock, Calendar, Bell, ChevronRight, MapPin, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";

export default function OperationGuide() {
  const [latestNotices, setLatestNotices] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "notices"), orderBy("date", "desc"), limit(2));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLatestNotices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <main className="container max-w-[1000px] mx-auto px-5 py-12 md:py-20 text-pretendard">
      <motion.div {...fadeIn}>
        <div className="section-indicator">운영안내</div>
        <h1 className="text-[32px] md:text-[44px] font-black text-slate-900 mb-12 leading-[1.1] tracking-tight">
          태리자원<br />
          <span className="text-brand-green">운영 안내 및 일정</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Link to="/guide/schedule" className="bg-white rounded-[40px] p-8 md:p-10 shadow-2xl shadow-green-900/5 border border-slate-50 hover:shadow-xl hover:shadow-green-900/10 transition-all group">
            <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green mb-8 group-hover:bg-brand-green group-hover:text-white transition-all">
              <Clock size={32} />
            </div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[26px] font-black text-slate-900 tracking-tight">매장 운영 일정</h2>
              <ChevronRight className="text-slate-300 group-hover:text-brand-green transition-all" />
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <span className="font-bold text-slate-500">평일 (월-금)</span>
                <span className="font-black text-slate-900">09:00 - 18:00</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <span className="font-bold text-slate-500">토요일</span>
                <span className="font-black text-slate-900">09:00 - 15:00</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <span className="font-bold text-slate-500">일요일 및 공휴일</span>
                <span className="font-black text-brand-green">휴무</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-500">점심시간</span>
                <span className="font-black text-slate-900 text-right">12:00 - 13:00<br /><span className="text-[12px] opacity-50 font-medium">※ 전화 상담은 상시 가능</span></span>
              </div>
            </div>
          </Link>

          {/* 운영 안내 및 공지 상세 */}
          <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-2xl shadow-green-900/5 border border-slate-50">
            <div className="w-16 h-16 bg-brand-lime/10 rounded-2xl flex items-center justify-center text-brand-lime mb-8">
              <Bell size={32} />
            </div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[26px] font-black text-slate-900 tracking-tight">태리자원 주요 공지</h2>
              <Link to="/guide/news" className="text-brand-green font-bold text-sm hover:underline">전체보기</Link>
            </div>
            <div className="space-y-4">
              {latestNotices.map((notice) => (
                <div key={notice.id} className="bg-slate-50 p-6 rounded-3xl group cursor-pointer hover:bg-brand-green/5 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[12px] font-medium text-slate-400">{new Date(notice.date).toLocaleDateString()}</span>
                    {notice.important && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">URGENT</span>}
                  </div>
                  <h3 className="font-black text-slate-800 group-hover:text-brand-green transition-colors line-clamp-1">{notice.title}</h3>
                  <p className="text-[14px] text-slate-500 mt-2 line-clamp-2">{notice.content}</p>
                </div>
              ))}
              
              <Link to="/guide/news" className="w-full flex items-center justify-center gap-2 py-4 text-slate-400 font-bold hover:text-brand-green transition-colors mt-4">
                더 많은 소식 보기 <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Location Info (Sub-feature) */}
        <div className="bg-slate-900 rounded-[48px] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-[32px] md:text-[40px] font-black leading-tight mb-6">방문 전 확인해주세요</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-brand-lime">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-[18px]">김해시 전하로123번길 6-19</p>
                    <p className="text-white/50 text-[14px]">김해 전하동 자원 순환 단지 내 위치</p>
                  </div>
                </div>
                <p className="text-white/60 leading-relaxed font-medium">
                  매장 방문 전 미리 품목과 대략적인 중량을 알려주시면 더욱 신속한 처리가 가능합니다. 
                  대형 차량 진입이 가능하오니 안심하고 방문해 주세요.
                </p>
              </div>
            </div>
            <div className="aspect-square bg-white/5 rounded-[40px] border border-white/10 flex items-center justify-center">
              <div className="text-center">
                <Info size={48} className="text-brand-lime mx-auto mb-4 opacity-50" />
                <p className="text-white/40 font-bold">오시는 길 로드맵 서비스 준비 중</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green/10 blur-[120px] rounded-full -mr-48 -mt-48" />
        </div>
      </motion.div>
    </main>
  );
}
