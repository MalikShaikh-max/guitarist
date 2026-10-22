import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, ArrowRight, Play, Award, RotateCcw } from 'lucide-react';
import { LESSONS, CHORDS, STRUMMING_PATTERNS } from '../data/guitarData';
import { Lesson, ChordDefinition } from '../types/guitar';
import { ChordBox } from './ChordBox';
import { audioEngine } from '../utils/audioEngine';

interface AcademyViewProps {
  onSelectChordOnFretboard: (chord: ChordDefinition) => void;
  onNavigateToTab: (tab: 'fretboard' | 'rhythm' | 'transition') => void;
}

export const AcademyView: React.FC<AcademyViewProps> = ({
  onSelectChordOnFretboard,
  onNavigateToTab,
}) => {
  const [activeLessonId, setActiveLessonId] = useState<string>(LESSONS[0].id);
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fretflow_completed_lessons');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const activeLesson = LESSONS.find((l) => l.id === activeLessonId) || LESSONS[0];
  const activeStep = activeLesson.steps[currentStepIndex] || activeLesson.steps[0];

  // Save progress
  useEffect(() => {
    try {
      localStorage.setItem('fretflow_completed_lessons', JSON.stringify(completedLessons));
    } catch {
      // Storage fallback
    }
  }, [completedLessons]);

  const toggleLessonComplete = (lessonId: string) => {
    setCompletedLessons((prev) =>
      prev.includes(lessonId) ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]
    );
  };

  const handleNextStep = () => {
    if (currentStepIndex < activeLesson.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      if (!completedLessons.includes(activeLesson.id)) {
        setCompletedLessons((prev) => [...prev, activeLesson.id]);
      }
      // Move to next lesson if available
      const currentIdx = LESSONS.findIndex((l) => l.id === activeLesson.id);
      if (currentIdx < LESSONS.length - 1) {
        setActiveLessonId(LESSONS[currentIdx + 1].id);
        setCurrentStepIndex(0);
      }
    }
  };

  const associatedChord = activeStep.chordId
    ? CHORDS.find((c) => c.id === activeStep.chordId)
    : null;

  const secondaryChord = activeStep.secondaryChordId
    ? CHORDS.find((c) => c.id === activeStep.secondaryChordId)
    : null;

  const progressPercent = Math.round((completedLessons.length / LESSONS.length) * 100);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Academy Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/30 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-2">
              <BookOpen className="w-4 h-4" />
              <span>Step-by-Step Curriculum</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">Zero Prior Music Theory Required</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight mb-2">
              Learn Guitar From Your First Pluck to Full Songs
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
              Master the physical ergonomics, chord muscle memory, and rhythmic pendulum timing that unlock 90% of popular guitar music.
            </p>
          </div>

          {/* Progress Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 min-w-[220px]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400">Curriculum Progress</span>
              <span className="font-mono font-bold text-amber-400">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-2">
              <div
                className="h-full bg-amber-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{completedLessons.length} of {LESSONS.length} Lessons</span>
              {progressPercent === 100 && (
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <Award className="w-3.5 h-3.5" /> Completed
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Lesson List on Left, Active Stage on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Lesson Directory */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
            Lesson Path
          </h2>

          <div className="space-y-2">
            {LESSONS.map((lesson, idx) => {
              const isActive = lesson.id === activeLesson.id;
              const isDone = completedLessons.includes(lesson.id);

              return (
                <div
                  key={lesson.id}
                  onClick={() => {
                    setActiveLessonId(lesson.id);
                    setCurrentStepIndex(0);
                  }}
                  className={`p-3.5 rounded-xl border transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 border-amber-400/80 shadow-md ring-1 ring-amber-400/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>{lesson.moduleTitle}</span>
                        <span>·</span>
                        <span>{lesson.estimatedMinutes} min</span>
                      </div>
                      <h3 className="font-semibold text-sm text-slate-200">
                        {idx + 1}. {lesson.lessonTitle}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {lesson.subtitle}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLessonComplete(lesson.id);
                      }}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                        isDone
                          ? 'text-emerald-400 hover:text-emerald-300'
                          : 'text-slate-600 hover:text-slate-400'
                      }`}
                      title={isDone ? 'Mark as Incomplete' : 'Mark as Done'}
                    >
                      <CheckCircle className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Interactive Lesson Deck */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          {/* Header */}
          <div className="border-b border-slate-800/80 pb-5">
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-xs font-semibold text-amber-400">
                {activeLesson.moduleTitle} · Lesson {activeLesson.moduleOrder}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>Step {currentStepIndex + 1} of {activeLesson.steps.length}</span>
              </div>
            </div>

            <h2 className="font-display text-2xl font-bold text-slate-100 mb-1">
              {activeLesson.lessonTitle}
            </h2>
            <p className="text-sm text-slate-400">
              {activeLesson.summary}
            </p>
          </div>

          {/* Active Step Content */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base text-amber-300 flex items-center gap-2">
              <span>{activeStep.title}</span>
            </h3>

            <div className="space-y-2.5 text-sm text-slate-300 leading-relaxed">
              {activeStep.body.map((paragraph, pIdx) => (
                <p key={pIdx}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Interactive Playground Sandbox */}
          {associatedChord && (
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Hands-On Interactive Practice
                </span>
                <button
                  onClick={() => onSelectChordOnFretboard(associatedChord)}
                  className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-4 cursor-pointer"
                >
                  View on Full Fretboard Studio →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <ChordBox chord={associatedChord} />
                {secondaryChord ? (
                  <ChordBox chord={secondaryChord} />
                ) : (
                  <div className="space-y-2.5 text-xs text-slate-400 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <p className="font-semibold text-slate-200">Practice Goal:</p>
                    <p>{activeStep.checkpointPrompt}</p>
                    <div className="pt-2">
                      <button
                        onClick={() => audioEngine.strumChord(associatedChord.frets, 'down', 24)}
                        className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Strum This Chord</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Strumming Pattern Practice Shortcut */}
          {activeStep.strumPatternId && (
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-semibold text-sm text-slate-200 mb-1">
                  Ready to practice this rhythm with the interactive metronome?
                </h4>
                <p className="text-xs text-slate-400">
                  Open the Rhythm Lab to play along with the visual pendulum and audio clicks.
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('rhythm')}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Open Rhythm Lab →
              </button>
            </div>
          )}

          {/* Action Step Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
            <button
              onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentStepIndex === 0}
              className="px-3.5 py-2 text-xs font-medium rounded-lg text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              ← Previous Step
            </button>

            <button
              onClick={handleNextStep}
              className="px-5 py-2 text-xs font-bold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>{currentStepIndex < activeLesson.steps.length - 1 ? 'Next Step' : 'Finish Lesson'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
