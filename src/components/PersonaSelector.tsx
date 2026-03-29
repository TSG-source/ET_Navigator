/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Persona } from '../types';
import { translations, Language } from '../i18n';

interface Props {
  current: Persona;
  onChange: (p: Persona) => void;
  vernacular?: Language;
}

export default function PersonaSelector({ current, onChange, vernacular = 'en' }: Props) {
  const t = translations[vernacular];
  const personas: { id: Persona; label: string }[] = [
    { id: 'general', label: t.general },
    { id: 'investor', label: t.investor },
    { id: 'startup', label: t.startup },
    { id: 'student', label: t.student },
  ];

  return (
    <div className="flex bg-et-cream dark:bg-white/5 p-1 rounded-full border border-et-ink/10 dark:border-white/10 shadow-sm transition-colors duration-300">
      {personas.map((p) => (
        <button
          key={p.id}
          onClick={() => onChange(p.id)}
          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
            current === p.id 
              ? 'bg-et-ink text-white dark:bg-white dark:text-et-ink shadow-sm' 
              : 'text-et-ink/40 dark:text-white/40 hover:text-et-ink dark:hover:text-white'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
