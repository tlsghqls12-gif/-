import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebase";

export default function ScheduleCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "calendar_events"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => doc.data()));
    });
    return () => unsubscribe();
  }, []);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = [];
  const firstDay = firstDayOfMonth(year, month);
  const totalDays = daysInMonth(year, month);

  // Fill empty days at the start
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Fill actual days
  for (let i = 1; i <= totalDays; i++) {
    days.push(i);
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <main className="container max-w-[1000px] mx-auto px-5 py-12 md:py-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-4 mb-12">
          <button 
            onClick={() => window.history.back()}
            className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-brand-green hover:border-brand-green transition-all shadow-sm"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <div className="section-indicator">매장 운영 일정</div>
            <h1 className="text-[28px] md:text-[36px] font-black text-slate-900 tracking-tight">태리자원 업무 캘린더</h1>
          </div>
        </div>

        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl shadow-green-900/5 border border-slate-50">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
            <div className="flex items-center gap-6">
              <h2 className="text-[32px] font-black text-slate-900">{year}년 {month + 1}월</h2>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <ChevronLeft size={24} className="text-slate-400" />
                </button>
                <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <ChevronRight size={24} className="text-slate-400" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[14px] font-bold">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-brand-green rounded-full" />
                <span className="text-slate-600">정상 운영</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-100 rounded-full" />
                <span className="text-slate-600">휴무</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 border-t border-slate-100">
            {weekDays.map((day, i) => (
              <div key={day} className={`py-6 text-center text-[15px] font-black tracking-tight ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-slate-400'}`}>
                {day}
              </div>
            ))}
            {days.map((day, i) => (
              <div 
                key={i} 
                className={`aspect-square p-2 md:p-4 border-t border-slate-100 flex flex-col items-center justify-start relative group transition-colors hover:bg-slate-50/50 
                  ${(i % 7 === 0) ? 'text-red-400' : (i % 7 === 6) ? 'text-blue-400' : 'text-slate-900'}
                  ${day === null ? 'bg-slate-50/30' : ''}
                `}
              >
                {day && (() => {
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const event = events.find(e => e.date === dateStr);
                  const isSunday = i % 7 === 0;
                  const status = event ? event.type : (isSunday ? 'closed' : 'open');

                  return (
                    <>
                      <span className="font-bold text-[16px] mb-2">{day}</span>
                      {status === 'open' || status === 'partial' ? (
                        <div className="w-full mt-auto">
                          <div className={`h-1 w-full bg-brand-green/20 rounded-full overflow-hidden ${status === 'partial' ? 'bg-brand-yellow/20' : ''}`}>
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              className={`h-full ${status === 'partial' ? 'bg-brand-yellow' : 'bg-brand-green'}`}
                            />
                          </div>
                          <p className={`hidden md:block text-[10px] font-bold mt-1 ${status === 'partial' ? 'text-brand-yellow' : 'text-brand-green'}`}>
                            {event ? event.title : '정상업무'}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-auto">
                          <p className="text-[10px] font-black text-slate-300">{event ? event.title : '휴무'}</p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            ))}
          </div>

          <div className="mt-12 bg-slate-50 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 border border-slate-100">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-brand-green shadow-sm shrink-0">
              <CalendarIcon size={32} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 mb-2">운영 일정 안내</h3>
              <p className="text-[15px] text-slate-500 font-medium leading-relaxed">
                일요일은 정기 휴무이며, 공휴일 업무는 당월 공지사항을 확인해 주시기 바랍니다.<br />
                기상의 악화 등으로 인한 임시 휴무 시 사전에 안내 드립니다.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
