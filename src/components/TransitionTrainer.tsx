import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, Trophy, Sparkles, ArrowLeftRight } from 'lucide-react';
import { CHORDS } from '../data/guitarData';
import { ChordDefinition } from '../types/guitar';
import { ChordBox } from './ChordBox';
import { audioEngine } from '../utils/audioEngine';

export const TransitionTrainer: React.FC = () => {
  const [chordA, setChordA] = useState<ChordDefinition>(CHORDS[4]); // G
  const [chordB, setChordB] = useState<ChordDefinition>(CHORDS[8]); // Cadd9
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [switchCount, setSwitchCount] = useState<number>(0);
  const [activeSide, setActiveSide] = useState<'A' | 'B'>('A');
  const [personalBest, setPersonalBest] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('fretflow_best_switch');
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (switchCount > personalBest) {
        setPersonalBest(switchCount);
        try {
          localStorage.setItem('fretflow_best_switch', switchCount.toString());
        } catch {
          // Fallback
        }
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, switchCount, personalBest]);

  // Spacebar hotkey to log a switch
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isActive) {
        e.preventDefault();
        handleSwitch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, activeSide]);

  const handleSwitch = () => {
    if (!isActive) return;
    setSwitchCount((prev) => prev + 1);
    const nextSide = activeSide === 'A' ? 'B' : 'A';
    setActiveSide(nextSide);
    const chordToPlay = nextSide === 'A' ? chordA : chordB;
    audioEngine.strumChord(chordToPlay.frets, 'down', 22);
  };

  const handleStart = () => {
    setTimeLeft(60);
    setSwitchCount(0);
    setActiveSide('A');
    setIsActive(true);
    audioEngine.strumChord(chordA.frets, 'down', 22);
  };

  const handleStop = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(60);
    setSwitchCount(0);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <ArrowLeftRight className="w-4 h-4" />
              <span>Muscle Memory Accelerator</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-100 tracking-tight">
              The 60-Second Chord Transition Lab
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              The proven 1-minute drill used by world-class guitar instructors to eliminate hesitation.
            </p>
          </div>

          {/* Personal Best Display */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Personal Record
              </div>
              <div className="font-mono text-base font-bold text-slate-100">
                {personalBest} clean switches / min
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xl">
        {/* Timer & Switch counter displays */}
        <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-6">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center min-w-[120px]">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
                Time Left
              </div>
              <div className={`font-mono text-4xl font-bold ${timeLeft <= 10 && isActive ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
                {timeLeft}s
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center min-w-[120px]">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
                Switches Made
              </div>
              <div className="font-mono text-4xl font-bold text-slate-100">
                {switchCount}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {!isActive ? (
              <button
                onClick={handleStart}
                className="px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-400/20"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{timeLeft === 0 ? 'Start Another Round' : 'Start 60s Drill'}</span>
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="px-6 py-3.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-red-500/20"
              >
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause</span>
              </button>
            )}

            <button
              onClick={handleReset}
              className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              title="Reset Drill"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Selected Chords Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Chord A Card */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              isActive && activeSide === 'A'
                ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-400/30'
                : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Position A (Target)
              </span>
              <select
                value={chordA.id}
                onChange={(e) => {
                  const found = CHORDS.find((c) => c.id === e.target.value);
                  if (found) setChordA(found);
                }}
                disabled={isActive}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {CHORDS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.category})
                  </option>
                ))}
              </select>
            </div>

            <ChordBox chord={chordA} isSelected={isActive && activeSide === 'A'} />
          </div>

          {/* Chord B Card */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              isActive && activeSide === 'B'
                ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-400/30'
                : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Position B (Target)
              </span>
              <select
                value={chordB.id}
                onChange={(e) => {
                  const found = CHORDS.find((c) => c.id === e.target.value);
                  if (found) setChordB(found);
                }}
                disabled={isActive}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {CHORDS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.category})
                  </option>
                ))}
              </select>
            </div>

            <ChordBox chord={chordB} isSelected={isActive && activeSide === 'B'} />
          </div>
        </div>

        {/* Big Tap to Switch Target when drill is active */}
        {isActive && (
          <div className="text-center pt-2">
            <button
              onClick={handleSwitch}
              className="w-full py-8 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-display font-extrabold text-2xl tracking-tight shadow-xl cursor-pointer active:scale-[0.99] transition-transform"
            >
              TAP HERE OR PRESS SPACEBAR AFTER EACH CLEAN SWITCH!
            </button>
            <p className="text-xs text-slate-400 mt-2">
              Next target: Switch fingers to <span className="text-amber-300 font-bold">{activeSide === 'A' ? chordB.name : chordA.name}</span>
            </p>
          </div>
        )}

        {/* Evaluation Benchmarks */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 text-xs text-slate-300 space-y-3">
          <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
            JustinGuitar Speed Benchmarks (Clean Switches in 60s):
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-slate-400">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <div className="font-bold text-slate-200">10 – 20 Switches</div>
              <div className="text-[11px]">Building initial finger coordination.</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <div className="font-bold text-amber-300">30 Switches</div>
              <div className="text-[11px]">Able to play slow campfire songs.</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <div className="font-bold text-emerald-400">45 Switches</div>
              <div className="text-[11px]">Seamless song transitions in tempo.</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <div className="font-bold text-cyan-400">60+ Switches</div>
              <div className="text-[11px]">Mastery! Pure unconscious muscle memory.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
