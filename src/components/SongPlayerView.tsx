import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, FastForward, Music, Sparkles } from 'lucide-react';
import { SONGS, CHORDS } from '../data/guitarData';
import { Song, ChordDefinition } from '../types/guitar';
import { Fretboard } from './Fretboard';
import { audioEngine } from '../utils/audioEngine';

export const SongPlayerView: React.FC = () => {
  const [selectedSong, setSelectedSong] = useState<Song>(SONGS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentEventIdx, setCurrentEventIdx] = useState<number>(0);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [currentBeatInEvent, setCurrentBeatInEvent] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentEvent = selectedSong.events[currentEventIdx] || selectedSong.events[0];
  const nextEvent = selectedSong.events[(currentEventIdx + 1) % selectedSong.events.length];

  const currentChordDef =
    CHORDS.find((c) => c.name.toLowerCase() === currentEvent.chord.toLowerCase()) || CHORDS[0];

  const nextChordDef =
    CHORDS.find((c) => c.name.toLowerCase() === nextEvent.chord.toLowerCase()) || CHORDS[0];

  // Effective BPM
  const effectiveBpm = Math.round(selectedSong.bpm * speedMultiplier);
  // Beat duration in ms
  const beatMs = Math.round(60000 / effectiveBpm);

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      // Metronome click and strum on downbeat
      setCurrentBeatInEvent((prevBeat) => {
        const nextBeat = prevBeat + 1;
        
        // Strum chord on beat 1, and on beat 3 if long bar
        if (prevBeat === 0) {
          audioEngine.strumChord(currentChordDef.frets, 'down', 22);
        } else if (prevBeat === 2 || prevBeat === 4 || prevBeat === 6) {
          audioEngine.strumChord(currentChordDef.frets, 'down', 25);
        } else {
          audioEngine.playClick(false);
        }

        // If event finished, move to next chord
        if (nextBeat >= currentEvent.durationBeats) {
          setCurrentEventIdx((prevEventIdx) => (prevEventIdx + 1) % selectedSong.events.length);
          return 0;
        }

        return nextBeat;
      });
    }, beatMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentEvent, currentChordDef, selectedSong, beatMs]);

  const handleTogglePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      // Trigger immediate first strum
      audioEngine.strumChord(currentChordDef.frets, 'down', 22);
    } else {
      setIsPlaying(false);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentEventIdx(0);
    setCurrentBeatInEvent(0);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <Music className="w-4 h-4" />
              <span>Interactive Song Practice Deck</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-100 tracking-tight">
              Play Along With Classic Acoustic Anthems
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Watch chords change in real time on the synchronized fretboard with audio playback.
            </p>
          </div>

          {/* Song selector dropdown buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {SONGS.map((song) => (
              <button
                key={song.id}
                onClick={() => {
                  setSelectedSong(song);
                  setIsPlaying(false);
                  setCurrentEventIdx(0);
                  setCurrentBeatInEvent(0);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedSong.id === song.id
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {song.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Playback Console */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Playback Transport & Info */}
        <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <button
              onClick={handleTogglePlay}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                isPlaying
                  ? 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/20'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20'
              }`}
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current translate-x-0.5" />}
            </button>

            <button
              onClick={handleReset}
              className="p-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700"
              title="Reset Song to Start"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <div>
              <h2 className="font-display font-bold text-xl text-slate-100">
                {selectedSong.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Key: {selectedSong.key}</span>
                <span>·</span>
                <span>{effectiveBpm} BPM</span>
                <span>·</span>
                <span className="text-amber-400">{selectedSong.style}</span>
              </div>
            </div>
          </div>

          {/* Speed practice buttons */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 px-2 font-medium">Practice Speed:</span>
            {[0.75, 1.0, 1.15].map((mult) => (
              <button
                key={mult}
                onClick={() => setSpeedMultiplier(mult)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  speedMultiplier === mult
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mult === 0.75 ? '0.75x (Slow)' : mult === 1.0 ? '1.0x (Normal)' : '1.15x (Fast)'}
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Chord Spotlight & Upcoming Cue */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
          {/* Active Chord spotlight */}
          <div className="md:col-span-8 bg-slate-950/80 border border-amber-500/30 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Current Strum
              </span>
              <span className="font-mono text-slate-400">
                Beat {currentBeatInEvent + 1} of {currentEvent.durationBeats}
              </span>
            </div>

            <div className="flex items-baseline gap-4 my-2">
              <span className="font-display text-5xl sm:text-6xl font-bold text-amber-300">
                {currentEvent.chord}
              </span>
              <span className="text-sm text-slate-300">
                {currentChordDef.description}
              </span>
            </div>

            {/* Lyrics bar */}
            <div className="mt-4 p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
              <p className="font-display text-lg text-slate-100 font-semibold italic">
                "{currentEvent.lyricsSnippet}"
              </p>
            </div>
          </div>

          {/* Up Next Preview (Crucial for beginner hand anticipation!) */}
          <div className="md:col-span-4 bg-slate-950/40 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Prepare Hand For (Next Chord)
            </div>

            <div className="my-2">
              <span className="font-display text-4xl font-bold text-slate-300">
                {nextEvent.chord}
              </span>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Tip: {nextChordDef.techniqueTip}
              </p>
            </div>

            <div className="text-[11px] text-amber-400 font-mono">
              Lyrics: "{nextEvent.lyricsSnippet.slice(0, 32)}..."
            </div>
          </div>
        </div>

        {/* Live Synchronized Fretboard */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Synchronized Fretboard Finger Position
            </span>
            <span className="text-xs text-amber-400 font-mono">
              Fingers auto-update as chords change
            </span>
          </div>
          <Fretboard activeChord={currentChordDef} />
        </div>

        {/* Song Chord Progress Timeline */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Song Chord Chart Timeline
          </span>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {selectedSong.events.map((event, idx) => {
              const isCurrent = idx === currentEventIdx;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentEventIdx(idx);
                    setCurrentBeatInEvent(0);
                  }}
                  className={`min-w-[110px] p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-bold'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-display text-base">{event.chord}</div>
                  <div className={`text-[10px] truncate ${isCurrent ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                    {event.lyricsSnippet}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
