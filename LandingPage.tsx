
import React from 'react';
import { AppState } from '../types';

interface LandingPageProps {
  state: AppState;
  onStartClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ state, onStartClick }) => {
  const { siteConfig, comments } = state;

  return (
    <div className="flex flex-col overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center text-center px-6 py-10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-yellow-500/10 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900/80 border border-yellow-500/30 text-yellow-500 text-[10px] font-black mb-8 tracking-[0.4em] uppercase shadow-2xl backdrop-blur-3xl">
             <i className="fas fa-crown"></i> Official Imperial Gateway
          </div>
          <h1 className="text-5xl md:text-8xl font-black mb-8 bg-gradient-to-b from-white via-yellow-500 to-yellow-900 bg-clip-text text-transparent leading-[1.1] tracking-tighter italic drop-shadow-2xl">
            {siteConfig.heroHeadline}
          </h1>
          <p className="text-sm md:text-xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-bold italic uppercase tracking-widest px-4 opacity-80">
            {siteConfig.heroTagline}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 px-4">
            <button onClick={onStartClick} className="w-full sm:w-auto px-16 py-7 royal-btn text-lg tracking-[0.2em] shadow-[0_20px_40px_rgba(184,134,11,0.3)]">{siteConfig.ctaText}</button>
            <a href={`https://wa.me/${siteConfig.whatsappNumber}`} className="w-full sm:w-auto px-16 py-7 bg-slate-900/80 border-2 border-slate-800 text-white font-black text-lg rounded-[2rem] hover:bg-slate-900 transition-all uppercase tracking-[0.3em] backdrop-blur-3xl shadow-2xl active:translate-y-1">সাপোর্ট নিন</a>
          </div>
        </div>
      </section>

      {/* Trust & Payout Statistics Section */}
      <section className="py-20 px-6 bg-slate-950/50 backdrop-blur-md border-y border-yellow-500/10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
           {[
             { label: 'সক্রিয় সদস্য', val: '৪৫,০০০+', icon: 'fa-users' },
             { label: 'মোট পেমেন্ট আউট', val: '৳৫০ লক্ষ+', icon: 'fa-money-bill-trend-up' },
             { label: 'দেশব্যাপী কভারেজ', val: '৬৪ জেলা', icon: 'fa-map-location-dot' },
             { label: 'সাপোর্ট রেটিং', val: '৪.৯/৫.০', icon: 'fa-star' },
           ].map((stat, i) => (
             <div key={i} className="text-center group">
               <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-yellow-500/20 group-hover:scale-110 transition-transform shadow-inner">
                 <i className={`fas ${stat.icon} text-2xl gold-text`}></i>
               </div>
               <p className="text-2xl md:text-4xl font-black text-white italic tracking-tighter mb-1">{stat.val}</p>
               <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{stat.label}</p>
             </div>
           ))}
        </div>
      </section>

      {/* Payout Certificates / Proof Section */}
      <section className="py-24 px-6 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black gold-text uppercase italic tracking-tighter mb-4">পেমেন্ট প্রুফ</h2>
            <p className="text-slate-500 text-[10px] md:text-lg font-bold uppercase tracking-[0.4em] italic opacity-60">আমাদের সদস্যদের সফল উত্তোলনের কিছু নমুনা</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'আরিফুল ইসলাম', amount: '৫,৫০০', date: '১২ মার্চ ২০২৪', method: 'bKash' },
              { name: 'মমতা বেগম', amount: '১২,০০০', date: '১৫ মার্চ ২০২৪', method: 'Nagad' },
              { name: 'রাকিব হোসেন', amount: '৩,২০০', date: '১৮ মার্চ ২০২৪', method: 'bKash' },
            ].map((cert, i) => (
              <div key={i} className="premium-card p-10 bg-gradient-to-br from-slate-900 to-black border-yellow-500/30 relative overflow-hidden group hover:border-yellow-500 transition-all shadow-2xl">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity"><i className="fas fa-empire text-9xl gold-text"></i></div>
                <div className="relative z-10 text-center">
                  <div className="inline-block px-4 py-1 bg-green-500 text-black rounded-lg text-[10px] font-black uppercase mb-6 shadow-xl">SUCCESSFUL PAYOUT</div>
                  <h4 className="text-3xl font-black gold-text italic mb-2 tracking-tighter">৳{cert.amount}</h4>
                  <p className="text-sm font-black text-white uppercase tracking-widest mb-6">{cert.name}</p>
                  <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest border-t border-slate-800 pt-6">
                    <p>Method: <span className="text-yellow-500">{cert.method}</span></p>
                    <p>{cert.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Reviews / Comments */}
      <section className="py-24 px-6 bg-slate-900/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black gold-text uppercase italic tracking-tighter mb-4">নাগরিক মতামত</h2>
            <div className="w-24 h-1.5 bg-yellow-500 mx-auto rounded-full shadow-lg"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(comments.length > 0 ? comments.slice(0, 6) : [
              { username: 'হাসান মিয়া', text: 'খুবই চমৎকার সাইট! ৫ মিনিটেই পেমেন্ট পেয়েছি। অনেক ধন্যবাদ ডিজিটাল এম্পায়ার!', rating: 5 },
              { username: 'সাদিয়া সুলতানা', text: 'অন্যান্য সাইটের তুলনায় এদের সাপোর্ট অনেক ফাস্ট এবং প্যাকেজগুলো অনেক লাভজনক।', rating: 5 },
              { username: 'কবির আহমেদ', text: 'পেমেন্ট নিয়ে কখনও টেনশন করতে হয় না। যারা ইনভেস্ট করতে চান তারা নিঃসন্দেহে যোগ দিতে পারেন।', rating: 5 },
            ]).map((c, i) => (
              <div key={i} className="premium-card p-10 relative bg-slate-950/80 group">
                <i className="fas fa-quote-left absolute top-8 left-8 text-yellow-500/10 text-5xl group-hover:text-yellow-500/20 transition-all"></i>
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center font-black text-yellow-500 text-xl uppercase shadow-inner rotate-6 group-hover:rotate-0 transition-transform">
                    {(c as any).username?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="text-white font-black text-sm uppercase italic tracking-tighter">{(c as any).username}</h4>
                    <div className="flex text-yellow-500 text-[10px] mt-1 gap-0.5">
                      {[...Array(5)].map((_, i) => <i key={i} className={`fas fa-star ${i < (c.rating || 5) ? 'opacity-100' : 'opacity-20'}`}></i>)}
                    </div>
                  </div>
                </div>
                <p className="text-slate-400 text-[13px] italic leading-relaxed relative z-10 font-bold opacity-80">"{(c as any).text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer / Contact */}
      <footer className="py-24 px-6 border-t border-yellow-500/10 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16">
          <div className="text-center md:text-left flex-1">
            <h3 className="text-4xl font-black gold-text italic uppercase mb-4 font-brand tracking-tighter">Digital Empire</h3>
            <p className="text-slate-500 text-xs font-black uppercase tracking-[0.4em] mb-10 italic">The Ultimate Digital Sovereign Network</p>
            <div className="space-y-6">
              <a href={`mailto:${siteConfig.supportEmail}`} className="flex items-center justify-center md:justify-start gap-5 text-slate-400 hover:text-white transition-all group">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-xl gold-text group-hover:scale-110 transition-transform shadow-xl"><i className="fas fa-envelope"></i></div>
                <span className="font-bold text-lg italic tracking-widest">{siteConfig.supportEmail}</span>
              </a>
              <a href={`https://wa.me/${siteConfig.whatsappNumber}`} target="_blank" className="flex items-center justify-center md:justify-start gap-5 text-slate-400 hover:text-white transition-all group">
                <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-2xl text-green-500 group-hover:scale-110 transition-transform shadow-xl"><i className="fab fa-whatsapp"></i></div>
                <span className="font-bold text-lg italic tracking-widest">+{siteConfig.whatsappNumber}</span>
              </a>
            </div>
          </div>
          <div className="premium-card p-12 text-center max-w-md w-full border-yellow-500/40 shadow-[0_0_100px_rgba(255,215,0,0.05)] scale-105">
             <h4 className="text-2xl font-black text-white italic uppercase mb-8 tracking-tighter">আজই আপনার যাত্রা শুরু করুন</h4>
             <button onClick={onStartClick} className="w-full royal-btn py-6 text-sm tracking-[0.5em] shadow-[0_20px_40px_rgba(0,0,0,0.5)]">Join Empire</button>
             <div className="mt-10 pt-8 border-t border-slate-900">
               <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.3em] italic">&copy; 2024 DIGITAL EMPIRE OFFICIAL. ALL RIGHTS RESERVED.</p>
               <div className="flex justify-center gap-6 mt-6 opacity-30 grayscale hover:grayscale-0 transition-all">
                 <i className="fab fa-cc-visa text-2xl"></i>
                 <i className="fab fa-cc-mastercard text-2xl"></i>
                 <i className="fas fa-shield-halved text-2xl"></i>
               </div>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
