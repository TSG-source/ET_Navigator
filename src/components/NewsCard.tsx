/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ExternalLink, 
  Activity, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Play, 
  ChevronRight,
  Maximize2,
  X,
  ArrowRight
} from 'lucide-react';
import { NewsStory } from '../types';
import { translations, Language } from '../i18n';

interface Props {
  story: NewsStory;
  index: number;
  onTrack: () => void;
  onNavigate: () => void;
  onVideo: () => void;
  onOpen: () => void;
  isReel?: boolean;
  vernacular?: Language;
}

export default function NewsCard({ story, index, onTrack, onNavigate, onVideo, onOpen, isReel, vernacular = 'en' }: Props) {
  const t = translations[vernacular];

  const sentimentIcon = {
    positive: <TrendingUp size={14} className="text-green-600" />,
    negative: <TrendingDown size={14} className="text-et-red" />,
    neutral: <Minus size={14} className="text-et-ink/40" />,
  };

  const isMarketNews = story.category.toLowerCase().includes('market') || story.category.toLowerCase().includes('finance');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onOpen}
      className={`group relative flex flex-col bg-et-cream dark:bg-[#121212] border-b border-et-ink/10 dark:border-white/10 overflow-hidden hover:bg-white/40 dark:hover:bg-white/5 transition-all duration-300 cursor-pointer ${
        isReel ? 'h-full w-full snap-start border-none bg-gradient-to-b from-et-cream via-white/20 to-et-cream dark:from-[#0a0a0a] dark:via-white/5 dark:to-[#0a0a0a]' : 'h-full'
      }`}
    >
      {story.imageUrl && !isReel && (
        <div className="w-full h-48 overflow-hidden">
          <img 
            src={story.imageUrl} 
            alt={story.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <div className={`p-8 md:p-12 flex flex-col h-full ${isReel ? 'justify-center items-center text-center max-w-lg mx-auto relative' : ''}`}>
        {isReel && story.imageUrl && (
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
            <img 
              src={story.imageUrl} 
              alt=""
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover blur-sm"
            />
          </div>
        )}
        
        {isReel && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-20 pointer-events-none">
            <div className="w-0.5 h-6 bg-et-ink/10 rounded-full overflow-hidden">
              <motion.div 
                animate={{ y: [-24, 24] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-full h-1/2 bg-et-red"
              />
            </div>
          </div>
        )}

        <div className={`flex flex-col w-full ${isReel ? 'mt-4 mb-2' : ''}`}>
          <div className="flex items-center justify-between mb-3 w-full">
            {isMarketNews ? (
              <div className="bg-et-ink dark:bg-white text-white dark:text-et-ink px-2 py-0.5 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                ET MARKETS
                <ChevronRight size={10} className="text-et-red" fill="currentColor" />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-et-red" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-et-ink/60 dark:text-white/60">
                  {story.category}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              {sentimentIcon[story.sentiment]}
              <span className="text-[9px] font-mono uppercase tracking-widest text-et-ink/40 dark:text-white/40 font-bold">
                {story.sentiment}
              </span>
              <div className="w-px h-3 bg-et-ink/10 dark:bg-white/10 mx-1" />
              <Maximize2 size={12} className="text-et-ink/20 dark:text-white/20 group-hover:text-et-red transition-colors" />
            </div>
          </div>

          <h3 className={`${isReel ? 'text-2xl md:text-5xl line-clamp-3' : 'text-xl'} font-display font-bold leading-tight mb-3 group-hover:text-et-red transition-colors dark:text-white`}>
            {story.title}
          </h3>
        </div>
        
        <div className="relative w-full">
          <p className={`text-et-ink/70 dark:text-white/70 ${isReel ? 'text-base md:text-xl' : 'text-sm'} leading-relaxed font-medium line-clamp-4 pr-4`}>
            {story.summary}
          </p>
          {isReel && (
            <div 
              className="absolute bottom-0 right-0 bg-gradient-to-l from-et-cream dark:from-[#0a0a0a] via-et-cream/95 dark:via-[#0a0a0a]/95 to-transparent pl-8 text-et-red font-black text-2xl hover:scale-110 transition-transform leading-none pb-0.5"
              title="Read More"
            >
              ...
            </div>
          )}
        </div>

          <div className={`${isReel ? 'mt-6 w-full' : 'mt-auto w-full'} pt-4 flex flex-col gap-6`}>
          <div className={`flex items-center gap-2 ${isReel ? 'justify-center' : 'justify-start'}`}>
            <span className="text-[9px] font-mono text-et-ink/30 dark:text-white/30 uppercase tracking-widest">{t.source}:</span>
            <span className="text-[10px] font-bold text-et-ink/60 dark:text-white/60">{story.source}</span>
          </div>
          
          <div className={`flex items-center gap-6 ${isReel ? 'justify-center' : 'justify-end'}`}>
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); onVideo(); }}
                className={`bg-et-red text-white rounded-full transition-all hover:scale-110 active:scale-95 shadow-lg shadow-et-red/20 border-2 border-transparent hover:border-et-red ${isReel ? 'p-5' : 'p-2'}`}
                title={t.video}
              >
                <Play size={isReel ? 28 : 20} fill="currentColor" />
              </button>
              {isReel && <span className="text-[9px] font-bold uppercase tracking-widest text-et-red">{t.video}</span>}
            </div>

            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); onNavigate(); }}
                className={`bg-et-red text-white rounded-full transition-all hover:scale-110 active:scale-95 shadow-lg shadow-et-red/20 border-2 border-transparent hover:border-et-red ${isReel ? 'p-5' : 'p-2'}`}
                title={t.briefing}
              >
                <MessageSquare size={isReel ? 28 : 20} />
              </button>
              {isReel && <span className="text-[9px] font-bold uppercase tracking-widest text-et-red">{t.briefing}</span>}
            </div>

            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); onTrack(); }}
                className={`bg-et-ink dark:bg-white text-white dark:text-et-ink rounded-full transition-all hover:scale-110 active:scale-95 shadow-lg shadow-et-ink/20 dark:shadow-white/10 border-2 border-transparent hover:border-et-red ${isReel ? 'p-5' : 'p-2'}`}
                title={t.trackStory}
              >
                <Activity size={isReel ? 28 : 20} />
              </button>
              {isReel && <span className="text-[9px] font-bold uppercase tracking-widest text-et-ink dark:text-white">{t.trackStory}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Relevance Indicator */}
      <div className="absolute top-0 left-0 w-0.5 h-full bg-et-ink/5">
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: `${story.relevance}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className="w-full bg-et-red"
        />
      </div>
    </motion.div>
  );
}
