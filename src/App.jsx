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
  arrayUnion,
  deleteDoc
} from 'firebase/firestore';
import { 
  Send, Clock, Sparkles, Zap, 
  X, Smile, RefreshCw,
  Palette, Droplets, Coffee, 
  Check, Star, Flame, Skull, Heart, Ghost, Edit3, StickyNote, Info, ImageOff, AlertTriangle, ListFilter, Plus,
  Volume2, VolumeX, ShieldAlert, Trophy
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

// --- CONSTANTS ---
const EXPIRY_MS = 24 * 60 * 60 * 1000;

// --- ULTIMATE REALISTIC SOUND ENGINE ---
const playSound = (type, isMuted) => {
  if (isMuted) return;
  
  if (type === 'sip') {
    const slurpAudio = new Audio('https://cdn.pixabay.com/audio/2022/03/10/audio_f53580e722.mp3');
    slurpAudio.volume = 0.6;
    slurpAudio.play().catch(() => {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const duration = 0.9;
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 20;
      
      filter.frequency.setValueAtTime(300, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(2500, ctx.currentTime + 0.3);
      filter.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.8);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.1);
      
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 22; 
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.12;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();

      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
      
      const gulp = ctx.createOscillator();
      const gGain = ctx.createGain();
      gulp.frequency.setValueAtTime(120, ctx.currentTime + 0.75);
      gulp.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.9);
      gGain.gain.setValueAtTime(0, ctx.currentTime + 0.75);
      gGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.77);
      gGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.9);
      gulp.connect(gGain);
      gGain.connect(ctx.destination);
      gulp.start(ctx.currentTime + 0.75);
    });
    return;
  }

  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  
  if (type === 'spill') {
    const duration = 0.6;
    const noise = ctx.createBufferSource();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const d = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) d[i] = Math.random() * 2 - 1;
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.3);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
    const impact = ctx.createOscillator();
    const iGain = ctx.createGain();
    impact.frequency.setValueAtTime(100, ctx.currentTime);
    impact.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.15);
    iGain.gain.setValueAtTime(0.3, ctx.currentTime);
    iGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
    impact.connect(iGain);
    iGain.connect(ctx.destination);
    impact.start();
    impact.stop(ctx.currentTime + 0.2);
  } else if (type === 'vibe') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }
};

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
  glitch: { name: 'Glitch Night', bg: 'from-black via-purple-900/80 to-black', accent: '#ff00ff', card: 'bg-black/80', border: 'border-[#00ffff]/40', text: 'text-[#ff00ff]', img: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000" },
  barbie: { name: 'Y2K Glitter', bg: 'from-[#ff0080]/60 via-[#ff85c0]/60 to-[#ff0080]/60', accent: '#ffffff', card: 'bg-white/30', border: 'border-white/50', text: 'text-white', img: "https://images.unsplash.com/photo-1596434316352-78d1f868d4d2?q=80&w=1000" }
};

const POST_VIBES = [
  { id: 0, name: 'BASED', color: 'bg-green-400', textColor: 'text-green-400', border: 'border-green-400', glow: 'shadow-[0_0_10px_#4ade80]' },
  { id: 1, name: 'CRINGE', color: 'bg-orange-500', textColor: 'text-orange-500', border: 'border-orange-500', glow: 'shadow-[0_0_10px_#f97316]' },
  { id: 2, name: 'REAL', color: 'bg-blue-400', textColor: 'text-blue-400', border: 'border-blue-400', glow: 'shadow-[0_0_10px_#60a5fa]' },
  { id: 3, name: 'DOWN BAD', color: 'bg-pink-500', textColor: 'text-pink-500', border: 'border-pink-500', glow: 'shadow-[0_0_10px_#ec4899]' },
  { id: 4, name: 'DARK', color: 'bg-purple-800', textColor: 'text-purple-400', border: 'border-purple-800', glow: 'shadow-[0_0_15px_#6b21a8]' }
];

const REACTION_TYPES = [
  { id: 'skull', icon: '💀' }, { id: 'fire', icon: '🔥' }, { id: 'heart', icon: '❤️' }, 
  { id: 'hundred', icon: '💯' }, { id: 'nail', icon: '💅' }, { id: 'clown', icon: '🤡' }
];

const RANKS = [
  { title: 'NPC', minXP: 0, maxXP: 49, emoji: '🤖', desc: 'Standard civilian. Just here for the side-quests.' },
  { title: 'Lurker', minXP: 50, maxXP: 149, emoji: '👀', desc: 'Expert observer. You see the tea before it boils.' },
  { title: 'Main Character', minXP: 150, maxXP: 499, emoji: '✨', desc: 'The plot revolves around you. Unstoppable energy.' },
  { title: 'Tea God', minXP: 500, maxXP: Infinity, emoji: '👑', desc: 'Omniscient brewer. You define the meta.' }
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

const getExpiryTime = (createdAt) => {
  if (!createdAt) return '24h 00m';
  const createdDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  const expiryDate = new Date(createdDate.getTime() + EXPIRY_MS);
  const diff = expiryDate.getTime() - Date.now();
  if (diff <= 0) return 'EXPIRED';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
};

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
  const [activePickerTab, setActivePickerTab] = useState('Vibes');
  const [isMuted, setIsMuted] = useState(false);
  const [isPollMode, setIsPollMode] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [selectedSticker, setSelectedSticker] = useState(null); 
  const [showRankTooltip, setShowRankTooltip] = useState(false);

  const scrollRef = useRef(null);
  const endRef = useRef(null);
  const theme = THEMES[currentTheme] || THEMES.cyber;
  const currentRank = RANKS.find(r => aura >= r.minXP && aura <= r.maxXP) || RANKS[0];
  const activeVibe = POST_VIBES.find(v => v.id === selectedVibe) || POST_VIBES[2];

  const prevTeaCount = useRef(0);
  const prevSortBy = useRef(sortBy);

  function performScrolling(behavior = 'smooth') {
    if (!endRef.current || !scrollRef.current) return;
    if (sortBy === 'new') {
      endRef.current.scrollIntoView({ behavior, block: 'end' });
    } else {
      scrollRef.current.scrollTo({ top: 0, behavior });
    }
  }

  useEffect(() => {
    setUserIdentity(generateIdentity());
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token).catch(() => signInAnonymously(auth));
      } else {
        await signInAnonymously(auth);
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
      const now = Date.now();
      
      let teaData = snapshot.docs
        .map(docSnap => {
          const data = docSnap.data();
          const totalReactions = Object.values(data.reactions || {}).reduce((a, b) => a + b, 0);
          const createdAt = data.createdAt?.toMillis ? data.createdAt.toMillis() : now;
          
          return { 
            id: docSnap.id, 
            ...data, 
            createdAtMs: createdAt,
            hypeScore: (data.sips || 0) + (totalReactions * 2) 
          };
        })
        .filter(item => (now - item.createdAtMs) < EXPIRY_MS);

      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        if (data.createdAt) {
          const createdAt = data.createdAt.toMillis();
          if (now - createdAt > EXPIRY_MS) {
            deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'confessions', docSnap.id));
          }
        }
      });

      if (sortBy === 'hot') {
        teaData = teaData.sort((a, b) => b.hypeScore - a.hypeScore);
      } else {
        teaData = teaData.sort((a, b) => a.createdAtMs - b.createdAtMs);
      }
      
      const isNewMessage = teaData.length > prevTeaCount.current;
      const hasSortChanged = sortBy !== prevSortBy.current;

      setTea(teaData);

      if (isNewMessage || hasSortChanged) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => performScrolling('smooth'));
        });
      }
      
      prevTeaCount.current = teaData.length;
      prevSortBy.current = sortBy;
    });
    return () => unsubscribe();
  }, [user, sortBy]);

  async function handleSpill(e) {
    if (e) e.preventDefault();
    const cleanInput = String(input).trim();
    const isMessageEmpty = !cleanInput && !selectedSticker;
    const isPollIncomplete = isPollMode && (pollOptions[0].trim() === '' || pollOptions[1].trim() === '');
    if (isMessageEmpty || isPollIncomplete || !user || isSpilling) return;
    
    setIsSpilling(true);
    playSound('spill', isMuted);
    const finalContent = cleanInput + (selectedSticker ? ` ${selectedSticker}` : '');
    let pollData = null;
    if (isPollMode) {
      const activeOptions = pollOptions.filter(o => o.trim() !== '');
      pollData = { options: activeOptions, votes: activeOptions.map(() => 0), votedBy: [] };
    }
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'confessions'), {
        text: finalContent, sips: 0, createdAt: serverTimestamp(), authorId: user.uid, identity: String(userIdentity), style: selectedVibe, reactions: {}, userReactions: {}, sippedBy: [], poll: pollData
      });
      setInput(''); setSelectedSticker(null); setPollOptions(['', '']); setIsPollMode(false); setAura(a => a + 25); setShowEmojiPicker(false);
      setTimeout(() => performScrolling('auto'), 10);
    } catch (e) { console.error(e); } finally { setIsSpilling(false); }
  }

  async function handleReaction(msgId, reactionId) {
    if (!user) return;
    playSound('vibe', isMuted);
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'confessions', msgId);
    const msg = tea.find(t => t.id === msgId);
    if (!msg) return;
    const currentReaction = msg.userReactions?.[user.uid];
    if (currentReaction === reactionId) {
      await updateDoc(docRef, { [`reactions.${reactionId}`]: increment(-1), [`userReactions.${user.uid}`]: deleteField() });
    } else {
      const updates = { [`reactions.${reactionId}`]: increment(1), [`userReactions.${user.uid}`]: reactionId };
      if (currentReaction) updates[`reactions.${currentReaction}`] = increment(-1);
      await updateDoc(docRef, updates);
      setAura(a => a + 2);
    }
  }

  async function handlePollVote(msgId, optionIndex) {
    if (!user) return;
    playSound('vibe', isMuted);
    const msg = tea.find(t => t.id === msgId);
    if (!msg || !msg.poll || msg.poll.votedBy?.includes(user.uid)) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'confessions', msgId);
    const newVotes = [...msg.poll.votes];
    newVotes[optionIndex] += 1;
    await updateDoc(docRef, { 'poll.votes': newVotes, 'poll.votedBy': arrayUnion(user.uid) });
    setAura(a => a + 5);
  }

  return (
    <div className="relative w-full h-screen overflow-hidden text-white transition-all duration-700 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: theme.img ? `url(${theme.img})` : 'none' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Plus+Jakarta+Sans:wght@700;800&family=Bungee&family=Rubik+Mono+One&display=swap');
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .logo-font { font-family: 'Bungee', cursive; }
        .sticker-font { font-family: 'Rubik Mono One', sans-serif; }
        .identity-font { font-family: 'Space Grotesk', sans-serif; font-weight: 700; }
        .message-font { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; }
        @keyframes glitch { 0% { transform: translate(0); text-shadow: -1px 0 #ff00c1, 1px 0 #00fff9; } 20% { transform: translate(-1px, 1px); } 40% { transform: translate(1px, -1px); text-shadow: 1px 0 #ff00c1, -1px 0 #00fff9; } 60% { transform: translate(-1px, -1px); } 100% { transform: translate(0); } }
        .glitch-hover:hover { animation: glitch 0.2s cubic-bezier(.25,.46,.45,.94) both infinite; }
      `}</style>

      <div className={`absolute inset-0 z-0 bg-gradient-to-br ${theme.bg} ${theme.img ? 'opacity-85' : 'opacity-100'}`}></div>
      
      <div className="relative z-10 flex flex-col h-full max-w-lg mx-auto bg-black/40 backdrop-blur-3xl border-x-2 border-white/5 shadow-2xl">
        <header className="px-4 py-4 border-b-2 border-white/10 bg-black/30 shrink-0 overflow-visible relative">
          <div className="flex items-center justify-between gap-4">
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
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsMuted(!isMuted)} className="p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/40 hover:text-white">
                    {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>
                  <div className="bg-white text-black px-2 py-0.5 skew-x-[-15deg] text-[9px] font-black uppercase tracking-tighter shadow-lg italic">AURA // {aura}XP</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-[9px] font-black text-white/40 uppercase tracking-widest bg-white/5 px-1.5 py-0.5 rounded-md border border-white/5 animate-pulse">{theme.name}</div>
                  <div 
                    onMouseEnter={() => setShowRankTooltip(true)}
                    onMouseLeave={() => setShowRankTooltip(false)}
                    className="relative"
                  >
                    {/* TRIGGER BADGE */}
                    <div className="px-2 py-0.5 bg-black/50 text-white rounded-full text-[9px] font-bold border border-white/20 flex items-center gap-1 cursor-help transition-all hover:border-white select-none relative z-50">
                      {String(currentRank.emoji)} {String(currentRank.title)}
                    </div>

                    {/* TOOLTIP CONTAINER: pt-2 acts as a 'bridge' to keep hover state active */}
                    {showRankTooltip && (
                      <div className="absolute right-0 top-full pt-2 w-56 z-[100] animate-in fade-in zoom-in-95 duration-200">
                         <div className="bg-black/95 border-2 border-white/20 p-4 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
                           <div className="text-[10px] font-black text-[#ccff00] mb-3 uppercase tracking-widest border-b border-white/10 pb-2 flex items-center justify-between">
                             <div className="flex items-center gap-1.5"><ShieldAlert size={12} /> RANK SYSTEM</div>
                             <Trophy size={12} className="text-white/20" />
                           </div>
                           <div className="space-y-3">
                             {RANKS.map(r => (
                               <div key={r.title} className={`flex flex-col gap-1 transition-all ${currentRank.title === r.title ? 'opacity-100 scale-100' : 'opacity-30 scale-[0.98]'}`}>
                                 <div className="flex items-center justify-between">
                                   <span className="text-[10px] font-black uppercase tracking-tight flex items-center gap-1">
                                     {r.emoji} {r.title}
                                     {currentRank.title === r.title && <Zap size={8} className="text-[#ccff00] fill-[#ccff00]" />}
                                   </span>
                                   <span className="text-[9px] font-mono font-bold">{r.minXP}+ XP</span>
                                 </div>
                                 <p className="text-[8px] leading-relaxed text-white/60 font-medium italic pr-2">{r.desc}</p>
                               </div>
                             ))}
                           </div>
                           <div className="mt-4 pt-3 border-t border-white/10">
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter">PROGRESSION METER</span>
                                <span className="text-[10px] font-black italic text-[#ccff00]">{aura} XP</span>
                              </div>
                              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                 <div 
                                   className="h-full bg-gradient-to-r from-green-400 to-[#ccff00] transition-all duration-1000 rounded-full" 
                                   style={{ width: `${Math.min(100, (aura / (currentRank.maxXP === Infinity ? aura : currentRank.maxXP + 1)) * 100)}%` }}
                                 />
                              </div>
                           </div>
                         </div>
                      </div>
                    )}
                  </div>
                </div>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-between p-2 bg-black/20 shrink-0">
            <div className="flex gap-2">
                <button onClick={() => setSortBy('new')} className={`px-4 py-1.5 text-[9px] font-black uppercase rounded-lg border-2 transition-all ${sortBy === 'new' ? 'bg-white text-black border-white' : 'bg-black/40 text-white/60 border-white/10'}`}>LATEST</button>
                <button onClick={() => setSortBy('hot')} className={`px-4 py-1.5 text-[9px] font-black uppercase rounded-lg border-2 transition-all ${sortBy === 'hot' ? 'bg-white text-black border-white' : 'bg-black/40 text-white/60 border-white/10'}`}>TRENDING</button>
            </div>
            <button onClick={() => { const keys = Object.keys(THEMES); const nextIdx = (keys.indexOf(currentTheme) + 1) % keys.length; setCurrentTheme(keys[nextIdx]); }} className="p-1.5 border-2 border-white rounded-full active:scale-90 hover:bg-white hover:text-black transition-all shadow-lg">
              <Palette size={16} />
            </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar scroll-smooth">
          {tea.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-30 gap-4 text-center px-10">
              <Droplets size={64} className="animate-bounce text-[#ccff00]" />
              <p className="text-[12px] font-black tracking-widest uppercase text-white/70">THE POT IS EMPTY. SPILL SOMETHING UNHINGED.</p>
            </div>
          ) : (
            tea.map((msg) => <TeaCard key={msg.id} msg={msg} currentUid={user?.uid} currentTheme={theme} isMuted={isMuted} onReact={(rid) => handleReaction(msg.id, rid)} onVote={(idx) => handlePollVote(msg.id, idx)} onSip={() => {
                if (!user || msg.sippedBy?.includes(user.uid)) return;
                playSound('sip', isMuted);
                updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'confessions', msg.id), { sips: increment(1), sippedBy: arrayUnion(user.uid) });
                setAura(a => a + 5);
              }} 
            />)
          )}
          <div ref={endRef} className="h-4 w-full" />
        </div>

        <div className="p-2 bg-black/90 border-t-2 border-white/10 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          {isPollMode && (
            <div className="mb-3 p-3 bg-white/5 border border-dashed border-white/20 rounded-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#ccff00]">POLL_CREATOR_V1.0</span>
                    <button onClick={() => setIsPollMode(false)} className="text-white/40 hover:text-white"><X size={12} /></button>
                </div>
                <div className="space-y-1.5">
                    {pollOptions.map((opt, i) => (
                        <div key={i} className="flex gap-2">
                            <input value={opt} onChange={(e) => { const next = [...pollOptions]; next[i] = e.target.value.toUpperCase(); setPollOptions(next); }} placeholder={`OPTION ${i+1}`} className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] uppercase font-bold focus:border-[#ccff00] focus:outline-none" />
                            {i > 1 && <button onClick={() => setPollOptions(pollOptions.filter((_, idx) => idx !== i))} className="text-red-400"><X size={14}/></button>}
                        </div>
                    ))}
                    {pollOptions.length < 4 && <button onClick={() => setPollOptions([...pollOptions, ''])} className="w-full py-1.5 border border-dashed border-white/10 rounded-lg text-[9px] font-black text-white/40 hover:border-white/30 hover:text-white/60 transition-all flex items-center justify-center gap-1.5"><Plus size={10} /> ADD OPTION</button>}
                </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5 mb-2">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => { setUserIdentity(generateIdentity()); setIsEditingName(false); }} className="p-1 bg-white text-black rounded shadow active:rotate-180 transition-transform"><RefreshCw size={12} /></button>
                    {isEditingName ? (
                        <div className="flex items-center gap-1">
                            <input autoFocus value={userIdentity} onChange={(e) => setUserIdentity(e.target.value)} onBlur={() => setIsEditingName(false)} onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)} className="bg-white/10 border-b-2 border-[#ccff00] text-[12px] identity-font text-white uppercase focus:outline-none px-1.5 py-0.5 rounded w-28" />
                            <button onClick={() => setIsEditingName(false)} className="p-0.5 bg-[#ccff00] text-black rounded"><Check size={10}/></button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditingName(true)} className="text-[12px] identity-font text-white uppercase tracking-tight flex items-center gap-1.5 hover:text-[#ccff00] transition-colors group">
                          {String(userIdentity || "GUEST_USER")} <Edit3 size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                    <span className="text-[7px] font-black text-white/30 uppercase mr-1">Vibe</span>
                    {POST_VIBES.map((v) => <button key={v.id} onClick={() => { setSelectedVibe(v.id); playSound('vibe', isMuted); }} className={`w-3.5 h-3.5 border-2 rounded-full transition-all hover:scale-125 ${selectedVibe === v.id ? `${v.color} border-white scale-110 ${v.glow}` : 'bg-transparent border-white/10'}`} />)}
                </div>
             </div>
          </div>

          <form onSubmit={handleSpill} className="flex flex-col gap-2">
             <div className="flex items-center bg-white/5 border border-white/10 focus-within:border-white/30 transition-all rounded-xl relative shadow-inner overflow-hidden">
                <div className="flex shrink-0">
                    <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-1.5 transition-all ${showEmojiPicker ? 'text-[#ccff00]' : 'text-white/40'}`} title="Stickers & Emojis"><Smile size={20} /></button>
                    <button type="button" onClick={() => setIsPollMode(!isPollMode)} className={`p-1.5 transition-all ${isPollMode ? 'text-[#ccff00]' : 'text-white/40'}`} title="Add Poll"><ListFilter size={20} /></button>
                </div>
                <div className="flex-1 flex items-center min-w-0">
                  {selectedSticker && <div className="relative shrink-0 flex items-center mr-1"><img src={selectedSticker} alt="preview" className="h-8 w-auto max-w-[50px] object-contain rounded animate-in zoom-in duration-300" /><button type="button" onClick={() => setSelectedSticker(null)} className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 text-white shadow-lg z-10"><X size={8} /></button></div>}
                  <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={selectedSticker ? "" : "WHAT'S THE TEA?"} className={`flex-1 bg-transparent border-none ${activeVibe.textColor} focus:outline-none font-bold text-[14px] py-2 placeholder-white/5 font-sans uppercase min-w-[50px] ${selectedSticker ? 'pl-1' : 'px-1.5'}`} />
                </div>
                <button 
                  type="submit" 
                  disabled={
                    isSpilling || 
                    (!String(input).trim() && !selectedSticker) || 
                    (isPollMode && (pollOptions[0].trim() === '' || pollOptions[1].trim() === ''))
                  } 
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
                      <button key={tab} type="button" onClick={() => setActivePickerTab(tab)} className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-full whitespace-nowrap transition-all ${activePickerTab === tab ? 'bg-[#ccff00] text-black' : 'bg-white/5 text-white/40'}`}> {tab} </button>
                    ))}
                  </div>
                  <div className="flex-1 overflow-y-auto no-scrollbar">
                    {activePickerTab === 'Stickers' ? (
                      <div className="grid grid-cols-3 gap-1.5 pb-2">
                        {FALLBACK_STICKERS.map((s) => (
                          <button key={s.id} type="button" onClick={() => { setSelectedSticker(s.url); setShowEmojiPicker(false); }} className="aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/5 hover:border-[#ccff00] transition-all relative group flex items-center justify-center">
                            <img src={s.url} alt="sticker" className="w-4/5 h-4/5 object-contain" loading="lazy" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-8 gap-2">{EMOJI_CATEGORIES[activePickerTab].map((e, idx) => (<button key={idx} type="button" onClick={() => { setInput(prev => String(prev) + String(e)); playSound('vibe', isMuted); }} className="text-xl hover:scale-125 transition-transform">{String(e)}</button>))}</div>
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

// Memoized TeaCard to prevent unnecessary entry animations during parent state changes
const TeaCard = React.memo(({ msg, currentUid, onSip, onReact, onVote, currentTheme, isMuted }) => {
  const [showVibeMenu, setShowVibeMenu] = useState(false);
  const [loadError, setLoadError] = useState({});
  const [expiryText, setExpiryText] = useState(getExpiryTime(msg.createdAt));
  const vibe = POST_VIBES.find(v => v.id === msg.style) || POST_VIBES[0];
  const reactions = msg.reactions || {};
  const myRId = msg.userReactions?.[currentUid];
  const totalR = Object.values(reactions).reduce((a, b) => a + b, 0);
  const hasSipped = msg.sippedBy?.includes(currentUid);
  const hasVoted = msg.poll?.votedBy?.includes(currentUid);
  const totalVotes = msg.poll?.votes?.reduce((a, b) => a + b, 0) || 0;
  const spiceLevel = Math.min(Math.max(Math.floor(((Number(msg.sips) || 0) + (totalR * 2)) / 5) + 1, 1), 5);

  useEffect(() => {
    const timer = setInterval(() => { setExpiryText(getExpiryTime(msg.createdAt)); }, 10000);
    return () => clearInterval(timer);
  }, [msg.createdAt]);

  const renderContent = () => {
    const tokens = String(msg.text).split(/\s+/);
    return tokens.map((part, i) => {
      if (part.match(/^https?:\/\/.*(giphy\.com\/media|giphy\.gif|i\.giphy\.com|\.gif$)/i)) {
        if (loadError[i]) return null;
        return (<div key={i} className="my-2 py-1 flex justify-center"><img src={part} alt="sticker" className="max-h-40 w-auto block animate-in zoom-in duration-500" onError={() => setLoadError(prev => ({ ...prev, [i]: true }))} /></div>);
      }
      return <span key={part + i}>{part} </span>;
    });
  };

  return (
    <div className={`p-4 border-2 ${currentTheme.border} ${currentTheme.card} relative shadow-xl rounded-[1.5rem] transition-all group overflow-hidden`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${vibe.color} opacity-40`}></div>
      <div className="flex justify-between items-start mb-3 pl-1">
          <div className="flex items-center gap-3">
             <div className={`h-10 w-10 ${vibe.color} flex items-center justify-center text-[16px] text-black border-2 border-black shadow-lg font-black rounded-xl uppercase transform -rotate-3`}>{String(msg.identity || "A").charAt(0)}</div>
             <div className="flex flex-col gap-0.5">
                <span className="identity-font text-[13px] text-white uppercase leading-none font-bold">{String(msg.identity || "ANON")}</span>
                <div className="flex items-center gap-1.5">
                    <span className={`text-[7px] font-black w-fit px-1.5 py-0.5 border border-black uppercase ${vibe.color} text-black rounded`}>{String(vibe.name)}</span>
                    <div className="flex gap-0.5 bg-black/20 px-1 py-0.5 rounded-full border border-white/5"> {[...Array(spiceLevel)].map((_, i) => <span key={i} className="text-[8px] animate-pulse">🌶️</span>)} </div>
                </div>
             </div>
          </div>
          <button onClick={onSip} disabled={hasSipped} className={`group flex items-center gap-1.5 px-3 py-1.5 border transition-all duration-300 active:scale-95 rounded-xl shadow-md ${hasSipped ? 'bg-green-500 text-black border-black scale-105' : `bg-black/20 ${currentTheme.text} ${currentTheme.border} hover:bg-white/10` }`} >
             {hasSipped ? <Check size={14} strokeWidth={4} /> : <Coffee size={14} />}
             <span className="text-[9px] font-black uppercase">{hasSipped ? 'SIPPED' : 'SIP'}</span>
             {Number(msg.sips) > 0 && <span className="text-[9px] ml-0.5 font-mono font-bold">({msg.sips})</span>}
          </button>
      </div>
      <div className="pl-1 mb-3"><div className={`message-font text-[18px] leading-[1.1] ${vibe.textColor} tracking-tight uppercase break-words`}>{renderContent()}</div></div>
      {msg.poll && (
        <div className="mt-4 mb-3 space-y-2">
            {msg.poll.options.map((option, idx) => {
                const percentage = totalVotes > 0 ? Math.round((msg.poll.votes[idx] / totalVotes) * 100) : 0;
                return (
                    <button key={idx} onClick={() => onVote(idx)} disabled={hasVoted} className={`relative w-full overflow-hidden h-10 border border-white/10 rounded-xl group/opt transition-all active:scale-[0.98] ${hasVoted ? 'cursor-default' : 'hover:border-white/30'}`} >
                        <div className={`absolute inset-y-0 left-0 transition-all duration-1000 ease-out ${vibe.color} opacity-20`} style={{ width: `${percentage}%` }} />
                        <div className="absolute inset-0 px-4 flex items-center justify-between z-10">
                            <span className="text-[10px] font-black uppercase truncate pr-4">{option}</span>
                            {hasVoted && <span className="text-[10px] font-mono font-bold opacity-60 italic">{percentage}%</span>}
                        </div>
                    </button>
                );
            })}
        </div>
      )}
      <div className="flex items-center justify-between pt-3 border-t border-white/5 pl-1">
          <div className="relative">
             <button onClick={() => setShowVibeMenu(!showVibeMenu)} className={`flex items-center gap-2 px-3 py-1.5 border transition-all rounded-full shadow-md text-[9px] font-black ${myRId ? 'bg-white text-black border-white' : `bg-black/20 ${currentTheme.text} ${currentTheme.border} hover:bg-white/10` }`} >
                <div className="flex -space-x-1.5">
                    {Object.keys(reactions).filter(k => reactions[k] > 0).slice(0, 2).map(k => (
                      <span key={k} className="drop-shadow-lg text-[12px] bg-black/40 rounded-full w-4 h-4 flex items-center justify-center border border-white/5">{REACTION_TYPES.find(r => r.id === k)?.icon}</span>
                    ))}
                </div>
                <span className="tracking-widest uppercase">{myRId ? 'VIBE SHARED' : 'ADD VIBE'}</span>
             </button>
             {showVibeMenu && (
               <div className="absolute bottom-full left-0 mb-3 flex gap-2 bg-black/95 p-2 border border-white/10 z-50 animate-in slide-in-from-bottom-2 duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.9)] rounded-2xl">
                 {REACTION_TYPES.map(r => (<button key={r.id} onClick={() => { onReact(r.id); setShowVibeMenu(false); }} className={`text-2xl transition-all hover:scale-125 p-1.5 rounded-xl ${myRId === r.id ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5'}`}>{r.icon}</button>))}
               </div>
             )}
          </div>
          <div className="opacity-40 flex items-center gap-1.5 font-bold font-mono"><div className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-red-400"><Clock size={10} className="animate-pulse" /><span className="text-[10px] uppercase">EXPIRES: {expiryText}</span></div></div>
      </div>
    </div>
  );
});