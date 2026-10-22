import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, Music, ArrowDown, ArrowUp, Zap, Clock } from 'lucide-react';
import { STRUMMING_PATTERNS, CHORDS } from '../data/guitarData';
import { StrummingPattern, ChordDefinition, StrumStroke } from '../types/guitar';
import { audioEngine } from '../utils/audioEngine';

export const RhythmLabView: React.FC = () => {
  const [selectedPattern, setSelectedPattern] = useState<StrummingPattern>(STRUMMING_PATTERNS[0]);
  const [bpm, setBpm] = useState<number>(selectedPattern.defaultBpm);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStrokeIdx, setCurrentStrokeIdx] = useState<number>(0);
  const [selectedChord, setSelectedChord] = useState<ChordDefinition>(CHORDS[4]); // G Major
  const [soundMode, setSoundMode] = useState<'both' | 'strum' | 'click'>('both');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<number>(0);

  // Interval calculation based on BPM and subdivisions
  // In 4/4 with 8 subdivisions, each step is an 8th note = (60,000 / BPM) / 2 ms
  const stepMs = Math.round((60000 / bpm) / 2);

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentStrokeIdx((prevIdx) => {
        const nextIdx = (prevIdx + 1) % selectedPattern.strokes.length;
        const currentStep = selectedPattern.strokes[nextIdx];

        // Sound triggers
        const isAccent = currentStep.isAccent;
        if (soundMode === 'click' || soundMode === 'both') {
          // Click on numbered beats (beat 1, 2, 3, 4)
          if (!currentStep.beatLabel.includes('&')) {
            audioEngine.playClick(isAccent);
          }
        }

        if (soundMode === 'strum' || soundMode === 'both') {
          if (currentStep.stroke === 'D') {
            audioEngine.strumChord(selectedChord.frets, 'down', 18);
          } else if (currentStep.stroke === 'U') {
            audioEngine.strumChord(selectedChord.frets, 'up', 18);
          }
        }

        return nextIdx;
      });
    }, stepMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, bpm, selectedPattern, selectedChord, soundMode, stepMs]);

  const togglePlay = () => {
    if (!isPlaying) {
      setCurrentStrokeIdx(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handleTapTempo = () => {
    const now = Date.now();
    if (lastTapRef.current > 0) {
      const delta = now - lastTapRef.current;
      if (delta > 250 && delta < 2000) {
        const calculatedBpm = Math.round(60000 / delta);
        setBpm(Math.min(180, Math.max(40, calculatedBpm)));
      }
    }
    lastTapRef.current = now;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <Zap className="w-4 h-4" />
              <span>Rhythm & Strumming Lab</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-100 tracking-tight">
              Interactive Pendulum & Strumming Metronome
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              The secret to playing guitar is keeping your right arm swinging constantly like a pendulum.
            </p>
          </div>

          {/* Sound Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            {(['both', 'strum', 'click'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setSoundMode(mode)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize cursor-pointer ${
                  soundMode === mode
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode === 'both' ? 'Strum + Click' : mode === 'strum' ? 'Guitar Strum' : 'Click Only'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pattern Selector Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {STRUMMING_PATTERNS.map((pattern) => {
          const isSelected = selectedPattern.id === pattern.id;
          return (
            <div
              key={pattern.id}
              onClick={() => {
                setSelectedPattern(pattern);
                setBpm(pattern.defaultBpm);
                setCurrentStrokeIdx(0);
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                isSelected
                  ? 'bg-slate-900 border-amber-400 ring-1 ring-amber-400/40 shadow-lg'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-display font-bold text-sm text-slate-100">
                  {pattern.name}
                </span>
                <span className="text-[11px] font-mono text-amber-400">
                  {pattern.timeSignature}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                {pattern.description}
              </p>
              <div className="text-[10px] text-slate-500 font-mono">
                E.g. {pattern.famousExample}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Strumming Stage */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Controls row */}
        <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                isPlaying
                  ? 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/20 scale-105'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20'
              }`}
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current translate-x-0.5" />}
            </button>

            <div>
              <div className="font-display font-bold text-xl text-slate-100 flex items-center gap-2">
                <span>{bpm}</span>
                <span className="text-xs font-mono text-slate-400 font-normal">BPM</span>
              </div>
              <span className="text-xs text-slate-400">
                {isPlaying ? 'Playing in real time' : 'Paused - Hit Play to start metronome'}
              </span>
            </div>
          </div>

          {/* BPM Slider & Tap Tempo */}
          <div className="flex items-center gap-4">
            <div className="space-y-1 w-44 sm:w-56">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Tempo</span>
                <span className="font-mono">{bpm} BPM</span>
              </div>
              <input
                type="range"
                min="40"
                max="180"
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-full accent-amber-400 h-2 bg-slate-950 rounded-lg cursor-pointer"
              />
            </div>

            <button
              onClick={handleTapTempo}
              className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Tap Tempo
            </button>
          </div>

          {/* Practice Chord Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Strum Chord:</span>
            <div className="flex items-center gap-1">
              {CHORDS.slice(0, 5).map((chord) => (
                <button
                  key={chord.id}
                  onClick={() => setSelectedChord(chord)}
                  className={`px-2.5 py-1 text-xs font-bold font-mono rounded-md border transition-colors cursor-pointer ${
                    selectedChord.id === chord.id
                      ? 'bg-amber-400 text-slate-950 border-amber-300'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {chord.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Beat Pendulum & Arrows */}
        <div className="space-y-4">
          <div className="text-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Beat Grid ({selectedPattern.name})
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
            {selectedPattern.strokes.map((strokeData, idx) => {
              const isCurrent = isPlaying && currentStrokeIdx === idx;
              const isDown = strokeData.stroke === 'D';
              const isUp = strokeData.stroke === 'U';
              const isGhost = strokeData.stroke === '-';

              return (
                <div
                  key={idx}
                  className={`relative rounded-xl p-3 sm:p-4 text-center border transition-all ${
                    isCurrent
                      ? 'bg-amber-400 text-slate-950 border-amber-300 scale-105 shadow-xl shadow-amber-500/20 z-10'
                      : isGhost
                      ? 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                      : 'bg-slate-950/80 border-slate-800 text-slate-200'
                  }`}
                >
                  {/* Beat number label */}
                  <div
                    className={`text-xs font-mono font-bold mb-2 ${
                      isCurrent ? 'text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    {strokeData.beatLabel}
                  </div>

                  {/* Arrow Icon */}
                  <div className="flex justify-center items-center h-8">
                    {isDown ? (
                      <ArrowDown className={`w-7 h-7 ${isCurrent ? 'text-slate-950 stroke-[3]' : 'text-amber-400 stroke-[2.5]'}`} />
                    ) : isUp ? (
                      <ArrowUp className={`w-7 h-7 ${isCurrent ? 'text-slate-950 stroke-[3]' : 'text-cyan-400 stroke-[2.5]'}`} />
                    ) : (
                      <div className="w-3 h-0.5 bg-slate-600 rounded" />
                    )}
                  </div>

                  {/* Text label */}
                  <div className="mt-2 text-[10px] font-bold uppercase tracking-wider">
                    {isDown ? 'DOWN' : isUp ? 'UP' : 'GHOST (MISS)'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coach Advice */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-300 space-y-1.5">
          <p className="font-semibold text-amber-300">
            Master the "Ghost Stroke" Rule:
          </p>
          <p className="text-slate-400 leading-relaxed">
            When you see <span className="text-slate-200 font-semibold">GHOST (MISS)</span>, your hand MUST still swing down past the strings without touching them. If you freeze your arm, your timing will collapse. Keep the pendulum swinging!
          </p>
        </div>
      </div>
    </div>
  );
};
