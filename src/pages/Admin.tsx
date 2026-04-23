import { motion } from "motion/react";
import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, handleFirestoreError, OperationType } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { Mail, Phone, Calendar, Trash2, CheckCircle, Clock, Settings, Image as ImageIcon, Save, Loader2 } from "lucide-react";

interface Inquiry {
  id: string;
  name: string;
  phone: string;
  itemName: string;
  weight: string;
  email: string;
  content: string;
  status: "new" | "read" | "completed";
  createdAt: any;
}

interface SiteSettings {
  heroImageUrl: string;
  aboutImageUrl: string;
}

export default function Admin() {
  const { isAdmin, loading } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({ heroImageUrl: "", aboutImageUrl: "" });
  const [activeTab, setActiveTab] = useState<"inquiries" | "settings">("inquiries");
  const [isUploading, setIsUploading] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    // Fetch inquiries
    const q = query(collection(db, "inquiries"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Inquiry[];
      setInquiries(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "inquiries");
    });

    // Fetch settings
    const fetchSettings = async () => {
      const settingsDoc = await getDoc(doc(db, "settings", "app"));
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data() as SiteSettings);
      }
    };
    fetchSettings();

    return () => unsubscribe();
  }, [isAdmin]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof SiteSettings) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(field);
    try {
      const storageRef = ref(storage, `settings/${field}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setSettings({ ...settings, [field]: url });
    } catch (error) {
      console.error("Upload failed:", error);
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(null);
    }
  };

  if (loading) return <div className="p-20 text-center">로딩 중...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "inquiries", id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `inquiries/${id}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteDoc(doc(db, "inquiries", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `inquiries/${id}`);
    }
  };

  const handleSettingsSave = async () => {
    try {
      await setDoc(doc(db, "settings", "app"), settings);
      alert("설정이 저장되었습니다.");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "settings/app");
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
        <div className="section-indicator">관리자 시스템</div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-[32px] md:text-[40px] font-black text-slate-900 mb-2 tracking-tight">통합 관리 센터</h1>
            <p className="text-slate-500 font-medium font-pretendard">고객 문의 및 사이트 전반의 설정을 관리합니다.</p>
          </div>
        </div>

        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl mb-12 shadow-inner w-fit">
          <button 
            onClick={() => setActiveTab("inquiries")}
            className={`px-8 py-3 rounded-xl font-black text-[15px] transition-all flex items-center gap-2 ${
              activeTab === "inquiries" ? "bg-white text-brand-green shadow-sm" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Mail size={18} /> 문의 내역 관리
          </button>
          <button 
            onClick={() => setActiveTab("settings")}
            className={`px-8 py-3 rounded-xl font-black text-[15px] transition-all flex items-center gap-2 ${
              activeTab === "settings" ? "bg-white text-brand-green shadow-sm" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Settings size={18} /> 사이트 환경 설정
          </button>
        </div>

        {activeTab === "inquiries" ? (
          <div className="space-y-8">
            {inquiries.map((inquiry) => (
              <div 
                key={inquiry.id} 
                className="bg-white rounded-[32px] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 relative group overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-2 h-full ${
                  inquiry.status === 'new' ? 'bg-brand-blue' : 
                  inquiry.status === 'read' ? 'bg-brand-yellow' : 'bg-brand-green'
                }`} />

                <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`text-[12px] font-black px-4 py-1 rounded-full uppercase tracking-wider ${
                        inquiry.status === 'new' ? 'bg-brand-blue/10 text-brand-blue' : 
                        inquiry.status === 'read' ? 'bg-brand-yellow/10 text-brand-yellow' : 'bg-brand-green/10 text-brand-green'
                      }`}>
                        {inquiry.status === 'new' ? '신규 접수' : inquiry.status === 'read' ? '확인 중' : '처리 완료'}
                      </span>
                      <span className="text-slate-300 font-bold text-sm flex items-center gap-1.5">
                        <Calendar size={14} />
                        {inquiry.createdAt?.toDate().toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-[24px] font-black text-slate-900 tracking-tight">{inquiry.name} <span className="text-slate-400 text-[18px]">고객님</span></h3>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleStatusUpdate(inquiry.id, 'read')}
                      className="w-12 h-12 flex items-center justify-center text-brand-yellow bg-brand-yellow/5 rounded-2xl hover:bg-brand-yellow hover:text-white transition-all shadow-sm"
                      title="읽음 처리"
                    >
                      <Clock size={20} />
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(inquiry.id, 'completed')}
                      className="w-12 h-12 flex items-center justify-center text-brand-green bg-brand-green/5 rounded-2xl hover:bg-brand-green hover:text-white transition-all shadow-sm"
                      title="완료 처리"
                    >
                      <CheckCircle size={20} />
                    </button>
                    <button 
                      onClick={() => handleDelete(inquiry.id)}
                      className="w-12 h-12 flex items-center justify-center text-red-500 bg-red-50 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      title="삭제"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                  <div className="space-y-1">
                    <p className="text-[12px] font-black text-slate-400 uppercase tracking-wider">연락처</p>
                    <p className="text-[15px] font-bold text-slate-700 flex items-center gap-2"><Phone size={14} className="text-brand-lime" /> {inquiry.phone}</p>
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    <p className="text-[12px] font-black text-slate-400 uppercase tracking-wider">이메일</p>
                    <p className="text-[15px] font-bold text-slate-700 truncate flex items-center gap-2"><Mail size={14} className="text-brand-lime" /> {inquiry.email || '미기재'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[12px] font-black text-slate-400 uppercase tracking-wider">품명</p>
                    <p className="text-[15px] font-black text-brand-green">{inquiry.itemName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[12px] font-black text-slate-400 uppercase tracking-wider">중량</p>
                    <p className="text-[15px] font-black text-slate-900">{inquiry.weight}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[12px] font-black text-slate-400 uppercase tracking-wider ml-1">상세 문의 내용</p>
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 text-slate-600 text-[16px] font-pretendard whitespace-pre-wrap leading-relaxed shadow-sm">
                    {inquiry.content}
                  </div>
                </div>
              </div>
            ))}

            {inquiries.length === 0 && (
              <div className="text-center py-40 rounded-[40px] bg-slate-50 border-2 border-dashed border-slate-100">
                <Mail size={80} className="mx-auto mb-6 text-slate-200" strokeWidth={1} />
                <p className="text-slate-400 font-black text-[18px]">접수된 문의가 없습니다.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            <div className="bg-white rounded-[40px] p-10 md:p-14 shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="space-y-8">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[22px] font-black text-slate-900 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green">
                        <ImageIcon size={20} />
                      </div>
                      메인 히어로 이미지
                    </h3>
                    <p className="text-slate-500 font-medium text-[14px]">메인 페이지 최상단 배경 이미지를 설정합니다.</p>
                  </div>
                  <div className="space-y-6">
                    <div className="w-full aspect-video rounded-3xl overflow-hidden border-2 border-slate-100 bg-slate-50 shadow-inner group relative">
                      {settings.heroImageUrl ? (
                        <img src={settings.heroImageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                          <ImageIcon size={48} strokeWidth={1} />
                          <p className="mt-2 text-sm font-bold">등록된 이미지가 없습니다</p>
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <div className="bg-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                          <Save size={18} /> 이미지 변경
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "heroImageUrl")} />
                      </label>
                    </div>
                    {isUploading === "heroImageUrl" && (
                      <div className="flex items-center gap-2 text-brand-green font-black animate-pulse">
                        <Loader2 className="animate-spin" size={20} /> 업로드 중입니다...
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[22px] font-black text-slate-900 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-lime/10 flex items-center justify-center text-brand-lime">
                        <ImageIcon size={20} />
                      </div>
                      회사소개 커버 이미지
                    </h3>
                    <p className="text-slate-500 font-medium text-[14px]">회사소개 페이지의 상단 이미지를 설정합니다.</p>
                  </div>
                  <div className="space-y-6">
                    <div className="w-full aspect-video rounded-3xl overflow-hidden border-2 border-slate-100 bg-slate-50 shadow-inner group relative">
                      {settings.aboutImageUrl ? (
                        <img src={settings.aboutImageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                          <ImageIcon size={48} strokeWidth={1} />
                          <p className="mt-2 text-sm font-bold">등록된 이미지가 없습니다</p>
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <div className="bg-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                          <Save size={18} /> 이미지 변경
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "aboutImageUrl")} />
                      </label>
                    </div>
                    {isUploading === "aboutImageUrl" && (
                      <div className="flex items-center gap-2 text-brand-lime font-black animate-pulse">
                        <Loader2 className="animate-spin" size={20} /> 업로드 중입니다...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-20 pt-10 border-t border-slate-100 flex justify-between items-center">
                <p className="text-slate-400 font-bold text-sm">이미지 변경 후 반드시 저장을 눌러주세요.</p>
                <button 
                  onClick={handleSettingsSave}
                  className="bg-brand-green text-white px-12 py-4 rounded-2xl font-black hover:scale-105 transition-transform flex items-center gap-3 text-[18px] shadow-xl shadow-brand-green/20"
                >
                  <Save size={24} /> 변경사항 최종 저장
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </main>
  );
}
