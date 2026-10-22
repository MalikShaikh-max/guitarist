/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header, ActiveTab } from './components/Header';
import { AcademyView } from './components/AcademyView';
import { FretboardStudioView } from './components/FretboardStudioView';
import { ChordLibraryView } from './components/ChordLibraryView';
import { RhythmLabView } from './components/RhythmLabView';
import { SongPlayerView } from './components/SongPlayerView';
import { TransitionTrainer } from './components/TransitionTrainer';
import { TunerTab } from './components/TunerTab';
import { CHORDS } from './data/guitarData';
import { ChordDefinition } from './types/guitar';
import { audioEngine } from './utils/audioEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('academy');
  const [selectedChord, setSelectedChord] = useState<ChordDefinition>(CHORDS[4]); // G Major
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioEngine.setMuted(nextMuted);
  };

  const handleSelectChordOnFretboard = (chord: ChordDefinition) => {
    setSelectedChord(chord);
    setActiveTab('fretboard');
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main App Content Viewport */}
      <main className="flex-1 w-full px-4 sm:px-6 py-6 md:py-8">
        {activeTab === 'academy' && (
          <AcademyView
            onSelectChordOnFretboard={handleSelectChordOnFretboard}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'fretboard' && (
          <FretboardStudioView
            selectedChord={selectedChord}
            onSelectChord={setSelectedChord}
          />
        )}

        {activeTab === 'chords' && (
          <ChordLibraryView
            selectedChord={selectedChord}
            onSelectChord={setSelectedChord}
          />
        )}

        {activeTab === 'rhythm' && <RhythmLabView />}

        {activeTab === 'songs' && <SongPlayerView />}

        {activeTab === 'transition' && <TransitionTrainer />}

        {activeTab === 'tuner' && <TunerTab />}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/80 py-6 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-slate-300">FretFlow</span>
            <span aria-hidden="true">·</span>
            <span>Acoustic Physical Modeling & Guitar Academy</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('tuner')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Chromatic Tuner
            </button>
            <button
              onClick={() => setActiveTab('rhythm')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Metronome Lab
            </button>
            <button
              onClick={() => setActiveTab('songs')}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Song Library
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
