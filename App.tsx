/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Newspaper, 
  Compass, 
  TrendingUp, 
  Settings, 
  ChevronRight, 
  MessageSquare, 
  Activity,
  User,
  Zap,
  Globe,
  Play,
  Moon,
  Sun
} from 'lucide-react';
import ETIcon from './components/ETIcon';
import { Persona, NewsStory, StoryArc as StoryArcType } from './types';
import { fetchPersonalizedNews, getStoryArc, generateAIImage } from './services/gemini';
import NewsCard from './components/NewsCard';
import NewsNavigator from './components/NewsNavigator';
import StoryArcTracker from './components/StoryArcTracker';
import VideoStudio from './components/VideoStudio';
import FloatingChatbot from './components/FloatingChatbot';
import StoryDetail from './components/StoryDetail';
import Onboarding from './components/Onboarding';
import PersonaSelector from './components/PersonaSelector';
import { translations, Language } from './i18n';

interface UserProfile {
  name: string;
  age: number;
  persona: Persona;
}

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [persona, setPersona] = useState<Persona>('general');
  const [activeTab, setActiveTab] = useState<'feed' | 'navigator' | 'arc'>('feed');
  const [stories, setStories] = useState<NewsStory[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedStoryTopic, setSelectedStoryTopic] = useState<string | null>(null);
  const [storyArcData, setStoryArcData] = useState<StoryArcType | null>(null);
  const [showVideoStudio, setShowVideoStudio] = useState(false);
  const [selectedStoryForVideo, setSelectedStoryForVideo] = useState<{ title: string; summary: string } | null>(null);
  const [selectedStoryForDetail, setSelectedStoryForDetail] = useState<NewsStory | null>(null);
  const [vernacular, setVernacular] = useState<Language>('en');
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const t = translations[vernacular];

  const [showLanguagePopup, setShowLanguagePopup] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const logoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  ] as const;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Load persisted data
    const savedProfile = localStorage.getItem('pulse_user_profile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setUserProfile(profile);
        setPersona(profile.persona);
      } catch (e) {
        console.error("Failed to parse saved profile", e);
      }
    }

    const savedVernacular = localStorage.getItem('pulse_vernacular');
    if (savedVernacular) {
      setVernacular(savedVernacular as Language);
    }

    const savedTheme = localStorage.getItem('pulse_theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pulse_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pulse_theme', 'light');
    }
  };

  useEffect(() => {
    if (userProfile) {
      setStories([]);
      setPage(1);
      setHasMore(true);
      loadNews(1, true);
    }
  }, [persona, vernacular, userProfile]);

  const loadNews = async (pageNum: number, isInitial: boolean = false) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      const data = await fetchPersonalizedNews(persona, userProfile?.name, userProfile?.age, pageNum);
      
      if (data.length === 0) {
        setHasMore(false);
        return;
      }

      // Enhance top 3 stories with AI-generated images for better relevance (only for first page)
      const enhancedStories = await Promise.all(data.map(async (story, idx) => {
        if (isInitial && idx < 3) {
          try {
            const aiImageUrl = await generateAIImage(`${story.title} - ${story.category}`);
            return { ...story, imageUrl: aiImageUrl };
          } catch (e) {
            console.error("Failed to generate AI image for story", idx, e);
            return story;
          }
        }
        return story;
      }));

      let finalStories = enhancedStories;
      if (vernacular !== 'en') {
        finalStories = enhancedStories.map(s => ({
          ...s,
          title: `[${vernacular.toUpperCase()}] ${s.title}`,
          summary: `[${vernacular.toUpperCase()}] ${s.summary}`,
        }));
      }

      setStories(prev => isInitial ? finalStories : [...prev, ...finalStories]);
      setPage(pageNum);
    } catch (error) {
      console.error("Error loading news:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const observer = useRef<IntersectionObserver | null>(null);
  const lastStoryElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadNews(page + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, page]);

  const handleTrackStory = async (topic: string) => {
    setSelectedStoryTopic(topic);
    setActiveTab('arc');
    setLoading(true);
    try {
      const data = await getStoryArc(topic);
      
      // Enhance main arc and timeline with AI images
      const enhancedTimeline = await Promise.all(data.timeline.map(async (point) => {
        try {
          const aiImg = await generateAIImage(`${topic} - ${point.event}`);
          return { ...point, imageUrl: aiImg };
        } catch (e) {
          return point;
        }
      }));

      let mainImg = data.imageUrl;
      try {
        mainImg = await generateAIImage(topic);
      } catch (e) {}

      setStoryArcData({ ...data, imageUrl: mainImg, timeline: enhancedTimeline });
    } catch (error) {
      console.error("Error loading story arc:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenVideo = (story: NewsStory) => {
    setSelectedStoryForVideo({ title: story.title, summary: story.summary });
    setShowVideoStudio(true);
  };

  const handleSetVernacular = (lang: Language) => {
    setVernacular(lang);
    localStorage.setItem('pulse_vernacular', lang);
    setShowLanguagePopup(false);
  };

  const LanguagePopup = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      onMouseEnter={handlePopupMouseEnter}
      onMouseLeave={() => setShowLanguagePopup(false)}
      className={`fixed bg-et-cream border border-et-ink/10 rounded-2xl shadow-2xl z-[100] p-2 min-w-[160px] ${
        isMobile ? 'bottom-20 right-4' : 'left-24 bottom-24'
      }`}
    >
      <div className="text-[10px] font-bold uppercase tracking-widest text-et-ink/30 px-3 py-2 border-b border-et-ink/5 mb-1">
        {t.selectLanguage}
      </div>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleSetVernacular(lang.code as Language)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
            vernacular === lang.code 
              ? 'bg-et-red/5 text-et-red font-bold' 
              : 'hover:bg-et-ink/5 text-et-ink/60 hover:text-et-ink'
          }`}
        >
          <div className="flex flex-col items-start">
            <span className="text-sm">{lang.native}</span>
            <span className="text-[9px] uppercase tracking-wider opacity-50">{lang.name}</span>
          </div>
          {vernacular === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-et-red" />}
        </button>
      ))}
    </motion.div>
  );

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setPersona(profile.persona);
    localStorage.setItem('pulse_user_profile', JSON.stringify(profile));
  };

  const handleSignOut = () => {
    localStorage.removeItem('pulse_user_profile');
    setUserProfile(null);
    setPersona('general');
    setShowLogoutPopup(false);
  };

  const handleUserMouseEnter = () => {
    if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
  };

  const handleUserMouseLeave = () => {
    logoutTimeoutRef.current = setTimeout(() => {
      setShowLogoutPopup(false);
    }, 300);
  };

  const handlePopupMouseEnter = () => {
    if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
  };

  const LogoutPopup = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      onMouseEnter={handlePopupMouseEnter}
      onMouseLeave={() => setShowLogoutPopup(false)}
      className={`fixed bg-et-cream border border-et-ink/10 rounded-2xl shadow-2xl z-[100] p-2 min-w-[200px] ${
        isMobile ? 'bottom-20 left-4' : 'left-24 bottom-12'
      }`}
    >
      <div className="px-4 py-3 border-b border-et-ink/5 mb-1">
        <p className="text-xs font-bold text-et-ink truncate">{userProfile?.name}</p>
        <p className="text-[10px] text-et-ink/40 font-mono uppercase tracking-widest">{userProfile?.persona}</p>
      </div>
      <button
        onClick={handleSignOut}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-et-red/5 text-et-red font-bold text-sm"
      >
        <Settings size={16} />
        Sign Out
      </button>
    </motion.div>
  );

  const getActiveColor = () => {
    switch (activeTab) {
      case 'feed': return 'et-red';
      case 'navigator': return 'et-blue';
      case 'arc': return 'et-gold';
      default: return 'et-red';
    }
  };

  const activeColor = getActiveColor();

  const isExpanded = isSidebarExpanded || showLogoutPopup || showLanguagePopup;

  return (
    <div className={`min-h-screen bg-et-cream dark:bg-[#0a0a0a] text-et-ink dark:text-white font-sans selection:bg-et-red/10 transition-colors duration-300`}>
      <AnimatePresence>
        {!userProfile && (
          <Onboarding onComplete={handleOnboardingComplete} vernacular={vernacular} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVideoStudio && (
          <VideoStudio 
            story={selectedStoryForVideo} 
            onClose={() => setShowVideoStudio(false)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLanguagePopup && <LanguagePopup />}
      </AnimatePresence>

      <AnimatePresence>
        {showLogoutPopup && <LogoutPopup />}
      </AnimatePresence>

      <AnimatePresence>
        {selectedStoryForDetail && (
          <StoryDetail 
            story={selectedStoryForDetail} 
            onClose={() => setSelectedStoryForDetail(null)}
            onVideo={() => handleOpenVideo(selectedStoryForDetail)}
            onNavigate={() => setActiveTab('navigator')}
            onTrack={() => handleTrackStory(selectedStoryForDetail.title)}
            vernacular={vernacular}
          />
        )}
      </AnimatePresence>

      {userProfile && (
        <>
          {/* Sidebar Navigation */}
          <nav 
            onMouseEnter={() => setIsSidebarExpanded(true)}
            onMouseLeave={() => setIsSidebarExpanded(false)}
            className={`fixed left-0 top-0 h-full border-r-2 hidden md:flex flex-col py-8 gap-8 z-50 shadow-sm transition-all duration-500 ease-in-out ${
              isExpanded ? 'w-64 px-6 items-start' : 'w-20 px-0 items-center'
            } ${
              activeTab === 'feed' ? 'bg-et-red/[0.02] border-r-et-red/20 dark:bg-et-red/[0.05]' :
              activeTab === 'navigator' ? 'bg-et-blue/[0.02] border-r-et-blue/20 dark:bg-et-blue/[0.05]' :
              'bg-et-gold/[0.02] border-r-et-gold/20 dark:bg-et-gold/[0.05]'
            } ${
              isDarkMode ? 'dark:bg-[#121212]' : 'bg-et-cream'
            }`}
          >
        <div className={`flex items-center gap-4 mb-8 transition-all duration-300 ${isExpanded ? 'px-2' : ''}`}>
          <ETIcon size={40} />
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="text-xs font-black tracking-tighter leading-none dark:text-white">ET NAVIGATOR</span>
              <span className="text-[8px] font-mono text-et-ink/40 dark:text-white/40 uppercase tracking-widest">Navigator</span>
              {userProfile && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] text-et-red font-bold mt-1"
                >
                  {t.welcome}, {userProfile.name}
                </motion.span>
              )}
            </motion.div>
          )}
        </div>
        
        <div className="flex flex-col gap-4 w-full">
          <NavButton 
            active={activeTab === 'feed'} 
            onClick={() => setActiveTab('feed')} 
            icon={<Newspaper size={24} />} 
            label={t.feed}
            isExpanded={isExpanded}
            activeColor="et-red"
          />
          <NavButton 
            active={activeTab === 'navigator'} 
            onClick={() => setActiveTab('navigator')} 
            icon={<Compass size={24} />} 
            label={t.navigator}
            isExpanded={isExpanded}
            activeColor="et-blue"
          />
          <NavButton 
            active={activeTab === 'arc'} 
            onClick={() => setActiveTab('arc')} 
            icon={<Activity size={24} />} 
            label={t.arcs}
            isExpanded={isExpanded}
            activeColor="et-gold"
          />
        </div>
        
        <div className="mt-auto flex flex-col gap-6 pb-4 w-full">
          <button 
            onClick={() => setShowLanguagePopup(!showLanguagePopup)}
            className={`transition-all flex items-center gap-4 w-full rounded-xl p-2 ${
              isExpanded ? 'hover:bg-et-ink/5 dark:hover:bg-white/5' : 'justify-center'
            } ${vernacular !== 'en' ? 'text-et-red' : 'text-et-ink/40 dark:text-white/40 hover:text-et-ink dark:hover:text-white'}`}
          >
            <div className="shrink-0"><Globe size={24} /></div>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col items-start"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{t.language}</span>
                <span className="text-[8px] font-mono font-bold uppercase opacity-50">{vernacular}</span>
              </motion.div>
            )}
          </button>

          <button 
            onClick={toggleDarkMode}
            className={`transition-all flex items-center gap-4 w-full rounded-xl p-2 ${
              isExpanded ? 'hover:bg-et-ink/5 dark:hover:bg-white/5' : 'justify-center'
            } text-et-ink/40 dark:text-white/40 hover:text-et-ink dark:hover:text-white`}
          >
            <div className="shrink-0">
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </div>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col items-start"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none">
                  {isDarkMode ? t.lightMode : t.darkMode}
                </span>
                <span className="text-[8px] font-mono font-bold uppercase opacity-50">
                  {isDarkMode ? 'Dark' : 'Light'}
                </span>
              </motion.div>
            )}
          </button>

          <div 
            onMouseEnter={handleUserMouseEnter}
            onMouseLeave={handleUserMouseLeave}
            onClick={() => setShowLogoutPopup(!showLogoutPopup)}
            className={`flex items-center gap-4 w-full rounded-xl p-2 transition-all cursor-pointer ${
              isExpanded ? 'bg-et-ink/5 hover:bg-et-ink/10 dark:bg-white/5 dark:hover:bg-white/10' : 'justify-center hover:bg-et-ink/5 dark:hover:bg-white/5'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-et-ink/10 dark:bg-white/10 flex items-center justify-center border border-et-ink/10 dark:border-white/10 shrink-0">
              <User size={20} className="text-et-ink/60 dark:text-white/60" />
            </div>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col items-start overflow-hidden"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none truncate w-full dark:text-white">
                  {userProfile?.name}
                </span>
                <span className="text-[8px] font-mono text-et-ink/40 dark:text-white/40 uppercase tracking-widest">
                  {userProfile?.persona}
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full h-16 bg-et-cream dark:bg-[#121212] border-t border-et-ink/10 dark:border-white/10 flex md:hidden items-center justify-around z-50 px-4 transition-colors">
        <button 
          onClick={() => setActiveTab('feed')}
          className={`flex flex-col items-center gap-1 p-2 rounded-full border-2 border-transparent hover:border-et-red transition-all ${activeTab === 'feed' ? 'text-et-red' : 'text-et-ink/40 dark:text-white/40'}`}
        >
          <Newspaper size={20} />
          <span className="text-[8px] font-bold uppercase">{t.feed}</span>
        </button>
        <button 
          onClick={() => setActiveTab('navigator')}
          className={`flex flex-col items-center gap-1 p-2 rounded-full border-2 border-transparent hover:border-et-red transition-all ${activeTab === 'navigator' ? 'text-et-red' : 'text-et-ink/40 dark:text-white/40'}`}
        >
          <Compass size={20} />
          <span className="text-[8px] font-bold uppercase">{t.briefing}</span>
        </button>
        <button 
          onClick={() => setActiveTab('arc')}
          className={`flex flex-col items-center gap-1 p-2 rounded-full border-2 border-transparent hover:border-et-red transition-all ${activeTab === 'arc' ? 'text-et-red' : 'text-et-ink/40 dark:text-white/40'}`}
        >
          <Activity size={20} />
          <span className="text-[8px] font-bold uppercase">{t.arcs}</span>
        </button>
        <button 
          onClick={() => setShowLanguagePopup(!showLanguagePopup)}
          className={`flex flex-col items-center gap-1 p-2 rounded-full border-2 border-transparent hover:border-et-red transition-all ${vernacular !== 'en' ? 'text-et-red' : 'text-et-ink/40 dark:text-white/40'}`}
        >
          <Globe size={20} />
          <span className="text-[8px] font-bold uppercase">{vernacular}</span>
        </button>
      </nav>

      {/* Main Content */}
      <main className={`min-h-screen pb-16 md:pb-0 transition-all duration-300 ease-in-out ${
        isMobile ? 'pl-0' : isExpanded ? 'md:pl-64' : 'md:pl-20'
      }`}>
        {/* ET Header Mimic */}
        <header className="bg-et-cream dark:bg-[#0a0a0a] border-b border-et-ink/10 dark:border-white/10 hidden md:block transition-colors">
          {/* Top Bar */}
          <div className="h-10 border-b border-et-ink/5 dark:border-white/5 flex items-center justify-between px-12 text-[10px] font-mono uppercase tracking-widest text-et-ink/60 dark:text-white/60">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-et-ink/40 dark:text-white/40">Nifty</span>
                <span className="font-bold text-et-ink dark:text-white">22,819.60</span>
                <span className="text-et-red">↓ -486.86</span>
              </div>
              <div className="h-3 w-[1px] bg-et-ink/10 dark:bg-white/10" />
              <div className="flex items-center gap-2">
                <span className="text-et-ink/40 dark:text-white/40">Benchmarks</span>
                <span className="font-bold text-et-red">CLOSED</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => window.open('https://economictimes.indiatimes.com/markets/watchlist', '_blank')}
                  className="hover:text-et-red transition-colors"
                >
                  My Watchlist
                </button>
                <button 
                  onClick={() => window.open('https://economictimes.indiatimes.com/subscription', '_blank')}
                  className="px-3 py-1 border border-et-ink/20 dark:border-white/20 rounded hover:bg-et-ink dark:hover:bg-white hover:text-white dark:hover:text-et-ink transition-all"
                >
                  Subscribe
                </button>
                <button 
                  onClick={() => window.open('https://economictimes.indiatimes.com/login', '_blank')}
                  className="hover:text-et-red transition-colors"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
 
          {/* Main Logo Section */}
          <div className="py-8 flex flex-col items-center gap-2">
            <div 
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => window.open('https://economictimes.indiatimes.com/', '_blank')}
            >
              <div className="w-12 h-12 bg-et-red flex items-center justify-center text-white font-display text-3xl font-bold">ET</div>
              <h1 className="text-6xl font-display font-bold tracking-tight text-et-ink dark:text-white">THE ECONOMIC TIMES</h1>
            </div>
            <div className="text-[10px] font-mono text-et-ink/40 dark:text-white/40 uppercase tracking-[0.2em] flex items-center gap-4">
              <span className="text-et-red font-bold">{t.welcome}, {userProfile?.name}</span>
              <div className="w-1 h-1 rounded-full bg-et-ink/20 dark:bg-white/20" />
              <span>English Edition</span>
              <div className="w-1 h-1 rounded-full bg-et-ink/20 dark:bg-white/20" />
              <span>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <div className="w-1 h-1 rounded-full bg-et-ink/20 dark:bg-white/20" />
              <button 
                onClick={() => window.open('https://epaper.timesgroup.com/', '_blank')}
                className="font-bold text-et-ink dark:text-white hover:text-et-red transition-colors"
              >
                Today's ePaper
              </button>
            </div>
          </div>
 
          {/* Navigation Bar */}
          <div className="h-12 border-t border-et-ink/10 dark:border-white/10 flex items-center justify-center gap-8 text-[11px] font-bold uppercase tracking-wider text-et-ink/80 dark:text-white/80">
            <button 
              onClick={() => window.open('https://economictimes.indiatimes.com/', '_blank')}
              className="text-et-red flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              <Play size={12} fill="currentColor" />
              Home
            </button>
            <button 
              onClick={() => window.open('https://economictimes.indiatimes.com/prime', '_blank')}
              className="hover:text-et-red transition-colors flex items-center gap-1"
            >
              <ETIcon size={16} />
              ETPrime
            </button>
            <button 
              onClick={() => window.open('https://economictimes.indiatimes.com/markets', '_blank')}
              className="hover:text-et-red transition-colors"
            >
              Markets
            </button>
            <button 
              onClick={() => window.open('https://economictimes.indiatimes.com/markets/stocks/market-stats', '_blank')}
              className="hover:text-et-red transition-colors"
            >
              Market Data
            </button>
            <button 
              onClick={() => window.open('https://economictimes.indiatimes.com/et-masterclass', '_blank')}
              className="text-et-red font-black hover:opacity-80 transition-opacity"
            >
              Masterclass
            </button>
            <button 
              onClick={() => window.open('https://economictimes.indiatimes.com/markets/stocks/ipo', '_blank')}
              className="hover:text-et-red transition-colors"
            >
              IPO
            </button>
            <button 
              onClick={() => window.open('https://economictimes.indiatimes.com/news', '_blank')}
              className="hover:text-et-red transition-colors"
            >
              News
            </button>
            <button 
              onClick={() => window.open('https://economictimes.indiatimes.com/industry', '_blank')}
              className="hover:text-et-red transition-colors"
            >
              Industry
            </button>
            <button 
              onClick={() => window.open('https://economictimes.indiatimes.com/small-biz', '_blank')}
              className="hover:text-et-red transition-colors"
            >
              SME
            </button>
            <button 
              onClick={() => window.open('https://economictimes.indiatimes.com/news/politics-and-nation', '_blank')}
              className="hover:text-et-red transition-colors"
            >
              Politics
            </button>
            <button 
              onClick={() => window.open('https://economictimes.indiatimes.com/wealth', '_blank')}
              className="hover:text-et-red transition-colors"
            >
              Wealth
            </button>
          </div>
        </header>

        {/* ETPrime Banner Mimic */}
        <div className="bg-et-red px-4 md:px-12 py-4 hidden md:block">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between bg-white/10 border border-white/20 p-4 rounded-xl gap-4">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2">
                <Zap className="text-white fill-white" size={24} />
                <span className="text-xl font-display font-bold italic text-white">ETPrime</span>
              </div>
              <div className="h-8 w-[1px] bg-white/20 hidden md:block" />
              <div>
                <h4 className="text-sm font-bold text-white">{t.exclusiveDeal}</h4>
                <p className="text-xs text-white/80">{t.unlockPrime}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button 
                onClick={() => window.open('https://economictimes.indiatimes.com/prime/plans', '_blank')}
                className="flex-1 md:flex-none bg-white text-et-red px-6 py-2 rounded font-black text-xs uppercase tracking-widest hover:bg-et-ink hover:text-white transition-all"
              >
                {t.availOffer}
              </button>
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest hidden md:block">{t.bankOffers}</span>
            </div>
          </div>
        </div>

        {/* Sub-Header / Persona Bar */}
        <div className={`h-14 border-b border-et-ink/5 dark:border-white/5 flex items-center justify-between px-4 md:px-12 sticky top-0 bg-et-cream/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md z-40 ${isMobile && activeTab === 'feed' ? 'hidden' : ''}`}>
          <div className="flex-1 min-w-0 flex items-center gap-4 overflow-x-auto scrollbar-hide mr-4">
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-et-ink/40 dark:text-white/40 whitespace-nowrap">
              <span className="text-et-red">News Live!</span>
              <span>Live Stream!</span>
              <span className="text-et-red hidden sm:inline">Assembly Elections</span>
              <span className="hidden sm:inline">IPL 2026</span>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-6 shrink-0">
            <PersonaSelector 
              current={persona} 
              onChange={setPersona} 
              vernacular={vernacular}
            />
            <div className="flex items-center gap-2 text-xs font-mono text-et-ink/40 dark:text-white/40 uppercase tracking-widest whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-et-red animate-pulse" />
              {t.intelligenceActive}
            </div>
          </div>
        </div>

        <div className={`${isMobile && activeTab === 'feed' ? 'p-0' : 'p-4 md:p-12'} max-w-7xl mx-auto`}>
          <AnimatePresence mode="wait">
            {activeTab === 'feed' && (
              <motion.div
                key="feed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`${isMobile ? 'h-[calc(100vh-4rem)] overflow-hidden' : 'space-y-8 md:space-y-12'}`}
              >
                <div className={`flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-et-ink dark:border-white pb-6 md:pb-8 gap-4 ${isMobile ? 'hidden' : ''}`}>
                  <div>
                    <span className="text-et-red font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] mb-2 block font-bold">{t.personalizedFor} {userProfile?.name}</span>
                    <h2 className="text-4xl md:text-6xl font-display font-bold leading-none dark:text-white">
                      The {t[persona as keyof typeof t] || persona} <br className="hidden md:block" /> <span className="text-et-red italic">{t.newsroom}</span>
                    </h2>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-et-ink/60 dark:text-white/60 text-xs md:text-sm max-w-xs font-medium">
                      Synthesizing 1,240 sources across global markets to deliver your specific edge.
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="h-[400px] bg-et-cream dark:bg-white/5 rounded-2xl animate-pulse border border-et-ink/5 dark:border-white/5 flex items-center justify-center">
                        <span className="text-et-ink/20 dark:text-white/20 font-bold uppercase tracking-widest">{t.loading}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`
                    ${isMobile 
                      ? 'flex flex-col h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide' 
                      : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
                    }
                  `}>
                    {stories.map((story, index) => {
                      const isLastElement = stories.length === index + 1;
                      return (
                        <div 
                          key={story.id} 
                          ref={isLastElement ? lastStoryElementRef : null}
                          className={isMobile ? 'snap-start h-full w-full shrink-0' : ''}
                        >
                          <NewsCard 
                            story={story} 
                            index={index} 
                            onTrack={() => handleTrackStory(story.title)}
                            onNavigate={() => setActiveTab('navigator')}
                            onVideo={() => handleOpenVideo(story)}
                            onOpen={() => setSelectedStoryForDetail(story)}
                            isReel={isMobile}
                            vernacular={vernacular}
                          />
                        </div>
                      );
                    })}
                    {loadingMore && (
                      <div className={`col-span-full py-12 flex flex-col items-center gap-4 ${isMobile ? 'snap-start h-full w-full shrink-0 justify-center' : ''}`}>
                        <div className="w-8 h-8 border-4 border-et-red border-t-transparent rounded-full animate-spin" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-et-ink/40">{t.loading}...</span>
                      </div>
                    )}
                    {!hasMore && stories.length > 0 && (
                      <div className="col-span-full py-12 text-center border-t border-et-ink/10 mt-8">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-et-ink/20">You've reached the end of the newsroom</span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'navigator' && (
              <motion.div
                key="navigator"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="h-[calc(100vh-12rem)]"
              >
                <NewsNavigator 
                  vernacular={vernacular} 
                  onOpenStory={(story) => setSelectedStoryForDetail(story)}
                />
              </motion.div>
            )}

            {activeTab === 'arc' && (
              <motion.div
                key="arc"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <StoryArcTracker 
                  topic={selectedStoryTopic} 
                  data={storyArcData} 
                  loading={loading} 
                  vernacular={vernacular}
                  onOpenStory={(story) => setSelectedStoryForDetail(story)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
          {/* Floating Chatbot */}
          <FloatingChatbot vernacular={vernacular} isSidebarExpanded={isExpanded} />
        </>
      )}
    </div>
  );
}

function NavButton({ active, onClick, icon, label, isExpanded, activeColor = 'et-red' }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; isExpanded: boolean; activeColor?: 'et-red' | 'et-blue' | 'et-gold' }) {
  const colorClasses = {
    'et-red': 'bg-et-red border-et-red shadow-et-red/20',
    'et-blue': 'bg-et-blue border-et-blue shadow-et-blue/20',
    'et-gold': 'bg-et-gold border-et-gold shadow-et-gold/20'
  };

  return (
    <motion.button 
      onClick={onClick}
      whileHover={{ 
        scale: 1.02,
        x: isExpanded ? 4 : 0,
        backgroundColor: active ? `var(--color-${activeColor})` : 'rgba(255, 255, 255, 0.05)'
      }}
      className={`relative group flex items-center h-12 rounded-full border-2 border-transparent transition-all duration-300 ${
        isExpanded ? 'w-full px-4 gap-4' : 'w-12 justify-center'
      } ${
        active 
          ? `${colorClasses[activeColor]} text-white shadow-lg` 
          : 'text-et-ink/40 dark:text-white/40 hover:text-et-ink dark:hover:text-white hover:bg-et-ink/5 dark:hover:bg-white/5'
      }`}
    >
      <div className="shrink-0 transition-transform duration-300 group-hover:scale-110">{icon}</div>
      {isExpanded && (
        <motion.span 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xs font-bold uppercase tracking-widest whitespace-nowrap"
        >
          {label}
        </motion.span>
      )}
      {!isExpanded && (
        <span className={`absolute left-full ml-4 px-2 py-1 text-white text-[10px] font-bold uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 ${
          activeColor === 'et-red' ? 'bg-et-red' : activeColor === 'et-blue' ? 'bg-et-blue' : 'bg-et-gold'
        }`}>
          {label}
        </span>
      )}
      {active && (
        <motion.div 
          layoutId="nav-indicator"
          className={`absolute rounded-r-full ${
            activeColor === 'et-red' ? 'bg-et-red' : activeColor === 'et-blue' ? 'bg-et-blue' : 'bg-et-gold'
          } ${
            isExpanded ? 'left-0 w-1.5 h-6' : '-left-4 w-1 h-8'
          }`}
        />
      )}
    </motion.button>
  );
}
