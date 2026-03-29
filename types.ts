/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Persona = 'investor' | 'startup' | 'student' | 'general';

export interface NewsStory {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  imageUrl?: string;
  timestamp: string;
  category: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  relevance: number; // 0-100
}

export interface StoryArcPoint {
  date: string;
  event: string;
  sentiment: number; // -1 to 1
  impact: string;
  imageUrl?: string;
}

export interface StoryArc {
  title: string;
  imageUrl?: string;
  timeline: StoryArcPoint[];
  keyPlayers: { name: string; role: string; sentiment: string }[];
  prediction: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  imageUrl?: string;
  sources?: { title: string; url: string }[];
}
