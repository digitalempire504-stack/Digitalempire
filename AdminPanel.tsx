
import React, { useState, useEffect } from 'react';
import { AppState, Package, SiteConfig, TransactionStatus, TransactionType, User, Transaction } from '../types';
import { doc, updateDoc, deleteDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from '../firebase';
import JSZip from 'jszip';

interface AdminPanelProps {
  state: AppState;
  updateConfig: (config: Partial<SiteConfig>) => void;
  managePackage: (pkg: Package, action: 'add' | 'edit' | 'delete') => void;
  handleTx: (txId: string, status: TransactionStatus) => void;
  adjustBalance: (userId: string, amount: number) => void;
  toggleUserBan: (userId: string) => void;
  deleteComment: (id: string) => void;
  onSwitchToUser?: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ state, updateConfig, managePackage, handleTx, adjustBalance, toggleUserBan, deleteComment, onSwitchToUser }) => {
  const [activeTab, setActiveTab] = useState<'withdraws' | 'deposits' | 'pkg_reqs' | 'users' | 'packages' | 'config'>('withdraws');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editPkg, setEditPkg] = useState<Package | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [localConfig, setLocalConfig] = useState<SiteConfig>(state.siteConfig);

  useEffect(() => { setLocalConfig(state.siteConfig); }, [state.siteConfig]);

  const downloadProject = async () => {
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      const files = ['index.html', 'index.tsx', 'App.tsx', 'types.ts', 'constants.ts', 'firebase.ts', 'metadata.json', 'package.json', 'vite.config.ts', 'components/Navbar.tsx', 'components/LandingPage.tsx', 'components/AdminPanel.tsx', 'components/UserDashboard.tsx', 'services/geminiService.ts', '_redirects'];
      for (const file of files) {
        try {
          const response = await fetch(`./${file}`);
          if (response.ok) zip.file(file, await response.text());
        } catch (e) { }
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = 'Digital-Empire-Project.zip';
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    } catch (err) { alert("ডাউনলোড ব্যর্থ!"); } finally { setIsDownloading(false); }
  };

  const filteredUsers = state.users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.phoneNumber?.includes(searchTerm) ||
    u.id.includes(searchTerm)
  );

  const pendingTxs = (type: TransactionType) => state.transactions.filter(t => t.type === type && t.status === TransactionStatus.PENDING);

  const Modal = ({ title, onClose, children }: { title: string, onClose: () => void, children?: React.ReactNode }) => (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 p-4 backdrop-blur-3xl animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border-2 border-yellow-500/20 p-6 md:p-10 rounded-[2.5rem] w-full max-w-4xl shadow-2xl relative my-8 animate-zoomIn">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-700 hover:text-white text-4xl transition-all"><i className="fas fa-times-circle"></i></button>
        <h2 className="text-2xl font-black gold-text uppercase italic mb-8 tracking-tighter border-b border-slate-800 pb-4 flex items-center gap-3">
          <i className="fas fa-shield-halved text-yellow-500/50"></i> {title}
        </h2>
        {children}
      </div>
    </div>
  );

  const updateUserPackage = async (userId: string, packageId: string) => {
    try {
      await updateDoc(doc(db, "users", userId), { activePackageId: packageId });
      alert("প্যাকেজ সফলভাবে আপডেট হয়েছে!");
      if (viewingUser) setViewingUser({ ...viewingUser, activePackageId: packageId });
    } catch (e) { alert("আপডেট ব্যর্থ হয়েছে!"); }
  };

  const getUserStatement = (userId: string) => {
    return state.transactions
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 pb-24">
      {/* Top Banner */}
      <div className="premium-card p-6 mb-6 flex flex-wrap justify-between items-center gap-4 bg-gradient-to-r from-slate-900 to-slate-950">
        <div>
          <h1 className="text-2xl font-black gold-text uppercase italic leading-none">Empire Command Center</h1>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-2">Administrator Access Enabled</p>
        </div>
        <div className="flex gap-3">
          <button onClick={downloadProject} className="bg-blue-600/10 border border-blue-500/30 text-blue-400 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all">
            {isDownloading ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-download mr-2"></i>} Download Code
          </button>
          <button onClick={onSwitchToUser} className="royal-btn px-6 py-2.5 text-[10px] tracking-widest">Switch to User View</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-8 no-scrollbar pb-2">
        {[
          { id: 'withdraws', label: 'Withdrawal', icon: 'fa-money-bill-transfer', badge: pendingTxs(TransactionType.WITHDRAWAL).length },
          { id: 'deposits', label: 'Deposits', icon: 'fa-wallet', badge: pendingTxs(TransactionType.DEPOSIT).length },
          { id: 'pkg_reqs', label: 'Package Req', icon: 'fa-crown', badge: pendingTxs(TransactionType.PACKAGE_PURCHASE).length },
          { id: 'users', label: 'Citizen List', icon: 'fa-users' },
          { id: 'packages', label: 'Empire Packs', icon: 'fa-box-open' },
          { id: 'config', label: 'Site Config', icon: 'fa-gear' },
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id as any)} 
            className={`flex-shrink-0 px-6 py-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all relative ${activeTab === tab.id ? 'bg-yellow-500 text-slate-950 border-yellow-500 shadow-[0_0_20px_rgba(255,215,0,0.3)]' : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-700'}`}
          >
            <i className={`fas ${tab.icon}`}></i> {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-[8px] animate-pulse border-2 border-slate-900">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      <div className="premium-card p-6 md:p-8 min-h-[600px] border-yellow-500/5">
        {(activeTab === 'withdraws' || activeTab === 'deposits' || activeTab === 'pkg_reqs') && (
          <div className="space-y-5">
            <h3 className="text-lg font-black text-white uppercase italic mb-6 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-yellow-500 rounded-full"></span> 
              Pending Requests Queue
            </h3>
            {pendingTxs(activeTab === 'withdraws' ? TransactionType.WITHDRAWAL : activeTab === 'deposits' ? TransactionType.DEPOSIT : TransactionType.PACKAGE_PURCHASE).map(tx => {
              const u = state.users.find(usr => usr.id === tx.userId);
              return (
                <div key={tx.id} className="bg-slate-950/50 p-6 rounded-[2rem] border-2 border-slate-900 flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-yellow-500/20 transition-all shadow-xl">
                  <div className="flex-grow w-full">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="bg-yellow-500/10 text-yellow-500 px-4 py-1.5 rounded-xl font-black text-[10px] border border-yellow-500/20 uppercase tracking-widest">{tx.method}</div>
                      <h4 className="text-white font-black text-xl italic tracking-tight">{u?.username || 'Unknown User'}</h4>
                      <button onClick={() => setViewingUser(u || null)} className="bg-blue-600/10 text-blue-400 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-95">User Statement & Details</button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div>
                         <p className="text-[8px] text-slate-600 uppercase font-black mb-1">Requested Amount</p>
                         <p className="text-3xl font-black gold-text italic">৳{tx.amount.toLocaleString()}</p>
                      </div>
                      <div>
                         <p className="text-[8px] text-slate-600 uppercase font-black mb-1">Account Number</p>
                         <p className="text-lg font-bold text-white tracking-widest">{tx.accountNumber}</p>
                      </div>
                      <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                         <p className="text-[8px] text-slate-600 uppercase font-black mb-1">Current Balance</p>
                         <p className={`text-xl font-black ${u && u.balance >= tx.amount ? 'text-green-500' : 'text-red-500'}`}>৳{u?.balance.toLocaleString() || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <button onClick={async () => {
                      if (tx.type === TransactionType.DEPOSIT) adjustBalance(tx.userId, tx.amount);
                      if (tx.type === TransactionType.PACKAGE_PURCHASE) await updateDoc(doc(db, "users", tx.userId), { activePackageId: tx.packageId });
                      handleTx(tx.id, TransactionStatus.APPROVED);
                    }} className="flex-1 bg-green-600 hover:bg-green-500 text-white px-10 py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl transition-all">Approve</button>
                    <button onClick={() => handleTx(tx.id, TransactionStatus.REJECTED)} className="flex-1 bg-red-600/10 hover:bg-red-600 text-red-500 px-10 py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] border-2 border-red-600/20 transition-all hover:text-white">Reject</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="relative">
               <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-600"></i>
               <input 
                 className="w-full bg-slate-950 border-4 border-slate-900 rounded-[2.5rem] pl-14 pr-8 py-5 text-white outline-none focus:border-yellow-500 font-bold shadow-inner transition-all text-lg" 
                 placeholder="Search by Name, Phone or ID..." 
                 value={searchTerm} 
                 onChange={e => setSearchTerm(e.target.value)} 
               />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredUsers.map(u => (
                <div key={u.id} className="bg-slate-950 p-6 rounded-[2.5rem] border-2 border-slate-900 shadow-xl flex flex-col justify-between group hover:border-yellow-500/20 transition-all">
                  <div>
                    <h4 className="text-white font-black text-xl uppercase italic tracking-tight mb-1">{u.username}</h4>
                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-4">{u.phoneNumber || 'No Phone Number'}</p>
                    <div className="flex justify-between items-center mb-6 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                      <p className="text-[8px] text-slate-500 uppercase font-black">Current Balance</p>
                      <p className="text-lg font-black gold-text italic">৳{u.balance.toLocaleString()}</p>
                    </div>
                  </div>
                  <button onClick={() => setViewingUser(u)} className="w-full bg-slate-900 hover:bg-yellow-500 hover:text-slate-950 text-slate-400 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 border-slate-800 transition-all shadow-lg active:scale-95">Full Dossier & Statement</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="max-w-4xl mx-auto space-y-10 animate-fadeIn">
            <h3 className="text-2xl font-black gold-text text-center uppercase italic tracking-widest border-b border-slate-900 pb-4">Imperial System Config</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { label: 'Support Email Address', key: 'supportEmail', icon: 'fa-envelope', color: 'text-blue-500' },
                { label: 'Official WhatsApp Number', key: 'whatsappNumber', icon: 'fa-whatsapp', color: 'text-green-500' },
                { label: 'Merchant bKash Number', key: 'bkashNumber', icon: 'fa-money-bill-transfer', color: 'text-pink-500' },
                { label: 'Merchant Nagad Number', key: 'nagadNumber', icon: 'fa-money-bill-wave', color: 'text-orange-500' },
              ].map(field => (
                <div key={field.key} className="space-y-3 group">
                   <div className="flex items-center gap-2 mb-1 ml-4">
                     <i className={`fas ${field.icon} ${field.color} text-[10px]`}></i>
                     <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{field.label}</label>
                   </div>
                   <div className="relative">
                      <input 
                        className="w-full bg-slate-950 border-4 border-slate-900 rounded-[2rem] px-8 py-5 text-white focus:border-yellow-500 outline-none font-bold shadow-inner transition-all group-hover:border-slate-800" 
                        value={(localConfig as any)[field.key] || ''} 
                        onChange={e => setLocalConfig({...localConfig, [field.key]: e.target.value})} 
                      />
                   </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
               <div className="flex items-center gap-2 mb-1 ml-4">
                 <i className="fas fa-bullhorn text-yellow-500 text-[10px]"></i>
                 <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Global Marquee Announcement</label>
               </div>
               <textarea 
                 className="w-full bg-slate-950 border-4 border-slate-900 rounded-[2.5rem] px-8 py-6 text-white h-32 focus:border-yellow-500 outline-none font-bold text-sm leading-relaxed shadow-inner" 
                 value={localConfig.announcement} 
                 onChange={e => setLocalConfig({...localConfig, announcement: e.target.value})} 
               />
            </div>

            <button onClick={() => { updateConfig(localConfig); alert('System Parameters Updated Successfully!'); }} className="w-full royal-btn py-7 text-sm tracking-[0.5em] shadow-2xl active:scale-95 transition-all">Publish Global Updates</button>
          </div>
        )}

        {/* Packages Tab */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black gold-text uppercase italic">Imperial Packages</h3>
              <button onClick={() => setEditPkg({ id: 'new-' + Date.now(), name: '', price: 0, durationDays: 30, dailyTasks: 0, earningsPerTask: 0, features: [] })} className="royal-btn px-6 py-3 text-[10px] tracking-widest shadow-xl">Establish New Empire Pack</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.packages.map(pkg => (
                <div key={pkg.id} className="bg-slate-950 p-8 rounded-[3rem] border-2 border-slate-800 group hover:border-yellow-500/20 shadow-2xl transition-all flex flex-col justify-between">
                  <div className="text-center mb-6">
                    <h4 className="text-white font-black text-2xl uppercase italic tracking-tighter mb-2">{pkg.name}</h4>
                    <p className="text-yellow-500 font-black text-4xl italic">৳{pkg.price.toLocaleString()}</p>
                  </div>
                  <button onClick={() => setEditPkg(pkg)} className="w-full bg-slate-900 border-2 border-slate-800 text-slate-500 hover:text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95">Modify Specs</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}

      {/* User Dossier Modal (Detailed Profile + Statement) */}
      {viewingUser && (
        <Modal title={`${viewingUser.username} - Imperial Dossier & Statement`} onClose={() => { setViewingUser(null); setAdjustAmount(''); }}>
          <div className="space-y-8 animate-fadeIn max-h-[75vh] overflow-y-auto no-scrollbar pr-2">
             {/* Key Financial Stats Row */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 text-center shadow-inner">
                   <p className="text-[8px] text-slate-600 uppercase font-black mb-1 tracking-widest">Net Balance</p>
                   <p className="text-2xl text-yellow-500 font-black italic">৳{viewingUser.balance.toLocaleString()}</p>
                </div>
                <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 text-center shadow-inner">
                   <p className="text-[8px] text-slate-600 uppercase font-black mb-1 tracking-widest">Total Payouts</p>
                   <p className="text-2xl text-green-500 font-black italic">৳{viewingUser.totalWithdrawn?.toLocaleString() || 0}</p>
                </div>
                <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 text-center shadow-inner">
                   <p className="text-[8px] text-slate-600 uppercase font-black mb-1 tracking-widest">Refer Commissions</p>
                   <p className="text-2xl text-purple-500 font-black italic">৳{viewingUser.referEarnings?.toLocaleString() || 0}</p>
                </div>
                <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 text-center shadow-inner">
                   <p className="text-[8px] text-slate-600 uppercase font-black mb-1 tracking-widest">Citizens Referred</p>
                   <p className="text-2xl text-blue-500 font-black italic">{viewingUser.totalReferrals || 0}</p>
                </div>
             </div>

             {/* Referral Context & Status Section */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-slate-800 shadow-xl">
                   <h5 className="text-[10px] font-black text-slate-500 uppercase italic mb-5 tracking-[0.3em] flex items-center gap-2 border-b border-slate-900 pb-3"><i className="fas fa-link text-yellow-500"></i> Referral Tracking</h5>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center group">
                        <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Identity Refer Code</span>
                        <span className="text-sm text-white font-black italic bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 group-hover:border-yellow-500/20 transition-all">{viewingUser.referCode || 'EMP-XXXX'}</span>
                      </div>
                      <div className="flex justify-between items-center group">
                        <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Referred By Patron</span>
                        <span className="text-[11px] text-yellow-500 font-black italic bg-yellow-500/5 px-3 py-1 rounded-lg border border-yellow-500/10 group-hover:bg-yellow-500/10 transition-all">{viewingUser.referredBy || 'Direct Registration'}</span>
                      </div>
                      <div className="flex justify-between items-center group">
                        <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Arrival Date</span>
                        <span className="text-[11px] text-white font-bold opacity-80">{new Date(viewingUser.joinedAt).toLocaleDateString()}</span>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-slate-800 shadow-xl">
                   <h5 className="text-[10px] font-black text-slate-500 uppercase italic mb-5 tracking-[0.3em] flex items-center gap-2 border-b border-slate-900 pb-3"><i className="fas fa-crown text-yellow-500"></i> Active Empire Tier</h5>
                   <div className="space-y-5">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Assigned Package</span>
                        <span className="text-[12px] text-green-500 font-black uppercase italic tracking-tighter drop-shadow-sm">{state.packages.find(p => p.id === viewingUser.activePackageId)?.name || 'Citizen (Standard)'}</span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[8px] text-slate-700 font-black uppercase ml-1">Manual Package Override</p>
                        <select 
                          className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl px-4 py-3 text-[10px] text-white font-black outline-none focus:border-yellow-500 shadow-lg appearance-none cursor-pointer"
                          value={viewingUser.activePackageId || ''}
                          onChange={(e) => updateUserPackage(viewingUser.id, e.target.value)}
                        >
                           <option value="">Switch Package Tier...</option>
                           {state.packages.map(p => (
                             <option key={p.id} value={p.id}>{p.name} (৳{p.price})</option>
                           ))}
                        </select>
                      </div>
                   </div>
                </div>
             </div>

             {/* Treasury Adjustment */}
             <div className="bg-slate-900/40 p-8 rounded-[3rem] border border-yellow-500/10 shadow-2xl">
                <h5 className="text-[11px] font-black text-white uppercase italic mb-6 tracking-[0.4em] text-center">Imperial Balance Treasury</h5>
                <div className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
                   <input 
                     type="number" 
                     placeholder="Enter Adjustment Amount..." 
                     className="flex-grow bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 text-white font-black outline-none focus:border-yellow-500 shadow-inner text-center md:text-left" 
                     value={adjustAmount} 
                     onChange={e => setAdjustAmount(e.target.value)} 
                   />
                   <button 
                     onClick={() => { 
                       if(!adjustAmount) return; 
                       adjustBalance(viewingUser.id, parseFloat(adjustAmount)); 
                       setViewingUser({...viewingUser, balance: viewingUser.balance + parseFloat(adjustAmount)});
                       setAdjustAmount('');
                       alert('Imperial Treasury Adjusted!');
                     }} 
                     className="bg-yellow-500 text-slate-950 px-10 py-4 rounded-2xl font-black text-[11px] uppercase shadow-[0_10px_30px_rgba(255,215,0,0.2)] active:scale-95 transition-all"
                   >Commit Transaction</button>
                </div>
                <p className="text-[9px] text-slate-600 text-center mt-5 italic font-bold tracking-widest opacity-60 uppercase">Use positive integer to grant credits, negative sign (-) to subtract imperial wealth.</p>
             </div>

             {/* Full Statement (Original History) */}
             <div className="bg-slate-950 p-8 rounded-[3rem] border-2 border-slate-900 shadow-2xl">
                <div className="flex items-center justify-between mb-8 border-b border-slate-900 pb-5">
                   <h5 className="text-[11px] font-black text-slate-500 uppercase italic tracking-[0.5em]">Original Financial Statement</h5>
                   <div className="bg-slate-900 px-4 py-1.5 rounded-full border border-slate-800 text-[8px] font-black text-slate-500 uppercase tracking-widest">Ledger Logs</div>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                   <table className="w-full text-left text-[10px] font-black uppercase tracking-tight">
                      <thead className="text-slate-700 border-b-2 border-slate-900">
                        <tr>
                          <th className="pb-5 px-3">Date/Time</th>
                          <th className="pb-5 px-3">Transaction Type</th>
                          <th className="pb-5 px-3">Method/Gateway</th>
                          <th className="pb-5 px-3 text-right">Debit/Credit</th>
                          <th className="pb-5 px-3 text-center">Outcome</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        {getUserStatement(viewingUser.id).map(tx => (
                          <tr key={tx.id} className="hover:bg-white/5 transition-all group">
                            <td className="py-5 px-3 text-slate-500 group-hover:text-slate-300 transition-colors">
                               {new Date(tx.createdAt).toLocaleDateString()}<br/>
                               <span className="text-[7px] opacity-40">{new Date(tx.createdAt).toLocaleTimeString()}</span>
                            </td>
                            <td className="py-5 px-3 text-white italic tracking-tighter group-hover:text-yellow-500 transition-colors">{tx.type}</td>
                            <td className="py-5 px-3 text-slate-500 lowercase opacity-70 italic">{tx.method} • {tx.accountNumber}</td>
                            <td className={`py-5 px-3 text-right font-black text-sm ${tx.type === TransactionType.EARNING || tx.type === TransactionType.DEPOSIT || tx.type === TransactionType.REFERRAL_BONUS || tx.type === TransactionType.REFERRAL_COMMISSION ? 'text-green-500' : 'text-red-500'}`}>
                              {tx.type === TransactionType.EARNING || tx.type === TransactionType.DEPOSIT || tx.type === TransactionType.REFERRAL_BONUS || tx.type === TransactionType.REFERRAL_COMMISSION ? '+' : '-'}৳{tx.amount.toLocaleString()}
                            </td>
                            <td className="py-5 px-3 text-center">
                               <span className={`px-3 py-1 rounded-lg text-[8px] font-black border transition-all ${
                                 tx.status === TransactionStatus.APPROVED ? 'bg-green-600/10 text-green-500 border-green-500/30 group-hover:bg-green-600 group-hover:text-white' : 
                                 tx.status === TransactionStatus.PENDING ? 'bg-yellow-600/10 text-yellow-500 border-yellow-500/30 group-hover:bg-yellow-500 group-hover:text-slate-950' : 
                                 'bg-red-600/10 text-red-500 border-red-500/30 group-hover:bg-red-600 group-hover:text-white'
                               }`}>
                                 {tx.status}
                               </span>
                            </td>
                          </tr>
                        ))}
                        {getUserStatement(viewingUser.id).length === 0 && (
                          <tr><td colSpan={5} className="py-24 text-center text-slate-800 italic tracking-[0.4em] font-black opacity-30">The citizen has no recorded financial activity yet.</td></tr>
                        )}
                      </tbody>
                   </table>
                </div>
             </div>

             <div className="flex flex-col sm:flex-row gap-4 border-t border-slate-800 pt-10">
                <button 
                  onClick={() => { toggleUserBan(viewingUser.id); setViewingUser({...viewingUser, isBanned: !viewingUser.isBanned}); }} 
                  className={`flex-1 py-7 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.3em] transition-all shadow-xl active:scale-95 ${viewingUser.isBanned ? 'bg-green-600/10 text-green-500 border-2 border-green-500/20 hover:bg-green-600 hover:text-white' : 'bg-red-600/10 text-red-500 border-2 border-red-600/20 hover:bg-red-600 hover:text-white'}`}
                >
                   {viewingUser.isBanned ? 'Grant Sovereign Pardon' : 'Execute Imperial Ban'}
                </button>
                <button onClick={() => setViewingUser(null)} className="flex-1 bg-slate-800 text-white py-7 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.3em] active:scale-95 transition-all border-2 border-slate-700 hover:bg-slate-700">Close Dossier Access</button>
             </div>
          </div>
        </Modal>
      )}

      {/* Package Edit Modal */}
      {editPkg && (
        <Modal title={editPkg.name || 'Establish New Package'} onClose={() => setEditPkg(null)}>
          <div className="space-y-6 animate-fadeIn">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-600 ml-3">Identity Name</label>
                   <input className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-yellow-500 shadow-inner" value={editPkg.name} onChange={e => setEditPkg({...editPkg, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-600 ml-3">Entry Price (৳)</label>
                   <input className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 text-yellow-500 font-bold outline-none focus:border-yellow-500 shadow-inner" type="number" value={editPkg.price} onChange={e => setEditPkg({...editPkg, price: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-600 ml-3">Daily Operations (Tasks)</label>
                   <input className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-yellow-500 shadow-inner" type="number" value={editPkg.dailyTasks} onChange={e => setEditPkg({...editPkg, dailyTasks: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-600 ml-3">Royalty Per Task (৳)</label>
                   <input className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-4 text-green-500 font-bold outline-none focus:border-yellow-500 shadow-inner" type="number" value={editPkg.earningsPerTask} onChange={e => setEditPkg({...editPkg, earningsPerTask: parseFloat(e.target.value)})} />
                </div>
             </div>
             <button onClick={() => { managePackage(editPkg, state.packages.find(p => p.id === editPkg.id) ? 'edit' : 'add'); setEditPkg(null); }} className="w-full royal-btn py-7 text-sm tracking-[0.4em] mt-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] active:scale-95 transition-all">Establish Imperial Pack</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminPanel;
