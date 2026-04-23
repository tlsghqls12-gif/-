import { motion, AnimatePresence } from "motion/react";
import { TrendingUp, MapPin, Calendar, Plus, Trash2, Package, X, ChevronLeft, ChevronRight, Image as ImageIcon, Loader2, CheckCircle2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, handleFirestoreError, OperationType } from "../firebase";
import { useAuth } from "../context/AuthContext";

interface PurchaseStatus {
  id: string;
  title: string;
  location: string;
  imageUrl?: string;
  createdAt: any;
}

const ITEMS_PER_PAGE = 9;

export default function PurchaseStatusPage() {
  const { isAdmin } = useAuth();
  const [statuses, setStatuses] = useState<PurchaseStatus[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newStatus, setNewStatus] = useState({ title: "", location: "", imageUrl: "" });
  const [selectedStatus, setSelectedStatus] = useState<PurchaseStatus | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "purchase_status"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PurchaseStatus[];
      setStatuses(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "purchase_status");
    });

    return () => unsubscribe();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `status/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setNewStatus({ ...newStatus, imageUrl: url });
    } catch (error) {
      console.error("Upload failed:", error);
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAdd = async () => {
    if (!newStatus.title || !newStatus.location) return;
    try {
      await addDoc(collection(db, "purchase_status"), {
        ...newStatus,
        createdAt: serverTimestamp()
      });
      setNewStatus({ title: "", location: "", imageUrl: "" });
      setIsAdding(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "purchase_status");
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteDoc(doc(db, "purchase_status", id));
      if (selectedStatus?.id === id) setSelectedStatus(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `purchase_status/${id}`);
    }
  };

  const totalPages = Math.ceil(statuses.length / ITEMS_PER_PAGE);
  const paginatedStatuses = statuses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <main className="container max-w-[1200px] mx-auto px-5 py-12 md:py-20">
      <motion.div {...fadeIn}>
        <div className="section-indicator">매입현황</div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-[32px] md:text-[40px] font-black text-slate-900 mb-2 tracking-tight">실시간 매입 현황</h1>
            <p className="text-slate-500 font-medium">태리자원의 최근 매입 활동 내역입니다.</p>
          </div>
          {isAdmin && (
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-brand-green text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-brand-green/20 hover:scale-105 transition-transform flex items-center gap-2 text-[15px]"
            >
              <Plus size={20} /> 현황 등록하기
            </button>
          )}
        </div>

        {isAdding && (
          <div className="professional-card p-10 mb-16 border-none bg-green-50 shadow-xl shadow-green-900/5">
            <h3 className="text-[22px] font-black text-brand-green mb-8 tracking-tight">새 매입 현황 등록</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-slate-400 ml-1">게시글 제목</label>
                  <input 
                    placeholder="예: 김해 지역 고철 매입 현황"
                    className="w-full p-4 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-lime bg-white font-bold"
                    value={newStatus.title}
                    onChange={e => setNewStatus({...newStatus, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-slate-400 ml-1">매입 장소</label>
                  <input 
                    placeholder="예: 경남 김해시 전하동 일대"
                    className="w-full p-4 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-lime bg-white font-bold"
                    value={newStatus.location}
                    onChange={e => setNewStatus({...newStatus, location: e.target.value})}
                  />
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100">
                <label className="text-[14px] font-bold text-slate-600 mb-3 block">현장 사진 첨부</label>
                <div className="flex items-center gap-6">
                  <label className="cursor-pointer bg-slate-50 border border-slate-200 px-6 py-3 rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2 text-[14px] font-bold text-slate-600">
                    <ImageIcon size={20} className="text-brand-lime" /> 현장 사진 선택
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </label>
                  {isUploading && <Loader2 className="animate-spin text-brand-lime" size={24} />}
                  {newStatus.imageUrl && <span className="text-[14px] text-brand-green font-bold flex items-center gap-1"><CheckCircle2 size={16} /> 사진 업로드 성공</span>}
                </div>
                {newStatus.imageUrl && (
                  <div className="mt-4 w-32 h-32 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                    <img src={newStatus.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                )}
              </div>
              <div className="flex gap-4 justify-end pt-4">
                <button onClick={() => setIsAdding(false)} className="px-8 py-3 text-slate-400 font-bold hover:text-slate-600">닫기</button>
                <button onClick={handleAdd} disabled={isUploading || !newStatus.title} className="px-10 py-3 bg-brand-green text-white rounded-2xl font-black shadow-lg shadow-brand-green/20">현황 게시물 등록</button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedStatuses.map((status) => (
            <div 
              key={status.id} 
              onClick={() => setSelectedStatus(status)}
              className="group bg-white rounded-[40px] overflow-hidden cursor-pointer shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-all duration-300 flex flex-col border border-slate-100"
            >
              <div className="relative h-64 bg-slate-50 overflow-hidden">
                {status.imageUrl ? (
                  <img 
                    src={status.imageUrl} 
                    alt={status.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <TrendingUp size={80} strokeWidth={1} />
                  </div>
                )}
                {isAdmin && (
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    <button 
                      onClick={(e) => handleDelete(e, status.id)}
                      className="w-10 h-10 bg-white/90 backdrop-blur-md text-red-500 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
              <div className="p-8 flex-grow flex flex-col">
                <h3 className="text-[20px] font-black text-slate-900 mb-6 tracking-tight group-hover:text-brand-green transition-colors line-clamp-1">{status.title}</h3>
                <div className="space-y-3 mt-auto">
                  <div className="flex items-center gap-2.5 text-[14px] text-slate-500 font-bold">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-brand-lime">
                      <MapPin size={16} />
                    </div>
                    {status.location}
                  </div>
                  <div className="flex items-center gap-2.5 text-[14px] text-slate-400 font-medium ml-1">
                    <Calendar size={14} className="text-slate-300" />
                    {status.createdAt?.toDate().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {statuses.length === 0 && !isAdding && (
          <div className="text-center py-32 rounded-[40px] bg-slate-50/50 border-2 border-dashed border-slate-100">
            <Package size={64} className="mx-auto mb-6 text-slate-200" strokeWidth={1} />
            <p className="text-slate-400 font-bold">최근 매입 활동 내역이 없습니다.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-20">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="w-12 h-12 rounded-2xl border border-slate-100 bg-white shadow-sm disabled:opacity-30 flex items-center justify-center hover:bg-brand-green hover:text-white transition-all text-slate-400"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-12 h-12 rounded-2xl font-black text-[16px] transition-all shadow-sm ${
                    currentPage === page ? "bg-brand-green text-white" : "bg-white border border-slate-100 text-slate-400 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="w-12 h-12 rounded-2xl border border-slate-100 bg-white shadow-sm disabled:opacity-30 flex items-center justify-center hover:bg-brand-green hover:text-white transition-all text-slate-400"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedStatus && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStatus(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-[850px] bg-white rounded-[48px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="absolute top-8 right-8 z-20">
                <button 
                  onClick={() => setSelectedStatus(null)}
                  className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-slate-500 hover:text-brand-green transition-all shadow-xl hover:rotate-90 duration-300"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="overflow-y-auto overflow-x-hidden">
                {selectedStatus.imageUrl && (
                  <div className="w-full h-[500px] relative">
                    <img 
                      src={selectedStatus.imageUrl} 
                      alt={selectedStatus.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                )}
                <div className="p-10 md:p-16">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="bg-brand-blue/10 text-brand-blue text-[13px] font-black px-4 py-1.5 rounded-full">실시간 현황</span>
                    <span className="text-slate-300 text-[13px] font-bold">{selectedStatus.createdAt?.toDate().toLocaleDateString()}</span>
                  </div>
                  <h2 className="text-[32px] md:text-[44px] font-black text-slate-900 mb-10 leading-[1.1] tracking-tight">
                    {selectedStatus.title}
                  </h2>
                  <div className="bg-slate-50 rounded-3xl p-8 space-y-4">
                    <div className="flex items-center gap-4 text-[18px] text-slate-700 font-bold">
                      <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-brand-lime">
                        <MapPin size={22} />
                      </div>
                      <span className="text-slate-400 font-black mr-2">매입 위치</span> {selectedStatus.location}
                    </div>
                  </div>
                  <div className="mt-12 flex justify-center">
                    <button onClick={() => setSelectedStatus(null)} className="px-12 py-4 bg-slate-900 text-white rounded-[20px] font-black shadow-lg hover:bg-brand-green transition-all">확인했습니다</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
