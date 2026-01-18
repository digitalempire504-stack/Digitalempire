
import React, { useState } from 'react';
import { User, Package, Transaction, TransactionType, TransactionStatus, SiteConfig } from '../types';

interface UserDashboardProps {
  user: User;
  packages: Package[];
  siteConfig: SiteConfig;
  transactions: Transaction[];
  onRequestTx: (amount: number, type: TransactionType, method: string, accountNumber: string) => void;
  onCompleteTask: () => void;
  onBuyPackage: (packageId: string) => void;
  onAddComment: (text: string, rating: number) => void;
  onSwitchToAdmin?: () => void;
}

const REAL_APPS = [
  { name: 'Imperial Ads Tester', icon: 'fa-facebook', color: 'bg-blue-600', img: 'https://cdn-icons-png.flaticon.com/512/124/124010.png' },
  { name: 'Sovereign Optimizer', icon: 'fa-whatsapp', color: 'bg-green-500', img: 'https://cdn-icons-png.flaticon.com/512/124/124034.png' },
  { name: 'Empire Creator Hub', icon: 'fa-tiktok', color: 'bg-slate-900', img: 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png' },
  { name: 'King Payout Watcher', icon: 'fa-youtube', color: 'bg-red-600', img: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png' },
  { name: 'Royal Majesty Hub', icon: 'fa-instagram', color: 'bg-gradient-to-tr from-yellow-400 to-purple-600', img: 'https://cdn-icons-png.flaticon.com/512/174/174855.png' },
];

const UserDashboard: React.FC<UserDashboardProps> = ({ user, packages, siteConfig, transactions, onRequestTx, onCompleteTask, onBuyPackage, onAddComment, onSwitchToAdmin }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'tasks' | 'packages' | 'history' | 'profile'>('home');
  const [showTxModal, setShowTxModal] = useState<'deposit' | 'withdraw' | null>(null);
  const [isTaskRunning, setIsTaskRunning] = useState(false);
  const [showTaskSuccess, setShowTaskSuccess] = useState(false);
  const [taskProgress, setTaskProgress] = useState(0);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bKash');
  const [account, setAccount] = useState('');

  const userPkg = packages.find(p => p.id === user.activePackageId);
  const today = new Date().toLocaleDateString();
  const tasksCompletedToday = user.lastTaskDate === today ? (user.tasksCompletedToday || 0) : 0;
  const tasksRemaining = userPkg ? Math.max(0, userPkg.dailyTasks - tasksCompletedToday) : 0;

  const currentTaskIndex = tasksCompletedToday % REAL_APPS.length;
  const currentTaskApp = REAL_APPS[currentTaskIndex];

  const startTask = (app: any) => {
    if (tasksRemaining <= 0) return alert('আজকের লিমিট শেষ!');
    setIsTaskRunning(true); 
    setTaskProgress(0);
    const interval = setInterval(() => {
      setTaskProgress(prev => {
        if (prev >= 100) { 
          clearInterval(interval); 
          setIsTaskRunning(false); 
          onCompleteTask(); 
          setShowTaskSuccess(true);
          return 100; 
        }
        return prev + 1; 
      });
    }, 50);
  };

  const StatBox = ({ label, val, color }: any) => (
    <div className="bg-slate-900 border-2 border-slate-800 p-4 rounded-2xl text-center shadow-xl transform transition-transform hover:scale-105">
      <p className="text-[10px] uppercase font-black text-slate-500 mb-1 tracking-widest">{label}</p>
      <p className={`text-xl font-black italic ${color}`}>{val}</p>
    </div>
  );

  const BackButton = () => (
    <button onClick={() => setActiveTab('home')} className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800 shadow-lg active:scale-95">
      <i className="fas fa-arrow-left"></i> ড্যাশবোর্ডে ফিরে যান
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 pb-24">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 animate-fadeIn">
        <StatBox label="বর্তমান ব্যালেন্স" val={`৳${user.balance.toLocaleString()}`} color="text-yellow-500" />
        <StatBox label="মোট উত্তোলন" val={`৳${(user.totalWithdrawn || 0).toLocaleString()}`} color="text-green-500" />
        <StatBox label="বাকি কাজ" val={tasksRemaining} color="text-blue-500" />
        <StatBox label="রেফার ইনকাম" val={`৳${(user.referEarnings || 0).toLocaleString()}`} color="text-purple-500" />
      </div>

      {activeTab === 'home' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="premium-card p-8 bg-gradient-to-br from-slate-900 via-slate-950 to-black border-yellow-500/30 shadow-[0_0_50px_rgba(255,215,0,0.1)] relative overflow-hidden">
            <p className="text-xs font-black uppercase text-slate-500 tracking-[0.3em] italic mb-2">Royal Imperial Wallet</p>
            <h1 className="text-6xl md:text-8xl font-black gold-text italic tracking-tighter drop-shadow-2xl">৳{user.balance.toLocaleString()}</h1>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <button onClick={() => setShowTxModal('deposit')} className="royal-btn py-5 text-sm tracking-[0.2em] shadow-xl">ডিপোজিট করুন</button>
              <button onClick={() => setShowTxModal('withdraw')} className="bg-white/5 border-2 border-white/10 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-white/10 transition-all shadow-xl">উইথড্র করুন</button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[
              { id: 'tasks', icon: 'fa-bolt-lightning', label: 'ডেইলি টাস্ক', color: 'text-blue-500' },
              { id: 'packages', icon: 'fa-crown', label: 'প্যাকেজসমূহ', color: 'text-yellow-500' },
              { id: 'history', icon: 'fa-receipt', label: 'স্টেটমেন্ট', color: 'text-green-500' },
              { id: 'profile', icon: 'fa-user-gear', label: 'প্রোফাইল', color: 'text-purple-500' },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id as any)} className="bg-slate-900 border-2 border-slate-800 p-6 rounded-[2rem] flex flex-col items-center gap-3 hover:border-yellow-500/40 transition-all group active:scale-95 shadow-xl">
                <i className={`fas ${t.icon} text-3xl ${t.color} group-hover:scale-125 transition-transform`}></i>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">{t.label}</span>
              </button>
            ))}
          </div>

          {onSwitchToAdmin && (
            <button onClick={onSwitchToAdmin} className="w-full bg-red-600/10 border-2 border-red-600/20 text-red-500 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-xl hover:bg-red-600/20 transition-all"><i className="fas fa-unlock-keyhole mr-2"></i> ADMIN HUB ACCESS</button>
          )}

          <div className="bg-slate-900/80 border-2 border-yellow-500/20 p-4 rounded-2xl flex items-center gap-4 shadow-xl">
             <i className="fas fa-bullhorn text-yellow-500 text-xl flex-shrink-0 animate-bounce"></i>
             <p className="text-xs font-bold text-slate-300 italic">"{siteConfig.announcement}"</p>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-4 animate-fadeIn">
          <BackButton />
          {tasksRemaining > 0 ? (
            <div className="bg-slate-900 p-10 rounded-[3rem] border-2 border-slate-800 flex flex-col items-center gap-8 shadow-2xl relative overflow-hidden">
              <div className={`relative w-32 h-32 ${currentTaskApp.color} rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl transition-all duration-500 ${isTaskRunning ? 'scale-110' : ''}`}>
                <img src={currentTaskApp.img} alt={currentTaskApp.name} className="w-20 h-20 object-contain drop-shadow-xl" />
                {isTaskRunning && <div className="absolute inset-0 rounded-[2.5rem] border-4 border-yellow-500 border-t-transparent animate-spin"></div>}
              </div>
              <div className="text-center w-full">
                {isTaskRunning ? (
                  <div className="space-y-6">
                    <p className="text-6xl font-black text-white italic mb-2 tracking-tighter">{taskProgress}%</p>
                    <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden border-2 border-slate-800 shadow-inner">
                      <div className="h-full royal-btn transition-all duration-100 ease-linear" style={{ width: `${taskProgress}%` }}></div>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-3xl font-black text-white uppercase italic mb-4 tracking-tighter">{currentTaskApp.name}</h3>
                    <div className="bg-yellow-500/10 border-2 border-yellow-500/20 px-8 py-4 rounded-2xl inline-flex items-center gap-3 text-yellow-500 font-black text-xl mb-6 shadow-inner">
                      <i className="fas fa-coins text-2xl"></i> +৳{userPkg?.earningsPerTask || 0}
                    </div>
                    <button onClick={() => startTask(currentTaskApp)} className="w-full royal-btn py-6 text-lg tracking-[0.3em] shadow-2xl active:scale-95 transition-all">কাজ শুরু করুন</button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center p-20 bg-slate-950/50 rounded-[4rem] border-4 border-slate-900 shadow-2xl">
              <i className="fas fa-check-double text-green-500 text-5xl mb-6 opacity-30 animate-pulse"></i>
              <h3 className="text-2xl font-black text-slate-400 uppercase italic tracking-widest">আজকের কাজ শেষ!</h3>
              <p className="mt-4 text-slate-600 text-xs font-black uppercase tracking-widest">আগামীকাল আবার ফিরে আসুন।</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'packages' && (
        <div className="space-y-6 animate-fadeIn">
          <BackButton />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map(pkg => (
              <div key={pkg.id} className={`p-8 rounded-[2.5rem] border-2 transition-all relative overflow-hidden group shadow-xl ${user.activePackageId === pkg.id ? 'bg-yellow-500 border-yellow-400 text-slate-950' : 'bg-slate-900 border-slate-800 text-white hover:border-yellow-500/30'}`}>
                {user.activePackageId === pkg.id && <div className="absolute top-4 right-4 bg-slate-950 text-yellow-500 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest animate-pulse">Active</div>}
                <h4 className="text-xl font-black uppercase italic mb-1 tracking-tighter">{pkg.name}</h4>
                <p className={`text-3xl font-black italic mb-4 ${user.activePackageId === pkg.id ? 'text-slate-900' : 'gold-text'}`}>৳{pkg.price.toLocaleString()}</p>
                <div className="space-y-2 mb-6 opacity-80 text-xs font-bold">
                   {pkg.features.map((f, i) => (
                     <p key={i} className="flex items-center gap-2"><i className="fas fa-check-circle"></i> {f}</p>
                   ))}
                </div>
                <button 
                  disabled={user.activePackageId === pkg.id}
                  onClick={() => onBuyPackage(pkg.id)}
                  className={`w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg ${user.activePackageId === pkg.id ? 'bg-slate-950/20 cursor-not-allowed' : 'royal-btn'}`}
                >
                  {user.activePackageId === pkg.id ? 'Already Active' : 'প্যাকেজ কিনুন'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4 animate-fadeIn">
          <BackButton />
          <div className="bg-slate-900 rounded-[2.5rem] border-2 border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-black uppercase tracking-widest">
                <thead className="bg-slate-950 text-slate-500 border-b border-slate-800">
                  <tr><th className="px-6 py-4">সময়</th><th className="px-6 py-4">ধরন</th><th className="px-6 py-4">পরিমাণ</th><th className="px-6 py-4 text-center">অবস্থা</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-bold">
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-5 text-[10px] text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-5 text-white italic">{tx.type}</td>
                      <td className={`px-6 py-5 font-black text-base ${tx.type === TransactionType.WITHDRAWAL || tx.type === TransactionType.PACKAGE_PURCHASE ? 'text-red-500' : 'text-green-500'}`}>
                        ৳{tx.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black border ${
                          tx.status === TransactionStatus.APPROVED ? 'bg-green-600/10 text-green-500 border-green-500/20' : 
                          tx.status === TransactionStatus.PENDING ? 'bg-yellow-600/10 text-yellow-500 border-yellow-500/20' : 
                          'bg-red-600/10 text-red-500 border-red-500/20'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && <tr><td colSpan={4} className="px-6 py-20 text-center text-slate-700 italic font-black uppercase tracking-[0.4em] opacity-40">কোন তথ্য নেই</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="space-y-6 animate-fadeIn">
          <BackButton />
          <div className="bg-slate-950 p-8 rounded-[3rem] border-2 border-slate-800 shadow-2xl text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12 scale-150"><i className="fas fa-empire text-9xl gold-text"></i></div>
             <div className="w-24 h-24 bg-yellow-500/10 border-2 border-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-500 text-4xl font-black shadow-inner">
               {user.username.charAt(0)}
             </div>
             <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">{user.username}</h3>
             <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] mb-8 italic">Imperial ID: {user.id.substring(0, 10)}...</p>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-lg">
                   <p className="text-[10px] text-slate-600 uppercase font-black mb-1">Joined Empire</p>
                   <p className="text-white font-bold italic">{new Date(user.joinedAt).toLocaleDateString()}</p>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-lg">
                   <p className="text-[10px] text-slate-600 uppercase font-black mb-1">Current Status</p>
                   <p className="text-green-500 font-black uppercase italic tracking-widest">{userPkg ? 'Elite Citizen' : 'Citizen'}</p>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Popups */}
      {showTaskSuccess && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/98 backdrop-blur-3xl p-4 animate-fadeIn">
          <div className="bg-slate-900 border-4 border-yellow-500/20 p-12 rounded-[4.5rem] w-full max-w-md text-center shadow-2xl animate-zoomIn">
            <div className="w-24 h-24 bg-green-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-green-500 text-5xl border-2 border-green-500/20 shadow-inner"><i className="fas fa-check"></i></div>
            <h2 className="text-4xl font-black gold-text uppercase italic mb-2 tracking-tighter">সফল!</h2>
            <p className="text-sm text-slate-400 font-bold mb-8 italic opacity-70">ব্যালেন্স সফলভাবে যোগ করা হয়েছে।</p>
            <div className="bg-slate-950 p-6 rounded-3xl border-2 border-slate-800 mb-10 shadow-2xl"><p className="text-5xl text-green-500 font-black italic">+৳{userPkg?.earningsPerTask || 0}</p></div>
            <button onClick={() => setShowTaskSuccess(false)} className="w-full royal-btn py-6 text-sm tracking-[0.4em] shadow-2xl active:scale-95 transition-all">ড্যাশবোর্ড</button>
          </div>
        </div>
      )}

      {showTxModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/98 p-4 backdrop-blur-3xl animate-fadeIn overflow-y-auto">
          <form onSubmit={(e) => { 
            e.preventDefault(); 
            if(showTxModal === 'withdraw' && parseFloat(amount) > user.balance) return alert('অপর্যাপ্ত ব্যালেন্স!');
            onRequestTx(parseFloat(amount), showTxModal === 'deposit' ? TransactionType.DEPOSIT : TransactionType.WITHDRAWAL, method, account); 
            setShowTxModal(null); setAmount(''); setAccount(''); 
          }} className="bg-slate-900 border-4 border-yellow-500/20 p-8 md:p-12 rounded-[3.5rem] w-full max-w-lg relative shadow-2xl my-8">
            <button type="button" onClick={() => setShowTxModal(null)} className="absolute top-10 right-10 text-slate-700 hover:text-white text-5xl transition-all active:scale-90"><i className="fas fa-times-circle"></i></button>
            <h2 className="text-4xl font-black gold-text uppercase italic mb-10 tracking-tighter border-b border-slate-800 pb-4">{showTxModal === 'deposit' ? 'ডিপোজিট' : 'উইথড্র'} রিকোয়েস্ট</h2>
            <div className="space-y-6">
              <input type="number" required placeholder="টাকার পরিমাণ (৳)" className="w-full bg-slate-950 border-4 border-slate-900 rounded-[2rem] px-8 py-6 text-yellow-500 text-4xl font-black text-center outline-none focus:border-yellow-500 shadow-inner" value={amount} onChange={e => setAmount(e.target.value)} />
              <input type="text" required placeholder="বিকাশ বা নগদ নাম্বার" className="w-full bg-slate-950 border-4 border-slate-900 rounded-2xl px-6 py-5 text-white text-xl font-bold text-center outline-none focus:border-yellow-500 shadow-inner" value={account} onChange={e => setAccount(e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                 {['bKash', 'Nagad'].map(m => (
                   <button key={m} type="button" onClick={() => setMethod(m)} className={`py-4 rounded-xl font-black text-[10px] uppercase border-2 transition-all ${method === m ? 'bg-yellow-500 text-slate-950 border-yellow-500 shadow-xl' : 'bg-slate-950 border-slate-800 text-slate-600'}`}>{m}</button>
                 ))}
              </div>
              <button type="submit" className="w-full royal-btn py-7 text-sm tracking-[0.4em] shadow-2xl mt-4 active:scale-95 transition-all">কনফার্ম করুন</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
