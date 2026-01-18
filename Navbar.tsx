
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, SiteConfig } from '../types';

interface NavbarProps {
  currentUser: User | null;
  logout: () => void;
  siteConfig: SiteConfig;
  onLogin: (email: string, pass: string) => Promise<{ success: boolean, message?: string }>;
  onRegister: (data: Partial<User>) => Promise<{ success: boolean, message?: string }>;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentUser, logout, siteConfig, onLogin, onRegister, isModalOpen, setIsModalOpen }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', phoneNumber: '', referCode: '' });
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = isRegisterMode ? await onRegister(formData) : await onLogin(formData.email, formData.password);
      if (result.success) { setIsModalOpen(false); navigate('/dashboard'); } else { alert(result.message); }
    } catch (err) { alert("একটি ত্রুটি হয়েছে।"); } finally { setIsLoading(false); }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-slate-950/98 backdrop-blur-3xl border-b border-yellow-500/20 px-4 md:px-12 py-3 flex justify-between items-center shadow-2xl">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 md:w-12 md:h-12">
             <div className="absolute inset-0 bg-gradient-to-tr from-yellow-600 to-yellow-200 rounded-xl rotate-45 group-hover:rotate-[225deg] transition-transform duration-700 shadow-[0_0_20px_rgba(255,215,0,0.5)]"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-star text-slate-950 text-xl md:text-2xl animate-pulse"></i>
             </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-black gold-text tracking-tighter italic uppercase leading-none font-brand">Digital Empire</span>
            <span className="text-[7px] text-slate-500 font-black uppercase tracking-[0.4em] mt-0.5 italic">Royal Sovereignty</span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <Link to="/dashboard" className="hidden md:flex items-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 px-4 py-2 rounded-lg border border-yellow-500/30 transition-all font-black uppercase text-[9px] gold-text">
                <i className="fas fa-house-user"></i> ড্যাশবোর্ড
              </Link>
              <button onClick={() => { logout(); navigate('/'); }} className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-4 py-2 rounded-lg border border-red-500/20 transition-all text-[9px] font-black uppercase active:scale-95">Logout</button>
            </div>
          ) : (
            <button onClick={() => { setIsRegisterMode(false); setIsModalOpen(true); }} className="royal-btn px-6 py-2.5 text-[9px]">Login</button>
          )}
        </div>
      </nav>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 backdrop-blur-3xl p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border-2 border-yellow-500/20 p-8 rounded-[3rem] w-full max-w-xl shadow-2xl my-8 relative animate-zoomIn">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-700 hover:text-white transition-all text-4xl"><i className="fas fa-times-circle"></i></button>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-yellow-500/20">
                <i className={`fas ${isRegisterMode ? 'fa-crown' : 'fa-star'} text-2xl gold-text`}></i>
              </div>
              <h2 className="text-3xl font-black gold-text uppercase italic tracking-tighter">{isRegisterMode ? 'Register' : 'Login'}</h2>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {isRegisterMode && (
                <>
                  <input name="username" type="text" required placeholder="নাম" className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl px-5 py-4 focus:border-yellow-500 outline-none text-white text-base shadow-inner font-bold" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                  <input name="phoneNumber" type="tel" required placeholder="ফোন নাম্বার" className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl px-5 py-4 focus:border-yellow-500 outline-none text-white text-base shadow-inner font-bold" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
                </>
              )}
              <input name="email" type="email" required placeholder="ইমেইল" className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl px-5 py-4 focus:border-yellow-500 outline-none text-white text-base shadow-inner font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input name="password" type="password" required placeholder="পাসওয়ার্ড" className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl px-5 py-4 focus:border-yellow-500 outline-none text-white text-base shadow-inner font-bold" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              
              <button type="submit" disabled={isLoading} className="w-full royal-btn py-5 text-[10px] tracking-[0.3em]">
                {isLoading ? <i className="fas fa-spinner animate-spin text-xl"></i> : (isRegisterMode ? 'Register' : 'Login')}
              </button>
            </form>

            <button onClick={() => setIsRegisterMode(!isRegisterMode)} className="w-full mt-8 text-[9px] font-black text-yellow-500/60 hover:text-yellow-500 tracking-widest uppercase italic transition-all">{isRegisterMode ? 'Already have an account? Login' : "Don't have an account? Register"}</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
