/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, User, Calendar, Zap, TrendingUp, Rocket, GraduationCap, Globe } from 'lucide-react';
import ETIcon from './ETIcon';
import { Persona } from '../types';
import { translations, Language } from '../i18n';

interface UserProfile {
  name: string;
  age: number;
  persona: Persona;
}

interface Props {
  onComplete: (profile: UserProfile) => void;
  vernacular?: Language;
}

export default function Onboarding({ onComplete, vernacular = 'en' }: Props) {
  const t = translations[vernacular];
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [persona, setPersona] = useState<Persona>('general');

  const personas: { id: Persona; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'investor', label: t.investor, icon: <TrendingUp size={24} />, desc: t.investorDesc },
    { id: 'startup', label: t.startup, icon: <Rocket size={24} />, desc: t.startupDesc },
    { id: 'student', label: t.student, icon: <GraduationCap size={24} />, desc: t.studentDesc },
    { id: 'general', label: t.general, icon: <Globe size={24} />, desc: t.generalDesc },
  ];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete({ name, age: Number(age), persona });
    }
  };

  return (
    <div className="fixed inset-0 bg-et-cream dark:bg-[#0a0a0a] z-[200] flex items-center justify-center p-4 overflow-hidden transition-colors duration-300">
      {/* Background Images for Steps */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="bg1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0"
          >
            <img 
              src="https://picsum.photos/seed/newsroom/1920/1080" 
              alt="" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover grayscale"
            />
          </motion.div>
        )}
        {step === 2 && (
          <motion.div 
            key="bg2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0"
          >
            <img 
              src="https://picsum.photos/seed/calendar/1920/1080" 
              alt="" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover grayscale"
            />
          </motion.div>
        )}
        {step === 3 && (
          <motion.div 
            key="bg3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0"
          >
            <img 
              src="https://picsum.photos/seed/business/1920/1080" 
              alt="" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover grayscale"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-md w-full relative z-10">
        <div className="flex items-center gap-3 mb-12 justify-center">
          <ETIcon size={40} />
          <h1 className="text-2xl font-display font-bold tracking-tight dark:text-white">ET NAVIGATOR</h1>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold dark:text-white">{t.welcomeFuture}</h2>
                <p className="text-et-ink/60 dark:text-white/60">{t.startWithName}</p>
              </div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-et-ink/30 dark:text-white/30" size={20} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.yourName}
                  className="w-full bg-et-cream dark:bg-white/5 border border-et-ink/10 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-et-red/20 focus:border-et-red transition-all text-lg dark:text-white"
                  autoFocus
                />
              </div>
              <button
                disabled={!name.trim()}
                onClick={handleNext}
                className="w-full bg-et-ink dark:bg-white text-white dark:text-et-ink py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-et-red dark:hover:bg-et-red dark:hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-et-ink"
              >
                {t.continue}
                <ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold dark:text-white">{t.niceToMeet}, {name}.</h2>
                <p className="text-et-ink/60 dark:text-white/60">{t.howOld}</p>
              </div>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-et-ink/30 dark:text-white/30" size={20} />
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                  placeholder={t.yourAge}
                  className="w-full bg-et-cream dark:bg-white/5 border border-et-ink/10 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-et-red/20 focus:border-et-red transition-all text-lg dark:text-white"
                  autoFocus
                />
              </div>
              <button
                disabled={!age}
                onClick={handleNext}
                className="w-full bg-et-ink dark:bg-white text-white dark:text-et-ink py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-et-red dark:hover:bg-et-red dark:hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-et-ink"
              >
                {t.continue}
                <ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold dark:text-white">{t.tailorExperience}</h2>
                <p className="text-et-ink/60 dark:text-white/60">{t.primaryInterest}</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {personas.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPersona(p.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                      persona === p.id
                        ? 'bg-et-red/5 border-et-red text-et-red'
                        : 'bg-et-cream dark:bg-white/5 border-et-ink/10 dark:border-white/10 text-et-ink dark:text-white'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      persona === p.id ? 'bg-et-red text-white' : 'bg-et-ink/5 dark:bg-white/5 text-et-ink/40 dark:text-white/40'
                    }`}>
                      {p.icon}
                    </div>
                    <div>
                      <div className="font-bold uppercase tracking-widest text-xs">{p.label}</div>
                      <div className="text-xs opacity-60 leading-tight mt-1">{p.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={handleNext}
                className="w-full bg-et-ink dark:bg-white text-white dark:text-et-ink py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-et-red dark:hover:bg-et-red dark:hover:text-white transition-all"
              >
                {t.enterNewsroom}
                <ETIcon size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 flex justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 rounded-full transition-all ${
                s === step ? 'w-8 bg-et-red' : 'w-2 bg-et-ink/10 dark:bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
