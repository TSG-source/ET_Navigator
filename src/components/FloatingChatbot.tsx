/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, X, Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import ETIcon from './ETIcon';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';
import { chatWithAssistant } from '../services/gemini';
import { Language, translations } from '../i18n';

interface Props {
  vernacular?: Language;
  isSidebarExpanded?: boolean;
}

export default function FloatingChatbot({ vernacular = 'en', isSidebarExpanded = false }: Props) {
  const t = translations[vernacular];
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: vernacular === 'en' 
        ? "Hi! I'm ET Helpbot. How can I help you navigate the ET Navigator app today?"
        : vernacular === 'hi'
        ? "नमस्ते! मैं ET Helpbot हूँ। आज मैं आपको ET Navigator ऐप नेविगेट करने में कैसे मदद कर सकता हूँ?"
        : "வணக்கம்! நான் ET Helpbot. இன்று ET Navigator செயலியைப் பயன்படுத்த நான் உங்களுக்கு எப்படி உதவுவது?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatWithAssistant(input, messages);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error("Assistant error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I hit a snag. Could you try again?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className={`fixed bottom-6 z-[60] transition-all duration-300 ease-in-out ${
        isSidebarExpanded ? 'left-72' : 'left-24'
      }`}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom left' }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? '60px' : '500px',
              width: isMinimized ? '200px' : '350px'
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-et-cream dark:bg-[#1a1a1a] border border-et-ink/10 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col mb-4 transition-colors duration-300"
          >
            {/* Header */}
            <div className="p-4 bg-et-red text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <ETIcon size={32} className="border border-white/20" />
                <div>
                  <h4 className="font-bold text-sm font-display italic">ET Helpbot</h4>
                  {!isMinimized && <p className="text-[8px] text-white/60 font-mono uppercase tracking-widest">Always Online</p>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-et-cream/30 dark:bg-black/20">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                        msg.role === 'user' ? 'bg-et-ink/5 dark:bg-white/5 border-et-ink/10 dark:border-white/10' : 'bg-et-red/10 border-et-red/20'
                      }`}>
                        {msg.role === 'user' ? <User size={16} className="text-et-ink/60 dark:text-white/60" /> : <Bot size={16} className="text-et-red" />}
                      </div>
                      <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.role === 'user' ? 'bg-et-ink/5 dark:bg-white/10 text-et-ink/80 dark:text-white/80 rounded-tr-none' : 'bg-et-cream dark:bg-[#2a2a2a] text-et-ink/80 dark:text-white/80 rounded-tl-none border border-et-ink/10 dark:border-white/10 shadow-sm'
                      }`}>
                        <div className="prose prose-xs max-w-none dark:prose-invert">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-et-red/10 border border-et-red/20 flex items-center justify-center animate-pulse">
                        <Bot size={16} className="text-et-red" />
                      </div>
                      <div className="p-3 rounded-2xl bg-et-cream dark:bg-[#2a2a2a] border border-et-ink/10 dark:border-white/10 rounded-tl-none flex gap-1 shadow-sm">
                        <div className="w-1.5 h-1.5 bg-et-red rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-et-red rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1.5 h-1.5 bg-et-red rounded-full animate-bounce [animation-delay:-0.3s]" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-et-ink/10 dark:border-white/10 bg-et-cream dark:bg-[#1a1a1a]">
                  <div className="relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Type a message..."
                      className="w-full bg-et-cream/20 dark:bg-white/5 border border-et-ink/10 dark:border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs focus:outline-none focus:border-et-red transition-all dark:text-white"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || loading}
                      className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-et-red text-white rounded-lg hover:bg-et-ink dark:hover:bg-white dark:hover:text-et-ink disabled:opacity-50 transition-all flex items-center justify-center"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 bg-et-red text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-et-ink transition-all relative group border-2 border-transparent hover:border-et-red ${
          isOpen ? 'bg-et-ink' : ''
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <ETIcon size={32} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-et-red border-2 border-et-cream dark:border-[#0a0a0a] rounded-full animate-pulse" />
        )}
        
        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute left-full ml-4 px-3 py-1.5 bg-et-ink dark:bg-white text-white dark:text-et-ink text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            ET Helpbot
          </div>
        )}
      </motion.button>
    </div>
  );
}
