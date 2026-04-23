import { motion } from "motion/react";
import { TrendingUp, Package, MapPin, ChevronRight, FileText, ShoppingBag, Truck, Info, Calendar, MessageSquare, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, limit, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

interface PurchaseStatus {
  id: string;
  title: string;
  location: string;
  createdAt: any;
}

interface PriceItem {
  id: string;
  name: string;
  price: string;
  trend: "up" | "down" | "stable";
}

export default function Home() {
  const [statuses, setStatuses] = useState<PurchaseStatus[]>([]);
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [heroImage, setHeroImage] = useState("https://images.unsplash.com/photo-1518349619113-03114f06ac3a?q=80&w=2000&auto=format&fit=crop");

  useEffect(() => {
    // Fetch settings
    const fetchSettings = async () => {
      const settingsDoc = await getDoc(doc(db, "settings", "app"));
      if (settingsDoc.exists() && settingsDoc.data().heroImageUrl) {
        setHeroImage(settingsDoc.data().heroImageUrl);
      }
    };
    fetchSettings();

    // Fetch prices
    const pq = query(collection(db, "prices"), orderBy("order", "asc"), limit(4));
    const unsubscribePrices = onSnapshot(pq, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PriceItem[];
      setPrices(data);
    });

    const q = query(collection(db, "purchase_status"), orderBy("createdAt", "desc"), limit(2));
    const unsubscribeStatuses = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PurchaseStatus[];
      setStatuses(data);
    });
    return () => {
      unsubscribePrices();
      unsubscribeStatuses();
    };
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  return (
    <main className="w-full pb-20">
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[640px] overflow-hidden bg-slate-50">
        <div className="container max-w-[1200px] mx-auto px-5 h-full grid grid-cols-1 lg:grid-cols-2 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="max-w-xl"
          >
            <h2 className="text-[20px] font-bold text-brand-lime mb-2">지속 가능한 미래를 위한</h2>
            <h1 className="text-[40px] md:text-[56px] font-black text-slate-900 leading-[1.1] mb-6">
              정직한 자원 순환의 시작,<br /> 
              <span className="text-brand-green">태리자원</span>입니다
            </h1>
            <p className="text-[18px] text-slate-600 font-medium mb-10 leading-relaxed">
              우리는 투명한 측정과 공정한 시세를 통해<br />
              지역 사회와 함께 성장하는 자원 순환 파트너가 되겠습니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/contact" className="bg-brand-green text-white px-8 py-4 rounded-full font-bold text-[17px] shadow-lg shadow-brand-green/20 hover:scale-105 transition-transform">
                매입 상담하기
              </Link>
            </div>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block">
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="w-full h-full"
          >
            <img 
              src={heroImage} 
              alt="태리자원 금속 자원" 
              className="w-full h-full object-cover rounded-bl-[120px]"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>
      </section>

      {/* Quick Access Tiles */}
      <section className="container max-w-[1200px] mx-auto px-5 -mt-16 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { icon: FileText, label: "시세정보", path: "/price" },
            { icon: ShoppingBag, label: "매입품목", path: "/items" },
            { icon: Truck, label: "매입현황", path: "/status" },
            { icon: MessageSquare, label: "상담문의", path: "/contact" },
            { icon: Clock, label: "운영안내", path: "/guide" },
          ].map((tile, i) => (
            <motion.div
              key={tile.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={tile.path} className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform group font-bold">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-green mb-3 group-hover:bg-brand-lime group-hover:text-white transition-colors">
                  <tile.icon size={28} />
                </div>
                <span className="text-slate-700 text-[15px]">{tile.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Announcements & Prices */}
      <section className="container max-w-[1200px] mx-auto px-5 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <motion.div {...fadeIn} className="lg:col-span-2">
            <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4">
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <TrendingUp className="text-brand-lime" /> 실시간 주요 시세
              </h3>
              <Link to="/price" className="text-[13px] font-bold text-slate-400 hover:text-brand-green flex items-center gap-1">
                전체보기 <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {prices.map((item) => (
                <div key={item.id} className="professional-card p-6 flex justify-between items-center bg-gradient-to-br from-white to-slate-50 border-none">
                  <span className="font-bold text-slate-800 text-lg">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-xl text-brand-green">{item.price}</span>
                    <span className={`text-[12px] font-bold px-2 py-1 rounded-full ${
                      item.trend === 'up' ? 'bg-red-50 text-red-500' : 
                      item.trend === 'down' ? 'bg-blue-50 text-blue-500' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {item.trend === 'up' && '▲'}
                      {item.trend === 'down' && '▼'}
                      {item.trend === 'stable' && '-'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
            <div className="bg-brand-blue rounded-[40px] p-8 text-white h-full shadow-2xl shadow-brand-blue/20 flex flex-col justify-between overflow-hidden relative">
              <div className="relative z-10">
                <h4 className="text-[18px] font-bold opacity-80 mb-2">자원 순환 서비스</h4>
                <h3 className="text-[28px] font-black leading-tight mb-6">최적의 단가로<br /> 보답하겠습니다</h3>
                <p className="text-[15px] opacity-70 leading-relaxed mb-10">당일 시세 분석을 통한 최적의 매입 가격을 제안하며, 신속하고 정확한 계량 서비스를 제공합니다.</p>
                <div className="space-y-4">
                  {statuses.map((s) => (
                    <div key={s.id} className="flex items-start gap-4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                      <div className="mt-1"><MapPin size={16} className="text-brand-lime" /></div>
                      <div>
                        <p className="font-bold text-[14px] leading-snug">{s.title}</p>
                        <p className="text-[11px] opacity-60 mt-1">{s.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 opacity-10">
                <Package size={200} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Education Info Section (Style Reference) */}
      <section className="bg-[#F2F8F0] py-24">
        <div className="container max-w-[1200px] mx-auto px-5">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-[36px] font-black text-slate-900 mb-4 tracking-tight">함께 만드는 자원 순환</h2>
            <p className="text-slate-500 font-medium">태리자원은 지역사회와 함께 환경을 생각합니다.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div {...fadeIn} className="bg-white rounded-[40px] p-8 shadow-xl shadow-green-900/5 group">
              <Link to="/guide/schedule">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-lime rounded-full flex items-center justify-center text-white"><Calendar size={20} /></div>
                    <h3 className="text-xl font-bold text-slate-800">매장 운영 일정</h3>
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-brand-green transition-all" />
                </div>
                <div className="grid grid-cols-7 gap-2">
                {['월','화','수','목','금','토','일'].map(d => (
                  <div key={d} className="text-center text-[13px] font-bold text-slate-400 py-2">{d}</div>
                ))}
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className={`text-center p-3 rounded-2xl font-bold text-[16px] ${i === 3 ? 'bg-brand-lime text-white shadow-lg shadow-brand-lime/20' : 'group-hover:bg-slate-50 text-slate-700'}`}>
                    {23 + i}
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-center text-slate-400 text-sm font-medium">
                환경보호 실천을 위해 주말은 일부 품목만 매입합니다.
              </div>
              </Link>
            </motion.div>

            <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="bg-white rounded-[40px] p-8 shadow-xl shadow-green-900/5 group">
              <Link to="/guide/news">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center text-white"><Info size={20} /></div>
                    <h3 className="text-xl font-bold text-slate-800">운영 안내 및 공지</h3>
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-brand-green transition-all" />
                </div>
                <ul className="space-y-6">
                  {[
                    "2024년 상반기 구리 단가 인상 안내",
                    "신규 매입 장비 도입으로 인한 정밀 계량 실시",
                    "지역사회 환경 교육 프로그램 참여 업체 선정",
                    "추석 명절 기간 휴무 및 수납 안내"
                  ].map((notice, i) => (
                    <li key={i} className="flex justify-between items-center">
                      <span className="font-medium text-slate-600 group-hover:text-brand-green transition-colors line-clamp-1">· {notice}</span>
                      <span className="text-[12px] text-slate-300 font-mono">2024.04.{20-i}</span>
                    </li>
                  ))}
                </ul>
                <div className="w-full mt-8 py-3 bg-slate-50 rounded-2xl text-slate-500 font-bold text-[14px] group-hover:bg-slate-100 transition-colors text-center">
                  상세 공지사항 확인하기
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Simple Address Info */}
      <section className="container max-w-[1200px] mx-auto px-5 py-24">
        <motion.div {...fadeIn} className="bg-white rounded-[40px] p-10 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="text-[20px] font-black text-slate-900 mb-4 tracking-tight">태리자원 찾아오시는 길</h4>
            <div className="space-y-2 text-slate-500 font-medium">
              <p className="flex items-center gap-2 tracking-tight"><MapPin size={16} className="text-brand-lime" /> 김해시 전하동 123-45 태리자원</p>
              <p className="flex items-center gap-2 tracking-tight"><Truck size={16} className="text-brand-lime" /> 055-123-4567 / 010-5555-2620</p>
            </div>
          </div>
          <div className="flex gap-3 relative z-10">
            <button className="bg-brand-green text-white px-6 py-3 rounded-2xl font-bold text-[15px] hover:scale-105 transition-transform shadow-lg shadow-brand-green/20">전화 상담하기</button>
            <button className="bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold text-[15px] hover:scale-105 transition-transform shadow-lg shadow-slate-800/20">길찾기 안내</button>
          </div>
          <div className="absolute right-0 bottom-0 opacity-[0.03] scale-150 rotate-12">
            <ShoppingBag size={300} />
          </div>
        </motion.div>
      </section>
    </main>
  );
}
