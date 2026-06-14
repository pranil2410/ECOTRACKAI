'use client';

import React, { useState, useEffect, useRef } from 'react';
import NavigationShell from '../../components/NavigationShell';
import { useAuth } from '../../hooks/useAuth';
import { dbService } from '../../lib/db';
import { aiService, CoachResponse, ChatMessage } from '../../services/aiService';
import { FootprintEntry, Challenge } from '../../types';
import { 
  Sparkles, 
  Send, 
  TrendingDown, 
  HelpCircle, 
  Lightbulb, 
  Check, 
  Bot, 
  User, 
  ArrowRight,
  Flame,
  Leaf
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import Link from 'next/link';

export default function CoachPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<FootprintEntry[]>([]);
  const [analysis, setAnalysis] = useState<CoachResponse | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(true);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: "Hello! I am your EcoTrack AI Coach. I have analyzed your logged activities. Ask me anything about reducing energy bills, low-carbon diets, eco-friendly transport, or waste recycling!",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sendingMessage]);

  const loadData = async () => {
    if (!user) return;
    try {
      const [entriesData, challengesData] = await Promise.all([
        dbService.getFootprintEntries(user.id),
        dbService.getChallenges()
      ]);
      setEntries(entriesData);
      setChallenges(challengesData);

      // Fetch AI analysis of entries
      const aiAnalysis = await aiService.getFootprintAnalysis(entriesData);
      setAnalysis(aiAnalysis);
    } catch (err) {
      console.error('Failed to load coach data:', err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Handle Send Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || sendingMessage || !user) return;

    const userText = inputMessage;
    setInputMessage('');
    setSendingMessage(true);

    const newUserMessage: ChatMessage = {
      sender: 'user',
      text: userText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Call Gemini Coach
      const reply = await aiService.askCoach(userText, messages, entries);
      
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: reply,
        timestamp: new Date().toISOString()
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: "I am having trouble connecting to the Gemini engine right now. Try check your internet connection or try again later. For now, try reducing water heating temperatures to save energy!",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setSendingMessage(false);
    }
  };

  // Find suggested challenge details
  const suggestedChallenge = challenges.find(c => c.id === analysis?.suggestedChallengeId);

  return (
    <NavigationShell>
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
            AI Sustainability Coach
          </h1>
          <p className="text-slate-400 text-sm">Receive personalized emission reviews, weekly challenge matches, and live Q&A recommendations.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel: Coach Analysis & Recommendations */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Sustainability Score Card */}
            <div className="p-6 rounded-2xl bg-[#10121a] border border-white/10 relative overflow-hidden flex flex-col items-center text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
              
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">AI Sustainability Score</span>
              
              {loadingAnalysis ? (
                <div className="h-28 w-28 rounded-full border-4 border-white/5 border-t-emerald-500 animate-spin mb-4" />
              ) : (
                <div className="relative h-28 w-28 flex items-center justify-center mb-4">
                  {/* Outer circle */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle 
                      cx="56" 
                      cy="56" 
                      r="48" 
                      className="stroke-white/5 fill-transparent" 
                      strokeWidth="8" 
                    />
                    <circle 
                      cx="56" 
                      cy="56" 
                      r="48" 
                      className="stroke-emerald-500 fill-transparent transition-all duration-1000" 
                      strokeWidth="8" 
                      strokeDasharray="301.6"
                      strokeDashoffset={301.6 - (301.6 * (analysis?.sustainabilityScore || 0)) / 100}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-white">{analysis?.sustainabilityScore || 75}</span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Score</span>
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-400 px-4 leading-relaxed">
                {analysis?.sustainabilityScore && analysis.sustainabilityScore >= 80 
                  ? "Excellent! You are maintaining a low carbon footprint. Keep practicing sustainable habits!" 
                  : analysis?.sustainabilityScore && analysis.sustainabilityScore >= 50
                  ? "Moderate score. There are significant opportunities to reduce emissions in your daily routine."
                  : "High carbon intensity. Review the recommendations below to take immediate green actions."}
              </p>
            </div>

            {/* AI Insights & Goal suggestion */}
            <div className="p-6 rounded-2xl glass-panel border border-white/5 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-emerald-400" /> Weekly Target Recommendation
              </h3>
              
              {loadingAnalysis ? (
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-white/5 animate-pulse" />
                  <div className="h-4 w-3/4 rounded bg-white/5 animate-pulse" />
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-slate-300 leading-relaxed bg-emerald-500/5 border border-emerald-500/15 p-3 rounded-lg font-medium">
                    "{analysis?.weeklyGoalRecommendation}"
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {analysis?.insights}
                  </p>
                </div>
              )}

              {/* Recommended Challenge shortcut */}
              {suggestedChallenge && (
                <div className="mt-2 border-t border-white/5 pt-4 flex flex-col gap-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Recommended Challenge</span>
                  <div className="p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <strong className="text-xs text-white">{suggestedChallenge.title}</strong>
                      <span className="text-[9px] font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded text-emerald-400">
                        +{suggestedChallenge.points_reward} pts
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">{suggestedChallenge.description}</p>
                    <Link 
                      href="/challenges"
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 hover:text-white mt-1"
                    >
                      Join Challenge <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Interactive Q&A Coach Chat */}
          <div className="lg:col-span-2 flex flex-col h-[600px] rounded-2xl glass-panel border border-white/5 overflow-hidden">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-white/5 bg-[#0c0d14] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Interactive Coach Dialogue</h3>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Gemini 1.5 Engine Live
                </span>
              </div>
            </div>

            {/* Chat History Panel */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar bg-[#090a0f]/35">
              {messages.map((msg, idx) => {
                const isAI = msg.sender === 'ai';
                return (
                  <div 
                    key={idx} 
                    className={cn(
                      "flex gap-3 max-w-[85%] animate-fade-in",
                      isAI ? "self-start" : "self-end flex-row-reverse"
                    )}
                  >
                    {/* Avatar */}
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0",
                      isAI 
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                        : "bg-slate-800 text-white"
                    )}>
                      {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>

                    {/* Text Bubble */}
                    <div className={cn(
                      "p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap",
                      isAI 
                        ? "bg-white/5 border border-white/5 text-slate-300 rounded-tl-none" 
                        : "bg-emerald-500 text-white font-medium rounded-tr-none shadow-md shadow-emerald-500/10"
                    )}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {sendingMessage && (
                <div className="flex gap-3 max-w-[85%] self-start animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 rounded-tl-none flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-[#0c0d14] flex gap-2">
              <input 
                type="text" 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={sendingMessage}
                placeholder="Ask advice (e.g. 'How can I save electricity on A/C?')"
                className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-[#090a0f] text-white text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              <button 
                type="submit"
                disabled={sendingMessage || !inputMessage.trim()}
                className="px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/40 text-white font-bold transition-all flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Personalized AI Tips (Grid Layout) */}
        {!loadingAnalysis && analysis?.recommendations && (
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-white">Tailored Action Strategies</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analysis.recommendations.map((rec, index) => (
                <div key={index} className="p-5 rounded-2xl glass-card flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[9px] font-bold uppercase",
                        rec.impact === 'High' 
                          ? "bg-rose-500/20 text-rose-400" 
                          : rec.impact === 'Medium' 
                          ? "bg-amber-500/20 text-amber-400" 
                          : "bg-sky-500/20 text-sky-400"
                      )}>
                        {rec.impact} Impact
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm mt-1">{rec.title}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">{rec.description}</p>
                  </div>
                  <div className="border-t border-white/5 pt-3 mt-1 text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <span>Task:</span>
                    <span className="text-slate-300 font-semibold truncate">{rec.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </NavigationShell>
  );
}
