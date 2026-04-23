import { motion } from "motion/react";
import { TrendingUp, AlertCircle, Edit2, Save, X, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, addDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { useAuth } from "../context/AuthContext";

interface PriceItem {
  id: string;
  name: string;
  unit: string;
  price: string;
  category: "비철스크랩" | "합금 / 특수금속" | "고철 / 기타 스크랩";
  trend: "up" | "down" | "stable";
  order: number;
}

const CATEGORIES = ["비철스크랩", "합금 / 특수금속", "고철 / 기타 스크랩"] as const;

export default function PriceInfo() {
  const { isAdmin } = useAuth();
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PriceItem>>({});
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "prices"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const priceData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PriceItem[];
      setPrices(priceData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "prices");
    });

    return () => unsubscribe();
  }, []);

  const handleEdit = (item: PriceItem) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const handleSave = async (id: string) => {
    try {
      const docRef = doc(db, "prices", id);
      await updateDoc(docRef, {
        ...editForm,
        updatedAt: serverTimestamp()
      });
      setEditingId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `prices/${id}`);
    }
  };

  const handleAdd = async (category: typeof CATEGORIES[number]) => {
    try {
      await addDoc(collection(db, "prices"), {
        name: "새 품목",
        unit: "1kg",
        price: "0원",
        category: category,
        trend: "stable",
        order: prices.length > 0 ? Math.max(...prices.map(p => p.order)) + 1 : 0,
        updatedAt: serverTimestamp()
      });
      setIsAdding(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "prices");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteDoc(doc(db, "prices", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `prices/${id}`);
    }
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const groupedPrices = CATEGORIES.reduce((acc, category) => {
    acc[category] = prices.filter(p => p.category === category);
    return acc;
  }, {} as Record<string, PriceItem[]>);

  return (
    <main className="container max-w-[1200px] mx-auto px-5 py-12 md:py-20">
      <motion.div {...fadeIn}>
        <div className="section-indicator">시세정보</div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h1 className="text-[32px] md:text-[40px] font-black text-slate-900 mb-2 tracking-tight">오늘의 매입 시세</h1>
            <p className="text-slate-500 font-medium">실시간 시장 상황을 반영한 품목별 매입 단가입니다.</p>
          </div>
          <div className="bg-brand-lime/10 px-4 py-2 rounded-full text-xs font-bold text-brand-lime flex items-center gap-2">
            <TrendingUp size={14} />
            실시간 시세 반영 중
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {CATEGORIES.map((category, idx) => (
            <div key={category} className="flex flex-col">
              <div className={`p-5 rounded-t-[32px] text-center font-black text-white shadow-lg tracking-tight text-[18px] ${
                idx === 0 ? "bg-brand-green" : idx === 1 ? "bg-slate-800" : "bg-brand-lime"
              }`}>
                {category}
              </div>
              <div className="professional-card rounded-t-none overflow-hidden border-t-0 flex-grow shadow-xl shadow-slate-200/40">
                <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-slate-50">
                    {groupedPrices[category]?.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="p-5">
                          {editingId === item.id ? (
                            <input 
                              className="border border-slate-200 rounded-xl px-3 py-2 w-full font-bold text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime"
                              value={editForm.name}
                              onChange={e => setEditForm({...editForm, name: e.target.value})}
                            />
                          ) : (
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 text-[16px] tracking-tight">{item.name}</span>
                              {isAdmin && (
                                <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => handleEdit(item)} className="text-brand-blue hover:scale-110 transition-transform"><Edit2 size={14} /></button>
                                  <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:scale-110 transition-transform"><Trash2 size={14} /></button>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-5 text-right">
                          {editingId === item.id ? (
                            <div className="flex flex-col gap-2">
                              <input 
                                className="border border-slate-200 rounded-xl px-3 py-2 w-full text-right font-black text-brand-green text-[16px] focus:outline-none focus:ring-2 focus:ring-brand-lime"
                                value={editForm.price}
                                onChange={e => setEditForm({...editForm, price: e.target.value})}
                              />
                              <div className="flex justify-end gap-3 mt-1">
                                <button onClick={() => handleSave(item.id)} className="bg-brand-green text-white p-2 rounded-lg shadow-md"><Save size={16} /></button>
                                <button onClick={() => setEditingId(null)} className="bg-slate-100 text-slate-500 p-2 rounded-lg"><X size={16} /></button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-end">
                              <span className="font-black text-slate-900 text-[18px] text-brand-green">{item.price}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[11px] text-slate-400 font-bold">{item.unit}</span>
                                {item.trend === "up" && <span className="text-red-500 text-[11px] font-bold bg-red-50 px-1.5 py-0.5 rounded">▲</span>}
                                {item.trend === "down" && <span className="text-brand-blue text-[11px] font-bold bg-blue-50 px-1.5 py-0.5 rounded">▼</span>}
                                {item.trend === "stable" && <span className="text-slate-300 text-[11px] font-bold bg-slate-50 px-1.5 py-0.5 rounded">-</span>}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {isAdmin && (
                      <tr>
                        <td colSpan={2} className="p-5 leading-none">
                          <button 
                            onClick={() => handleAdd(category)}
                            className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 hover:border-brand-lime hover:text-brand-lime hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-[14px] font-bold"
                          >
                            <Plus size={18} /> 새 품목 추가
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-amber-50/50 border border-amber-100 p-8 rounded-[32px] flex items-start gap-5 shadow-sm">
          <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-500 shrink-0">
            <AlertCircle size={22} />
          </div>
          <div className="text-[15px] text-amber-900 leading-relaxed">
            <p className="font-black mb-2 text-[17px]">시세 이용 및 거래 안내</p>
            <ul className="space-y-1.5 text-amber-800/80 font-medium">
              <li className="flex items-center gap-2"><span className="w-1 h-1 bg-amber-400 rounded-full" /> 위 시세는 시장 상황에 따라 실시간으로 변동될 수 있습니다.</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 bg-amber-400 rounded-full" /> 대량 매입이나 정기 거래의 경우 별도의 우대 단가를 적용해 드립니다.</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 bg-amber-400 rounded-full" /> 정확한 견적은 현장 확인 또는 사진 전송을 통해 안내받으실 수 있습니다.</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
