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
  increment,
  deleteField,
  arrayUnion
} from 'firebase/firestore';
import { 
  Send, Clock, Sparkles, Zap, 
  X, Smile, RefreshCw,
  Palette, Droplets, Coffee, 
  Check, Star, Flame, Skull, Heart, Ghost, Edit3, Search, StickyNote, Info, ImageOff, AlertTriangle
} from 'lucide-react';

// --- 1. FIREBASE CONFIGURATION ---
const userFirebaseConfig = {
  apiKey: "AIzaSyAiawH4K9GaHGjOJ4qbjQkJrtRWe_dqCpY",
  authDomain: "tea-confessions.firebaseapp.com",
  projectId: "tea-confessions",
  storageBucket: "tea-confessions.firebasestorage.app",
  messagingSenderId: "751037797594",
  appId: "1:751037797594:web:7ccefa8c5b75c0d18b81e3",
  measurementId: "G-Y2FH43XZ3C"
};

const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : userFirebaseConfig;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'tea-confessions-v1';

const FALLBACK_STICKERS = [
  { id: 'j5L4RHeV8Q5tmepRVb', url: 'https://i.giphy.com/media/j5L4RHeV8Q5tmepRVb/giphy.gif' },
  { id: '3ohc1eCJLScHDWQ20o', url: 'https://i.giphy.com/media/3ohc1eCJLScHDWQ20o/giphy.gif' },
  { id: 'kv61bAVDv9CJ3SuC2a', url: 'https://i.giphy.com/media/kv61bAVDv9CJ3SuC2a/giphy.gif' },
  { id: 'mFA2mRBIpm1t6T9Aks', url: 'https://i.giphy.com/media/mFA2mRBIpm1t6T9Aks/giphy.gif' },
  { id: 'In0Lpu4FVivjISX9HT', url: 'https://i.giphy.com/media/In0Lpu4FVivjISX9HT/giphy.gif' },
  { id: 'P8CC8QCewsRhRTTQpx', url: 'https://i.giphy.com/media/P8CC8QCewsRhRTTQpx/giphy.gif' },
  { id: 'UmnWEKDFoPmcZHmwFl', url: 'https://i.giphy.com/media/UmnWEKDFoPmcZHmwFl/giphy.gif' },
  { id: 'jTnGaiuxvvDNK', url: 'https://i.giphy.com/media/jTnGaiuxvvDNK/giphy.gif' },
  { id: 'pY8jLmZw0ElqvVeRH4', url: 'https://i.giphy.com/media/pY8jLmZw0ElqvVeRH4/giphy.gif' },
  { id: '5aCiXMnPl1cli', url: 'https://i.giphy.com/media/5aCiXMnPl1cli/giphy.gif' },
  { id: '3MwLGbvFjwhHvXJNVM', url: 'https://i.giphy.com/media/3MwLGbvFjwhHvXJNVM/giphy.gif' },
  { id: 'SWoXEoE1lA0uSQcF1h', url: 'https://i.giphy.com/media/SWoXEoE1lA0uSQcF1h/giphy.gif' },
  { id: 'gKHGnB1ml0moQdjhEJ', url: 'https://i.giphy.com/media/gKHGnB1ml0moQdjhEJ/giphy.gif' },
  { id: 'u7A8q8nbNuJqcGCeU6', url: 'https://i.giphy.com/media/u7A8q8nbNuJqcGCeU6/giphy.gif' },
  { id: 'sr8jYZVVsCmxddga8w', url: 'https://i.giphy.com/media/sr8jYZVVsCmxddga8w/giphy.gif' },
  { id: 'G5Ed9LJqPKfew', url: 'https://i.giphy.com/media/G5Ed9LJqPKfew/giphy.gif' },
  { id: 'kq1KSSLxmvlzG', url: 'https://i.giphy.com/media/kq1KSSLxmvlzG/giphy.gif' },
  { id: 'QEeQB8Kosm8Yh5WOF5', url: 'https://i.giphy.com/media/QEeQB8Kosm8Yh5WOF5/giphy.gif' },
  { id: 'J5411fGvSOviQuemEi', url: 'https://i.giphy.com/media/J5411fGvSOviQuemEi/giphy.gif' },
  { id: 'TUgeUheZm54vzBHwpB', url: 'https://i.giphy.com/media/TUgeUheZm54vzBHwpB/giphy.gif' },
  { id: 'OOeKVbtXrd0cJhJFHh', url: 'https://i.giphy.com/media/OOeKVbtXrd0cJhJFHh/giphy.gif' },
  { id: 'PS7d4tm1Hq6Sk', url: 'https://i.giphy.com/media/PS7d4tm1Hq6Sk/giphy.gif' },
  { id: 'f8ywYgttpGzzVPH5AO', url: 'https://i.giphy.com/media/f8ywYgttpGzzVPH5AO/giphy.gif' },
  { id: 'nTE6nHdPzsO26VbrYh', url: 'https://i.giphy.com/media/nTE6nHdPzsO26VbrYh/giphy.gif' },
  { id: 'JIX9t2j0ZTN9S', url: 'https://i.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif' },
  { id: '3og0IuE1EjI5ZQzr3i', url: 'https://i.giphy.com/media/3og0IuE1EjI5ZQzr3i/giphy.gif' },
  { id: '2UBzpyM7naBtCzq4Cz', url: 'https://i.giphy.com/media/2UBzpyM7naBtCzq4Cz/giphy.gif' },
  { id: 'RCX9vhBZu3oqM5SpwV', url: 'https://i.giphy.com/media/RCX9vhBZu3oqM5SpwV/giphy.gif' },
  { id: 'zDfdPBJBVQ2P2Vt7HU', url: 'https://i.giphy.com/media/zDfdPBJBVQ2P2Vt7HU/giphy.gif' },
  { id: 'l0He8XWUYnXlbzleg', url: 'https://i.giphy.com/media/l0He8XWUYnXlbzleg/giphy.gif' },
  { id: 'xFnM1NeZZtvvUlVV5E', url: 'https://i.giphy.com/media/xFnM1NeZZtvvUlVV5E/giphy.gif' }
];

const THEMES = {
  cyber: { name: 'Cyber Acid', bg: 'from-black to-green-900/40', accent: '#ccff00', card: 'bg-black/80', border: 'border-[#ccff00]/40', text: 'text-[#ccff00]', img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000" },
  anime: { name: 'Anime Lo-Fi', bg: 'from-indigo-900/60 to-black/90', accent: '#60a5fa', card: 'bg-black/60', border: 'border-blue-400/30', text: 'text-blue-300', img: "https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=1000" },
  dream: { name: 'Dreamcore', bg: 'from-purple-300/40 to-blue-200/40', accent: '#ffffff', card: 'bg-white/20', border: 'border-white/50', text: 'text-white', img: "https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a?q=80&w=1000" },
  glitch: { name: 'Glitch Night', bg: 'from-black via-purple-900/80 to-black', accent: '#ff00ff', card: 'bg-black/80', border: 'border-[#00ffff]/40', text: 'text-[#ff00ff]', img: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000" },
  barbie: { name: 'Y2K Glitter', bg: 'from-[#ff0080]/60 via-[#ff85c0]/60 to-[#ff0080]/60', accent: '#ffffff', card: 'bg-white/30', border: 'border-white/50', text: 'text-white', img: "https://images.unsplash.com/photo-1596434316352-78d1f868d4d2?q=80&w=1000" },
  midnight: { name: 'Midnight Club', bg: 'from-[#000428]/80 via-[#004e92]/80 to-[#000000]', accent: '#00d2ff', card: 'bg-black/60', border: 'border-[#00d2ff]/30', text: 'text-blue-400', img: "https://images.unsplash.com/photo-1500673922987-e212871fec22?q=80&w=1000" },
  sunset: { name: 'Aura Sunset', bg: 'from-[#ff512f]/60 via-[#dd2476]/60 to-[#000000]', accent: '#ffd700', card: 'bg-black/40', border: 'border-[#ff512f]/40', text: 'text-orange-400', img: "https://images.unsplash.com/photo-1475924156736-452f740d2ecd?q=80&w=1000" },
  boba: { name: 'Boba Neon', bg: 'from-[#d7ccc8]/80 via-[#a1887f]/80 to-[#5d4037]', accent: '#3e2723', card: 'bg-white/30', border: 'border-[#3e2723]/30', text: 'text-[#3e2723]', img: "https://images.unsplash.com/photo-1558857563-b371f3036ef5?q=80&w=1000" },
  toxic: { name: 'Toxic Waste', bg: 'from-black to-yellow-950', accent: '#faff00', card: 'bg-black/90', border: 'border-[#faff00]/50', text: 'text-[#faff00]', img: "https://images.unsplash.com/photo-1510511459019-5dee9954889c?q=80&w=1000" },
  cloud: { name: 'Cloud 9', bg: 'from-[#e3f2fd]/60 via-[#bbdefb]/60 to-[#90caf9]', accent: '#1565c0', card: 'bg-white/50', border: 'border-white/70', text: 'text-[#0d47a1]', img: "https://images.unsplash.com/photo-1499346030926-9a72daac6c63?q=80&w=1000" },
  retro: { name: 'Retro Arcade', bg: 'from-black to-red-950/80', accent: '#ff0000', card: 'bg-black/70', border: 'border-[#ff0000]/40', text: 'text-[#ff0000]', img: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?q=80&w=1000" },
  coquette: { name: 'Coquette', bg: 'from-pink-100/90 to-white', accent: '#ff69b4', card: 'bg-white/60', border: 'border-[#ff69b4]/30', text: 'text-[#db7093]', img: "https://images.unsplash.com/photo-1516192535944-07fb50221491?q=80&w=1000" },
  forest: { name: 'Forest Grunge', bg: 'from-green-950/70 to-black', accent: '#8bc34a', card: 'bg-black/40', border: 'border-[#8bc34a]/30', text: 'text-[#aed581]', img: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1000" },
  space: { name: 'Nebula', bg: 'from-indigo-950 to-black', accent: '#9c27b0', card: 'bg-black/50', border: 'border-purple-500/30', text: 'text-purple-300', img: "https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=1000" },
  academia: { name: 'Dark Academia', bg: 'from-stone-900 to-black', accent: '#d4af37', card: 'bg-black/40', border: 'border-[#d4af37]/30', text: 'text-[#d4af37]', img: "https://images.unsplash.com/photo-1513001900722-370f803f498d?q=80&w=1000" }
};

const POST_VIBES = [
  { id: 0, name: 'BASED', color: 'bg-green-400', border: 'border-green-400', glow: 'shadow-[0_0_10px_#4ade80]' },
  { id: 1, name: 'CRINGE', color: 'bg-orange-500', border: 'border-orange-500', glow: 'shadow-[0_0_10px_#f97316]' },
  { id: 2, name: 'REAL', color: 'bg-blue-400', border: 'border-blue-400', glow: 'shadow-[0_0_10px_#60a5fa]' },
  { id: 3, name: 'DOWN BAD', color: 'bg-pink-500', border: 'border-pink-500', glow: 'shadow-[0_0_10px_#ec4899]' },
  { id: 4, name: 'DARK', color: 'bg-purple-800', border: 'border-purple-800', glow: 'shadow-[0_0_15px_#6b21a8]' }
];

const REACTION_TYPES = [
  { id: 'skull', icon: '💀' }, 
  { id: 'fire', icon: '🔥' }, 
  { id: 'heart', icon: '❤️' }, 
  { id: 'hundred', icon: '💯' }, 
  { id: 'nail', icon: '💅' }, 
  { id: 'clown', icon: '🤡' }
];

const RANKS = [
  { title: 'NPC', minXP: 0, maxXP: 49, emoji: '🤖', desc: 'SIMULATION PHASE. prove you are a real player.' },
  { title: 'Lurker', minXP: 50, maxXP: 149, emoji: '👀', desc: 'SHADOW REALM. You stay in the shadows.' },
  { title: 'Main Character', minXP: 150, maxXP: 499, emoji: '✨', desc: 'PLOT ARMOR. The timeline revolves around you.' },
  { title: 'Tea God', minXP: 500, maxXP: Infinity, emoji: '👑', desc: 'SIMULATION BROKEN. Your words are law.' }
];

const EMOJI_CATEGORIES = {
  'Vibes': ['💀', '🤡', '😭', '🔥', '👀', '💅', '🧢', '🤌', '🫠', '🫡', '🤫', '🙄', '🥵', '🥶'],
  'Moods': ['🫥', '🫣', '😮‍💨', '🤬', '🥴', '😴', '🧿', '🚩', '💣', '🧨', '🔪', '🗑️', '🥀', '🩹'],
  'Hype': ['✨', '💯', '🚀', '👑', '💎', '💸', '🛸', '🗿', '🎯', '🌊', '👽', '🍿', '🥤', '🍰']
};

const generateIdentity = () => {
  const adjs = ['Verified', 'Unhinged', 'Based', 'Feral', 'Main', 'Rare', 'Toxic', 'Savage', 'Cringe'];
  const nouns = ['Bestie', 'Opp', 'Simp', 'NPC', 'CEO', 'Lurker', 'Stan', 'Demon', 'Matcha'];
  return `${adjs[Math.floor(Math.random() * adjs.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
};

// --- NEW EXPIRY TIME LOGIC ---
const getExpiryTime = (createdAt) => {
  if (!createdAt) return '24h 00m';
  const createdDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  const expiryDate = new Date(createdDate.getTime() + 24 * 60 * 60 * 1000);
  const diff = expiryDate.getTime() - Date.now();
  
  if (diff <= 0) return 'EXPIRED';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
};

// --- 3. MAIN COMPONENT ---
export default function App() {
  const [user, setUser] = useState(null);
  const [tea, setTea] = useState([]);
  const [input, setInput] = useState('');
  const [isSpilling, setIsSpilling] = useState(false);
  const [sortBy, setSortBy] = useState('new'); 
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [userIdentity, setUserIdentity] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [selectedVibe, setSelectedVibe] = useState(2); 
  const [currentTheme, setCurrentTheme] = useState('cyber');
  const [aura, setAura] = useState(0);
  const [showRankTooltip, setShowRankTooltip] = useState(false);
  const [activePickerTab, setActivePickerTab] = useState('Vibes');

  const [stickerSearch, setStickerSearch] = useState('');
  const [stickers, setStickers] = useState([]);
  const [selectedSticker, setSelectedSticker] = useState(null); 
  const [isSearchingStickers, setIsSearchingStickers] = useState(false);
  const [stickerError, setStickerError] = useState(false);

  const scrollRef = useRef(null);
  const endRef = useRef(null);
  const theme = THEMES[currentTheme] || THEMES.cyber;
  const currentRank = RANKS.find(r => aura >= r.minXP && aura <= r.maxXP) || RANKS[0];

  const handleInputChange = (e) => setInput(e.target.value);

  const performScrolling = () => {
      if (sortBy === 'new') {
          endRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
          scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };

  const applyVibeStyle = (vibeId) => {
    if (!input.trim()) return;
    let text = input.trim();
    text = text.replace(/[🗿🤡🤌💯✨🫠💔💀]/g, '').trim();
    switch (vibeId) {
      case 0: text = text.toUpperCase() + " 🗿"; break;
      case 1: text = text.toLowerCase() + " 🤡🤌"; break;
      case 2: text = text + " 💯✨"; break;
      case 3: text = text + " 🫠💔"; break;
      case 4: text = text.split('').join(' ') + " 💀"; break;
    }
    setInput(text);
  };

  const handleVibeClick = (vibeId) => {
    setSelectedVibe(vibeId);
    applyVibeStyle(vibeId);
  };

  useEffect(() => {
    if (activePickerTab !== 'Stickers' || !showEmojiPicker) return;

    const fetchStickers = async () => {
      setIsSearchingStickers(true);
      setStickerError(false);
      try {
        const apiKey = "dc6zaTOxFJmzC"; // Public beta key
        const queryTerm = stickerSearch.trim();
        let endpoint = `https://api.giphy.com/v1/stickers/trending?api_key=${apiKey}&limit=21&rating=pg-13`;
        
        if (queryTerm) {
          endpoint = `https://api.giphy.com/v1/stickers/search?api_key=${apiKey}&q=${encodeURIComponent(queryTerm)}&limit=21&rating=pg-13`;
        }

        const res = await fetch(endpoint);
        if (!res.ok) throw new Error("API Limit");
        const data = await res.json();
        
        if (!data.data || data.data.length === 0) throw new Error("No results");

        setStickers(data.data.map(s => ({
          id: s.id,
          url: `https://i.giphy.com/media/${s.id}/giphy.gif`,
          preview: s.images.preview_gif?.url || `https://i.giphy.com/media/${s.id}/giphy.gif`
        })));
      } catch (err) {
        setStickerError(true);
        setStickers(FALLBACK_STICKERS.map(s => ({ ...s, preview: s.url })));
      } finally {
        setIsSearchingStickers(false);
      }
    };

    const timeoutId = setTimeout(fetchStickers, 500);
    return () => clearTimeout(timeoutId);
  }, [stickerSearch, activePickerTab, showEmojiPicker]);

  useEffect(() => {
    setUserIdentity(generateIdentity());
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) { 
        console.error("Auth Error:", e);
        await signInAnonymously(auth).catch(err => console.error("Final Auth Failure:", err));
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const teaCollection = collection(db, 'artifacts', appId, 'public', 'data', 'confessions');
    const unsubscribe = onSnapshot(query(teaCollection), (snapshot) => {
      let teaData = snapshot.docs.map(doc => {
        const data = doc.data();
        const totalReactions = Object.values(data.reactions || {}).reduce((a, b) => a + b, 0);
        return { 
          id: doc.id, 
          ...data,
          hypeScore: (data.sips || 0) + (totalReactions * 2) 
        };
      });

      if (sortBy === 'hot') {
        teaData = teaData.sort((a, b) => b.hypeScore - a.hypeScore);
      } else {
        teaData = teaData.sort((a, b) => {
          const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return tA - tB;
        });
      }
      setTea(teaData);
      setTimeout(performScrolling, 100);
    }, (err) => console.error("Firestore Error:", err));
    return () => unsubscribe();
  }, [user, sortBy]);

  const handleSpill = async (e) => {
    if (e) e.preventDefault();
    const cleanInput = String(input).trim();
    if ((!cleanInput && !selectedSticker) || !user || isSpilling) return;
    setIsSpilling(true);

    const finalContent = cleanInput + (selectedSticker ? ` ${selectedSticker}` : '');

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'confessions'), {
        text: finalContent,
        sips: 0,
        createdAt: serverTimestamp(),
        authorId: user.uid,
        identity: String(userIdentity || "Anon"), 
        style: selectedVibe,
        reactions: {}, 
        userReactions: {}, 
        sippedBy: []
      });
      setInput('');
      setSelectedSticker(null);
      setAura(a => a + 15);
      setShowEmojiPicker(false);
    } catch (e) { console.error("Firebase Add Error:", e); } finally { setIsSpilling(false); }
  };

  const handleReaction = async (msgId, reactionId) => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'confessions', msgId);
    const msg = tea.find(t => t.id === msgId);
    if (!msg) return;

    const currentReaction = msg.userReactions?.[user.uid];

    if (currentReaction === reactionId) {
      await updateDoc(docRef, {
        [`reactions.${reactionId}`]: increment(-1),
        [`userReactions.${user.uid}`]: deleteField()
      });
    } else {
      const updates = {
        [`reactions.${reactionId}`]: increment(1),
        [`userReactions.${user.uid}`]: reactionId
      };
      if (currentReaction) updates[`reactions.${currentReaction}`] = increment(-1);
      await updateDoc(docRef, updates);
      setAura(a => a + 2);
    }
  };

  return (
    <div 
      className={`relative w-full h-screen overflow-hidden text-white transition-all duration-700 bg-cover bg-center bg-no-repeat`}
      style={{ backgroundImage: theme.img ? `url(${theme.img})` : 'none' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Plus+Jakarta+Sans:wght@700;800&family=Bungee&family=Rubik+Mono+One&display=swap');
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .logo-font { font-family: 'Bungee', cursive; }
        .sticker-font { font-family: 'Rubik Mono One', sans-serif; }
        .identity-font { font-family: 'Space Grotesk', sans-serif; font-weight: 700; }
        .message-font { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; }
        
        @keyframes glitch {
          0% { transform: translate(0); text-shadow: -1px 0 #ff00c1, 1px 0 #00fff9; }
          20% { transform: translate(-1px, 1px); }
          40% { transform: translate(1px, -1px); text-shadow: 1px 0 #ff00c1, -1px 0 #00fff9; }
          60% { transform: translate(-1px, -1px); }
          100% { transform: translate(0); }
        }
        .glitch-hover:hover {
          animation: glitch 0.2s cubic-bezier(.25,.46,.45,.94) both infinite;
        }

        .sticker-stack > div {
          box-shadow: 2px 2px 0px black;
        }
      `}</style>

      <div className={`absolute inset-0 z-0 bg-gradient-to-br ${theme.bg} ${theme.img ? 'opacity-85' : 'opacity-100'}`}></div>
      
      <div className="relative z-10 flex flex-col h-full max-w-lg mx-auto bg-black/40 backdrop-blur-3xl border-x-2 border-white/5 shadow-2xl">
        
        <header className="px-4 py-4 border-b-2 border-white/10 bg-black/30 shrink-0 overflow-visible">
          <div className="flex items-center justify-between gap-4">
            
            {/* NEW CREATIVE GEN Z LOGO */}
            <div className="relative group cursor-pointer flex-shrink-0 pt-2">
              <div className="absolute -inset-1 bg-yellow-400 -rotate-3 rounded-sm opacity-80 group-hover:rotate-3 transition-transform"></div>
              <div className="absolute -inset-1 bg-pink-500 rotate-2 rounded-sm opacity-80 group-hover:-rotate-2 transition-transform"></div>
              <div className="relative bg-black border-2 border-white px-3 py-1 flex flex-col items-center shadow-2xl">
                <span className="sticker-font text-white text-[8px] leading-none tracking-[0.2em] mb-1 opacity-60">ULTRA_SECRET</span>
                <div className="flex items-center gap-1">
                  <span className="logo-font text-xl text-[#ccff00] leading-none glitch-hover">SPILL</span>
                  <div className="h-5 w-0.5 bg-white/20 rotate-12 mx-1"></div>
                  <span className="logo-font text-xl text-white leading-none glitch-hover">TEA</span>
                </div>
                <div className="w-full h-0.5 bg-white/10 my-1"></div>
                <div className="flex items-center gap-1.5">
                  <span className="sticker-font text-[7px] text-[#ff0080] tracking-widest uppercase">BURN_IN_24H</span>
                  <AlertTriangle size={8} className="text-[#ff0080]" />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 text-right">
                <div className="bg-white text-black px-2 py-0.5 skew-x-[-15deg] text-[9px] font-black uppercase tracking-tighter shadow-lg italic">AURA // {aura}XP</div>
                <div className="flex items-center gap-2 relative">
                  <div className="text-[9px] font-black text-white/40 uppercase tracking-widest bg-white/5 px-1.5 py-0.5 rounded-md border border-white/5 animate-pulse">{theme.name}</div>
                  <div 
                    className="px-2 py-0.5 bg-black/50 text-white rounded-full text-[9px] font-bold border border-white/20 flex items-center gap-1 cursor-help transition-all hover:border-white select-none z-[60]"
                    onMouseEnter={() => setShowRankTooltip(true)}
                    onMouseLeave={() => setShowRankTooltip(false)}
                    onClick={() => setShowRankTooltip(!showRankTooltip)}
                  >
                    {String(currentRank.emoji)} {String(currentRank.title)}
                  </div>
                </div>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-between p-2 bg-black/20 shrink-0">
            <div className="flex gap-2">
                <button 
                  onClick={() => setSortBy('new')} 
                  className={`px-4 py-1.5 text-[9px] font-black uppercase rounded-lg border-2 transition-all ${sortBy === 'new' ? 'bg-white text-black border-white' : 'bg-black/40 text-white/60 border-white/10'}`}
                >LATEST</button>
                <button 
                  onClick={() => setSortBy('hot')} 
                  className={`px-4 py-1.5 text-[9px] font-black uppercase rounded-lg border-2 transition-all ${sortBy === 'hot' ? 'bg-white text-black border-white' : 'bg-black/40 text-white/60 border-white/10'}`}
                >TRENDING</button>
            </div>
            <button 
              onClick={() => {
                  const keys = Object.keys(THEMES);
                  const nextIdx = (keys.indexOf(currentTheme) + 1) % keys.length;
                  setCurrentTheme(keys[nextIdx]);
              }}
              className="p-1.5 border-2 border-white rounded-full active:scale-90 hover:bg-white hover:text-black transition-all shadow-lg"
            >
              <Palette size={16} />
            </button>
        </div>

        {/* FEED */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar scroll-smooth">
          {tea.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-30 gap-4 text-center px-10">
              <Droplets size={64} className="animate-bounce text-[#ccff00]" />
              <p className="text-[12px] font-black tracking-widest uppercase text-white/70">THE POT IS EMPTY. SPILL SOMETHING UNHINGED TO START THE TIMELINE.</p>
            </div>
          ) : (
            tea.map((msg) => <TeaCard 
              key={msg.id} 
              msg={msg} 
              currentUid={user?.uid} 
              currentTheme={theme}
              onReact={(rid) => handleReaction(msg.id, rid)}
              onSip={() => {
                if (!user || msg.sippedBy?.includes(user.uid)) return;
                updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'confessions', msg.id), { sips: increment(1), sippedBy: arrayUnion(user.uid) });
                setAura(a => a + 5);
              }} 
            />)
          )}
          <div ref={endRef} className="h-4" />
        </div>

        <div className="p-2 bg-black/90 border-t-2 border-white/10 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col gap-1.5 mb-2">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => { setUserIdentity(generateIdentity()); setIsEditingName(false); }} className="p-1 bg-white text-black rounded shadow active:rotate-180 transition-transform"><RefreshCw size={12} /></button>
                    {isEditingName ? (
                        <div className="flex items-center gap-1">
                            <input 
                              autoFocus
                              value={userIdentity} 
                              onChange={(e) => setUserIdentity(e.target.value)}
                              onBlur={() => setIsEditingName(false)}
                              onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                              className="bg-white/10 border-b-2 border-[#ccff00] text-[12px] identity-font text-white uppercase focus:outline-none px-1.5 py-0.5 rounded w-28"
                            />
                            <button onClick={() => setIsEditingName(false)} className="p-0.5 bg-[#ccff00] text-black rounded"><Check size={10}/></button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditingName(true)} className="text-[12px] identity-font text-white uppercase tracking-tight flex items-center gap-1.5 hover:text-[#ccff00] transition-colors group">
                          {String(userIdentity || "GUEST_USER")}
                          <Edit3 size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    )}
                </div>
                
                <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                    <span className="text-[7px] font-black text-white/30 uppercase mr-1">Vibe</span>
                    {POST_VIBES.map((v) => (
                        <button key={v.id} onClick={() => handleVibeClick(v.id)} className={`w-3.5 h-3.5 border-2 rounded-full transition-all hover:scale-125 ${selectedVibe === v.id ? `${v.color} border-white scale-110 ${v.glow}` : 'bg-transparent border-white/10'}`} />
                    ))}
                </div>
             </div>
          </div>

          <form onSubmit={handleSpill} className="flex flex-col gap-2">
             <div className="flex items-center bg-white/5 border border-white/10 focus-within:border-white/30 transition-all rounded-xl relative shadow-inner overflow-hidden">
                <div className="flex shrink-0">
                    <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-1.5 transition-all ${showEmojiPicker ? 'text-[#ccff00]' : 'text-white/40'}`}><Smile size={20} /></button>
                </div>
                
                <div className="flex-1 flex items-center min-w-0">
                  {selectedSticker && (
                    <div className="relative shrink-0 flex items-center">
                      <img 
                        src={selectedSticker} 
                        alt="preview" 
                        className="h-8 w-auto max-w-[50px] object-contain rounded animate-in zoom-in duration-300" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setSelectedSticker(null)} 
                        className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 text-white shadow-lg z-10"
                      >
                        <X size={8} />
                      </button>
                    </div>
                  )}
                  <input 
                    value={input} 
                    onChange={handleInputChange} 
                    placeholder={selectedSticker ? "" : "WHAT'S THE TEA?"} 
                    className={`flex-1 bg-transparent border-none text-white focus:outline-none font-bold text-[14px] py-2 placeholder-white/5 font-sans uppercase min-w-[50px] ${selectedSticker ? 'pl-1' : 'px-1.5'}`} 
                  />
                </div>
                
                <button 
                    type="submit" 
                    disabled={isSpilling || (!String(input).trim() && !selectedSticker)} 
                    className={`relative px-4 py-2 ${isSpilling ? 'bg-gray-500' : 'bg-[#ccff00]'} text-black font-black italic tracking-tighter text-[12px] uppercase overflow-hidden active:translate-y-0.5 transition-all disabled:opacity-10 group shrink-0`}
                >
                    <span className="relative z-10">{isSpilling ? '...' : 'SPILL'}</span>
                    <div className="absolute inset-0 bg-white/40 -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                </button>
             </div>

             {showEmojiPicker && (
                <div className="mt-1 p-3 bg-black/95 border border-white/10 rounded-xl h-64 overflow-hidden flex flex-col animate-in slide-in-from-bottom-2 z-50 shadow-2xl">
                  <div className="flex gap-1.5 mb-3 overflow-x-auto no-scrollbar pb-1.5 border-b border-white/5">
                    {['Vibes', 'Moods', 'Hype', 'Stickers'].map(tab => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActivePickerTab(tab)}
                        className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-full whitespace-nowrap transition-all ${activePickerTab === tab ? 'bg-[#ccff00] text-black' : 'bg-white/5 text-white/40'}`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 overflow-y-auto no-scrollbar">
                    {activePickerTab === 'Stickers' ? (
                      <div className="flex flex-col h-full">
                        <div className="relative mb-2 flex gap-1.5">
                          <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20" size={12} />
                            <input
                              type="text"
                              value={stickerSearch}
                              onChange={(e) => setStickerSearch(e.target.value)}
                              placeholder="Search stickers..."
                              className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-2 py-1.5 text-[11px] text-white placeholder-white/20 focus:outline-none focus:border-[#ccff00]"
                            />
                          </div>
                        </div>

                        {isSearchingStickers && (
                          <div className="flex-1 flex items-center justify-center flex-col gap-1.5 opacity-20">
                            <RefreshCw size={20} className="animate-spin" />
                            <span className="text-[8px] uppercase font-black">Digging Giphy...</span>
                          </div>
                        )}

                        {!isSearchingStickers && (
                          <div className="grid grid-cols-3 gap-1.5 pb-2">
                            {stickers.map((s) => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => {
                                  setSelectedSticker(s.url); 
                                  setShowEmojiPicker(false);
                                }}
                                className="aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/5 hover:border-[#ccff00] transition-all relative group flex items-center justify-center"
                              >
                                <img src={s.preview} alt="sticker" className="w-4/5 h-4/5 object-contain" loading="lazy" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <div className="text-[8px] font-black text-white/20 mb-2 uppercase tracking-widest">{activePickerTab}</div>
                          <div className="grid grid-cols-8 gap-2">
                            {EMOJI_CATEGORIES[activePickerTab].map((e, idx) => (
                              <button key={idx} type="button" onClick={() => setInput(prev => String(prev) + String(e))} className="text-xl hover:scale-125 transition-transform">{String(e)}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
             )}
          </form>
        </div>
      </div>
    </div>
  );
}

function TeaCard({ msg, currentUid, onSip, onReact, currentTheme }) {
  const [showVibeMenu, setShowVibeMenu] = useState(false);
  const [loadError, setLoadError] = useState({});
  const [expiryText, setExpiryText] = useState(getExpiryTime(msg.createdAt));
  
  const vibe = POST_VIBES.find(v => v.id === msg.style) || POST_VIBES[0];
  const reactions = msg.reactions || {};
  const myRId = msg.userReactions?.[currentUid];
  const totalR = Object.values(reactions).reduce((a, b) => a + b, 0);
  const hasSipped = msg.sippedBy?.includes(currentUid);

  const spiceScore = (Number(msg.sips) || 0) + (totalR * 2);
  const spiceLevel = Math.min(Math.max(Math.floor(spiceScore / 5) + 1, 1), 5);

  // Update expiry timer every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setExpiryText(getExpiryTime(msg.createdAt));
    }, 60000);
    return () => clearInterval(timer);
  }, [msg.createdAt]);

  const renderContent = () => {
    const tokens = String(msg.text).split(/\s+/);
    return tokens.map((part, i) => {
      if (part.match(/^https?:\/\/.*(giphy\.com\/media|giphy\.gif|i\.giphy\.com|\.gif$)/i)) {
        if (loadError[i]) return null;
        
        return (
          <div key={i} className="my-2 py-1 flex justify-center">
             <img 
               src={part} 
               alt="sticker" 
               className="max-h-40 w-auto block animate-in zoom-in duration-500" 
               onError={() => setLoadError(prev => ({ ...prev, [i]: true }))}
             />
          </div>
        );
      }
      return <span key={part + i}>{part} </span>;
    });
  };

  return (
    <div className={`p-4 border-2 ${currentTheme.border} ${currentTheme.card} relative shadow-xl rounded-[1.5rem] transition-all group overflow-hidden`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${vibe.color} opacity-40`}></div>
      
      <div className="flex justify-between items-start mb-3 pl-1">
          <div className="flex items-center gap-3">
             <div className={`h-10 w-10 ${vibe.color} flex items-center justify-center text-[16px] text-black border-2 border-black shadow-lg font-black rounded-xl uppercase transform -rotate-3 transition-transform group-hover:rotate-0`}>{String(msg.identity || "A").charAt(0)}</div>
             <div className="flex flex-col gap-0.5">
                <span className="identity-font text-[13px] text-white tracking-tight uppercase leading-none font-bold">{String(msg.identity || "ANON")}</span>
                <div className="flex items-center gap-1.5">
                    <span className={`text-[7px] font-black w-fit px-1.5 py-0.5 border border-black uppercase ${vibe.color} tracking-widest text-black rounded`}>{String(vibe.name)}</span>
                    <div className="flex gap-0.5 bg-black/20 px-1 py-0.5 rounded-full border border-white/5">
                        {[...Array(spiceLevel)].map((_, i) => <span key={i} className="text-[8px] animate-pulse drop-shadow-[0_0_5px_#ff4500]">🌶️</span>)}
                    </div>
                </div>
             </div>
          </div>
          <button 
            onClick={onSip} 
            disabled={hasSipped} 
            className={`group flex items-center gap-1.5 px-3 py-1.5 border transition-all duration-300 active:scale-95 rounded-xl shadow-md
              ${hasSipped 
                ? 'bg-green-500 text-black border-black scale-105' 
                : `bg-black/20 ${currentTheme.text} ${currentTheme.border} hover:bg-white/10`
              }`}
          >
             {hasSipped ? <Check size={14} strokeWidth={4} /> : <Coffee size={14} />}
             <span className="text-[9px] font-black uppercase tracking-widest">{hasSipped ? 'SIPPED' : 'SIP'}</span>
             {Number(msg.sips) > 0 && <span className="text-[9px] ml-0.5 font-mono font-bold">({msg.sips})</span>}
          </button>
      </div>
      
      <div className="pl-1 mb-3">
          <div className="message-font text-[20px] leading-[1.1] text-white tracking-tight uppercase selection:bg-[#ccff00] selection:text-black break-words">
            {renderContent()}
          </div>
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-white/5 pl-1">
          <div className="relative">
             <button 
               onClick={() => setShowVibeMenu(!showVibeMenu)} 
               className={`flex items-center gap-2 px-3 py-1.5 border transition-all rounded-full shadow-md text-[9px] font-black
                 ${myRId 
                   ? 'bg-white text-black border-white' 
                   : `bg-black/20 ${currentTheme.text} ${currentTheme.border} hover:bg-white/10`
                 }`}
             >
                <div className="flex -space-x-1.5">
                    {Object.keys(reactions).filter(k => reactions[k] > 0).slice(0, 2).map(k => (
                      <span key={k} className="drop-shadow-lg text-[12px] bg-black/40 rounded-full w-4 h-4 flex items-center justify-center border border-white/5">{REACTION_TYPES.find(r => r.id === k)?.icon}</span>
                    ))}
                </div>
                <span className="tracking-widest uppercase">{myRId ? 'VIBE SHARED' : 'ADD VIBE'}</span>
                {totalR > 0 && <span className="ml-0.5 font-mono opacity-60">({totalR})</span>}
             </button>
             
             {showVibeMenu && (
               <div className="absolute bottom-full left-0 mb-3 flex gap-2 bg-black/95 p-2 border border-white/10 z-50 animate-in slide-in-from-bottom-2 duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.9)] rounded-2xl">
                 {REACTION_TYPES.map(r => (
                   <button key={r.id} onClick={() => { onReact(r.id); setShowVibeMenu(false); }} className={`text-2xl transition-all hover:scale-125 p-1.5 rounded-xl ${myRId === r.id ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5'}`}>{r.icon}</button>
                 ))}
               </div>
             )}
          </div>
          
          <div className="opacity-40 flex items-center gap-1.5 font-bold font-mono">
            <div className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-red-400">
              <Clock size={10} className="animate-pulse" />
              <span className="text-[10px] uppercase tracking-tighter">EXPIRES: {expiryText}</span>
            </div>
          </div>
      </div>
    </div>
  );
}