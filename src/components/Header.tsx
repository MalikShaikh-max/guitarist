import React from 'react';
import { Volume2, VolumeX, Mic } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

export type ActiveTab = 'academy' | 'fretboard' | 'chords' | 'rhythm' | 'songs' | 'transition' | 'tuner';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  isMuted,
  onToggleMute,
}) => {
  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'academy', label: 'Academy' },
    { id: 'fretboard', label: 'Fretboard Studio' },
    { id: 'chords', label: 'Chord Library' },
    { id: 'rhythm', label: 'Rhythm Lab' },
    { id: 'songs', label: 'Song Player' },
    { id: 'transition', label: 'Transition Drill' },
    { id: 'tuner', label: 'Tuner' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Single text wordmark */}
        <button
          onClick={() => onTabChange('academy')}
          className="text-left group cursor-pointer focus:outline-none"
        >
          <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-amber-400 group-hover:text-amber-300 transition-colors whitespace-nowrap shrink-0">
            FretFlow
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-amber-400/15 text-amber-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Quick Action Zone */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => onTabChange('tuner')}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'tuner'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900/80 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-amber-400" />
            <span>Guitar Tuner</span>
          </button>

          <button
            onClick={onToggleMute}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              isMuted
                ? 'bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25'
                : 'bg-slate-900/80 border-slate-700/60 text-slate-300 hover:text-amber-400 hover:bg-slate-800'
            }`}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation strip */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-slate-900/80 bg-slate-950/95 scrollbar-none">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-amber-400/20 text-amber-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
