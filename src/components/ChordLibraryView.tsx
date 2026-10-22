import React, { useState } from 'react';
import { Search, Filter, Sparkles, Music } from 'lucide-react';
import { CHORDS } from '../data/guitarData';
import { ChordDefinition } from '../types/guitar';
import { ChordBox } from './ChordBox';
import { Fretboard } from './Fretboard';

interface ChordLibraryViewProps {
  selectedChord: ChordDefinition;
  onSelectChord: (chord: ChordDefinition) => void;
}

const CATEGORIES = ['All', 'Essential', 'Major', 'Minor', '7th', 'Suspended', 'Barre'] as const;

export const ChordLibraryView: React.FC<ChordLibraryViewProps> = ({
  selectedChord,
  onSelectChord,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredChords = CHORDS.filter((chord) => {
    const matchesCategory =
      activeCategory === 'All' || chord.category === activeCategory;
    const matchesSearch =
      chord.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chord.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Search */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-100 tracking-tight mb-1">
              Interactive Chord Dictionary & Soundboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Hear realistic acoustic strums, examine finger numbers (1-4), open strings (○), and mutes (✕).
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chords (e.g. G, Em, Cadd9)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Chord Studio Preview (Fretboard + Details) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Selected Chord Neck Anatomy
          </h2>
          <span className="text-xs text-amber-400 font-mono font-medium">
            Currently Loaded: {selectedChord.name}
          </span>
        </div>
        <Fretboard activeChord={selectedChord} />
      </div>

      {/* Chord Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Chords ({filteredChords.length})
          </h2>
          <span className="text-xs text-slate-400">
            Click any card to inspect on neck
          </span>
        </div>

        {filteredChords.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-sm">
            No chords found matching "{searchQuery}".
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredChords.map((chord) => (
              <ChordBox
                key={chord.id}
                chord={chord}
                isSelected={selectedChord.id === chord.id}
                onSelect={onSelectChord}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
