/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Maximize2, Sparkles, Zap, Activity, TrendingUp } from 'lucide-react';
import ETIcon from './ETIcon';
import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'DEMO_MODE' });

interface Props {
  story: { title: string; summary: string } | null;
  onClose: () => void;
}

export default function VideoStudio({ story, onClose }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [script, setScript] = useState<{ text: string; imageUrl: string }[]>([]);
  const [currentLine, setCurrentLine] = useState(0);

  useEffect(() => {
    if (story) {
      generateVideoContent();
    }
  }, [story]);

  const generateVideoContent = async () => {
    setLoading(true);
    
    // Fallback script for Demo Mode
    const fallbackScript = [
      { text: "Welcome to ET AI Studio. Today's top story is breaking now.", imageUrl: `https://picsum.photos/seed/news/1200/800` },
      { text: story?.title || "Major market update incoming.", imageUrl: `https://picsum.photos/seed/title/1200/800` },
      { text: "Analysts are closely watching the impact on global trade and local markets.", imageUrl: `https://picsum.photos/seed/chart/1200/800` },
      { text: "Early indicators suggest a significant shift in investor sentiment.", imageUrl: `https://picsum.photos/seed/invest/1200/800` },
      { text: "Stay tuned to ET Navigator for real-time updates as this story develops.", imageUrl: `https://picsum.photos/seed/et/1200/800` },
    ];

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'DEMO_MODE') {
      setScript(fallbackScript);
      setLoading(false);
      return;
    }

    try {
      // 1. Generate Script
      const scriptResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a 60-second broadcast news script for this story: "${story?.title}". 
        The script should be professional, punchy, and divided into 5 clear segments.
        For each segment, also provide a relevant 'keyword' for an image.
        Return as a JSON array of objects with 'text' and 'keyword' properties.`,
        config: { responseMimeType: "application/json" }
      });
      const segments = JSON.parse(scriptResponse.text);
      const linesWithImages = segments.map((s: any) => ({
        text: s.text,
        imageUrl: `https://picsum.photos/seed/${s.keyword}/1200/800`
      }));
      setScript(linesWithImages);

      // 2. Generate Narration (TTS)
      const ttsResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Read this news report professionally: ${linesWithImages.map((l: any) => l.text).join(' ')}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Fenrir' },
            },
          },
        },
      });

      const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const binary = atob(base64Audio);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: 'audio/pcm' }); 
        setAudioUrl(URL.createObjectURL(blob));
      }
    } catch (error) {
      console.error("Video generation error, using fallback", error);
      setScript(fallbackScript);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isPlaying && progress < 100) {
      interval = setInterval(() => {
        setProgress(prev => {
          const next = prev + 0.5;
          if (next >= 100) setIsPlaying(false);
          return next;
        });
        setCurrentLine(Math.floor((progress / 100) * script.length));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, progress, script.length]);

  if (!story) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-et-ink/95 backdrop-blur-xl flex items-center justify-center p-12"
    >
      <button 
        onClick={onClose}
        className="absolute top-12 right-12 text-white/40 hover:text-white transition-colors font-mono uppercase tracking-widest text-xs"
      >
        Close Studio
      </button>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Video Player Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="aspect-video bg-et-ink rounded-3xl border-4 border-white overflow-hidden relative group shadow-2xl">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-16 border-4 border-et-red border-t-transparent rounded-full animate-spin" />
                <div className="text-center">
                  <h3 className="font-bold uppercase tracking-widest text-sm mb-2 text-white">Generating Broadcast</h3>
                  <p className="text-xs text-white/40 font-mono">Synthesizing visuals & narration...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Simulated Visuals */}
                <div className="absolute inset-0 bg-gradient-to-br from-et-red/20 to-black" />
                
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentLine}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {script[currentLine]?.imageUrl && (
                      <div className="absolute inset-0 z-0">
                        <img 
                          src={script[currentLine].imageUrl} 
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover opacity-40"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-et-ink via-transparent to-et-ink/50" />
                      </div>
                    )}
                    <div className="relative z-10 p-20 text-center space-y-8">
                      <div className="w-24 h-24 bg-et-red rounded-full mx-auto flex items-center justify-center shadow-2xl shadow-et-red/50">
                        <Activity size={40} className="text-white" />
                      </div>
                      <h2 className="text-4xl font-display font-bold text-white leading-tight drop-shadow-lg">
                        {script[currentLine]?.text}
                      </h2>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Overlays */}
                <div className="absolute top-8 left-8 flex items-center gap-3">
                  <div className="px-3 py-1 bg-et-red text-white text-[10px] font-bold uppercase tracking-widest rounded animate-pulse">
                    Breaking
                  </div>
                  <div className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[10px] font-mono uppercase tracking-widest rounded border border-white/10">
                    ET AI Studio
                  </div>
                </div>

                <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                  <div className="max-w-md">
                    <span className="text-et-gold font-mono text-[10px] uppercase tracking-widest mb-2 block font-bold">Contextual Overlay</span>
                    <p className="text-sm font-bold leading-tight bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white">
                      {story.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                    <TrendingUp size={20} className="text-green-500" />
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-white/40 uppercase block">Market Impact</span>
                      <span className="text-sm font-bold text-green-500">+4.2%</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Controls */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-8">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-12 h-12 bg-et-cream text-et-ink rounded-full flex items-center justify-center hover:bg-et-red hover:text-white transition-all shadow-lg"
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
            
            <div className="flex-1 space-y-2">
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-et-red"
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-white/40 uppercase tracking-widest">
                <span>0:{(Math.floor(progress * 0.6)).toString().padStart(2, '0')}</span>
                <span>1:00</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-white/40">
              <Volume2 size={20} />
              <Maximize2 size={20} />
            </div>
          </div>
        </div>

        {/* Info Area */}
        <div className="space-y-8">
          <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-6">
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="text-et-gold" />
              <h3 className="font-bold uppercase tracking-widest text-sm text-white">AI Production Notes</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[10px] font-mono text-white/20 uppercase block mb-1">Tone</span>
                <p className="text-sm font-bold text-white">Professional / Authoritative</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[10px] font-mono text-white/20 uppercase block mb-1">Voice</span>
                <p className="text-sm font-bold text-white">Fenrir (Deep Baritone)</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[10px] font-mono text-white/20 uppercase block mb-1">Visual Style</span>
                <p className="text-sm font-bold text-white">Kinetic Typography / Data Viz</p>
              </div>
            </div>

            <button className="w-full py-4 bg-et-red text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-et-red/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-et-red/20">
              <ETIcon size={20} />
              Export for Social
            </button>
          </div>

          <div className="p-8 bg-et-red/10 border border-et-red/20 rounded-3xl">
            <h4 className="font-bold text-sm mb-4 flex items-center gap-2 text-white">
              <Activity size={16} className="text-et-red" />
              Live Data Feed
            </h4>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest">
                  <span className="text-white/40">Ticker {i}</span>
                  <span className="text-green-500">+{(Math.random() * 5).toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
