
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AdminPanel from './components/AdminPanel';
import UserDashboard from './components/UserDashboard';
import { AppState, User, Transaction, Package, SiteConfig, TransactionStatus, TransactionType, UserComment } from './types';
import { INITIAL_SITE_CONFIG, INITIAL_PACKAGES } from './constants';
import { auth, db, ADMIN_UID } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy,
  where,
  addDoc,
  deleteDoc,
  limit
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    users: [],
    packages: [],
    transactions: [],
    comments: [],
    siteConfig: INITIAL_SITE_CONFIG,
    currentUser: null
  });

  const [adminViewMode, setAdminViewMode] = useState<'user' | 'admin'>('user');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleError = (error: any) => console.warn("Access Error:", error.message);
    const unsubConfig = onSnapshot(doc(db, "settings", "siteConfig"), (docSnap) => {
      if (docSnap.exists()) {
        setState(prev => ({ ...prev, siteConfig: docSnap.data() as SiteConfig }));
      } else {
        setDoc(doc(db, "settings", "siteConfig"), INITIAL_SITE_CONFIG).catch(handleError);
      }
    }, handleError);

    const unsubPkgs = onSnapshot(collection(db, "packages"), (snap) => {
      if (snap.empty) {
        INITIAL_PACKAGES.forEach(pkg => setDoc(doc(db, "packages", pkg.id), pkg).catch(handleError));
      } else {
        const pkgs = snap.docs.map(d => ({ ...d.data() } as Package));
        setState(prev => ({ ...prev, packages: pkgs }));
      }
    }, handleError);

    const unsubComments = onSnapshot(query(collection(db, "comments"), orderBy("createdAt", "desc"), limit(20)), (snap) => {
      const comms = snap.docs.map(d => ({ id: d.id, ...d.data() } as UserComment));
      setState(prev => ({ ...prev, comments: comms }));
    }, handleError);

    return () => { unsubConfig(); unsubPkgs(); unsubComments(); };
  }, []);

  useEffect(() => {
    let unsubUsers: (() => void) | null = null;
    let unsubTransactions: (() => void) | null = null;
    let unsubCurrentUser: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        unsubCurrentUser = onSnapshot(doc(db, "users", firebaseUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            setState(prev => ({ ...prev, currentUser: { id: docSnap.id, ...docSnap.data() } as User }));
          } else if (firebaseUser.uid === ADMIN_UID) {
            const adminData: User = { id: ADMIN_UID, username: "Super Admin", email: firebaseUser.email || "", balance: 0, joinedAt: new Date().toISOString(), totalWithdrawn: 0, totalRejected: 0, tasksCompletedToday: 0, referEarnings: 0, totalReferrals: 0 };
            setDoc(doc(db, "users", ADMIN_UID), adminData);
          }
        });

        const qTx = firebaseUser.uid === ADMIN_UID 
          ? query(collection(db, "transactions"), orderBy("createdAt", "desc"))
          : query(collection(db, "transactions"), where("userId", "==", firebaseUser.uid), orderBy("createdAt", "desc"));

        unsubTransactions = onSnapshot(qTx, (snap) => {
          const txs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
          setState(prev => ({ ...prev, transactions: txs }));
        });

        if (firebaseUser.uid === ADMIN_UID) {
          unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
            const users = snap.docs.map(d => ({ id: d.id, ...d.data() } as User));
            setState(prev => ({ ...prev, users }));
          });
        }
      } else {
        setState(prev => ({ ...prev, currentUser: null, users: [], transactions: [] }));
      }
      setLoading(false);
    });

    return () => {
      unsubAuth();
      if (unsubUsers) unsubUsers();
      if (unsubTransactions) unsubTransactions();
      if (unsubCurrentUser) unsubCurrentUser();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const userDoc = await getDoc(doc(db, "users", cred.user.uid));
      if (userDoc.exists() && (userDoc.data() as User).isBanned) {
        await signOut(auth);
        return { success: false, message: 'আপনার একাউন্টটি ব্যান করা হয়েছে!' };
      }
      return { success: true };
    } catch (err: any) { return { success: false, message: 'ভুল ইমেইল অথবা পাসওয়ার্ড!' }; }
  };

  const register = async (userData: Partial<User>) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, userData.email!, userData.password!);
      const newUser: User = {
        id: cred.user.uid,
        username: userData.username || 'নতুন নাগরিক',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        referCode: 'EMP' + Math.floor(1000 + Math.random() * 9000),
        referEarnings: 0,
        totalReferrals: 0,
        balance: 0,
        joinedAt: new Date().toISOString(),
        totalWithdrawn: 0,
        totalRejected: 0,
        tasksCompletedToday: 0
      };
      await setDoc(doc(db, "users", cred.user.uid), newUser);
      return { success: true };
    } catch (err: any) { return { success: false, message: 'নিবন্ধন ব্যর্থ হয়েছে!' }; }
  };

  const completeTask = async () => {
    if (!state.currentUser) return;
    const userPkg = state.packages.find(p => p.id === state.currentUser?.activePackageId);
    if (!userPkg) return alert("প্যাকেজ কিনুন!");
    const today = new Date().toLocaleDateString();
    const currentTasks = state.currentUser.lastTaskDate === today ? (state.currentUser.tasksCompletedToday || 0) : 0;
    
    await updateDoc(doc(db, "users", state.currentUser.id), { 
      balance: state.currentUser.balance + userPkg.earningsPerTask,
      tasksCompletedToday: currentTasks + 1,
      lastTaskDate: today
    });

    await addDoc(collection(db, "transactions"), {
      userId: state.currentUser.id,
      amount: userPkg.earningsPerTask,
      type: TransactionType.EARNING,
      status: TransactionStatus.APPROVED,
      method: 'System',
      accountNumber: 'Task Reward',
      createdAt: new Date().toISOString()
    });
  };

  const buyPackage = async (packageId: string) => {
    if (!state.currentUser) return;
    const pkg = state.packages.find(p => p.id === packageId);
    if (!pkg) return;
    await addDoc(collection(db, "transactions"), {
      userId: state.currentUser.id,
      amount: pkg.price,
      type: TransactionType.PACKAGE_PURCHASE,
      status: TransactionStatus.PENDING,
      method: 'Admin Approval',
      accountNumber: pkg.name,
      packageId,
      createdAt: new Date().toISOString()
    });
    window.open(`https://wa.me/${state.siteConfig.whatsappNumber}?text=${encodeURIComponent(`আমি ${pkg.name} কিনতে চাই। ইউজার আইডি: ${state.currentUser.id}`)}`, '_blank');
  };

  return (
    <HashRouter>
      <div className="min-h-screen royal-gradient text-slate-100 flex flex-col">
        <Navbar currentUser={state.currentUser} logout={async () => await signOut(auth)} siteConfig={state.siteConfig} onLogin={login} onRegister={register} isModalOpen={isAuthModalOpen} setIsModalOpen={setIsAuthModalOpen} />
        <main className="flex-grow">
          {loading ? (
            <div className="h-screen flex items-center justify-center"><i className="fas fa-empire text-6xl gold-text animate-spin"></i></div>
          ) : (
            <Routes>
              <Route path="/" element={<LandingPage state={state} onStartClick={() => setIsAuthModalOpen(true)} />} />
              <Route path="/dashboard" element={
                state.currentUser ? (
                  state.currentUser.id === ADMIN_UID ? (
                    adminViewMode === 'admin' ? (
                      <AdminPanel 
                        state={state} 
                        updateConfig={(c) => updateDoc(doc(db, "settings", "siteConfig"), c)} 
                        managePackage={async (p, a) => a === 'delete' ? deleteDoc(doc(db, "packages", p.id)) : setDoc(doc(db, "packages", p.id), p)} 
                        handleTx={async (id, s) => {
                          const tx = state.transactions.find(t => t.id === id);
                          if (s === TransactionStatus.APPROVED && tx?.type === TransactionType.WITHDRAWAL) {
                            const u = state.users.find(usr => usr.id === tx.userId);
                            if (u) await updateDoc(doc(db, "users", u.id), { totalWithdrawn: (u.totalWithdrawn || 0) + tx.amount, balance: (u.balance - tx.amount) });
                          }
                          await updateDoc(doc(db, "transactions", id), { status: s });
                        }} 
                        adjustBalance={async (id, a) => updateDoc(doc(db, "users", id), { balance: (state.users.find(u => u.id === id)?.balance || 0) + a })} 
                        toggleUserBan={async (id) => updateDoc(doc(db, "users", id), { isBanned: !state.users.find(u => u.id === id)?.isBanned })} 
                        deleteComment={(id) => deleteDoc(doc(db, "comments", id))} 
                        onSwitchToUser={() => setAdminViewMode('user')} 
                      />
                    ) : (
                      <UserDashboard user={state.currentUser} packages={state.packages} siteConfig={state.siteConfig} transactions={state.transactions} onRequestTx={async (a, t, m, acc) => addDoc(collection(db, "transactions"), { userId: state.currentUser?.id, amount: a, type: t, status: TransactionStatus.PENDING, method: m, accountNumber: acc, createdAt: new Date().toISOString() })} onCompleteTask={completeTask} onBuyPackage={buyPackage} onAddComment={async (t, r) => addDoc(collection(db, "comments"), { userId: state.currentUser?.id, username: state.currentUser?.username, text: t, rating: r, createdAt: new Date().toISOString(), isApproved: true })} onSwitchToAdmin={() => setAdminViewMode('admin')} />
                    )
                  ) : (
                    <UserDashboard user={state.currentUser} packages={state.packages} siteConfig={state.siteConfig} transactions={state.transactions} onRequestTx={async (a, t, m, acc) => addDoc(collection(db, "transactions"), { userId: state.currentUser?.id, amount: a, type: t, status: TransactionStatus.PENDING, method: m, accountNumber: acc, createdAt: new Date().toISOString() })} onCompleteTask={completeTask} onBuyPackage={buyPackage} onAddComment={async (t, r) => addDoc(collection(db, "comments"), { userId: state.currentUser?.id, username: state.currentUser?.username, text: t, rating: r, createdAt: new Date().toISOString(), isApproved: true })} />
                  )
                ) : <Navigate to="/" />
              } />
            </Routes>
          )}
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
