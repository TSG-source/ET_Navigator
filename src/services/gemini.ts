/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { Persona, NewsStory, StoryArc, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'DEMO_MODE' });

const MOCK_STORIES: Record<Persona, NewsStory[]> = {
  general: [
    { id: '1', title: 'Global Markets Rally on Tech Earnings', summary: 'Major indices hit record highs as tech giants report better-than-expected quarterly results, driven by AI infrastructure demand.', source: 'Economic Times', url: '#', imageUrl: 'https://picsum.photos/seed/markets/800/600', timestamp: '2h ago', category: 'Markets', sentiment: 'positive', relevance: 0.95 },
    { id: '2', title: 'New Policy Shift in Renewable Energy', summary: 'The government announces a major overhaul of green energy subsidies, aiming to accelerate solar adoption across industrial hubs.', source: 'ET Energy', url: '#', imageUrl: 'https://picsum.photos/seed/energy/800/600', timestamp: '4h ago', category: 'Policy', sentiment: 'neutral', relevance: 0.88 },
    { id: '3', title: 'Startup Ecosystem Braces for Funding Winter', summary: 'Venture capital activity slows down as investors prioritize profitability over growth in the latest series of funding rounds.', source: 'ET Tech', url: '#', imageUrl: 'https://picsum.photos/seed/startup/800/600', timestamp: '6h ago', category: 'Startups', sentiment: 'negative', relevance: 0.82 },
  ],
  investor: [
    { id: 'i1', title: 'Fed Signals Potential Rate Cut in Q3', summary: 'Inflation data suggests a cooling economy, leading analysts to predict a pivot in monetary policy by the Federal Reserve.', source: 'ET Markets', url: '#', imageUrl: 'https://picsum.photos/seed/fed/800/600', timestamp: '1h ago', category: 'Macro', sentiment: 'positive', relevance: 0.98 },
    { id: 'i2', title: 'Semiconductor Stocks Surge on AI Demand', summary: 'Chipmakers see massive gains as cloud providers ramp up spending on specialized hardware for large language models.', source: 'ET Tech', url: '#', imageUrl: 'https://picsum.photos/seed/chips/800/600', timestamp: '3h ago', category: 'Tech', sentiment: 'positive', relevance: 0.94 },
  ],
  startup: [
    { id: 's1', title: 'Fintech Unicorn Expands to Southeast Asia', summary: 'Leading digital payment provider secures regulatory approval for cross-border operations in three new markets.', source: 'ET Rise', url: '#', imageUrl: 'https://picsum.photos/seed/fintech/800/600', timestamp: '5h ago', category: 'Expansion', sentiment: 'positive', relevance: 0.92 },
    { id: 's2', title: 'AI Governance Framework Proposed for Startups', summary: 'New guidelines aim to ensure ethical deployment of automated systems while maintaining innovation speed.', source: 'ET Tech', url: '#', imageUrl: 'https://picsum.photos/seed/ai/800/600', timestamp: '8h ago', category: 'Regulation', sentiment: 'neutral', relevance: 0.85 },
  ],
  student: [
    { id: 'st1', title: 'The Future of Work: Hybrid vs Remote', summary: 'A deep dive into how major corporations are restructuring their office presence and what it means for new graduates.', source: 'ET Panache', url: '#', imageUrl: 'https://picsum.photos/seed/office/800/600', timestamp: '10h ago', category: 'Careers', sentiment: 'neutral', relevance: 0.90 },
    { id: 'st2', title: 'Upskilling in the Age of Automation', summary: 'Expert guide on the most in-demand skills for 2026 and how to leverage online learning platforms effectively.', source: 'ET Education', url: '#', imageUrl: 'https://picsum.photos/seed/learning/800/600', timestamp: '12h ago', category: 'Skills', sentiment: 'positive', relevance: 0.88 },
  ]
};

export const fetchPersonalizedNews = async (persona: Persona, userName?: string, userAge?: number, page: number = 1): Promise<NewsStory[]> => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'DEMO_MODE') {
    return MOCK_STORIES[persona] || MOCK_STORIES.general;
  }

  const userContext = userName && userAge ? `The user is ${userName}, aged ${userAge}. ` : '';
  const prompt = `${userContext}Generate a list of 6 current, real-world business news stories personalized for a ${persona}. 
  This is page ${page} of the news feed. Ensure these stories are different from previous pages if possible.
  For an investor: focus on market moves, earnings, and macro trends.
  For a founder: focus on funding, competitor moves, and tech innovation.
  For a student: focus on explainers, industry shifts, and career-relevant news.
  Include real source names and URLs if possible.
  For each story, provide a relevant 'imageUrl' using the format: https://loremflickr.com/800/600/{keyword} where {keyword} is a specific, descriptive keyword related to the story topic (e.g., 'semiconductor', 'stock-market', 'startup-office').
  Return as a JSON array of stories.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              source: { type: Type.STRING },
              url: { type: Type.STRING },
              imageUrl: { type: Type.STRING },
              timestamp: { type: Type.STRING },
              category: { type: Type.STRING },
              sentiment: { type: Type.STRING, enum: ["positive", "negative", "neutral"] },
              relevance: { type: Type.NUMBER },
            },
            required: ["id", "title", "summary", "source", "url", "imageUrl", "timestamp", "category", "sentiment", "relevance"],
          },
        },
      },
    });

    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to fetch news stories, using fallback", e);
    return MOCK_STORIES[persona] || MOCK_STORIES.general;
  }
};

export const getStoryArc = async (topic: string): Promise<StoryArc> => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'DEMO_MODE') {
    return {
      title: topic,
      imageUrl: `https://picsum.photos/seed/${topic}/800/600`,
      timeline: [
        { date: 'Jan 2026', event: 'Initial Rumors Surface', sentiment: 0.1, impact: 'Low', imageUrl: 'https://picsum.photos/seed/rumor/800/600' },
        { date: 'Feb 2026', event: 'Official Announcement', sentiment: 0.5, impact: 'High', imageUrl: 'https://picsum.photos/seed/announce/800/600' },
        { date: 'Mar 2026', event: 'Market Reaction', sentiment: 0.8, impact: 'Critical', imageUrl: 'https://picsum.photos/seed/market/800/600' },
        { date: 'Apr 2026', event: 'Regulatory Review', sentiment: 0.3, impact: 'Medium', imageUrl: 'https://picsum.photos/seed/law/800/600' },
        { date: 'May 2026', event: 'Implementation Phase', sentiment: 0.6, impact: 'High', imageUrl: 'https://picsum.photos/seed/build/800/600' },
      ],
      keyPlayers: [
        { name: 'Industry Leader A', role: 'Primary Driver', sentiment: 'Bullish' },
        { name: 'Regulatory Body X', role: 'Oversight', sentiment: 'Neutral' },
        { name: 'Competitor B', role: 'Disruptor', sentiment: 'Bearish' },
      ],
      prediction: 'The story is likely to stabilize in the next quarter as regulatory hurdles are cleared, leading to a new industry standard.'
    };
  }

  const prompt = `Analyze the ongoing business story: "${topic}". 
  Provide a timeline of key events (at least 5), identify key players and their roles/sentiment, and provide a "what to watch next" prediction.
  For the main story and each timeline event, provide a relevant 'imageUrl' using the format: https://loremflickr.com/800/600/{keyword} where {keyword} is a specific, descriptive keyword related to the event or topic.
  Return as a JSON object matching the StoryArc interface.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            imageUrl: { type: Type.STRING },
            timeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING },
                  event: { type: Type.STRING },
                  sentiment: { type: Type.NUMBER },
                  impact: { type: Type.STRING },
                  imageUrl: { type: Type.STRING },
                },
                required: ["date", "event", "sentiment", "impact", "imageUrl"],
              },
            },
            keyPlayers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  role: { type: Type.STRING },
                  sentiment: { type: Type.STRING },
                },
                required: ["name", "role", "sentiment"],
              },
            },
            prediction: { type: Type.STRING },
          },
          required: ["title", "imageUrl", "timeline", "keyPlayers", "prediction"],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to fetch story arc, using fallback", e);
    return getStoryArc(topic); // Recursive call with demo mode logic
  }
};

export const chatWithNews = async (query: string, history: ChatMessage[]): Promise<ChatMessage> => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'DEMO_MODE') {
    return {
      role: 'model',
      text: "I'm currently in Demo Mode. In a live environment, I would synthesize real-time news data to answer your query. For now, I can tell you that market trends are showing a strong shift towards AI-integrated services across all sectors.",
      sources: [{ title: 'Demo Source', url: '#' }]
    };
  }

  const chat = ai.chats.create({
    model: "gemini-3.1-pro-preview",
    config: {
      systemInstruction: "You are an expert business news navigator. Synthesize multiple sources into clear, interactive briefings. Answer follow-up questions with depth and context. Always cite sources if available via grounding. If you are discussing a specific company, industry, or topic, you can include a relevant image by adding a line at the very end of your response in this format: IMAGE_URL: https://picsum.photos/seed/{keyword}/800/600 where {keyword} is a single word related to the topic.",
      tools: [{ googleSearch: {} }],
    },
  });

  try {
    const response = await chat.sendMessage({ message: query });
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => ({
      title: chunk.web?.title || "Source",
      url: chunk.web?.uri || "#"
    })) || [];

    let text = response.text;
    let imageUrl: string | undefined;

    const imageMatch = text.match(/IMAGE_URL: (https:\/\/[^\s]+)/);
    if (imageMatch) {
      imageUrl = imageMatch[1];
      text = text.replace(/IMAGE_URL: https:\/\/[^\s]+/, '').trim();
    }

    return {
      role: 'model',
      text,
      imageUrl,
      sources
    };
  } catch (e) {
    console.error("Chat failed, using fallback", e);
    return {
      role: 'model',
      text: "I'm having trouble connecting to the live news feed right now. However, based on recent trends, we're seeing significant volatility in tech stocks following the latest earnings reports.",
      sources: []
    };
  }
};

export const chatWithAssistant = async (query: string, history: ChatMessage[]): Promise<ChatMessage> => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'DEMO_MODE') {
    return {
      role: 'model',
      text: "Hello! I'm the ET Navigator assistant. I'm currently running in Demo Mode. You can explore the Feed, Navigator, and Arcs tabs to see how the application works with sample data."
    };
  }

  const chat = ai.chats.create({
    model: "gemini-3.1-pro-preview",
    config: {
      systemInstruction: "You are ET Navigator, a helpful AI guide for the Economic Times Navigator application. You help users navigate the app, explain business concepts, and provide general assistance. Keep your responses concise, professional, and helpful. You can use markdown for formatting.",
    },
  });

  try {
    const response = await chat.sendMessage({ message: query });
    
    return {
      role: 'model',
      text: response.text
    };
  } catch (e) {
    console.error("Assistant chat failed", e);
    return {
      role: 'model',
      text: "I'm here to help! You can navigate through the app using the sidebar on the left. If you have specific questions about a story, try the News Navigator tab."
    };
  }
};

export const generateAIImage = async (prompt: string): Promise<string> => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'DEMO_MODE') {
    return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/800/600`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `A professional, high-quality editorial business news photograph illustrating: ${prompt}. Cinematic lighting, corporate aesthetic, sharp focus.`,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (e) {
    console.error("Image generation failed", e);
  }
  
  return `https://loremflickr.com/800/600/business,${encodeURIComponent(prompt.split(' ')[0])}`;
};
