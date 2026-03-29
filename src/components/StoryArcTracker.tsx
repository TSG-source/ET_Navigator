/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Activity, Users, Zap, Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { StoryArc } from '../types';
import { translations, Language } from '../i18n';

interface Props {
  topic: string | null;
  data: StoryArc | null;
  loading: boolean;
  vernacular?: Language;
  onOpenStory?: (story: any) => void;
}

export default function StoryArcTracker({ topic, data, loading, vernacular = 'en', onOpenStory }: Props) {
  const t = translations[vernacular];

  const handleOpenPoint = (point: any) => {
    if (onOpenStory) {
      const partialStory = {
        id: Math.random().toString(36).substr(2, 9),
        title: point.event,
        summary: point.impact,
        source: "Story Arc Timeline",
        url: "#",
        imageUrl: point.imageUrl,
        timestamp: point.date,
        category: "Timeline Event",
        sentiment: point.sentiment > 0 ? "positive" : point.sentiment < 0 ? "negative" : "neutral",
        relevance: 100
      };
      onOpenStory(partialStory);
    }
  };

  const handleOpenMain = () => {
    if (onOpenStory && data) {
      const partialStory = {
        id: Math.random().toString(36).substr(2, 9),
        title: data.title,
        summary: data.prediction,
        source: "Story Arc Analysis",
        url: "#",
        imageUrl: data.imageUrl,
        timestamp: new Date().toISOString(),
        category: "Story Arc",
        sentiment: "neutral",
        relevance: 100
      };
      onOpenStory(partialStory);
    }
  };

  if (!topic) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 bg-et-ink/5 dark:bg-white/5 border border-et-ink/10 dark:border-white/10 rounded-full flex items-center justify-center">
          <Activity size={32} className="text-et-ink/20 dark:text-white/20" />
        </div>
        <div>
          <h3 className="text-2xl font-display font-bold uppercase tracking-tighter dark:text-white">No Story Selected</h3>
          <p className="text-et-ink/40 dark:text-white/40 text-sm max-w-xs mx-auto mt-2">
            Select a story from your feed to track its complete visual narrative and sentiment shifts.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-12">
        <div className="h-20 bg-et-cream dark:bg-white/5 rounded-2xl animate-pulse border border-et-ink/5 dark:border-white/5 flex items-center justify-center">
          <span className="text-et-ink/20 dark:text-white/20 font-bold uppercase tracking-widest">{t.loading}</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-[400px] bg-et-cream dark:bg-white/5 rounded-2xl animate-pulse border border-et-ink/5 dark:border-white/5" />
          <div className="h-[400px] bg-et-cream dark:bg-white/5 rounded-2xl animate-pulse border border-et-ink/5 dark:border-white/5" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-et-ink dark:border-white pb-8 gap-8">
        <div className="flex-1 space-y-6">
          <div className="max-w-2xl">
            <span className="text-et-red font-mono text-xs uppercase tracking-[0.3em] mb-2 block font-bold">{t.storyArc}</span>
            <h2 className="text-5xl font-display font-bold leading-none dark:text-white">
              {data.title}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-left">
              <span className="text-[10px] font-mono text-et-ink/20 dark:text-white/20 uppercase tracking-widest block mb-1">{t.sentiment}</span>
              <div className="flex items-center gap-2 justify-end">
                <TrendingUp size={16} className="text-green-600" />
                <span className="text-xl font-bold text-green-600">Bullish</span>
              </div>
            </div>
          </div>
        </div>
        
        {data.imageUrl && (
          <motion.div 
            whileHover={{ scale: 1.02 }}
            onClick={handleOpenMain}
            className="w-full md:w-1/3 aspect-video rounded-2xl overflow-hidden shadow-2xl border border-et-ink/10 dark:border-white/10 cursor-pointer group"
          >
            <img 
              src={data.imageUrl} 
              alt={data.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sentiment Timeline */}
        <div className="lg:col-span-2 bg-et-cream dark:bg-white/5 border border-et-ink/10 dark:border-white/10 rounded-3xl p-8 space-y-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity size={20} className="text-et-red" />
              <h3 className="font-bold uppercase tracking-widest text-sm dark:text-white">{t.timeline}</h3>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-mono text-et-ink/40 dark:text-white/40 uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-et-red" />
                {t.sentiment}
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.timeline}>
                <defs>
                  <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ed1c24" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ed1c24" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--chart-axis)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: 'var(--chart-tick)' }}
                />
                <YAxis 
                  stroke="var(--chart-axis)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: 'var(--chart-tick)' }}
                  domain={[-1, 1]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--chart-tooltip-bg)', 
                    border: '1px solid var(--chart-tooltip-border)', 
                    borderRadius: '12px',
                    color: 'var(--chart-tooltip-text)'
                  }}
                  itemStyle={{ color: 'var(--chart-tooltip-text)', fontSize: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sentiment" 
                  stroke="#ed1c24" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSentiment)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-et-ink/5 dark:border-white/5">
            {data.timeline.slice(-2).map((point, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -4 }}
                onClick={() => handleOpenPoint(point)}
                className="flex gap-4 p-4 bg-et-cream/10 dark:bg-white/5 rounded-full border-2 border-transparent cursor-pointer hover:border-et-red transition-all group"
              >
                {point.imageUrl && (
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                    <img 
                      src={point.imageUrl} 
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-et-ink/20 dark:text-white/20 uppercase tracking-widest">{point.date}</span>
                  <p className="text-sm font-bold leading-tight group-hover:text-et-red transition-colors dark:text-white">{point.event}</p>
                  <p className="text-[11px] text-et-ink/40 dark:text-white/40 leading-relaxed font-medium line-clamp-2">{point.impact}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Key Players */}
        <div className="bg-et-cream dark:bg-white/5 border border-et-ink/10 dark:border-white/10 rounded-3xl p-8 space-y-8 shadow-sm">
          <div className="flex items-center gap-3">
            <Users size={20} className="text-et-red" />
            <h3 className="font-bold uppercase tracking-widest text-sm dark:text-white">{t.keyPlayers}</h3>
          </div>

          <div className="space-y-6">
            {data.keyPlayers.map((player, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-et-cream/10 dark:bg-white/5 rounded-2xl border border-et-ink/10 dark:border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-et-red/10 flex items-center justify-center font-bold text-et-red">
                    {player.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold dark:text-white">{player.name}</h4>
                    <p className="text-[10px] text-et-ink/40 dark:text-white/40 uppercase tracking-widest">{player.role}</p>
                  </div>
                </div>
                <div className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded border ${
                  player.sentiment === 'Bullish' || player.sentiment === 'Positive' ? 'text-green-600 border-green-600/20 bg-green-600/5' : 
                  player.sentiment === 'Bearish' || player.sentiment === 'Negative' ? 'text-et-red border-et-red/20 bg-et-red/5' : 
                  'text-et-ink/40 dark:text-white/40 border-et-ink/20 dark:border-white/20 bg-et-ink/5 dark:bg-white/5'
                }`}>
                  {player.sentiment}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-et-ink/5 dark:border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles size={16} className="text-et-red" />
              <h3 className="font-bold uppercase tracking-widest text-[10px] text-et-ink/40 dark:text-white/40">{t.prediction}</h3>
            </div>
            <div className="p-6 bg-et-red/5 dark:bg-et-red/10 border border-et-red/10 dark:border-et-red/20 rounded-2xl">
              <p className="text-sm leading-relaxed text-et-red italic font-medium">
                "{data.prediction}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
