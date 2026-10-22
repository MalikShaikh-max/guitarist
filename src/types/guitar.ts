export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface ChordDefinition {
  id: string;
  name: string;
  category: 'Essential' | 'Major' | 'Minor' | '7th' | 'Suspended' | 'Barre';
  frets: [number, number, number, number, number, number]; // Strings 6, 5, 4, 3, 2, 1 (-1 = X, 0 = O)
  fingers: [number, number, number, number, number, number]; // 0 = none/open, 1=index, 2=middle, 3=ring, 4=pinky
  baseFret?: number;
  barre?: { fret: number; fromString: number; toString: number };
  difficulty: Difficulty;
  description: string;
  techniqueTip: string;
  commonIn: string;
}

export interface ScaleDefinition {
  id: string;
  name: string;
  root: string;
  type: 'Pentatonic Minor' | 'Major Pentatonic' | 'Blues' | 'Natural Minor' | 'Major';
  pattern: { string: number; frets: number[] }[];
  description: string;
  practicalUse: string;
}

export type StrumStroke = 'D' | 'U' | 'X' | '-'; // Down, Up, Chuck/Mute, Rest

export interface StrummingPattern {
  id: string;
  name: string;
  timeSignature: '4/4' | '3/4' | '6/8';
  defaultBpm: number;
  subdivisions: number; // 8 for eighth notes, 16 for sixteenth
  strokes: { stroke: StrumStroke; beatLabel: string; isAccent: boolean }[];
  description: string;
  famousExample: string;
}

export interface LessonStep {
  title: string;
  body: string[];
  interactiveMode?: 'fretboard' | 'chord' | 'strum' | 'transition';
  chordId?: string;
  secondaryChordId?: string;
  strumPatternId?: string;
  checkpointPrompt?: string;
}

export interface Lesson {
  id: string;
  moduleOrder: number;
  moduleTitle: string;
  lessonTitle: string;
  subtitle: string;
  estimatedMinutes: number;
  difficulty: Difficulty;
  summary: string;
  steps: LessonStep[];
}

export interface SongChordEvent {
  chord: string;
  durationBeats: number;
  lyricsSnippet: string;
}

export interface Song {
  id: string;
  title: string;
  style: string;
  difficulty: Difficulty;
  key: string;
  bpm: number;
  strumPatternId: string;
  chords: string[];
  story: string;
  events: SongChordEvent[];
}
