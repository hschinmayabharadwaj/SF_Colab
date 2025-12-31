
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import { PRD_CONTENT, INITIAL_ACHIEVEMENTS, LEAGUE_CONFIG } from './constants';
import { gemini } from './services/geminiService';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { getHealth, getWalletBalance, getWalletHistory, earnCoins } from './services/api';


// --- Utilities for Audio Encoding/Decoding ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const chartData = [
  { name: 'Mon', coins: 400, xp: 240 },
  { name: 'Tue', coins: 300, xp: 139 },
  { name: 'Wed', coins: 200, xp: 980 },
  { name: 'Thu', coins: 278, xp: 390 },
  { name: 'Fri', coins: 189, xp: 480 },
  { name: 'Sat', coins: 239, xp: 380 },
  { name: 'Sun', coins: 349, xp: 430 },
];

const Confetti: React.FC = () => {
  const pieces = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      left: Math.random() * 100 + '%',
      delay: Math.random() * 2 + 's',
      color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)],
      duration: (Math.random() * 2 + 3) + 's',
      size: (Math.random() * 8 + 4) + 'px'
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[101]">
      {pieces.map((p, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: p.left,
            backgroundColor: p.color,
            animation: `confetti-fall ${p.duration} linear ${p.delay} infinite, confetti-shake 2s ease-in-out infinite`,
            width: p.size,
            height: p.size,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px'
          }}
        />
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [wallet, setWallet] = useState({ coins: 0, crystals: 0, pendingEarnings: 0 });
  const [xp, setXp] = useState(8450);
  const [aiResponse, setAiResponse] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(true);
  
  // User ID for the test user (created in backend)
  const USER_ID = '251b53e1-1aa1-47bb-8f34-f55e278fc8ae';
  
  // Transition tracking
  const [transitionState, setTransitionState] = useState<{ active: boolean; direction: 'up' | 'down'; league: string } | null>(null);
  const prevLeagueRef = useRef<string | null>(null);

  // Notifications State
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'info' | 'success' | 'error' }[]>([]);

  // Live API State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [liveTranscription, setLiveTranscription] = useState('');
  const [liveStatus, setLiveStatus] = useState<'connecting' | 'listening' | 'speaking' | 'idle'>('idle');
  const sessionRef = useRef<any>(null);
  const audioContextsRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const addNotification = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  useEffect(() => {
    getHealth()
      .then((data) => {
        console.log('Backend health:', data);
      })
      .catch((err) => {
        console.error('Backend not reachable:', err);
      });
  }, []);

const [userId, setUserId] = useState<string | null>(null);

useEffect(() => {
  // Fetch or create user on mount
  const initUser = async () => {
    try {
      // Try to get existing user
      const response = await fetch('http://127.0.0.1:5001/users');
      const data = await response.json();
      
      if (data.users && data.users.length > 0) {
        setUserId(data.users[0].id);
      } else {
        // Create a new user if none exists
        const createResponse = await fetch('http://127.0.0.1:5001/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'alex_rivera',
            email: 'alex@example.com'
          })
        });
        const newUser = await createResponse.json();
        setUserId(newUser.id);
      }
    } catch (error) {
      console.error('Failed to initialize user:', error);
    }
  };
  
  initUser();
}, []);


  // Fetch wallet data from backend
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setWalletLoading(true);
        const walletData = await getWalletBalance(USER_ID);
        setWallet({
          coins: walletData.sf_coins,
          crystals: walletData.premium_gems,
          pendingEarnings: walletData.event_tokens // Using event_tokens as pending earnings for demo
        });
        addNotification('Wallet data loaded successfully', 'success');
      } catch (error) {
        console.error('Failed to fetch wallet data:', error);
        addNotification('Failed to load wallet data', 'error');
        // Keep default values on error
      } finally {
        setWalletLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  // Derive current league and progress
  const leagueData = useMemo(() => {
    let current = LEAGUE_CONFIG[0];
    let next = LEAGUE_CONFIG[1];
    for (let i = 0; i < LEAGUE_CONFIG.length; i++) {
      if (xp >= LEAGUE_CONFIG[i].minXp) {
        current = LEAGUE_CONFIG[i];
        next = LEAGUE_CONFIG[i + 1] || null;
      } else {
        break;
      }
    }
    const progress = next 
      ? ((xp - current.minXp) / (next.minXp - current.minXp)) * 100 
      : 100;
    return { current, next, progress };
  }, [xp]);

  // Handle League Transitions
  useEffect(() => {
    if (prevLeagueRef.current && prevLeagueRef.current !== leagueData.current.name) {
      const currentIdx = LEAGUE_CONFIG.findIndex(l => l.name === leagueData.current.name);
      const prevIdx = LEAGUE_CONFIG.findIndex(l => l.name === prevLeagueRef.current);
      
      const direction = currentIdx > prevIdx ? 'up' : 'down';
      setTransitionState({
        active: true,
        direction,
        league: leagueData.current.name
      });

      if (direction === 'up') {
        addNotification(`New Milestone: Achieved ${leagueData.current.name} League!`, 'success');
      }

      const timer = setTimeout(() => {
        setTransitionState(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
    prevLeagueRef.current = leagueData.current.name;
  }, [leagueData.current.name]);

  const handleClaimPayout = () => {
    if (wallet.pendingEarnings <= 0) {
      addNotification("No pending earnings to withdraw.", "error");
      return;
    }
    const amount = wallet.pendingEarnings.toFixed(2);
    addNotification(`Withdrawal of $${amount} initiated.`, 'info');
    setWallet(prev => ({ ...prev, pendingEarnings: 0 }));
    setTimeout(() => addNotification(`Successfully transferred $${amount} to your vault.`, "success"), 2000);
  };

  const askAi = async () => {
    if (!aiQuery) return;
    setIsLoading(true);
    const result = await gemini.analyzePRD(aiQuery, PRD_CONTENT);
    setAiResponse(result || 'No response.');
    setIsLoading(false);
    addNotification("AI Insight generated.", "info");
  };

  // --- Gemini Live API Implementation ---
  const startLiveSession = async () => {
    if (isLiveActive) return;
    setIsLiveActive(true);
    setLiveStatus('connecting');
    setLiveTranscription('');

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.GEMINI_API_KEY });
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextsRef.current = { input: inputAudioContext, output: outputAudioContext };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setLiveStatus('listening');
            addNotification("Voice Session Active", "success");
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) { int16[i] = inputData[i] * 32768; }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
            (window as any)._scriptProcessor = scriptProcessor; // Keep reference
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setLiveTranscription(prev => prev + message.serverContent!.outputTranscription!.text);
              setLiveStatus('speaking');
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
              const source = outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContext.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              audioSourcesRef.current.add(source);
              source.onended = () => {
                audioSourcesRef.current.delete(source);
                if (audioSourcesRef.current.size === 0) setLiveStatus('listening');
              };
            }

            if (message.serverContent?.interrupted) {
              audioSourcesRef.current.forEach(s => s.stop());
              audioSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
            
            if (message.serverContent?.turnComplete) {
              setLiveStatus('listening');
            }
          },
          onerror: (e) => {
            console.error("Live Error", e);
            addNotification("Voice Session Error", "error");
            stopLiveSession();
          },
          onclose: () => {
            stopLiveSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: 'You are the SF Ecosystem Voice Assistant. Help the user understand their merit, economy, and the protocol rules defined in the PRD.',
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsLiveActive(false);
      setLiveStatus('idle');
      addNotification("Could not access microphone", "error");
    }
  };

  const stopLiveSession = () => {
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch (e) {}
      sessionRef.current = null;
    }
    if (audioContextsRef.current) {
      audioContextsRef.current.input.close();
      audioContextsRef.current.output.close();
      audioContextsRef.current = null;
    }
    if ((window as any)._scriptProcessor) {
      (window as any)._scriptProcessor.disconnect();
    }
    setIsLiveActive(false);
    setLiveStatus('idle');
    addNotification("Voice Session Ended", "info");
  };

  const LeagueIcon = ({ league, className = "" }: { league: string, className?: string }) => {
    const icon = league === 'Bronze' ? '🥉' : league === 'Silver' ? '🥈' : league === 'Gold' ? '🥇' : league === 'Platinum' ? '🛡️' : league === 'Diamond' ? '💎' : '👑';
    return <span className={className}>{icon}</span>;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Merit XP" value={xp.toLocaleString()} subValue={`Level ${Math.floor(xp / 200)} ${leagueData.current.name}`} icon="⭐" color="yellow" />
              <StatCard title="Wallet (SF Coins)" value={wallet.coins.toLocaleString()} subValue="Approx. $124.50" icon="🪙" color="blue" />
              <StatCard title="Crystals" value={wallet.crystals} subValue="Premium Utility" icon="💎" color="purple" />
              <StatCard title="Pending Payout" value={`$${wallet.pendingEarnings.toFixed(2)}`} subValue="Auditable Earnings" icon="🏦" color="green" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-[#1a1a1a] p-6 rounded-xl border border-gray-800">
                <h3 className="text-lg font-semibold mb-6 flex items-center justify-between">
                  Activity Velocity
                  <span className="text-xs font-normal text-gray-500">Last 7 Days</span>
                </h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#666" fontSize={12} />
                      <YAxis stroke="#666" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333' }} />
                      <Area type="monotone" dataKey="xp" stroke="#3b82f6" fillOpacity={1} fill="url(#colorXp)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 relative overflow-hidden group">
                <h3 className="text-lg font-semibold mb-4">League Rank</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{leagueData.next ? `${leagueData.next.name} League` : 'Max Rank Reached'}</span>
                    <span className="text-blue-400 font-mono tracking-tighter">{leagueData.progress.toFixed(0)}% Complete</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden border border-gray-700/50">
                    <div className="bg-blue-600 h-full transition-all duration-700 ease-out" style={{ width: `${leagueData.progress}%` }}></div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-gray-800">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-3 tracking-widest">Active Perks</p>
                    <ul className="text-xs space-y-2">
                      {leagueData.current.perks.map((perk, i) => (
                        <li key={i} className="flex items-center space-x-2 text-gray-300">
                          <span className="text-blue-500">✦</span>
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'merit':
        return (
          <div className="space-y-12">
            <header className="flex justify-between items-end border-b border-gray-800 pb-4">
              <div>
                <h2 className="text-2xl font-bold">Seasonal Merit Ladder</h2>
                <p className="text-gray-400 text-sm italic">Ranked progression for the current governance cycle</p>
              </div>
            </header>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 space-y-6">
                <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800 shadow-inner">
                  <h3 className="font-bold text-lg mb-6">Ladder Progress</h3>
                  <div className="space-y-3">
                    {LEAGUE_CONFIG.slice().reverse().map((l) => {
                      const isActive = l.name === leagueData.current.name;
                      const isUnlocked = xp >= l.minXp;
                      return (
                        <div key={l.name} className={`relative p-5 rounded-xl border transition-all duration-500 ${isActive ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500/40 rank-shine animate-rank-pop' : isUnlocked ? 'bg-gray-800/20 border-gray-700' : 'opacity-30 grayscale'}`}>
                          <div className="flex items-center space-x-5">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${l.color}15`, color: l.color }}>
                              <LeagueIcon league={l.name} />
                            </div>
                            <div>
                              <h4 className="font-bold text-lg">{l.name}</h4>
                              <p className="text-[10px] text-gray-500 uppercase">{l.minXp.toLocaleString()} XP REQUIRED</p>
                            </div>
                            <div className="flex-1 text-right">
                              {isActive && <span className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded font-black uppercase tracking-tighter">Current</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800">
                  <h3 className="font-bold mb-4 text-gray-300">XP Projection</h3>
                  <div className="space-y-4">
                    <label className="text-xs text-gray-500 uppercase block font-bold tracking-widest flex justify-between">
                      Simulate XP Gain
                      <span className="text-blue-400 font-mono tracking-tighter">{xp.toLocaleString()} XP</span>
                    </label>
                    <input type="range" min="0" max="60000" step="100" value={xp} onChange={(e) => setXp(Number(e.target.value))} className="w-full accent-blue-600 h-1.5 bg-gray-800 rounded-lg cursor-pointer" />
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800">
                  <h3 className="font-bold mb-5 flex items-center space-x-3">
                    <span className="text-lg">🎯</span>
                    <span className="tracking-tight text-gray-300">Active Milestones</span>
                  </h3>
                  <div className="space-y-4">
                    {INITIAL_ACHIEVEMENTS.map(ach => (
                      <div key={ach.id} className={`p-4 rounded-xl border flex items-center justify-between ${ach.unlocked ? 'bg-green-500/5 border-green-500/20' : 'bg-transparent border-gray-800/50 opacity-60'}`}>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-300">{ach.title}</p>
                          <div className="w-full bg-gray-900 h-1 rounded-full overflow-hidden mt-2">
                            <div className={`h-full transition-all duration-1000 ${ach.unlocked ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: `${ach.progress}%` }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'economy':
        return (
          <div className="space-y-8">
            <header className="border-b border-gray-800 pb-4">
              <h2 className="text-2xl font-bold">Economy & Vault</h2>
              <p className="text-gray-400 text-sm">Manage your SF holdings and claim audited payouts.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-900/30 via-[#1a1a1a] to-black p-8 rounded-3xl border border-blue-500/20 shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
                <div className="relative z-10">
                  <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">Total Estimated Balance</p>
                  <h3 className="text-5xl font-black text-white tracking-tighter mb-8">${(wallet.coins / 100 + wallet.pendingEarnings).toFixed(2)}</h3>
                  
                  <div className="grid grid-cols-2 gap-6 mb-10">
                    <div>
                      <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">SF Coins</p>
                      <p className="text-xl font-bold text-blue-200">{wallet.coins.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">SF Crystals</p>
                      <p className="text-xl font-bold text-purple-400">{wallet.crystals.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="p-5 bg-white/5 border border-white/10 rounded-2xl mb-8">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-gray-400 text-sm font-medium">Pending Earnings</p>
                      <span className="text-green-400 font-bold">${wallet.pendingEarnings.toFixed(2)}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 italic">Subject to 48h protocol verification period</p>
                  </div>

                  <button 
                    onClick={handleClaimPayout}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all transform active:scale-95"
                  >
                    Withdraw Funds to External Vault
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800">
                  <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
                    Transaction History
                    <span className="text-xs text-gray-500 font-normal">Last 30 Days</span>
                  </h3>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {[
                      { type: 'Task Reward', amount: '+450 Coins', date: '2h ago', status: 'Completed', icon: '✅' },
                      { type: 'League Bonus', amount: '+5.00 WP', date: 'Yesterday', status: 'Verified', icon: '💎' },
                      { type: 'Subscription', amount: '-$9.99', date: '3 days ago', status: 'Recurring', icon: '🎟️' },
                      { type: 'Withdrawal', amount: '-$42.00', date: '1 week ago', status: 'Completed', icon: '🏦' }
                    ].map((tx, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 hover:bg-white/5 rounded-xl transition-colors border border-transparent hover:border-white/5">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl opacity-80">{tx.icon}</span>
                          <div>
                            <p className="text-sm font-semibold">{tx.type}</p>
                            <p className="text-[10px] text-gray-500 uppercase">{tx.date} • {tx.status}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-mono ${tx.amount.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-900/10 border border-blue-500/20 p-5 rounded-2xl">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center space-x-2">
                    <span className="animate-pulse">🚀</span>
                    <span>Economy Insight</span>
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Based on your current activity velocity, your estimated earnings for the next governance cycle are projected to grow by 12.5%.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'subscriptions':
        return (
          <div className="space-y-12">
            <header className="text-center max-w-2xl mx-auto space-y-4">
              <h2 className="text-4xl font-black tracking-tight">Ecosystem Tiers</h2>
              <p className="text-gray-400 text-base leading-relaxed">
                Empower your contribution. Subscriptions fund the periodic budget pools and grant high-level platform utility.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Contributor Plus */}
              <div className="bg-[#1a1a1a] border border-gray-800 p-8 rounded-[2rem] relative flex flex-col hover:border-gray-700 transition-all group">
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-1">Contributor Plus</h3>
                  <p className="text-gray-500 text-xs">Standard professional utility</p>
                </div>
                <div className="mb-8">
                  <span className="text-5xl font-black">$9.99</span>
                  <span className="text-gray-500 text-sm ml-2">/ month</span>
                </div>
                <ul className="space-y-4 text-sm text-gray-400 mb-10 flex-1">
                  <li className="flex items-center space-x-3"><span className="text-blue-500">✓</span><span>Advanced Analytics</span></li>
                  <li className="flex items-center space-x-3"><span className="text-blue-500">✓</span><span>Verified Plus Badge</span></li>
                  <li className="flex items-center space-x-3"><span className="text-blue-500">✓</span><span>Early Pool Payouts</span></li>
                </ul>
                <button className="w-full py-4 bg-white/5 text-gray-400 font-bold rounded-2xl border border-white/10 cursor-default">
                  Current Active Plan
                </button>
              </div>

              {/* Founder Plus */}
              <div className="bg-gradient-to-b from-blue-600/20 to-black border-2 border-blue-600 p-8 rounded-[2rem] relative flex flex-col transform scale-105 shadow-2xl shadow-blue-500/20 group">
                <div className="absolute top-4 right-6 text-[10px] font-black bg-blue-600 text-white px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
                  Highly Recommended
                </div>
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-1 text-white">Founder Plus</h3>
                  <p className="text-blue-300/60 text-xs font-medium">For power contributors</p>
                </div>
                <div className="mb-8">
                  <span className="text-5xl font-black text-white">$19.99</span>
                  <span className="text-blue-300 text-sm ml-2">/ month</span>
                </div>
                <ul className="space-y-4 text-sm text-blue-100/70 mb-10 flex-1">
                  <li className="flex items-center space-x-3"><span className="text-blue-400">✓</span><span>Priority Support Channel</span></li>
                  <li className="flex items-center space-x-3"><span className="text-blue-400">✓</span><span>Multi-Vault Management</span></li>
                  <li className="flex items-center space-x-3"><span className="text-blue-400">✓</span><span>Founder Visibility Boost</span></li>
                  <li className="flex items-center space-x-3"><span className="text-blue-400">✓</span><span>Advisory Council Voting</span></li>
                </ul>
                <button 
                  onClick={() => addNotification("Upgraded to Founder Plus!", "success")}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95"
                >
                  Upgrade to Founder
                </button>
              </div>

              {/* Equity Track */}
              <div className="bg-[#1a1a1a] border border-gray-800 p-8 rounded-[2rem] relative flex flex-col hover:border-gray-700 transition-all">
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-1">Equity Track</h3>
                  <p className="text-gray-500 text-xs">Commitment-based rewards</p>
                </div>
                <div className="mb-8">
                  <span className="text-5xl font-black">$39.99</span>
                  <span className="text-gray-500 text-sm ml-2">/ month</span>
                </div>
                <ul className="space-y-4 text-sm text-gray-400 mb-10 flex-1">
                  <li className="flex items-center space-x-3"><span className="text-purple-500">✓</span><span>Equity Staking Pool</span></li>
                  <li className="flex items-center space-x-3"><span className="text-purple-500">✓</span><span>Direct Investor Access</span></li>
                  <li className="flex items-center space-x-3"><span className="text-purple-500">✓</span><span>Scale Analytics (V2)</span></li>
                </ul>
                <button 
                  onClick={() => addNotification("Applied for Equity Track!", "info")}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition-all active:scale-95"
                >
                  Apply for Track
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-gray-600 italic">
              * Subscriptions are non-merit boosting; they provide convenience and analytics only.
            </p>
          </div>
        );
      case 'prd':
        return (
          <div className="flex flex-col h-[calc(100vh-140px)]">
            <header className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">PRD Assistant</h2>
                <p className="text-gray-400 text-sm italic">AI-driven analysis of the SF Ecosystem Protocol</p>
              </div>
              <button 
                onClick={isLiveActive ? stopLiveSession : startLiveSession}
                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center space-x-2 ${isLiveActive ? 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/20' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20'}`}
              >
                <span>{isLiveActive ? '🔴 End Voice Session' : '🎙️ Start Voice Chat'}</span>
              </button>
            </header>
            
            <div className="flex-1 overflow-y-auto mb-4 bg-gray-900/50 border border-gray-800 rounded-xl p-6 relative">
              {isLiveActive && (
                <div className="absolute inset-0 bg-blue-900/10 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-6 text-center">
                  <div className="flex items-end space-x-1 h-12">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <div key={i} className="waveform-bar w-2 bg-blue-400 rounded-full" style={{ animationDelay: `${i * 0.1}s` }}></div>
                    ))}
                  </div>
                  <div className="px-8">
                    <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">{liveStatus === 'listening' ? 'Listening...' : 'Speaking...'}</p>
                    <p className="text-white text-lg font-medium italic max-w-md line-clamp-3">{liveTranscription || "I'm listening. Ask me about the merit model or payouts."}</p>
                  </div>
                </div>
              )}

              {aiResponse ? (
                <div className="prose prose-invert max-w-none">
                  <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg mb-4 text-sm text-blue-200">
                    <p className="font-bold mb-1 underline">Analysis Result:</p>
                    <div className="whitespace-pre-wrap leading-relaxed">{aiResponse}</div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4 opacity-50">
                  <span className="text-6xl">🤖</span>
                  <p>Ask me anything about the XP model, Payout Pools, or Anti-Abuse rules.</p>
                </div>
              )}
              {isLoading && <div className="text-center text-blue-500 animate-pulse text-sm">Processing protocol analysis...</div>}
            </div>

            <div className="flex space-x-4">
              <input value={aiQuery} onChange={(e) => setAiQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && askAi()} placeholder="Ex: How are Work Points (WP) calculated?" className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors text-white" />
              <button onClick={askAi} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all">Analyze</button>
            </div>
          </div>
        );
      default:
        return <div className="flex items-center justify-center h-full text-gray-500 italic">Coming soon...</div>;
    }
  };

  return (
    <div className="min-h-screen pl-64 transition-all bg-[#0a0a0a]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Rank Up Overlay */}
      {transitionState?.active && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-xl animate-in fade-in duration-700"></div>
          {transitionState.direction === 'up' && <Confetti />}
          <div className="relative animate-rank-pop text-center space-y-8 max-w-lg px-6">
            <div className="text-blue-400 font-black text-6xl tracking-tighter uppercase italic drop-shadow-2xl">
              {transitionState.direction === 'up' ? 'Tier Promoted!' : 'League Updated'}
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
              <div className="w-56 h-56 mx-auto bg-gradient-to-t from-blue-600/30 to-blue-400/10 rounded-[3rem] flex items-center justify-center text-[7rem] shadow-2xl shadow-blue-500/50 border border-blue-400/40 rank-shine relative z-10 overflow-hidden">
                <LeagueIcon league={transitionState.league} />
              </div>
            </div>
            <div className="text-white text-4xl font-black tracking-widest uppercase">{transitionState.league}</div>
          </div>
        </div>
      )}

      {/* Notifications Portal */}
      <div className="fixed top-6 right-6 z-[1000] flex flex-col items-end space-y-3 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className={`notification-card w-80 p-4 rounded-xl border shadow-2xl backdrop-blur-md pointer-events-auto flex items-start space-x-3 ${n.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-100' : n.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-100' : 'bg-blue-500/10 border-blue-500/30 text-blue-100'}`}>
            <span className="text-lg">{n.type === 'success' ? '✅' : n.type === 'error' ? '❌' : 'ℹ️'}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold">{n.message}</p>
            </div>
            <button onClick={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))} className="text-white/20 hover:text-white/50 transition-colors">✕</button>
          </div>
        ))}
      </div>

      <main className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Ecosystem Dashboard</h1>
            <p className="text-white text-3xl font-black tracking-tight">Welcome back, Alex</p>
          </div>
          <div className="flex space-x-3 items-center">
             <div className="flex items-center space-x-4 mr-4 bg-gray-900/50 px-4 py-2 rounded-xl border border-gray-800 transition-all duration-700">
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Active Rank</p>
                  <p className="text-xs font-bold text-gray-300">{leagueData.current.name}</p>
                </div>
                <div className="w-9 h-9 rounded-full border border-gray-800 bg-gray-800/50 flex items-center justify-center text-base">
                  <LeagueIcon league={leagueData.current.name} />
                </div>
             </div>
             <button className="p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors relative group">
                <span className="text-lg">🔔</span>
                {notifications.length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping"></span>}
             </button>
          </div>
        </div>

        {renderContent()}
      </main>
      
      <footer className="max-w-7xl mx-auto px-8 py-10 border-t border-gray-800 text-[10px] text-gray-600 flex justify-between uppercase tracking-widest">
        <span>© 2024 SF Ecosystem Protocols. All Rights Reserved.</span>
        <div className="space-x-4">
          <a href="#" className="hover:text-blue-400 transition-colors">Governance</a>
          <a href="#" className="hover:text-blue-400 transition-colors">Security Audit</a>
          <a href="#" className="hover:text-blue-400 transition-colors">Developer API</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
