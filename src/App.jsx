import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  serverTimestamp,
  updateDoc,
  doc,
  increment
} from 'firebase/firestore';
import { 
  Send, Clock, Sparkles, Coffee, 
  Image as ImageIcon, X, EyeOff, 
  Volume2, VolumeX, AlertTriangle, 
  Flame, Flag, Palette, Smile, RefreshCw,
  Edit2, BarChart2, Share2, Maximize2,
  Check, WifiOff, Wifi
} from 'lucide-react';

// --- 1. FIREBASE CONFIGURATION ---

// ✅ YOUR CONFIGURATION IS NOW APPLIED HERE
const MANUAL_CONFIG = {
  apiKey: "AIzaSyAiawH4K9GaHGjOJ4qbjQkJrtRWe_dqCpY",
  authDomain: "tea-confessions.firebaseapp.com",
  projectId: "tea-confessions",
  storageBucket: "tea-confessions.firebasestorage.app",
  messagingSenderId: "751037797594",
  appId: "1:751037797594:web:7ccefa8c5b75c0d18b81e3",
  measurementId: "G-Y2FH43XZ3C"
};

let firebaseConfig = MANUAL_CONFIG;
let isDemoConfig = false;

// Fallback logic just in case, but MANUAL_CONFIG will take precedence
try {
  if (!firebaseConfig) {
     if (typeof __firebase_config === 'string') {
       firebaseConfig = JSON.parse(__firebase_config);
     } else if (typeof __firebase_config === 'object') {
       firebaseConfig = __firebase_config;
     } else {
       throw new Error('No config');
     }
  }
} catch (e) {
  firebaseConfig = { apiKey: "demo", authDomain: "demo", projectId: "demo" };
  isDemoConfig = true; 
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Sanitization: Remove file paths from ID
const rawAppId = typeof __app_id !== 'undefined' ? __app_id : 'tea-confessions-v1';
const appId = rawAppId.split('/')[0];

// --- 2. ASSETS & CONSTANTS ---
const BANNED_WORDS = ['hate', 'ugly', 'stupid', 'loser', 'kill', 'die']; 
const POPULAR_EMOJIS = ['💀', '😭', '🤡', '☕', '✨', '🔥', '👀', '💅', '🧢', '💩', '🤮', '🥺', '🚩', '🙉', '🦄', '🤌', '🧘', '💣', '💤', '🎉', '💔', '💯', '🫡', '🫣'];

const THEMES = {
  midnight: { name: 'Midnight', bg: 'bg-[#0a0a0c]', orb1: 'bg-purple-600/30', orb2: 'bg-blue-600/20', orb3: 'bg-pink-500/20', accent: 'from-pink-500 to-violet-600', icon: 'text-violet-400' },
  toxic: { name: 'Toxic', bg: 'bg-[#050a05]', orb1: 'bg-lime-500/30', orb2: 'bg-emerald-600/20', orb3: 'bg-green-500/20', accent: 'from-lime-400 to-emerald-600', icon: 'text-lime-400' },
  lovebomb: { name: 'Lovebomb', bg: 'bg-[#0a0505]', orb1: 'bg-red-600/30', orb2: 'bg-rose-600/20', orb3: 'bg-orange-500/20', accent: 'from-red-500 to-rose-600', icon: 'text-rose-400' }
};

const POST_VIBES = [
  { id: 0, name: 'Chill', color: 'bg-purple-500' },
  { id: 1, name: 'Tea', color: 'bg-pink-500' },
  { id: 2, name: 'Toxic', color: 'bg-green-500' },
  { id: 3, name: 'Dark', color: 'bg-slate-500' }
];

const ADJECTIVES = ['Ghostly', 'Secret', 'Quiet', 'Lurking', 'Shadowy', 'Mysterious', 'Chaos', 'Humble', 'Local', 'Spicy', 'Salty', 'Dramatic'];
const NOUNS = ['Bestie', 'Vibe', 'Specter', 'Source', 'Lurker', 'Witness', 'Demon', 'Ex', 'Main', 'Simp', 'Expert', 'Snitch'];

// --- 3. HELPER FUNCTIONS ---
const getTimeAgo = (timestamp) => {
  if (!timestamp) return 'just now'; // Handle null/pending timestamp
  const now = new Date();
  // Handle Firestore Timestamp vs JS Date vs String
  let date;
  if (timestamp?.toDate) {
    date = timestamp.toDate();
  } else {
    date = new Date(timestamp);
  }
  
  // Safety check for invalid dates
  if (isNaN(date.getTime())) return 'unknown';

  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return 'expired';
};

const checkToxicity = (text) => {
  const lowerText = text.toLowerCase();
  return BANNED_WORDS.some(word => lowerText.includes(word));
};

const generateIdentity = () => `${ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]} ${NOUNS[Math.floor(Math.random() * NOUNS.length)]}`;

const getAuraRank = (points) => {
    if (points < 50) return { title: 'NPC', emoji: '🤖' };
    if (points < 100) return { title: 'Lurker', emoji: '👀' };
    if (points < 300) return { title: 'Bestie', emoji: '✨' };
    if (points < 1000) return { title: 'Main Character', emoji: '💅' };
    return { title: 'Icon', emoji: '👑' };
};

// --- 4. MAIN COMPONENT ---
export default function App() {
  const [user, setUser] = useState(null);
  const [tea, setTea] = useState([]);
  const [input, setInput] = useState('');
  const [isSpilling, setIsSpilling] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notification, setNotification] = useState(null); 
  const [connectionStatus, setConnectionStatus] = useState('connecting'); 
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  const [sortBy, setSortBy] = useState('new'); 
  const [currentTheme, setCurrentTheme] = useState('midnight');
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [userIdentity, setUserIdentity] = useState('');
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [selectedVibe, setSelectedVibe] = useState(0);

  const [aura, setAura] = useState(0);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollOptions, setPollOptions] = useState({ a: '', b: '' });
  const [lightboxImage, setLightboxImage] = useState(null);

  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const identityInputRef = useRef(null);
  const audioRef = useRef(null);

  // Initialize Audio safely for all environments
  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3');
  }, []);

  const theme = THEMES[currentTheme];
  const auraRank = getAuraRank(aura);

  // --- HELPERS (Defined before usage) ---
  const processTeaList = (data, sortType) => {
    let freshTea = data.filter(item => {
        // FIX: Handle null (pending) createdAt as NOW
        let date;
        if (!item.createdAt) {
          date = new Date(); 
        } else if (item.createdAt.toDate) {
          date = item.createdAt.toDate();
        } else {
          date = new Date(item.createdAt);
        }
        
        if (item.reports > 5) return false; 
        // Keep item if it's less than 24h old
        return (new Date() - date) / 36e5 < 24;
    });

    if (sortType === 'hot') {
      freshTea.sort((a, b) => (b.sips || 0) - (a.sips || 0));
    } else {
      freshTea.sort((a, b) => {
          // FIX: Handle null (pending) as "Infinity" or Now so it stays at the bottom
          const getTime = (t) => {
            if (!t) return Date.now();
            return t.toMillis ? t.toMillis() : new Date(t).getTime();
          };
          const timeA = getTime(a.createdAt);
          const timeB = getTime(b.createdAt);
          return timeA - timeB; 
      });
    }
    return freshTea;
  };

  const incrementAura = (amount) => {
      const newAura = aura + amount;
      setAura(newAura);
      localStorage.setItem('tea_aura', newAura.toString());
  };

  // --- INITIALIZATION ---
  useEffect(() => {
    // 1. Setup Identity & Aura
    setUserIdentity(generateIdentity());
    const savedAura = localStorage.getItem('tea_aura');
    if (savedAura) setAura(parseInt(savedAura, 10));

    // 2. Try Firebase Auth
    const initAuth = async () => {
      // If we are forced to demo config (offline), skip auth
      if (isDemoConfig) {
        setIsOfflineMode(true);
        setConnectionStatus('offline');
        setUser({ uid: 'offline-user' });
        return;
      }

      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.warn("Auth failed, switching to offline mode.", error);
        setIsOfflineMode(true);
        setConnectionStatus('offline');
        setUser({ uid: 'offline-user' });
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setConnectionStatus('connected');
      }
    });
    return () => unsubscribe();
  }, []);

  // --- DATA FETCHING (HYBRID) ---
  useEffect(() => {
    if (!user) return;

    if (isOfflineMode) {
      // OFFLINE MODE: Load from LocalStorage
      const localTea = JSON.parse(localStorage.getItem('tea_local_db') || '[]');
      setTea(processTeaList(localTea, sortBy));
      return;
    }

    // ONLINE MODE: Firebase
    let teaCollection;
    if (typeof __app_id !== 'undefined') {
       teaCollection = collection(db, 'artifacts', appId, 'public', 'data', 'confessions');
    } else {
       teaCollection = collection(db, 'confessions');
    }
    
    const q = query(teaCollection);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const teaData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTea(processTeaList(teaData, sortBy));
      setConnectionStatus('connected');
      
      // Only scroll on initial load or if user is near bottom to prevent annoyance
      // For simplicity in this demo, we just scroll if it's 'new' sort
      if(sortBy === 'new') {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }, (error) => {
        console.error("Firebase blocked access. Switching to Offline Mode.");
        setIsOfflineMode(true);
        setConnectionStatus('offline');
        const localTea = JSON.parse(localStorage.getItem('tea_local_db') || '[]');
        setTea(processTeaList(localTea, sortBy));
    });

    return () => unsubscribe();
  }, [user, soundEnabled, sortBy, isOfflineMode]); 

  // --- ACTIONS (HYBRID) ---
  const handleSpill = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !imagePreview) || !user) return;

    if (checkToxicity(input)) {
      setNotification({ text: "Don't be messy. Be nice.", type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setIsSpilling(true);
    
    const newTea = {
      text: input.trim(),
      image: imagePreview || null,
      sips: 0,
      reports: 0,
      createdAt: isOfflineMode ? new Date().toISOString() : serverTimestamp(),
      authorId: user.uid,
      identity: userIdentity || "Anonymous Vibe", 
      style: selectedVibe,
      ...(showPollCreator && pollOptions.a && pollOptions.b ? {
          poll: { question: "Vote:", options: { a: pollOptions.a, b: pollOptions.b }, votes: { a: 0, b: 0 } }
      } : {})
    };

    try {
      if (isOfflineMode) {
        // SAVE LOCAL
        const currentLocal = JSON.parse(localStorage.getItem('tea_local_db') || '[]');
        const newItem = { ...newTea, id: Date.now().toString(), createdAt: new Date() };
        currentLocal.push(newItem);
        localStorage.setItem('tea_local_db', JSON.stringify(currentLocal));
        setTea(processTeaList(currentLocal, sortBy));
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      } else {
        // SAVE FIREBASE
        let teaCollection;
        if (typeof __app_id !== 'undefined') {
          teaCollection = collection(db, 'artifacts', appId, 'public', 'data', 'confessions');
        } else {
          teaCollection = collection(db, 'confessions');
        }
        await addDoc(teaCollection, newTea);
      }

      incrementAura(10); 
      if (soundEnabled && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      setInput('');
      setImageFile(null);
      setImagePreview(null);
      if(fileInputRef.current) fileInputRef.current.value = "";
      setShowEmojiPicker(false);
      setShowPollCreator(false);
      setPollOptions({ a: '', b: '' });

    } catch (error) {
      console.error("Spill failed:", error);
      setNotification({ text: "Error. Try again.", type: 'error' });
    } finally {
      setIsSpilling(false);
    }
  };

  const handleSip = async (item) => {
      incrementAura(1);
      if (isOfflineMode) {
          const currentLocal = JSON.parse(localStorage.getItem('tea_local_db') || '[]');
          const updated = currentLocal.map(t => t.id === item.id ? { ...t, sips: (t.sips || 0) + 1 } : t);
          localStorage.setItem('tea_local_db', JSON.stringify(updated));
          setTea(processTeaList(updated, sortBy));
      } else {
          try {
            const docRef = (typeof __app_id !== 'undefined') 
                ? doc(db, 'artifacts', appId, 'public', 'data', 'confessions', item.id)
                : doc(db, 'confessions', item.id);
            await updateDoc(docRef, { sips: increment(1) });
          } catch(e) { console.error(e); }
      }
  };

  const handleVoteAction = async (item, option) => {
      incrementAura(2);
      if (isOfflineMode) {
          const currentLocal = JSON.parse(localStorage.getItem('tea_local_db') || '[]');
          const updated = currentLocal.map(t => {
              if (t.id === item.id && t.poll) {
                  const currentVotes = t.poll.votes || { a: 0, b: 0 };
                  const newVotes = { ...currentVotes, [option]: (currentVotes[option] || 0) + 1 };
                  return { ...t, poll: { ...t.poll, votes: newVotes } };
              }
              return t;
          });
          localStorage.setItem('tea_local_db', JSON.stringify(updated));
          setTea(processTeaList(updated, sortBy));
      } else {
          try {
             const docRef = (typeof __app_id !== 'undefined') 
                ? doc(db, 'artifacts', appId, 'public', 'data', 'confessions', item.id)
                : doc(db, 'confessions', item.id);
             await updateDoc(docRef, { [`poll.votes.${option}`]: increment(1) });
          } catch(e) { console.error(e); }
      }
  };

  // --- RENDER ---
  return (
    <div className={`relative w-full h-screen overflow-hidden ${theme.bg} text-white font-sans transition-colors duration-700`}>
      
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] ${theme.orb1} rounded-full blur-[120px] animate-pulse transition-colors duration-700`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] ${theme.orb2} rounded-full blur-[120px] animate-pulse delay-700 transition-colors duration-700`}></div>
        <div className={`absolute top-[40%] left-[30%] w-[300px] h-[300px] ${theme.orb3} rounded-full blur-[100px] animate-bounce duration-[10s] transition-colors duration-700`}></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </div>

      {/* LIGHTBOX */}
      {lightboxImage && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setLightboxImage(null)}>
              <img src={lightboxImage} alt="Full Receipt" className="max-w-full max-h-full rounded-lg shadow-2xl" />
              <button className="absolute top-4 right-4 bg-white/10 p-2 rounded-full text-white hover:bg-white/20"><X /></button>
          </div>
      )}

      {/* APP WRAPPER */}
      <div className="relative z-10 flex flex-col h-full max-w-md mx-auto border-x border-white/5 bg-black/20 backdrop-blur-sm">
        
        {/* HEADER */}
        <header className="flex flex-col gap-4 px-6 py-4 border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 bg-gradient-to-tr ${theme.accent} rounded-lg shadow-lg`}>
                <Coffee size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">tea.</h1>
                <div className="flex items-center gap-1 text-[10px] text-white/40 uppercase tracking-widest font-medium">
                    <span>{auraRank.emoji} {auraRank.title}</span>
                    <span className="w-1 h-1 rounded-full bg-white/30"></span>
                    <span>{aura} Aura</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
               {isOfflineMode ? <WifiOff size={16} className="text-red-400 animate-pulse" title="Offline Mode" /> : <Wifi size={16} className="text-green-400" title="Online" />}
               
               <button onClick={() => setShowThemePicker(!showThemePicker)} className={`p-2 rounded-full hover:bg-white/5 ${showThemePicker ? 'text-white' : 'text-white/40'} transition-colors`}><Palette size={18} /></button>
               <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors">{soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
            </div>
          </div>

          {showThemePicker && (
            <div className="flex gap-2 p-2 bg-white/5 rounded-xl justify-center animate-in slide-in-from-top-2">
                {Object.keys(THEMES).map((key) => (
                    <button key={key} onClick={() => { setCurrentTheme(key); setShowThemePicker(false); }} className={`text-xs px-3 py-1 rounded-full border transition-all ${currentTheme === key ? `bg-white/20 border-white text-white` : 'border-transparent text-white/40 hover:text-white'}`}>
                        {THEMES[key].name}
                    </button>
                ))}
            </div>
          )}

          <div className="flex items-center justify-between text-xs font-medium text-white/50">
            <div className="flex bg-black/20 rounded-full p-1 border border-white/5">
                <button onClick={() => setSortBy('new')} className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${sortBy === 'new' ? 'bg-white/10 text-white shadow-sm' : 'hover:text-white/80'}`}><Clock size={12} /> New</button>
                <button onClick={() => setSortBy('hot')} className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${sortBy === 'hot' ? 'bg-white/10 text-white shadow-sm' : 'hover:text-white/80'}`}><Flame size={12} className={sortBy === 'hot' ? 'text-orange-400' : ''} /> Hot</button>
            </div>
            <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isOfflineMode ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
                {isOfflineMode ? 'offline' : 'live'}
            </div>
          </div>
        </header>

        {/* FEED */}
        <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide space-y-6">
          {tea.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/30 gap-4">
              <Sparkles size={40} className="opacity-50" />
              <p className="text-sm font-light">It's quiet... too quiet.</p>
            </div>
          ) : (
            tea.map((msg) => (
              <TeaCard 
                key={msg.id} 
                msg={msg} 
                theme={theme}
                incrementAura={incrementAura}
                openLightbox={setLightboxImage}
                onSip={() => handleSip(msg)}
                onVote={(option) => handleVoteAction(msg, option)}
              />
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* NOTIFICATION TOAST */}
        {notification && (
          <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl animate-bounce flex items-center gap-2 z-50">
            <AlertTriangle size={14} />
            {notification.text}
          </div>
        )}

        {/* INPUT AREA */}
        <div className="p-4 bg-black/40 backdrop-blur-xl border-t border-white/5">
          {imagePreview && (
            <div className="mb-3 relative inline-block">
              <img src={imagePreview} alt="Preview" className="h-20 w-auto rounded-lg border border-white/20" />
              <button onClick={() => { setImageFile(null); setImagePreview(null); if(fileInputRef.current) fileInputRef.current.value = ""; }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"><X size={12} /></button>
            </div>
          )}

          {showPollCreator && (
              <div className="mb-3 bg-white/5 p-3 rounded-xl border border-white/10 animate-in slide-in-from-bottom-2">
                  <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold uppercase text-white/40 tracking-wider">Poll Options</span>
                      <button onClick={() => setShowPollCreator(false)} className="text-white/40 hover:text-white"><X size={12}/></button>
                  </div>
                  <div className="flex gap-2">
                      <input type="text" placeholder="Yes" className="w-1/2 bg-black/20 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-white/30" value={pollOptions.a} onChange={e => setPollOptions({...pollOptions, a: e.target.value})} maxLength={15} />
                      <input type="text" placeholder="No" className="w-1/2 bg-black/20 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-white/30" value={pollOptions.b} onChange={e => setPollOptions({...pollOptions, b: e.target.value})} maxLength={15} />
                  </div>
              </div>
          )}
          
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2 bg-white/5 rounded-full pl-3 pr-2 py-1 border border-white/5">
                <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold">AS:</span>
                {isEditingIdentity ? (
                    <form onSubmit={(e) => { e.preventDefault(); if (!userIdentity.trim()) setUserIdentity(generateIdentity()); setIsEditingIdentity(false); }} className="flex items-center">
                        <input ref={identityInputRef} type="text" value={userIdentity} onChange={(e) => setUserIdentity(e.target.value)} onBlur={() => setIsEditingIdentity(false)} className="bg-transparent border-none outline-none text-[10px] text-white font-bold w-24 placeholder-white/20" placeholder="Your Name" maxLength={15} />
                    </form>
                ) : (
                    <button onClick={() => setIsEditingIdentity(true)} className="text-[10px] text-white/90 font-bold hover:text-white truncate max-w-[80px] flex items-center gap-1">
                        {userIdentity || "Anon"} <Edit2 size={8} className="opacity-50" />
                    </button>
                )}
                <div className="w-px h-3 bg-white/10 mx-1"></div>
                <button onClick={() => { setUserIdentity(generateIdentity()); setIsEditingIdentity(false); }} className="text-white/30 hover:text-white transition-colors" title="Random Identity"><RefreshCw size={10} /></button>
            </div>
            <div className="flex gap-1.5">
                {POST_VIBES.map((vibe) => (
                    <button key={vibe.id} onClick={() => setSelectedVibe(vibe.id)} className={`w-4 h-4 rounded-full transition-all ${vibe.color} ${selectedVibe === vibe.id ? 'ring-2 ring-white scale-110' : 'opacity-40 hover:opacity-100'}`} title={vibe.name} />
                ))}
            </div>
          </div>

          <form onSubmit={handleSpill} className="relative flex items-end gap-2">
            <div className="flex-1 relative">
                {showEmojiPicker && (
                    <div className="absolute bottom-full left-0 mb-2 p-2 bg-[#1a1a1c] border border-white/10 rounded-2xl shadow-xl grid grid-cols-6 gap-2 animate-in slide-in-from-bottom-2 z-50 max-h-48 overflow-y-auto scrollbar-hide">
                        {POPULAR_EMOJIS.map(emoji => (
                            <button type="button" key={emoji} onClick={() => setInput(p => p + emoji)} className="text-xl hover:bg-white/10 p-1 rounded transition-colors">{emoji}</button>
                        ))}
                    </div>
                )}

              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="spill the tea (anon)..." maxLength={280} className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-3xl py-3.5 pl-10 pr-20 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all font-light" />
              
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`hover:text-yellow-400 transition-colors ${showEmojiPicker ? 'text-yellow-400' : 'text-white/40'}`}><Smile size={18} /></button>
                  <button type="button" onClick={() => setShowPollCreator(!showPollCreator)} className={`hover:text-blue-400 transition-colors ${showPollCreator ? 'text-blue-400' : 'text-white/40'}`}><BarChart2 size={18} /></button>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="text-white/40 hover:text-pink-400 transition-colors"><ImageIcon size={18} /></button>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                  const file = e.target.files[0];
                  if(file) {
                      if(file.size > 100000) { setNotification({text:"File too big (<100KB)", type:'error'}); return; }
                      const r = new FileReader();
                      r.onloadend = () => { setImageFile(file); setImagePreview(r.result); };
                      r.readAsDataURL(file);
                  }
              }} />
            </div>

            <button type="submit" disabled={(!input.trim() && !imagePreview) || isSpilling} className={`p-3.5 rounded-full bg-gradient-to-tr ${theme.accent} text-white shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex-shrink-0`}>
              {isSpilling ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: TEA CARD ---
function TeaCard({ msg, theme, openLightbox, onSip, onVote }) {
  const [showReceipt, setShowReceipt] = useState(false);
  const [hasSipped, setHasSipped] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const isHot = (msg.sips || 0) > 10;

  // Determine Card Style
  const getCardStyle = (styleId) => {
      switch(styleId) {
          case 0: return 'bg-gradient-to-br from-purple-500/10 to-blue-500/5 border-purple-500/20 hover:border-purple-500/40'; 
          case 1: return 'bg-gradient-to-br from-pink-500/10 to-rose-500/5 border-pink-500/20 hover:border-pink-500/40'; 
          case 2: return 'bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20 hover:border-green-500/40'; 
          case 3: return 'bg-gradient-to-br from-slate-500/10 to-gray-500/5 border-slate-500/20 hover:border-slate-500/40'; 
          default: return 'bg-white/5 border-white/10 hover:border-white/20';
      }
  };

  const handleCopy = () => {
      const text = document.createElement("textarea");
      text.value = msg.text;
      document.body.appendChild(text);
      text.select();
      document.execCommand('copy');
      document.body.removeChild(text);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
  };

  // Safe checks for poll properties
  const pollVotesA = msg.poll?.votes?.a || 0;
  const pollVotesB = msg.poll?.votes?.b || 0;
  const totalVotes = pollVotesA + pollVotesB || 1;

  return (
    <div className={`
      relative overflow-hidden p-5 rounded-2xl border transition-all duration-300 animate-in slide-in-from-bottom-4 fade-in group
      ${getCardStyle(msg.style)}
      backdrop-blur-md shadow-lg
      ${isHot ? 'shadow-[0_0_15px_rgba(255,165,0,0.15)] border-orange-500/30' : ''}
    `}>
      {isHot && (
          <div className="absolute top-0 right-0 bg-gradient-to-bl from-orange-500/20 to-transparent p-2 rounded-bl-2xl">
              <Flame size={14} className="text-orange-400 animate-pulse" />
          </div>
      )}

      {msg.identity && (
          <div className="mb-2 text-[10px] uppercase font-bold tracking-wider text-white/30 flex items-center gap-1">
             {msg.identity}
          </div>
      )}

      <p className="text-[15px] leading-relaxed font-light text-white/90 break-words whitespace-pre-wrap">
        {msg.text}
      </p>
      
      {msg.poll && msg.poll.options && (
          <div className="mt-3 bg-black/20 rounded-xl p-3 border border-white/5">
              <div className="flex gap-2">
                  <button disabled={hasVoted} onClick={() => { setHasVoted(true); onVote('a'); }} className="flex-1 bg-white/5 hover:bg-white/10 active:scale-95 transition-all py-2 rounded-lg text-xs font-bold text-white/80 disabled:opacity-50 relative overflow-hidden">
                      <span className="relative z-10">{msg.poll.options.a}</span>
                      {hasVoted && (
                          <div className="absolute inset-0 bg-white/10 z-0" style={{ width: `${(pollVotesA / totalVotes) * 100}%` }}></div>
                      )}
                      {hasVoted && <span className="ml-1 opacity-60">({pollVotesA})</span>}
                  </button>
                  <button disabled={hasVoted} onClick={() => { setHasVoted(true); onVote('b'); }} className="flex-1 bg-white/5 hover:bg-white/10 active:scale-95 transition-all py-2 rounded-lg text-xs font-bold text-white/80 disabled:opacity-50 relative overflow-hidden">
                      <span className="relative z-10">{msg.poll.options.b}</span>
                      {hasVoted && (
                          <div className="absolute inset-0 bg-white/10 z-0" style={{ width: `${(pollVotesB / totalVotes) * 100}%` }}></div>
                      )}
                      {hasVoted && <span className="ml-1 opacity-60">({pollVotesB})</span>}
                  </button>
              </div>
          </div>
      )}

      {msg.image && (
        <div className="mt-3 relative group cursor-pointer" onClick={() => showReceipt ? openLightbox(msg.image) : setShowReceipt(true)}>
          <div className={`relative rounded-lg overflow-hidden border border-white/10 transition-all duration-500 ${showReceipt ? 'blur-0' : 'blur-md hover:blur-sm'}`}>
            <img src={msg.image} alt="Receipt" className="w-full h-auto object-cover max-h-60" />
            {!showReceipt && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="bg-black/50 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider text-white backdrop-blur-md flex items-center gap-2 border border-white/20">
                  <EyeOff size={10} /> tap to view receipts
                </div>
              </div>
            )}
            {showReceipt && (
               <div className="absolute bottom-2 right-2 bg-black/50 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-black/70">
                   <Maximize2 size={12} />
               </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-end justify-between text-white/30">
        <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase">
          <Clock size={10} />
          {getTimeAgo(msg.createdAt)}
        </div>

        <div className="flex items-center gap-2">
            <button onClick={handleCopy} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-white/10 text-white/20 hover:text-white" title="Share">
                {showCopied ? <Check size={12} className="text-green-400" /> : <Share2 size={12} />}
            </button>
            <button onClick={() => alert("Reported to moderators.")} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-white/10 text-white/20 hover:text-red-400" title="Flag toxic content">
                <Flag size={12} />
            </button>
            <button onClick={() => { if(!hasSipped) { setHasSipped(true); onSip(); } }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${hasSipped ? `bg-white/10 ${theme.icon} border border-white/20` : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5'}`}>
                <Coffee size={12} className={hasSipped ? "fill-current" : ""} />
                <span>{msg.sips || 0}</span>
            </button>
        </div>
      </div>
    </div>
  );
}