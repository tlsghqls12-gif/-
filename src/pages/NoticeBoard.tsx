import { motion } from "motion/react";
import { ChevronLeft, Search, Bell, Megaphone, FileText, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

export default function NoticeBoard() {
  const [notices, setNotices] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = query(collection(db, "notices"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const filteredNotices = notices.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                          n.content.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <main className="container max-w-[1000px] mx-auto px-5 py-12 md:py-20">
      <motion.div {...fadeIn}>
        <div className="flex items-center gap-4 mb-12">
          <button 
            onClick={() => window.history.back()}
            className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-brand-green hover:border-brand-green transition-all shadow-sm"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <div className="section-indicator">운영 안내 및 공지</div>
            <h1 className="text-[28px] md:text-[36px] font-black text-slate-900 tracking-tight">태리자원 소식통</h1>
          </div>
        </div>

        <div className="mb-10 flex justify-end items-center">
          <div className="relative w-full md:w-[300px]">
            <input 
              type="text" 
              placeholder="검색어를 입력하세요"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
        </div>

        <div className="space-y-4">
          {filteredNotices.map((notice) => (
            <motion.div 
              key={notice.id}
              whileHover={{ y: -2 }}
              className={`bg-white rounded-3xl p-6 md:p-8 flex items-start gap-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer group ${notice.important ? 'ring-2 ring-brand-green/20' : ''}`}
            >
              <div className="w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center bg-brand-green/10 text-brand-green">
                {notice.important ? <Megaphone size={24} /> : <Bell size={24} />}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="text-[13px] font-medium text-slate-400">{new Date(notice.date).toLocaleDateString()}</span>
                </div>
                <h3 className="text-[18px] md:text-[20px] font-black text-slate-800 mb-3 group-hover:text-brand-green transition-colors">{notice.title}</h3>
                <p className="text-slate-500 font-medium text-[15px] leading-relaxed line-clamp-2 md:line-clamp-1">{notice.content}</p>
              </div>
              <div className="hidden md:flex w-10 h-10 rounded-full border border-slate-100 items-center justify-center text-slate-300 group-hover:bg-brand-green group-hover:text-white group-hover:border-brand-green transition-all">
                <ChevronRight size={20} />
              </div>
            </motion.div>
          ))}

          {filteredNotices.length === 0 && (
            <div className="text-center py-24 bg-white rounded-[40px] border border-slate-100">
              <p className="text-slate-400 font-bold">검색 결과가 없습니다.</p>
            </div>
          )}
        </div>

        <div className="mt-12 flex justify-center gap-2">
          {[1, 2, 3].map(p => (
            <button key={p} className={`w-10 h-10 rounded-xl font-bold transition-all ${p === 1 ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-white border border-slate-100 text-slate-400 hover:text-slate-900'}`}>
              {p}
            </button>
          ))}
        </div>
      </motion.div>
    </main>
  );
}
