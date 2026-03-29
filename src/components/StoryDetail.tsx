/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ExternalLink, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Play, 
  MessageSquare, 
  Activity,
  X
} from 'lucide-react';
import { NewsStory } from '../types';
import { translations, Language } from '../i18n';

interface Props {
  story: NewsStory | null;
  onClose: () => void;
  onVideo?: () => void;
  onNavigate?: () => void;
  onTrack?: () => void;
  vernacular?: Language;
}

export default function StoryDetail({ story, onClose, onVideo, onNavigate, onTrack, vernacular = 'en' }: Props) {
  if (!story) return null;
  const t = translations[vernacular];

  const sentimentIcon = {
    positive: <TrendingUp size={14} className="text-green-600" />,
    negative: <TrendingDown size={14} className="text-et-red" />,
    neutral: <Minus size={14} className="text-et-ink/40" />,
  };

  return (
    <AnimatePresence>
      {story && (
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 bg-et-cream dark:bg-[#0a0a0a] z-[100] flex flex-col transition-colors duration-300"
        >
          <div className="p-6 border-b border-et-ink/10 dark:border-white/10 flex items-center justify-between sticky top-0 bg-et-cream dark:bg-[#0a0a0a] z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-et-red flex items-center justify-center text-white font-display font-bold">ET</div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-et-ink dark:text-white">Full Story</h4>
                <p className="text-[10px] text-et-ink/40 dark:text-white/40 font-mono">{story.category}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-et-ink/5 dark:hover:bg-white/5 rounded-full transition-colors dark:text-white"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-2xl mx-auto">
              {story.imageUrl && (
                <div className="w-full aspect-video rounded-2xl overflow-hidden mb-8 shadow-xl">
                  <img 
                    src={story.imageUrl} 
                    alt={story.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 mb-6">
                {sentimentIcon[story.sentiment]}
                <span className="text-[10px] font-bold uppercase tracking-widest text-et-ink/40 dark:text-white/40">
                  {t.sentiment}: {story.sentiment}
                </span>
                <div className="w-1 h-1 rounded-full bg-et-ink/20 dark:bg-white/20 mx-2" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-et-ink/40 dark:text-white/40">
                  {story.source}
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-display font-bold leading-tight mb-8 text-et-ink dark:text-white">
                {story.title}
              </h2>

              <div className="prose prose-et max-w-none dark:prose-invert">
                <p className="text-lg md:text-xl text-et-ink/80 dark:text-white/80 leading-relaxed font-medium mb-8">
                  {story.summary}
                </p>
                
                <div className="space-y-6 text-et-ink/70 dark:text-white/70 leading-relaxed">
                  <p>
                    The current market dynamics suggest a significant shift in investor sentiment as global economic indicators continue to fluctuate. Analysts at {story.source} point towards a potential consolidation phase in the coming weeks, driven by both domestic policy changes and international trade developments.
                  </p>
                  <p>
                    Key stakeholders are closely monitoring the situation, with many expecting a detailed report from regulatory bodies by the end of the quarter. This development is particularly relevant for the {story.category} sector, which has seen increased volatility recently.
                  </p>
                  <p>
                    Furthermore, the integration of AI-driven analytics in tracking these trends has provided a more nuanced understanding of the long-term impacts. As the story unfolds, ET Navigator will continue to provide real-time updates and deep-dive analysis into the underlying factors shaping this narrative.
                  </p>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-et-ink/10 dark:border-white/10 flex flex-col gap-6">
                <button 
                  onClick={() => window.open(story.url, '_blank')}
                  className="w-full bg-et-ink dark:bg-white text-white dark:text-et-ink py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-et-red dark:hover:bg-et-red dark:hover:text-white transition-all"
                >
                  {t.readMore}
                  <ExternalLink size={18} />
                </button>

                <div className="grid grid-cols-3 gap-4">
                  {onVideo && (
                    <button 
                      onClick={() => { onClose(); onVideo(); }}
                      className="flex flex-col items-center gap-2 p-4 bg-et-cream/50 dark:bg-white/5 rounded-xl hover:bg-et-cream dark:hover:bg-white/10 transition-colors"
                    >
                      <Play size={24} className="text-et-red" fill="currentColor" />
                      <span className="text-[10px] font-bold uppercase tracking-widest dark:text-white">{t.video}</span>
                    </button>
                  )}
                  {onNavigate && (
                    <button 
                      onClick={() => { onClose(); onNavigate(); }}
                      className="flex flex-col items-center gap-2 p-4 bg-et-cream/50 dark:bg-white/5 rounded-xl hover:bg-et-cream dark:hover:bg-white/10 transition-colors"
                    >
                      <MessageSquare size={24} className="text-et-red" />
                      <span className="text-[10px] font-bold uppercase tracking-widest dark:text-white">{t.briefing}</span>
                    </button>
                  )}
                  {onTrack && (
                    <button 
                      onClick={() => { onClose(); onTrack(); }}
                      className="flex flex-col items-center gap-2 p-4 bg-et-cream/50 dark:bg-white/5 rounded-xl hover:bg-et-cream dark:hover:bg-white/10 transition-colors"
                    >
                      <Activity size={24} className="text-et-ink dark:text-white" />
                      <span className="text-[10px] font-bold uppercase tracking-widest dark:text-white">{t.trackStory}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
