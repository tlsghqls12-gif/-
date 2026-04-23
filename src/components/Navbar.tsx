import { Link } from "react-router-dom";
import { Globe, LogIn, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const PHONE_NUMBER = "010-5555-2620";

export default function Navbar() {
  const { user, isAdmin, login, logout } = useAuth();

  return (
    <header className="w-full relative z-50">
      {/* Top Utility Bar */}
      <div className="bg-slate-50 border-b border-slate-100 py-2 hidden sm:block">
        <div className="container max-w-[1200px] mx-auto px-5 flex justify-end items-center text-[13px] text-slate-500 font-medium tracking-tight">
          <div className="flex items-center gap-4">
            {user ? (
              <button onClick={logout} className="flex items-center gap-1.5 hover:text-brand-green">
                <LogOut size={14} /> 로그아웃
              </button>
            ) : (
              <button onClick={login} className="flex items-center gap-1.5 hover:text-brand-green">
                <LogIn size={14} /> 로그인
              </button>
            )}
            <div className="flex items-center gap-1.5 cursor-pointer hover:text-brand-green uppercase">
              <Globe size={14} /> KOR
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 shadow-sm">
        <div className="container max-w-[1200px] mx-auto px-5 h-[80px] flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[20px] font-black text-brand-green tracking-tighter leading-none">TAERI RESOURCES</span>
              <span className="text-[13px] font-bold text-brand-lime tracking-tight">태리자원</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center space-x-10 text-[17px] font-bold text-slate-700">
            <Link to="/about" className="hover:text-brand-green transition-colors relative group py-2">
              회사소개
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-lime transition-all group-hover:w-full" />
            </Link>
            <Link to="/price" className="hover:text-brand-green transition-colors relative group py-2">
              시세정보
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-lime transition-all group-hover:w-full" />
            </Link>
            <Link to="/items" className="hover:text-brand-green transition-colors relative group py-2">
              매입품목
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-lime transition-all group-hover:w-full" />
            </Link>
            <Link to="/status" className="hover:text-brand-green transition-colors relative group py-2">
              매입현황
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-lime transition-all group-hover:w-full" />
            </Link>
            <Link to="/contact" className="hover:text-brand-green transition-colors relative group py-2">
              문의하기
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-lime transition-all group-hover:w-full" />
            </Link>
          </div>

          <div className="flex items-center gap-5">
            {isAdmin && (
              <Link 
                to="/admin" 
                className="hidden sm:block text-[11px] bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-bold hover:bg-amber-200 transition-colors"
              >
                ADMIN
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
