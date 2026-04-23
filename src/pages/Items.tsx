import { motion, AnimatePresence } from "motion/react";
import { Package, CheckCircle2, Plus, Trash2, Edit2, Save, X, ChevronLeft, ChevronRight, Image as ImageIcon, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, addDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, handleFirestoreError, OperationType } from "../firebase";
import { useAuth } from "../context/AuthContext";

interface ItemPost {
  id: string;
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
  createdAt: any;
  authorUid: string;
}

const ITEMS_PER_PAGE = 9;

export default function Items() {
  const { isAdmin, user } = useAuth();
  const [items, setItems] = useState<ItemPost[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "구리 / 동", imageUrl: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ItemPost>>({});
  const [selectedItem, setSelectedItem] = useState<ItemPost | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "items"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ItemPost[];
      setItems(itemData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "items");
    });

    return () => unsubscribe();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `items/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      if (isEdit) {
        setEditForm({ ...editForm, imageUrl: url });
      } else {
        setNewPost({ ...newPost, imageUrl: url });
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!user || !newPost.title) return;
    try {
      await addDoc(collection(db, "items"), {
        ...newPost,
        authorUid: user.uid,
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      setNewPost({ title: "", content: "", category: "구리 / 동", imageUrl: "" });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "items");
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteDoc(doc(db, "items", id));
      if (selectedItem?.id === id) setSelectedItem(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `items/${id}`);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateDoc(doc(db, "items", id), {
        ...editForm
      });
      setEditingId(null);
      if (selectedItem?.id === id) {
        setSelectedItem({ ...selectedItem, ...editForm } as ItemPost);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `items/${id}`);
    }
  };

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const paginatedItems = items.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <main className="container max-w-[1200px] mx-auto px-5 py-12 md:py-20">
      <motion.div {...fadeIn}>
        <div className="section-indicator">매입품목</div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-[32px] md:text-[40px] font-black text-slate-900 mb-2 tracking-tight">취급 품목 안내</h1>
            <p className="text-slate-500 font-medium">태리자원에서 매입하는 주요 품목 게시판입니다.</p>
          </div>
          {isAdmin && (
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-brand-green text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-brand-green/20 hover:scale-105 transition-transform flex items-center gap-2 text-[15px]"
            >
              <Plus size={20} /> 새 품목 등록
            </button>
          )}
        </div>

        {isAdding && (
          <div className="professional-card p-10 mb-16 border-none bg-green-50 shadow-xl shadow-green-900/5">
            <h3 className="text-[22px] font-black text-brand-green mb-8 tracking-tight">새 매입 품목 등록</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-slate-400 ml-1">품목 제목</label>
                  <input 
                    placeholder="예: 구리 매입 안내"
                    className="w-full p-4 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-lime bg-white font-bold"
                    value={newPost.title}
                    onChange={e => setNewPost({...newPost, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-slate-400 ml-1">카테고리 선택</label>
                  <select 
                    className="w-full p-4 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-lime bg-white font-bold appearance-none"
                    value={newPost.category}
                    onChange={e => setNewPost({...newPost, category: e.target.value})}
                  >
                    <option>구리 / 동</option>
                    <option>알루미늄</option>
                    <option>스테인리스 / 특수금속</option>
                    <option>고철 / 비철</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-400 ml-1">상세 설명</label>
                <textarea 
                  placeholder="품목에 대한 자세한 사양과 매입 조건을 입력해주세요."
                  className="w-full p-4 border border-slate-200 rounded-2xl h-40 focus:outline-none focus:ring-2 focus:ring-brand-lime bg-white font-medium"
                  value={newPost.content}
                  onChange={e => setNewPost({...newPost, content: e.target.value})}
                />
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100">
                <label className="text-[14px] font-bold text-slate-600 mb-3 block">이미지 첨부</label>
                <div className="flex items-center gap-6">
                  <label className="cursor-pointer bg-slate-50 border border-slate-200 px-6 py-3 rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2 text-[14px] font-bold text-slate-600">
                    <ImageIcon size={20} className="text-brand-lime" /> 이미지 파일 선택
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </label>
                  {isUploading && <Loader2 className="animate-spin text-brand-lime" size={24} />}
                  {newPost.imageUrl && <span className="text-[14px] text-brand-green font-bold flex items-center gap-1"><CheckCircle2 size={16} /> 업로드 완료</span>}
                </div>
                {newPost.imageUrl && (
                  <div className="mt-4 relative w-32 h-32 rounded-2xl overflow-hidden border border-slate-200">
                    <img src={newPost.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                )}
              </div>
              <div className="flex gap-4 justify-end pt-4">
                <button onClick={() => setIsAdding(false)} className="px-8 py-3 text-slate-400 font-bold hover:text-slate-600">취소하기</button>
                <button onClick={handleCreate} disabled={isUploading || !newPost.title} className="px-10 py-3 bg-brand-green text-white rounded-2xl font-black shadow-lg shadow-brand-green/20 disabled:opacity-30 hover:scale-105 transition-transform">품목 등록 완료</button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedItems.map((item) => (
            <div 
              key={item.id} 
              onClick={() => setSelectedItem(item)}
              className="group bg-white rounded-[40px] overflow-hidden cursor-pointer shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-all duration-300 flex flex-col border border-slate-100"
            >
              <div className="relative h-64 bg-slate-50 overflow-hidden">
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <Package size={80} strokeWidth={1} />
                  </div>
                )}
                <div className="absolute top-6 left-6">
                  <span className="bg-white/95 backdrop-blur-md text-brand-green text-[12px] font-black px-3 py-1.5 rounded-full shadow-lg">
                    {item.category}
                  </span>
                </div>
                {isAdmin && (
                  <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setEditingId(item.id); 
                        setEditForm(item); 
                      }} 
                      className="w-10 h-10 bg-white/90 backdrop-blur-md text-brand-blue rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, item.id)} 
                      className="w-10 h-10 bg-white/90 backdrop-blur-md text-red-500 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              <div className="p-8 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-[20px] font-black text-slate-900 mb-3 tracking-tight group-hover:text-brand-green transition-colors">{item.title}</h3>
                  <p className="text-slate-500 text-[15px] font-medium line-clamp-2 leading-relaxed mb-6">{item.content}</p>
                </div>
                <div className="flex items-center text-brand-lime font-bold text-[13px] gap-1 group-hover:gap-2 transition-all">
                  자세히 보기 <ChevronRight size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && !isAdding && (
          <div className="text-center py-32 rounded-[40px] bg-slate-50/50 border-2 border-dashed border-slate-100">
            <Package size={64} className="mx-auto mb-6 text-slate-200" strokeWidth={1} />
            <p className="text-slate-400 font-bold">등록된 매입 품목이 없습니다.</p>
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
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-[900px] bg-white rounded-[48px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="absolute top-8 right-8 z-20">
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-slate-500 hover:text-brand-green transition-all shadow-xl hover:rotate-90 duration-300"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="overflow-y-auto overflow-x-hidden">
                {selectedItem.imageUrl && (
                  <div className="w-full h-[500px] relative">
                    <img 
                      src={selectedItem.imageUrl} 
                      alt={selectedItem.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                )}
                <div className="p-10 md:p-16">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="bg-brand-green/10 text-brand-green text-[13px] font-black px-4 py-1.5 rounded-full">
                      {selectedItem.category}
                    </span>
                    <div className="h-px w-10 bg-brand-lime" />
                    <span className="text-slate-300 text-[13px] font-bold">태리자원 매입 정보</span>
                  </div>
                  <h2 className="text-[32px] md:text-[44px] font-black text-slate-900 mb-10 leading-[1.1] tracking-tight">
                    {selectedItem.title}
                  </h2>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-slate-600 text-[18px] font-medium leading-[1.7] whitespace-pre-wrap">
                      {selectedItem.content}
                    </p>
                  </div>
                  <div className="mt-16 pt-10 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-slate-400 font-bold text-[14px]">관련 문의: 055-123-4567 / 010-5555-2620</p>
                    <button onClick={() => setSelectedItem(null)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-brand-green transition-colors">목록으로 돌아가기</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-5">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-[650px] bg-white rounded-[40px] shadow-2xl p-10 overflow-hidden"
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-[24px] font-black text-slate-900 tracking-tight">매입 품목 정보 수정</h3>
                <button onClick={() => setEditingId(null)} className="text-slate-300 hover:text-slate-600"><X size={24} /></button>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-slate-400 ml-1">품목 제목</label>
                  <input 
                    className="w-full p-4 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-brand-lime outline-none"
                    value={editForm.title}
                    onChange={e => setEditForm({...editForm, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-slate-400 ml-1">상세 설명</label>
                  <textarea 
                    className="w-full p-4 border border-slate-200 rounded-2xl h-48 font-medium focus:ring-2 focus:ring-brand-lime outline-none"
                    value={editForm.content}
                    onChange={e => setEditForm({...editForm, content: e.target.value})}
                  />
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl">
                  <label className="text-[14px] font-bold text-slate-600 mb-3 block">대표 이미지</label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer bg-white border border-slate-200 px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 text-[14px] font-bold shadow-sm">
                      <ImageIcon size={18} className="text-brand-lime" /> 이미지 교체
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, true)} />
                    </label>
                    {isUploading && <Loader2 className="animate-spin text-brand-lime" size={20} />}
                  </div>
                  {editForm.imageUrl && (
                    <div className="mt-4 w-28 h-28 rounded-2xl overflow-hidden border border-slate-100 shadow-inner">
                      <img src={editForm.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-3 mt-8">
                  <button onClick={() => setEditingId(null)} className="px-8 py-3 text-slate-400 font-bold">닫기</button>
                  <button onClick={() => handleUpdate(editingId)} disabled={isUploading} className="px-10 py-3 bg-brand-green text-white rounded-2xl font-black shadow-lg shadow-brand-green/20">정보 수정 완료</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

