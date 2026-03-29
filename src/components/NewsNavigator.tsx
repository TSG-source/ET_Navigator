/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Sparkles, ExternalLink, RefreshCw } from 'lucide-react';
import ETIcon from './ETIcon';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';
import { chatWithNews } from '../services/gemini';
import { translations, Language } from '../i18n';

interface Props {
  vernacular?: Language;
  onOpenStory?: (story: any) => void;
}

export default function NewsNavigator({ vernacular = 'en', onOpenStory }: Props) {
  const t = translations[vernacular];
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: vernacular === 'en' 
        ? "Hello! I'm your AI News Navigator. I can synthesize complex business stories into interactive briefings. What would you like to explore today?"
        : vernacular === 'hi'
        ? "नमस्ते! मैं आपका AI समाचार नेविगेटर हूँ। मैं जटिल व्यावसायिक कहानियों को इंटरैक्टிக் ब्रीफिंग में संश्लेषित कर सकता हूँ। आज आप क्या खोजना चाहेंगे?"
        : "வணக்கம்! நான் உங்கள் AI செய்தி நேவிகேட்டர். சிக்கலான வணிகக் கதைகளை ஊடாடும் விளக்கங்களாக என்னால் ஒருங்கிணைக்க முடியும். இன்று நீங்கள் எதை ஆராய விரும்புகிறீர்கள்?",
    },
  ]);

  const handleOpenSource = (source: { title: string; url: string }, imageUrl?: string) => {
    if (onOpenStory) {
      // Create a partial NewsStory object from the source
      const partialStory = {
        id: Math.random().toString(36).substr(2, 9),
        title: source.title,
        summary: "Full details available via the source link. ET Navigator has synthesized this briefing based on real-time data from multiple business news outlets.",
        source: new URL(source.url).hostname.replace('www.', ''),
        url: source.url,
        imageUrl: imageUrl || `https://picsum.photos/seed/${source.title.split(' ')[0]}/800/600`,
        timestamp: new Date().toISOString(),
        category: "Briefing Source",
        sentiment: "neutral" as const,
        relevance: 100
      };
      onOpenStory(partialStory);
    }
  };

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatWithNews(input, messages);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I encountered an error while processing your request. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-et-cream dark:bg-[#121212] border border-et-ink/10 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl transition-colors duration-300">
      {/* Header */}
      <div className="p-6 border-b border-et-ink/10 flex items-center justify-between bg-et-red text-white">
        <div className="flex items-center gap-4">
          <ETIcon size={40} className="border border-white/20" />
          <div>
            <h3 className="font-bold text-lg font-display italic">{t.navigator}</h3>
            <p className="text-xs text-white/60 font-mono uppercase tracking-widest">Powered by Gemini 3.1 Pro</p>
          </div>
        </div>
        <button 
          onClick={() => setMessages([{ 
            role: 'model', 
            text: vernacular === 'en' 
              ? "Hello! I'm your AI News Navigator. I can synthesize complex business stories into interactive briefings. What would you like to explore today?"
              : vernacular === 'hi'
              ? "नमस्ते! मैं आपका AI समाचार नेविगेटर हूँ। मैं जटिल व्यावसायिक कहानियों को इंटरैक्टिव ब्रीफिंग में संश्लेषित कर सकता हूँ। आज आप क्या खोजना चाहेंगे?"
              : "வணக்கம்! நான் உங்கள் AI செய்தி நேவிகேட்டர். சிக்கலான வணிகக் கதைகளை ஊடாடும் விளக்கங்களாக என்னால் ஒருங்கிணைக்க முடியும். இன்று நீங்கள் எதை ஆராய விரும்புகிறீர்கள்?"
          }])}
          className="p-2 text-white/60 hover:text-white transition-colors"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide bg-et-cream/30 dark:bg-white/5">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
              msg.role === 'user' ? 'bg-et-ink/5 dark:bg-white/5 border-et-ink/10 dark:border-white/10' : 'bg-et-red/10 border-et-red/20'
            }`}>
              {msg.role === 'user' ? <User size={20} className="text-et-ink/60 dark:text-white/60" /> : <Bot size={20} className="text-et-red" />}
            </div>
            
            <div className={`max-w-[80%] space-y-4 ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`p-6 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' ? 'bg-et-ink/5 dark:bg-white/5 text-et-ink/80 dark:text-white/80 rounded-tr-none' : 'bg-et-cream dark:bg-white/5 text-et-ink/80 dark:text-white/80 rounded-tl-none border border-et-ink/10 dark:border-white/10 shadow-sm'
              }`}>
                {msg.imageUrl && (
                  <div className="mb-4 rounded-xl overflow-hidden shadow-md">
                    <img 
                      src={msg.imageUrl} 
                      alt="" 
                      referrerPolicy="no-referrer"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                <div className="prose prose-sm max-w-none prose-headings:font-display prose-headings:italic dark:prose-invert">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>

              {msg.sources && msg.sources.length > 0 && (
                <div className={`flex flex-wrap gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sources.map((source, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOpenSource(source, msg.imageUrl)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-et-cream dark:bg-white/5 border-2 border-transparent rounded-full text-[10px] font-mono uppercase tracking-widest hover:bg-et-red hover:text-white hover:border-et-red transition-all shadow-sm group dark:text-white/60 dark:hover:text-white"
                    >
                      <ExternalLink size={12} className="group-hover:scale-110 transition-transform" />
                      {source.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-6">
            <div className="w-10 h-10 rounded-full bg-et-red/10 border border-et-red/20 flex items-center justify-center animate-pulse">
              <Bot size={20} className="text-et-red" />
            </div>
            <div className="p-6 rounded-2xl bg-et-cream dark:bg-white/5 border border-et-ink/10 dark:border-white/10 rounded-tl-none flex gap-2 shadow-sm">
              <div className="w-2 h-2 bg-et-red rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-et-red rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-et-red rounded-full animate-bounce [animation-delay:-0.3s]" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-8 border-t border-et-ink/10 dark:border-white/10 bg-et-cream dark:bg-[#121212]">
        <div className="relative max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.askPulse}
            className="w-full bg-et-cream/20 dark:bg-white/5 border border-et-ink/10 dark:border-white/10 rounded-2xl py-4 pl-6 pr-16 text-sm focus:outline-none focus:border-et-red transition-all placeholder:text-et-ink/20 dark:placeholder:text-white/20 text-et-ink dark:text-white"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 top-2 bottom-2 px-4 bg-et-red text-white rounded-xl hover:bg-et-red/90 disabled:opacity-50 disabled:hover:bg-et-red transition-all flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-center mt-4 text-[10px] font-mono text-et-ink/20 dark:text-white/20 uppercase tracking-[0.2em]">
          Gemini 3.1 Pro synthesizes real-time data for every briefing
        </p>
      </div>
    </div>
  );
}
