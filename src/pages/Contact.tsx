import { motion } from "motion/react";
import { MapPin, Phone, Clock, MessageSquare, CheckCircle2 } from "lucide-react";
import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { PHONE_NUMBER } from "../components/Navbar";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    itemName: "",
    weight: "",
    email: "",
    content: "",
    agree: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agree) {
      alert("개인정보제공 동의가 필요합니다.");
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "inquiries"), {
        ...formData,
        status: "new",
        createdAt: serverTimestamp()
      });
      setIsSuccess(true);
      setFormData({
        name: "",
        phone: "",
        itemName: "",
        weight: "",
        email: "",
        content: "",
        agree: false
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "inquiries");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <main className="container max-w-[1000px] mx-auto px-5 py-12 md:py-20">
      <motion.div {...fadeIn}>
        <div className="text-center mb-16">
          <div className="section-indicator mx-auto w-fit">상담 및 문의</div>
          <h1 className="text-[32px] md:text-[44px] font-black text-slate-900 mb-6 tracking-tight leading-tight">
            가장 정직한 가치를<br />
            <span className="text-brand-green">직접 확인해 보세요</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-[600px] mx-auto text-[15px] md:text-[17px] leading-relaxed">
            고객님의 자원을 소중히 생각합니다.<br />
            품목, 중량, 위치에 관계없이 언제든 편하게 문의주시면 친절히 상담해 드립니다.
          </p>
        </div>

        {isSuccess ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[48px] p-16 text-center shadow-2xl shadow-green-900/5 max-w-[600px] mx-auto border border-brand-green/10"
          >
            <div className="w-24 h-24 bg-brand-green text-white rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-brand-green/20">
              <CheckCircle2 size={56} />
            </div>
            <h2 className="text-[28px] font-black mb-4 tracking-tight">문의가 접수되었습니다!</h2>
            <p className="text-slate-500 font-medium mb-10">담당자가 확인 후 신속하게 연락드리겠습니다.</p>
            <button 
              onClick={() => setIsSuccess(false)}
              className="bg-slate-900 text-white px-12 py-4 rounded-2xl font-black shadow-lg hover:bg-brand-green transition-all"
            >
              추가 문의하기
            </button>
          </motion.div>
        ) : (
          <div className="bg-white rounded-[48px] p-8 md:p-14 shadow-2xl shadow-green-900/5 border border-slate-50">
            <form onSubmit={handleSubmit} className="space-y-12">
              {/* 기본정보 */}
              <section>
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-1.5 h-6 bg-brand-lime rounded-full" />
                  <h2 className="text-[24px] font-black text-slate-900 tracking-tight">기본 정보를 알려주세요</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[13px] font-black text-slate-400 ml-1 uppercase tracking-wider">성함 또는 업체명 <span className="text-brand-green">*</span></label>
                    <input 
                      required
                      placeholder="홍길동"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-brand-lime transition-all font-bold"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-black text-slate-400 ml-1 uppercase tracking-wider">연락처 <span className="text-brand-green">*</span></label>
                    <input 
                      required
                      placeholder="010-0000-0000"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-brand-lime transition-all font-bold"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-black text-slate-400 ml-1 uppercase tracking-wider">품명 <span className="text-brand-green">*</span></label>
                    <input 
                      required
                      placeholder="예: 구리, 고철, 알루미늄 등"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-brand-lime transition-all font-bold"
                      value={formData.itemName}
                      onChange={e => setFormData({...formData, itemName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-black text-slate-400 ml-1 uppercase tracking-wider">대략적인 중량 <span className="text-brand-green">*</span></label>
                    <input 
                      required
                      placeholder="예: 50kg, 1톤 등"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-brand-lime transition-all font-bold"
                      value={formData.weight}
                      onChange={e => setFormData({...formData, weight: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[13px] font-black text-slate-400 ml-1 uppercase tracking-wider">이메일 주소</label>
                    <input 
                      type="email"
                      placeholder="example@email.com"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-brand-lime transition-all font-bold"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
              </section>

              {/* 문의 내용 */}
              <section>
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-1.5 h-6 bg-brand-green rounded-full" />
                  <h2 className="text-[24px] font-black text-slate-900 tracking-tight">상세한 요청사항을 적어주세요</h2>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-6 focus-within:ring-2 focus-within:ring-brand-green transition-all shadow-inner">
                  <textarea 
                    placeholder="매각하실 물품의 상태, 보관 위치, 방문 희망 시간 등을 자유롭게 작성해 주세요."
                    className="w-full h-48 bg-transparent outline-none resize-none font-medium text-slate-700 placeholder:text-slate-300"
                    value={formData.content}
                    onChange={e => setFormData({...formData, content: e.target.value})}
                  />
                </div>
              </section>

              <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-6">
                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setFormData({...formData, agree: !formData.agree})}>
                  <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${formData.agree ? 'bg-brand-green border-brand-green text-white shadow-lg shadow-brand-green/20' : 'border-slate-200 bg-white'}`}>
                    <CheckCircle2 size={18} />
                  </div>
                  <label htmlFor="agree" className="text-[15px] font-bold text-slate-600 cursor-pointer select-none">
                    개인정보 수집 및 이용에 동의합니다
                  </label>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-fit bg-brand-green text-white px-16 py-4 rounded-2xl font-black text-[18px] transition-all shadow-xl shadow-brand-green/20 hover:scale-105 disabled:opacity-50"
                >
                  {isSubmitting ? "전송 중..." : "상담 신청하기"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Contact Info Cards */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-6 group hover:-translate-y-1 transition-all">
            <div className="w-14 h-14 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green group-hover:bg-brand-green group-hover:text-white transition-all">
              <Phone size={24} />
            </div>
            <div>
              <p className="text-[13px] font-black text-slate-400 uppercase tracking-wider mb-1">전화 상담</p>
              <p className="font-black text-slate-900 text-[18px] tracking-tight">{PHONE_NUMBER}</p>
            </div>
          </div>
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-6 group hover:-translate-y-1 transition-all">
            <div className="w-14 h-14 bg-brand-lime/10 rounded-2xl flex items-center justify-center text-brand-lime group-hover:bg-brand-lime group-hover:text-white transition-all">
              <MapPin size={24} />
            </div>
            <div>
              <p className="text-[13px] font-black text-slate-400 uppercase tracking-wider mb-1">본사 위치</p>
              <p className="font-black text-slate-900 text-[18px] tracking-tight">김해시 전하로123번길 6-19</p>
            </div>
          </div>
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-6 group hover:-translate-y-1 transition-all">
            <div className="w-14 h-14 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-[13px] font-black text-slate-400 uppercase tracking-wider mb-1">운영 시간</p>
              <p className="font-black text-slate-900 text-[18px] tracking-tight">09:00 ~ 18:00 (월-토)</p>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
