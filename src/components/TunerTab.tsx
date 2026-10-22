import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { audioEngine, OPEN_STRING_NOTES, OPEN_STRING_NAMES, OPEN_STRING_FREQS } from '../utils/audioEngine';

interface TunerString {
  index: number;
  name: string;
  note: string;
  freq: number;
}

const STRINGS: TunerString[] = [
  { index: 0, name: 'String 6 (Thickest)', note: 'E2', freq: 82.41 },
  { index: 1, name: 'String 5', note: 'A2', freq: 110.00 },
  { index: 2, name: 'String 4', note: 'D3', freq: 146.83 },
  { index: 3, name: 'String 3', note: 'G3', freq: 196.00 },
  { index: 4, name: 'String 2', note: 'B3', freq: 246.94 },
  { index: 5, name: 'String 1 (Thinnest)', note: 'E4', freq: 329.63 },
];

export const TunerTab: React.FC = () => {
  const [selectedString, setSelectedString] = useState<TunerString>(STRINGS[0]);
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [detectedPitch, setDetectedPitch] = useState<number | null>(null);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  const [centsOffset, setCentsOffset] = useState<number>(0);
  const [micError, setMicError] = useState<string | null>(null);

  const startMic = async () => {
    setMicError(null);
    const success = await audioEngine.startMicListening((freq, note, cents) => {
      setDetectedPitch(freq);
      setDetectedNote(note);
      setCentsOffset(cents);

      // Automatically match closest standard string if detected
      if (freq) {
        let closest = STRINGS[0];
        let minDiff = Math.abs(freq - STRINGS[0].freq);
        for (const s of STRINGS) {
          const diff = Math.abs(freq - s.freq);
          if (diff < minDiff) {
            minDiff = diff;
            closest = s;
          }
        }
        setSelectedString(closest);
      }
    });

    if (success) {
      setIsMicActive(true);
    } else {
      setIsMicActive(false);
      setMicError('Microphone permission not granted or mic unavailable. You can use reference audio tones below to tune by ear!');
    }
  };

  const stopMic = () => {
    audioEngine.stopMicListening();
    setIsMicActive(false);
    setDetectedPitch(null);
    setDetectedNote(null);
    setCentsOffset(0);
  };

  useEffect(() => {
    return () => {
      audioEngine.stopMicListening();
    };
  }, []);

  const playReferenceTone = (str: TunerString) => {
    setSelectedString(str);
    audioEngine.pluck(str.freq, 3.5, 0.9);
  };

  const isInTune = isMicActive && detectedPitch && Math.abs(centsOffset) <= 4;
  const isFlat = isMicActive && detectedPitch && centsOffset < -4;
  const isSharp = isMicActive && detectedPitch && centsOffset > 4;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <Mic className="w-4 h-4" />
              <span>Standard E-A-D-G-B-e Tuner</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-100 tracking-tight">
              Acoustic Guitar Chromatic Tuner
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Tune using your device microphone with real-time pitch feedback, or by ear using pure acoustic reference tones.
            </p>
          </div>

          {/* Mic Toggle Button */}
          <div>
            {!isMicActive ? (
              <button
                onClick={startMic}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Mic className="w-4 h-4" />
                <span>Start Live Mic Tuner</span>
              </button>
            ) : (
              <button
                onClick={stopMic}
                className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
              >
                <MicOff className="w-4 h-4" />
                <span>Stop Microphone</span>
              </button>
            )}
          </div>
        </div>

        {micError && (
          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{micError}</span>
          </div>
        )}
      </div>

      {/* Main Tuner Gauge Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-10 text-center space-y-8 shadow-xl relative overflow-hidden">
        {/* String Target Pill & Frequency */}
        <div className="space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Target Tuning String
          </div>
          <div className="font-display font-extrabold text-5xl sm:text-6xl text-amber-400">
            {isMicActive && detectedNote ? detectedNote : selectedString.note}
          </div>
          <div className="text-xs font-mono text-slate-400">
            Ideal Frequency: {selectedString.freq.toFixed(2)} Hz
            {detectedPitch && (
              <span className="text-slate-300 ml-2">
                (Detected: {detectedPitch.toFixed(1)} Hz)
              </span>
            )}
          </div>
        </div>

        {/* Visual Needle Arc / Cents Gauge */}
        <div className="max-w-md mx-auto space-y-3">
          <div className="relative h-12 flex items-center justify-center">
            {/* Center target tick */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-emerald-400 rounded-full z-10" />

            {/* Gauge bar track */}
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 relative flex">
              <div className="w-1/2 bg-gradient-to-r from-red-500/40 via-amber-400/40 to-emerald-400/40" />
              <div className="w-1/2 bg-gradient-to-r from-emerald-400/40 via-amber-400/40 to-red-500/40" />
            </div>

            {/* Needle indicator */}
            <div
              className="absolute top-0 bottom-0 w-2.5 rounded-full shadow-lg transition-all duration-100 ease-out z-20"
              style={{
                left: `${Math.min(95, Math.max(5, 50 + centsOffset))}%`,
                transform: 'translateX(-50%)',
                backgroundColor: isInTune ? '#10b981' : isFlat ? '#f59e0b' : '#ef4444',
                boxShadow: isInTune ? '0 0 12px #10b981' : 'none',
              }}
            />
          </div>

          {/* Cents scale text */}
          <div className="flex justify-between text-[11px] font-mono text-slate-500 px-2">
            <span>-50 Cents (Too Flat)</span>
            <span className={isInTune ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
              0 (In Tune)
            </span>
            <span>+50 Cents (Too Sharp)</span>
          </div>

          {/* Status Verdict */}
          <div className="pt-2">
            {isInTune ? (
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>IN TUNE! PERFECT PITCH</span>
              </div>
            ) : isFlat ? (
              <div className="text-amber-400 font-bold text-sm">
                ▲ TOO FLAT — TIGHTEN TUNING PEG GENTLY
              </div>
            ) : isSharp ? (
              <div className="text-red-400 font-bold text-sm">
                ▼ TOO SHARP — LOOSEN TUNING PEG GENTLY
              </div>
            ) : (
              <div className="text-slate-500 text-xs">
                {isMicActive ? 'Pluck a string now...' : 'Select a reference string below or start mic'}
              </div>
            )}
          </div>
        </div>

        {/* 6 String Reference Tone Buttons */}
        <div className="pt-6 border-t border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Pluck Reference Tone By Ear (Standard Tuning)
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {STRINGS.map((str) => {
              const isSelected = selectedString.index === str.index;
              return (
                <button
                  key={str.index}
                  onClick={() => playReferenceTone(str)}
                  className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-bold'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="font-display font-bold text-xl mb-0.5">
                    {str.note}
                  </div>
                  <div className="text-[11px] opacity-80">
                    {str.name.split(' ')[0]} {str.name.split(' ')[1]}
                  </div>
                  <div className="text-[10px] font-mono mt-1 opacity-70">
                    {str.freq.toFixed(1)} Hz
                  </div>
                  <div className="mt-2 flex justify-center">
                    <Volume2 className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tuning Tips Guide */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 text-left text-xs text-slate-400 space-y-2">
          <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Golden Rules of Tuning:</span>
          </h4>
          <ul className="list-disc list-inside space-y-1 pl-1 text-slate-300">
            <li>
              <strong>Always tune UP into the note:</strong> If a string is sharp (pitch too high), tune it slightly lower than the target first, then turn the peg upward to reach pitch. This removes peg slack and keeps the guitar in tune longer.
            </li>
            <li>
              <strong>Follow the string wire to the peg:</strong> Ensure you are turning the tuning peg connected to the string you are actually plucking!
            </li>
            <li>
              <strong>Small micro-turns:</strong> A quarter-turn makes a huge pitch difference. Never make rapid full turns on thin strings to prevent string snaps.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
