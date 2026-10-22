import React, { useState } from 'react';
import { Music, Layers, BookOpen, Volume2, Sparkles } from 'lucide-react';
import { CHORDS, SCALES } from '../data/guitarData';
import { ChordDefinition, ScaleDefinition } from '../types/guitar';
import { Fretboard } from './Fretboard';
import { audioEngine } from '../utils/audioEngine';

interface FretboardStudioViewProps {
  selectedChord: ChordDefinition;
  onSelectChord: (chord: ChordDefinition) => void;
}

export const FretboardStudioView: React.FC<FretboardStudioViewProps> = ({
  selectedChord,
  onSelectChord,
}) => {
  const [mode, setMode] = useState<'chord' | 'scale' | 'free'>('chord');
  const [selectedScale, setSelectedScale] = useState<ScaleDefinition>(SCALES[0]);
  const [showNoteNames, setShowNoteNames] = useState<boolean>(true);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <Layers className="w-4 h-4" />
              <span>Full Neck Visualizer & Solo Sandbox</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-100 tracking-tight">
              Interactive Fretboard Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Explore chords, pentatonic scale solo boxes, and acoustic notes across all 6 strings and 14 frets.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setMode('chord')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                mode === 'chord'
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Chord View
            </button>
            <button
              onClick={() => setMode('scale')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                mode === 'scale'
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Scale Solo Boxes
            </button>
            <button
              onClick={() => setMode('free')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                mode === 'free'
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Free Exploration
            </button>
          </div>
        </div>

        {/* Secondary Mode Toolbar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          {mode === 'chord' && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs text-slate-400 whitespace-nowrap">Load Chord:</span>
              {CHORDS.map((chord) => (
                <button
                  key={chord.id}
                  onClick={() => onSelectChord(chord)}
                  className={`px-2.5 py-1 text-xs font-mono font-bold rounded-md border transition-colors cursor-pointer whitespace-nowrap ${
                    selectedChord.id === chord.id
                      ? 'bg-amber-400 text-slate-950 border-amber-300'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {chord.name}
                </button>
              ))}
            </div>
          )}

          {mode === 'scale' && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs text-slate-400 whitespace-nowrap">Load Scale:</span>
              {SCALES.map((scale) => (
                <button
                  key={scale.id}
                  onClick={() => setSelectedScale(scale)}
                  className={`px-3 py-1 text-xs font-medium rounded-md border transition-colors cursor-pointer whitespace-nowrap ${
                    selectedScale.id === scale.id
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {scale.name}
                </button>
              ))}
            </div>
          )}

          {mode === 'free' && (
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showNoteNames}
                  onChange={(e) => setShowNoteNames(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0"
                />
                <span>Show Note Names on Hover</span>
              </label>
              <span>·</span>
              <span>Click any fret to pluck note with acoustic physical synthesis</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Fretboard */}
      <Fretboard
        activeChord={mode === 'chord' ? selectedChord : null}
        activeScale={mode === 'scale' ? selectedScale : null}
        showNoteNames={showNoteNames}
      />

      {/* Scale / Soloing Educational Explainer when Scale Mode is Active */}
      {mode === 'scale' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-sm space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Lead Guitar Soloing Blueprint: {selectedScale.name}</span>
          </div>
          <h3 className="font-display text-lg font-bold text-slate-100">
            {selectedScale.description}
          </h3>
          <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
            {selectedScale.practicalUse}
          </p>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-400">
            <strong>How to practice:</strong> Click through the highlighted blue notes on the fretboard from low E (string 6) up to high E (string 1), then back down. These 5 notes can never sound bad together!
          </div>
        </div>
      )}
    </div>
  );
};
