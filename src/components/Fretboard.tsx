import React, { useState } from 'react';
import { Play, RotateCcw, Volume2, Music, Sparkles } from 'lucide-react';
import { audioEngine, getNoteAt, OPEN_STRING_NOTES, OPEN_STRING_NAMES } from '../utils/audioEngine';
import { ChordDefinition, ScaleDefinition } from '../types/guitar';

interface FretboardProps {
  activeChord?: ChordDefinition | null;
  activeScale?: ScaleDefinition | null;
  customFrets?: number[];
  onFretClick?: (stringIndex: number, fret: number) => void;
  showNoteNames?: boolean;
}

const TOTAL_FRETS = 14;
const INLAY_FRETS = [3, 5, 7, 9, 12];

// String order: index 5 (String 1, High E) at top, down to index 0 (String 6, Low E) at bottom
// This matches standard guitar tablature and looking down at your guitar neck
const DISPLAY_STRINGS = [
  { index: 5, label: 'e (1st)', gauge: '1.2px', color: '#cbd5e1' },
  { index: 4, label: 'B (2nd)', gauge: '1.5px', color: '#cbd5e1' },
  { index: 3, label: 'G (3rd)', gauge: '1.9px', color: '#cbd5e1' },
  { index: 2, label: 'D (4th)', gauge: '2.4px', color: '#fbbf24' },
  { index: 1, label: 'A (5th)', gauge: '3.0px', color: '#d97706' },
  { index: 0, label: 'E (6th)', gauge: '3.6px', color: '#b45309' },
];

export const Fretboard: React.FC<FretboardProps> = ({
  activeChord,
  activeScale,
  customFrets,
  onFretClick,
  showNoteNames = true,
}) => {
  const [vibratingStrings, setVibratingStrings] = useState<Record<number, boolean>>({});
  const [lastPluckedNote, setLastPluckedNote] = useState<string | null>(null);
  const [isStrumming, setIsStrumming] = useState(false);

  // Trigger vibration animation on plucking a string
  const triggerStringPluck = (stringIndex: number, fret: number) => {
    const noteInfo = getNoteAt(stringIndex, fret);
    audioEngine.pluckString(stringIndex, fret);
    setLastPluckedNote(`${noteInfo.fullName} (${noteInfo.freq.toFixed(1)} Hz)`);

    setVibratingStrings((prev) => ({ ...prev, [stringIndex]: true }));
    setTimeout(() => {
      setVibratingStrings((prev) => ({ ...prev, [stringIndex]: false }));
    }, 400);

    if (onFretClick) {
      onFretClick(stringIndex, fret);
    }
  };

  // Strum current chord
  const handleStrum = (direction: 'down' | 'up' = 'down') => {
    if (isStrumming) return;
    setIsStrumming(true);

    const fretsToPlay = activeChord ? activeChord.frets : customFrets || [0, 0, 0, 0, 0, 0];
    audioEngine.strumChord(fretsToPlay, direction, 26, (strIndex) => {
      setVibratingStrings((prev) => ({ ...prev, [strIndex]: true }));
      setTimeout(() => {
        setVibratingStrings((prev) => ({ ...prev, [strIndex]: false }));
      }, 350);
    });

    if (activeChord) {
      setLastPluckedNote(`${activeChord.name} Chord Strum`);
    }

    setTimeout(() => {
      setIsStrumming(false);
    }, 300);
  };

  // Arpeggio (slow fingerpicked roll)
  const handleArpeggio = () => {
    if (isStrumming) return;
    setIsStrumming(true);
    const fretsToPlay = activeChord ? activeChord.frets : customFrets || [0, 0, 0, 0, 0, 0];

    audioEngine.strumChord(fretsToPlay, 'down', 90, (strIndex) => {
      setVibratingStrings((prev) => ({ ...prev, [strIndex]: true }));
      setTimeout(() => {
        setVibratingStrings((prev) => ({ ...prev, [strIndex]: false }));
      }, 450);
    });

    setTimeout(() => {
      setIsStrumming(false);
    }, 700);
  };

  // Check if a fret on a string is active in current chord
  const getChordFingerAt = (stringIndex: number, fret: number): { isFretted: boolean; finger: number; isOpen: boolean; isMuted: boolean } => {
    if (!activeChord) return { isFretted: false, finger: 0, isOpen: false, isMuted: false };
    const targetFret = activeChord.frets[stringIndex];
    const finger = activeChord.fingers[stringIndex];

    if (targetFret === -1) {
      return { isFretted: false, finger: 0, isOpen: false, isMuted: true };
    }
    if (targetFret === 0 && fret === 0) {
      return { isFretted: false, finger: 0, isOpen: true, isMuted: false };
    }
    if (targetFret === fret && fret > 0) {
      return { isFretted: true, finger, isOpen: false, isMuted: false };
    }
    return { isFretted: false, finger: 0, isOpen: false, isMuted: false };
  };

  // Check if a note is in the active scale
  const isScaleFret = (stringIndex: number, fret: number): boolean => {
    if (!activeScale) return false;
    const match = activeScale.pattern.find((p) => p.string === stringIndex);
    return match ? match.frets.includes(fret) : false;
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Top control and status bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-slate-100 text-base sm:text-lg flex items-center gap-2">
              {activeChord ? `${activeChord.name} Chord Fretboard` : activeScale ? `${activeScale.name}` : 'Interactive Fretboard'}
              {activeChord && (
                <span className="text-xs text-amber-400/90 font-mono font-normal">
                  [{activeChord.category}]
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              {lastPluckedNote ? (
                <span className="text-amber-300 font-mono">Plucked: {lastPluckedNote}</span>
              ) : (
                'Click any fret or open string to pluck it with acoustic audio'
              )}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStrum('down')}
            disabled={isStrumming}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer shadow-md disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Strum Down</span>
          </button>

          <button
            onClick={() => handleStrum('up')}
            disabled={isStrumming}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700 disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Strum Up</span>
          </button>

          <button
            onClick={handleArpeggio}
            disabled={isStrumming}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Arpeggio Roll</span>
          </button>
        </div>
      </div>

      {/* Fretboard Container */}
      <div className="overflow-x-auto pb-4 pt-2 -mx-2 px-2 scrollbar-thin">
        <div className="min-w-[860px] relative select-none">
          {/* Fret number indicators header */}
          <div className="flex pl-24 pr-4 mb-1 text-slate-400 text-xs font-mono font-medium">
            <div className="w-12 text-center text-slate-500">Open</div>
            {Array.from({ length: TOTAL_FRETS }, (_, i) => i + 1).map((fret) => (
              <div
                key={fret}
                className={`flex-1 text-center ${
                  INLAY_FRETS.includes(fret) ? 'text-amber-400 font-bold' : 'text-slate-500'
                }`}
              >
                {fret}
              </div>
            ))}
          </div>

          {/* Rosewood fretboard surface */}
          <div className="relative rounded-xl border border-amber-950/60 bg-gradient-to-r from-[#221612] via-[#2a1a15] to-[#1c120e] shadow-2xl p-2.5">
            {/* Pearloid Inlay dots on fretboard wood */}
            <div className="absolute inset-0 pointer-events-none flex pl-24 pr-4">
              <div className="w-12" />
              {Array.from({ length: TOTAL_FRETS }, (_, i) => i + 1).map((fret) => (
                <div key={fret} className="flex-1 flex items-center justify-center">
                  {fret === 12 ? (
                    <div className="flex flex-col gap-8 opacity-60">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-100/70 shadow-sm" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-100/70 shadow-sm" />
                    </div>
                  ) : INLAY_FRETS.includes(fret) ? (
                    <div className="w-3 h-3 rounded-full bg-amber-100/60 shadow-sm opacity-60" />
                  ) : null}
                </div>
              ))}
            </div>

            {/* Nut (Bone ivory bar separating open strings from fret 1) */}
            <div className="absolute top-0 bottom-0 left-[84px] w-2.5 bg-amber-100/90 rounded-sm shadow-md border-r border-amber-300/40 pointer-events-none z-10" />

            {/* Strings and frets rows */}
            <div className="flex flex-col gap-4 relative z-20 py-1">
              {DISPLAY_STRINGS.map((str) => {
                const isVibrating = vibratingStrings[str.index];
                const chordStatus = activeChord ? getChordFingerAt(str.index, 0) : null;

                return (
                  <div key={str.index} className="flex items-center relative group">
                    {/* Headstock string label + Open/Mute indicator */}
                    <div className="w-20 shrink-0 flex items-center justify-between pr-2.5">
                      <span className="text-xs font-mono font-medium text-slate-300">
                        {str.label}
                      </span>
                      {activeChord && (
                        <span
                          className={`text-xs font-bold font-mono px-1 rounded ${
                            chordStatus?.isMuted
                              ? 'text-red-400 bg-red-950/40 border border-red-800/40'
                              : activeChord.frets[str.index] === 0
                              ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40'
                              : 'text-slate-400'
                          }`}
                        >
                          {chordStatus?.isMuted ? '✕' : activeChord.frets[str.index] === 0 ? '○' : ''}
                        </span>
                      )}
                    </div>

                    {/* Open string click target (Fret 0) */}
                    <button
                      onClick={() => triggerStringPluck(str.index, 0)}
                      className="w-12 h-7 shrink-0 flex items-center justify-center rounded hover:bg-amber-400/20 transition-colors cursor-pointer relative"
                      title={`Pluck open string ${str.label} (${OPEN_STRING_NOTES[str.index]})`}
                    >
                      {activeChord && activeChord.frets[str.index] === 0 && (
                        <div className="w-5 h-5 rounded-full border-2 border-emerald-400 bg-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-300 z-30">
                          0
                        </div>
                      )}
                      {!activeChord && (
                        <span className="text-[10px] text-slate-400 font-mono group-hover:text-amber-300">
                          {OPEN_STRING_NOTES[str.index]}
                        </span>
                      )}
                    </button>

                    {/* Physical String Wire across frets */}
                    <div className="flex-1 relative flex items-center">
                      <div
                        className={`absolute left-0 right-0 pointer-events-none transition-transform ${
                          isVibrating ? 'string-vibrating' : ''
                        }`}
                        style={{
                          height: str.gauge,
                          backgroundColor: str.color,
                          boxShadow: isVibrating
                            ? '0 0 8px rgba(251, 191, 36, 0.8)'
                            : '0 1px 2px rgba(0,0,0,0.8)',
                        }}
                      />

                      {/* Frets columns on this string */}
                      {Array.from({ length: TOTAL_FRETS }, (_, i) => i + 1).map((fret) => {
                        const noteData = getNoteAt(str.index, fret);
                        const chordInfo = activeChord ? getChordFingerAt(str.index, fret) : null;
                        const inScale = isScaleFret(str.index, fret);

                        return (
                          <div
                            key={fret}
                            className="flex-1 h-7 flex items-center justify-center relative border-r border-slate-400/40 group/fret"
                          >
                            {/* Click target for this fret */}
                            <button
                              onClick={() => triggerStringPluck(str.index, fret)}
                              className="w-full h-full flex items-center justify-center hover:bg-amber-400/15 transition-colors cursor-pointer relative z-30"
                              title={`String ${str.index + 1}, Fret ${fret}: ${noteData.fullName}`}
                            >
                              {/* Active Chord Finger Marker */}
                              {chordInfo?.isFretted && (
                                <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center shadow-lg transform scale-110 border border-amber-200">
                                  {chordInfo.finger > 0 ? chordInfo.finger : '•'}
                                </div>
                              )}

                              {/* Scale Marker */}
                              {!chordInfo?.isFretted && inScale && (
                                <div className="w-4 h-4 rounded-full bg-cyan-500/80 text-white font-bold text-[9px] flex items-center justify-center shadow-sm">
                                  {noteData.note}
                                </div>
                              )}

                              {/* Hover note preview when free exploring */}
                              {!chordInfo?.isFretted && !inScale && showNoteNames && (
                                <span className="opacity-0 group-hover/fret:opacity-100 text-[10px] text-amber-200 font-mono bg-slate-900/90 px-1 rounded shadow">
                                  {noteData.note}
                                </span>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend & Guide footer */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3 pt-3 border-t border-slate-800/80">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-950 font-bold text-[9px] flex items-center justify-center">
              1
            </div>
            <span>Finger Placement (1=Index, 2=Middle, 3=Ring, 4=Pinky)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400 font-mono font-bold">○</span>
            <span>Open String (Pluck freely)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-red-400 font-mono font-bold">✕</span>
            <span>Muted String (Do not strum)</span>
          </div>
        </div>

        {activeChord && (
          <div className="text-amber-300/90 italic">
            Pro-Tip: {activeChord.techniqueTip}
          </div>
        )}
      </div>
    </div>
  );
};
