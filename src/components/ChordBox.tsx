import React, { useState } from 'react';
import { Volume2, Check } from 'lucide-react';
import { ChordDefinition } from '../types/guitar';
import { audioEngine } from '../utils/audioEngine';

interface ChordBoxProps {
  chord: ChordDefinition;
  isSelected?: boolean;
  onSelect?: (chord: ChordDefinition) => void;
  compact?: boolean;
}

export const ChordBox: React.FC<ChordBoxProps> = ({
  chord,
  isSelected = false,
  onSelect,
  compact = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayStrum = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
    audioEngine.strumChord(chord.frets, 'down', 24);
    setTimeout(() => setIsPlaying(false), 300);
  };

  // Find max fret to determine diagram height (at least 4 frets)
  const maxFretInChord = Math.max(...chord.frets);
  const totalDisplayFrets = Math.max(4, maxFretInChord);

  return (
    <div
      onClick={() => onSelect && onSelect(chord)}
      className={`rounded-xl border transition-all text-left relative overflow-hidden cursor-pointer ${
        isSelected
          ? 'bg-slate-900/95 border-amber-400 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/40'
          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
      } ${compact ? 'p-3' : 'p-4'}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-display font-bold text-lg text-slate-100 flex items-center gap-2">
            {chord.name}
            {isSelected && (
              <span className="text-amber-400 text-xs font-mono">Active</span>
            )}
          </h4>
          <span className="text-[11px] text-slate-400 font-medium">
            {chord.category}
          </span>
        </div>

        <button
          onClick={handlePlayStrum}
          className={`p-2 rounded-lg border transition-all cursor-pointer ${
            isPlaying
              ? 'bg-amber-400 text-slate-950 border-amber-300 scale-95'
              : 'bg-slate-800/80 text-amber-400 border-slate-700/80 hover:bg-amber-400 hover:text-slate-950'
          }`}
          title={`Strum ${chord.name}`}
          aria-label={`Strum ${chord.name}`}
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* SVG Chord Grid */}
      <div className="flex justify-center my-2">
        <svg
          viewBox="0 0 160 180"
          className="w-36 h-40 select-none drop-shadow-sm"
        >
          {/* Top Mute (X) and Open (O) indicators */}
          {chord.frets.map((fretVal, strIdx) => {
            const x = 30 + strIdx * 20;
            if (fretVal === -1) {
              return (
                <text
                  key={`top-x-${strIdx}`}
                  x={x}
                  y={16}
                  textAnchor="middle"
                  fill="#ef4444"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  ✕
                </text>
              );
            }
            if (fretVal === 0) {
              return (
                <circle
                  key={`top-o-${strIdx}`}
                  cx={x}
                  cy={12}
                  r={4.5}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="1.8"
                />
              );
            }
            return null;
          })}

          {/* Nut line (thick white bar at top of fret 1) */}
          <line
            x1={28}
            y1={24}
            x2={132}
            y2={24}
            stroke="#f8fafc"
            strokeWidth={chord.baseFret && chord.baseFret > 1 ? 1.5 : 4}
            strokeLinecap="round"
          />

          {/* Base Fret indicator if capo / higher on neck */}
          {chord.baseFret && chord.baseFret > 1 && (
            <text
              x={18}
              y={44}
              textAnchor="middle"
              fill="#fbbf24"
              fontSize="11"
              fontWeight="bold"
              fontFamily="monospace"
            >
              {chord.baseFret}fr
            </text>
          )}

          {/* Horizontal Frets */}
          {Array.from({ length: totalDisplayFrets + 1 }).map((_, fIdx) => (
            <line
              key={`fret-${fIdx}`}
              x1={30}
              y1={24 + fIdx * 30}
              x2={130}
              y2={24 + fIdx * 30}
              stroke="#475569"
              strokeWidth="1.2"
            />
          ))}

          {/* Vertical Strings (String 6 on left to String 1 on right) */}
          {Array.from({ length: 6 }).map((_, sIdx) => (
            <line
              key={`string-${sIdx}`}
              x1={30 + sIdx * 20}
              y1={24}
              x2={30 + sIdx * 20}
              y2={24 + totalDisplayFrets * 30}
              stroke="#64748b"
              strokeWidth={sIdx === 0 ? 2.5 : sIdx === 1 ? 2.0 : 1.2}
            />
          ))}

          {/* Barre line if applicable */}
          {chord.barre && (
            <rect
              x={30 + chord.barre.fromString * 20 - 7}
              y={24 + (chord.barre.fret - 1) * 30 + 8}
              width={(chord.barre.toString - chord.barre.fromString) * 20 + 14}
              height={14}
              rx={7}
              fill="#fbbf24"
              opacity={0.9}
            />
          )}

          {/* Fretted finger dots */}
          {chord.frets.map((fretVal, strIdx) => {
            if (fretVal > 0) {
              const cx = 30 + strIdx * 20;
              const cy = 24 + (fretVal - 1) * 30 + 15;
              const finger = chord.fingers[strIdx];

              return (
                <g key={`dot-${strIdx}`}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={7}
                    fill="#fbbf24"
                    stroke="#1e293b"
                    strokeWidth="1.5"
                  />
                  {finger > 0 && (
                    <text
                      x={cx}
                      y={cy + 3.5}
                      textAnchor="middle"
                      fill="#0f172a"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      {finger}
                    </text>
                  )}
                </g>
              );
            }
            return null;
          })}
        </svg>
      </div>

      {/* Description & Tips */}
      {!compact && (
        <div className="mt-2 pt-2 border-t border-slate-800/80 text-xs">
          <p className="text-slate-300 line-clamp-2 mb-1.5 leading-relaxed">
            {chord.description}
          </p>
          <p className="text-slate-400 text-[11px]">
            <span className="text-slate-200 font-medium">Song context:</span> {chord.commonIn}
          </p>
        </div>
      )}
    </div>
  );
};
