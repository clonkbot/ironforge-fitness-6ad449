import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell, Timer, Trophy, User, Flame, Zap,
  Play, Pause, RotateCcw, Check, Plus, X,
  TrendingUp, Calendar, Target, Star, Lock,
  ChevronRight, Volume2, VolumeX
} from 'lucide-react';

// Types
interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroup: string;
  icon: string;
}

interface CompletedExercise {
  id: string;
  exerciseId: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  completedAt: Date;
}

interface UserStats {
  level: number;
  xp: number;
  xpToNext: number;
  totalWorkouts: number;
  weeklyWorkouts: number;
  monthlyWorkouts: number;
  yearlyWorkouts: number;
  bodyFat: number;
  streak: number;
}

interface AvatarSkin {
  id: string;
  name: string;
  colors: string[];
  unlockLevel: number;
  unlocked: boolean;
}

// Exercise database
const EXERCISES: Exercise[] = [
  { id: '1', name: 'Bench Press', category: 'Strength', muscleGroup: 'Chest', icon: '🏋️' },
  { id: '2', name: 'Squats', category: 'Strength', muscleGroup: 'Legs', icon: '🦵' },
  { id: '3', name: 'Deadlift', category: 'Strength', muscleGroup: 'Back', icon: '💪' },
  { id: '4', name: 'Pull-ups', category: 'Strength', muscleGroup: 'Back', icon: '🔝' },
  { id: '5', name: 'Shoulder Press', category: 'Strength', muscleGroup: 'Shoulders', icon: '🎯' },
  { id: '6', name: 'Bicep Curls', category: 'Strength', muscleGroup: 'Arms', icon: '💪' },
  { id: '7', name: 'Tricep Dips', category: 'Strength', muscleGroup: 'Arms', icon: '⬇️' },
  { id: '8', name: 'Lunges', category: 'Strength', muscleGroup: 'Legs', icon: '🚶' },
  { id: '9', name: 'Plank', category: 'Core', muscleGroup: 'Abs', icon: '🧘' },
  { id: '10', name: 'Russian Twists', category: 'Core', muscleGroup: 'Abs', icon: '🔄' },
  { id: '11', name: 'Leg Press', category: 'Strength', muscleGroup: 'Legs', icon: '🦿' },
  { id: '12', name: 'Lat Pulldown', category: 'Strength', muscleGroup: 'Back', icon: '⬇️' },
  { id: '13', name: 'Cable Rows', category: 'Strength', muscleGroup: 'Back', icon: '🚣' },
  { id: '14', name: 'Leg Curls', category: 'Strength', muscleGroup: 'Legs', icon: '🦵' },
  { id: '15', name: 'Calf Raises', category: 'Strength', muscleGroup: 'Legs', icon: '🦶' },
  { id: '16', name: 'Face Pulls', category: 'Strength', muscleGroup: 'Shoulders', icon: '🎭' },
  { id: '17', name: 'Chest Flyes', category: 'Strength', muscleGroup: 'Chest', icon: '🦅' },
  { id: '18', name: 'Hammer Curls', category: 'Strength', muscleGroup: 'Arms', icon: '🔨' },
  { id: '19', name: 'Treadmill', category: 'Cardio', muscleGroup: 'Full Body', icon: '🏃' },
  { id: '20', name: 'Rowing Machine', category: 'Cardio', muscleGroup: 'Full Body', icon: '🚣' },
  { id: '21', name: 'Jump Rope', category: 'Cardio', muscleGroup: 'Full Body', icon: '⭕' },
  { id: '22', name: 'Burpees', category: 'HIIT', muscleGroup: 'Full Body', icon: '🔥' },
  { id: '23', name: 'Mountain Climbers', category: 'HIIT', muscleGroup: 'Core', icon: '🏔️' },
  { id: '24', name: 'Box Jumps', category: 'Plyometric', muscleGroup: 'Legs', icon: '📦' },
];

const AVATAR_SKINS: AvatarSkin[] = [
  { id: 'default', name: 'Rookie', colors: ['#00f5d4', '#0a0a0f'], unlockLevel: 1, unlocked: true },
  { id: 'fire', name: 'Inferno', colors: ['#ff006e', '#ffbe0b'], unlockLevel: 5, unlocked: false },
  { id: 'electric', name: 'Thunder', colors: ['#ffbe0b', '#00f5d4'], unlockLevel: 10, unlocked: false },
  { id: 'cosmic', name: 'Cosmic', colors: ['#8b5cf6', '#ec4899'], unlockLevel: 15, unlocked: false },
  { id: 'shadow', name: 'Shadow', colors: ['#1a1a2e', '#16213e'], unlockLevel: 20, unlocked: false },
  { id: 'gold', name: 'Champion', colors: ['#ffd700', '#ff8c00'], unlockLevel: 30, unlocked: false },
];

// Sound effects
const useSound = () => {
  const [enabled, setEnabled] = useState(true);

  const playBeep = useCallback(() => {
    if (!enabled) return;
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  }, [enabled]);

  const playAlarm = useCallback(() => {
    if (!enabled) return;
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    [0, 0.15, 0.3].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 1000;
      gain.gain.setValueAtTime(0.4, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.1);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.1);
    });
  }, [enabled]);

  return { enabled, setEnabled, playBeep, playAlarm };
};

// Avatar Component
const Avatar = ({ skin, size = 120 }: { skin: AvatarSkin; size?: number }) => (
  <motion.div
    className="relative"
    style={{ width: size, height: size }}
    whileHover={{ scale: 1.05 }}
  >
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <defs>
        <linearGradient id={`grad-${skin.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={skin.colors[0]} />
          <stop offset="100%" stopColor={skin.colors[1]} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      {/* Body */}
      <ellipse cx="50" cy="75" rx="25" ry="20" fill={`url(#grad-${skin.id})`} filter="url(#glow)" />
      {/* Head */}
      <circle cx="50" cy="35" r="22" fill={`url(#grad-${skin.id})`} filter="url(#glow)" />
      {/* Eyes */}
      <circle cx="42" cy="32" r="4" fill="#0a0a0f" />
      <circle cx="58" cy="32" r="4" fill="#0a0a0f" />
      <circle cx="43" cy="31" r="1.5" fill="#fff" />
      <circle cx="59" cy="31" r="1.5" fill="#fff" />
      {/* Smile */}
      <path d="M 40 42 Q 50 50 60 42" stroke="#0a0a0f" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Arms */}
      <ellipse cx="25" cy="70" rx="8" ry="15" fill={`url(#grad-${skin.id})`} />
      <ellipse cx="75" cy="70" rx="8" ry="15" fill={`url(#grad-${skin.id})`} />
    </svg>
    <motion.div
      className="absolute inset-0 rounded-full opacity-30"
      style={{ background: `radial-gradient(circle, ${skin.colors[0]}40, transparent)` }}
      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
  </motion.div>
);

// Timer Component
const RestTimer = ({ onComplete }: { onComplete: () => void }) => {
  const [time, setTime] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTime, setSelectedTime] = useState(60);
  const { enabled, setEnabled, playBeep, playAlarm } = useSound();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((t) => {
          if (t <= 4 && t > 1) playBeep();
          if (t === 1) {
            playAlarm();
            onComplete();
          }
          return t - 1;
        });
      }, 1000);
    } else if (time === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, time, playBeep, playAlarm, onComplete]);

  const progress = (time / selectedTime) * 100;
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <motion.div
      className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl rounded-3xl p-4 md:p-6 border border-cyan-500/20 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-magenta-500/5" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-bold text-cyan-400 font-display flex items-center gap-2">
            <Timer className="w-5 h-5" /> REST TIMER
          </h3>
          <button
            onClick={() => setEnabled(!enabled)}
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {enabled ? <Volume2 className="w-5 h-5 text-cyan-400" /> : <VolumeX className="w-5 h-5 text-gray-500" />}
          </button>
        </div>

        <div className="relative w-40 h-40 md:w-48 md:h-48 mx-auto mb-6">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="#1a1a2e"
              strokeWidth="8"
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="url(#timerGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              style={{ filter: 'drop-shadow(0 0 10px #00f5d4)' }}
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00f5d4" />
                <stop offset="100%" stopColor="#ff006e" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              className="text-4xl md:text-5xl font-display font-bold text-white"
              animate={isRunning && time <= 5 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: time <= 5 ? Infinity : 0 }}
            >
              {minutes}:{seconds.toString().padStart(2, '0')}
            </motion.span>
          </div>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap justify-center">
          {[30, 60, 90, 120, 180].map((t) => (
            <button
              key={t}
              onClick={() => { setSelectedTime(t); setTime(t); setIsRunning(false); }}
              className={`px-3 py-2 rounded-lg text-sm font-bold transition-all min-w-[44px] min-h-[44px] ${
                selectedTime === t
                  ? 'bg-cyan-500 text-black'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
              }`}
            >
              {t >= 60 ? `${t / 60}m` : `${t}s`}
            </button>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsRunning(!isRunning)}
            className="flex-1 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-400 text-black min-h-[48px]"
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isRunning ? 'PAUSE' : 'START'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setTime(selectedTime); setIsRunning(false); }}
            className="px-4 md:px-6 py-3 md:py-4 rounded-xl bg-gray-800/50 text-gray-400 hover:text-white transition-colors min-h-[48px] min-w-[48px]"
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// XP Bar Component
const XPBar = ({ xp, xpToNext, level }: { xp: number; xpToNext: number; level: number }) => {
  const progress = (xp / xpToNext) * 100;

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs md:text-sm text-gray-400">Level {level}</span>
        <span className="text-xs md:text-sm text-cyan-400">{xp}/{xpToNext} XP</span>
      </div>
      <div className="h-3 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 via-magenta-500 to-amber-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ boxShadow: '0 0 20px #00f5d4' }}
        />
      </div>
    </div>
  );
};

// Main App
export default function App() {
  const [activeTab, setActiveTab] = useState<'workout' | 'exercises' | 'profile' | 'shop'>('workout');
  const [completedExercises, setCompletedExercises] = useState<CompletedExercise[]>([]);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [exerciseForm, setExerciseForm] = useState({ sets: 3, reps: 10, weight: 20 });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSkin, setSelectedSkin] = useState(AVATAR_SKINS[0]);
  const [skins, setSkins] = useState(AVATAR_SKINS);

  const [userStats, setUserStats] = useState<UserStats>({
    level: 7,
    xp: 450,
    xpToNext: 1000,
    totalWorkouts: 47,
    weeklyWorkouts: 4,
    monthlyWorkouts: 16,
    yearlyWorkouts: 47,
    bodyFat: 18.5,
    streak: 5,
  });

  const categories = ['All', ...new Set(EXERCISES.map(e => e.category))];
  const filteredExercises = EXERCISES.filter(e =>
    (selectedCategory === 'All' || e.category === selectedCategory) &&
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addExercise = () => {
    if (!selectedExercise) return;

    const newCompleted: CompletedExercise = {
      id: Date.now().toString(),
      exerciseId: selectedExercise.id,
      name: selectedExercise.name,
      sets: exerciseForm.sets,
      reps: exerciseForm.reps,
      weight: exerciseForm.weight,
      completedAt: new Date(),
    };

    setCompletedExercises([newCompleted, ...completedExercises]);

    // Add XP
    const xpGained = exerciseForm.sets * 10;
    setUserStats(prev => {
      let newXp = prev.xp + xpGained;
      let newLevel = prev.level;
      let newXpToNext = prev.xpToNext;

      while (newXp >= newXpToNext) {
        newXp -= newXpToNext;
        newLevel++;
        newXpToNext = Math.floor(newXpToNext * 1.2);

        // Unlock skins
        setSkins(s => s.map(skin => ({
          ...skin,
          unlocked: skin.unlockLevel <= newLevel
        })));
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        xpToNext: newXpToNext,
        totalWorkouts: prev.totalWorkouts + 1,
        weeklyWorkouts: prev.weeklyWorkouts + 1,
        monthlyWorkouts: prev.monthlyWorkouts + 1,
        yearlyWorkouts: prev.yearlyWorkouts + 1,
      };
    });

    setShowExerciseModal(false);
    setSelectedExercise(null);
    setExerciseForm({ sets: 3, reps: 10, weight: 20 });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-body overflow-x-hidden flex flex-col">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-magenta-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0ibm9uZSIvPgo8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIiBmaWxsPSIjMjAyMDMwIi8+Cjwvc3ZnPg==')] opacity-50" />
      </div>

      {/* Header */}
      <motion.header
        className="relative z-10 px-4 md:px-6 py-4 border-b border-gray-800/50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Dumbbell className="w-7 h-7 md:w-8 md:h-8 text-cyan-400" />
            </motion.div>
            <h1 className="text-xl md:text-2xl font-display font-bold bg-gradient-to-r from-cyan-400 to-magenta-400 bg-clip-text text-transparent">
              IRONFORGE
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-1 md:gap-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 px-2 md:px-3 py-1.5 md:py-2 rounded-full border border-amber-500/30">
              <Flame className="w-4 h-4 text-amber-400" />
              <span className="text-xs md:text-sm font-bold text-amber-400">{userStats.streak} DAY</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-cyan-500/20 px-3 py-2 rounded-full border border-cyan-500/30">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold text-cyan-400">LVL {userStats.level}</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-4 md:px-6 py-4 md:py-6 pb-24 md:pb-28">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'workout' && (
              <motion.div
                key="workout"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4 md:space-y-6"
              >
                {/* XP Bar */}
                <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-3 md:p-4 border border-gray-800/50">
                  <XPBar xp={userStats.xp} xpToNext={userStats.xpToNext} level={userStats.level} />
                </div>

                <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
                  {/* Timer */}
                  <RestTimer onComplete={() => {}} />

                  {/* Quick Add Exercise */}
                  <motion.div
                    className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl rounded-3xl p-4 md:p-6 border border-magenta-500/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h3 className="text-base md:text-lg font-bold text-magenta-400 font-display flex items-center gap-2 mb-4">
                      <Plus className="w-5 h-5" /> LOG EXERCISE
                    </h3>

                    <button
                      onClick={() => setShowExerciseModal(true)}
                      className="w-full py-6 md:py-8 rounded-2xl border-2 border-dashed border-gray-700 hover:border-cyan-500/50 transition-colors flex flex-col items-center justify-center gap-2 group min-h-[120px]"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center"
                      >
                        <Plus className="w-6 h-6 text-cyan-400" />
                      </motion.div>
                      <span className="text-gray-400 group-hover:text-cyan-400 transition-colors text-sm md:text-base">
                        Tap to add exercise
                      </span>
                    </button>

                    {/* Recent exercises */}
                    <div className="mt-4 space-y-2 max-h-40 md:max-h-48 overflow-y-auto">
                      {completedExercises.slice(0, 3).map((ex, i) => (
                        <motion.div
                          key={ex.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center justify-between bg-gray-800/30 rounded-xl px-3 md:px-4 py-2 md:py-3"
                        >
                          <div className="flex items-center gap-2 md:gap-3 min-w-0">
                            <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                            <span className="text-xs md:text-sm truncate">{ex.name}</span>
                          </div>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {ex.sets}x{ex.reps} @ {ex.weight}kg
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Today's Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {[
                    { label: 'Exercises', value: completedExercises.length, icon: Dumbbell, color: 'cyan' },
                    { label: 'Total Sets', value: completedExercises.reduce((a, b) => a + b.sets, 0), icon: Target, color: 'magenta' },
                    { label: 'Total Reps', value: completedExercises.reduce((a, b) => a + (b.sets * b.reps), 0), icon: TrendingUp, color: 'amber' },
                    { label: 'Volume (kg)', value: completedExercises.reduce((a, b) => a + (b.sets * b.reps * b.weight), 0), icon: Flame, color: 'green' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className={`bg-gray-900/50 backdrop-blur rounded-xl md:rounded-2xl p-3 md:p-4 border border-${stat.color}-500/20`}
                    >
                      <stat.icon className={`w-5 h-5 md:w-6 md:h-6 text-${stat.color}-400 mb-2`} />
                      <p className="text-xl md:text-2xl font-display font-bold">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'exercises' && (
              <motion.div
                key="exercises"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4 md:space-y-6"
              >
                <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                  <input
                    type="text"
                    placeholder="Search exercises..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 md:py-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors min-h-[48px]"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 md:px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all min-h-[44px] ${
                        selectedCategory === cat
                          ? 'bg-cyan-500 text-black'
                          : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="grid gap-2 md:gap-3">
                  {filteredExercises.map((exercise, i) => (
                    <motion.button
                      key={exercise.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => { setSelectedExercise(exercise); setShowExerciseModal(true); }}
                      className="flex items-center justify-between bg-gray-900/50 hover:bg-gray-800/50 border border-gray-800/50 hover:border-cyan-500/30 rounded-xl px-4 py-4 transition-all group min-h-[60px]"
                    >
                      <div className="flex items-center gap-3 md:gap-4 min-w-0">
                        <span className="text-xl md:text-2xl flex-shrink-0">{exercise.icon}</span>
                        <div className="text-left min-w-0">
                          <p className="font-medium text-sm md:text-base truncate">{exercise.name}</p>
                          <p className="text-xs text-gray-500">{exercise.muscleGroup} • {exercise.category}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4 md:space-y-6"
              >
                {/* Avatar & Level */}
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl rounded-3xl p-4 md:p-8 border border-cyan-500/20 text-center">
                  <Avatar skin={selectedSkin} size={120} />
                  <h2 className="text-xl md:text-2xl font-display font-bold mt-4">IRON WARRIOR</h2>
                  <p className="text-cyan-400 text-sm">{selectedSkin.name} Skin</p>

                  <div className="mt-6 max-w-xs mx-auto">
                    <XPBar xp={userStats.xp} xpToNext={userStats.xpToNext} level={userStats.level} />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {[
                    { label: 'Body Fat %', value: `${userStats.bodyFat}%`, icon: User },
                    { label: 'Weekly', value: userStats.weeklyWorkouts, icon: Calendar },
                    { label: 'Monthly', value: userStats.monthlyWorkouts, icon: TrendingUp },
                    { label: 'Yearly', value: userStats.yearlyWorkouts, icon: Trophy },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-gray-900/50 backdrop-blur rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-800/50 text-center"
                    >
                      <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-cyan-400 mx-auto mb-2" />
                      <p className="text-xl md:text-2xl font-display font-bold">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Completed Exercises History */}
                <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-4 md:p-6 border border-gray-800/50">
                  <h3 className="font-display font-bold text-base md:text-lg mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" /> EXERCISE HISTORY
                  </h3>
                  <div className="space-y-2 max-h-48 md:max-h-64 overflow-y-auto">
                    {completedExercises.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No exercises logged yet. Start training!</p>
                    ) : (
                      completedExercises.map((ex) => (
                        <div key={ex.id} className="flex items-center justify-between bg-gray-800/30 rounded-xl px-3 md:px-4 py-2 md:py-3">
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{ex.name}</p>
                            <p className="text-xs text-gray-500">
                              {ex.sets} sets × {ex.reps} reps @ {ex.weight}kg
                            </p>
                          </div>
                          <span className="text-xs text-gray-600 flex-shrink-0 ml-2">+{ex.sets * 10} XP</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'shop' && (
              <motion.div
                key="shop"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4 md:space-y-6"
              >
                <div className="text-center mb-6 md:mb-8">
                  <h2 className="text-2xl md:text-3xl font-display font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                    AVATAR SKINS
                  </h2>
                  <p className="text-gray-400 text-sm mt-2">Unlock new looks as you level up!</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {skins.map((skin, i) => (
                    <motion.button
                      key={skin.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => skin.unlocked && setSelectedSkin(skin)}
                      disabled={!skin.unlocked}
                      className={`relative bg-gray-900/50 backdrop-blur rounded-2xl p-4 md:p-6 border transition-all min-h-[160px] md:min-h-[200px] flex flex-col items-center justify-center ${
                        skin.unlocked
                          ? selectedSkin.id === skin.id
                            ? 'border-cyan-500 shadow-lg shadow-cyan-500/20'
                            : 'border-gray-800/50 hover:border-cyan-500/30'
                          : 'border-gray-800/30 opacity-60'
                      }`}
                    >
                      {!skin.unlocked && (
                        <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                          <div className="text-center">
                            <Lock className="w-6 h-6 md:w-8 md:h-8 text-gray-600 mx-auto mb-2" />
                            <p className="text-xs text-gray-500">Level {skin.unlockLevel}</p>
                          </div>
                        </div>
                      )}

                      <Avatar skin={skin} size={80} />
                      <p className="font-display font-bold mt-3 text-sm md:text-base">{skin.name}</p>

                      {selectedSkin.id === skin.id && skin.unlocked && (
                        <div className="absolute top-2 right-2 md:top-3 md:right-3 w-5 h-5 md:w-6 md:h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                          <Check className="w-3 h-3 md:w-4 md:h-4 text-black" />
                        </div>
                      )}

                      {skin.unlocked && (
                        <div className="absolute top-2 left-2 md:top-3 md:left-3">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center border-t border-gray-800/30">
        <p className="text-xs text-gray-600">
          Requested by <span className="text-gray-500">@Prvgz</span> · Built by <span className="text-gray-500">@clonkbot</span>
        </p>
      </footer>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur-xl border-t border-gray-800/50">
        <div className="max-w-lg mx-auto flex justify-around py-2 px-4">
          {[
            { id: 'workout', icon: Dumbbell, label: 'Workout' },
            { id: 'exercises', icon: Target, label: 'Exercises' },
            { id: 'profile', icon: User, label: 'Profile' },
            { id: 'shop', icon: Star, label: 'Skins' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex flex-col items-center gap-1 px-3 py-2 min-w-[64px] min-h-[56px] rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'text-cyan-400 bg-cyan-500/10'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Exercise Modal */}
      <AnimatePresence>
        {showExerciseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowExerciseModal(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-t-3xl md:rounded-3xl p-5 md:p-6 w-full max-w-md border border-gray-800 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg md:text-xl font-display font-bold">
                  {selectedExercise ? selectedExercise.name : 'Select Exercise'}
                </h3>
                <button
                  onClick={() => setShowExerciseModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!selectedExercise ? (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {EXERCISES.slice(0, 10).map((ex) => (
                    <button
                      key={ex.id}
                      onClick={() => setSelectedExercise(ex)}
                      className="w-full flex items-center gap-3 p-3 md:p-4 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-colors min-h-[56px]"
                    >
                      <span className="text-xl">{ex.icon}</span>
                      <span className="text-sm md:text-base">{ex.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-5 md:space-y-6">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Sets</label>
                    <div className="flex gap-2">
                      {[2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setExerciseForm({ ...exerciseForm, sets: n })}
                          className={`flex-1 py-3 md:py-4 rounded-xl font-bold transition-all min-h-[48px] ${
                            exerciseForm.sets === n
                              ? 'bg-cyan-500 text-black'
                              : 'bg-gray-800/50 hover:bg-gray-700/50'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Reps</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={exerciseForm.reps}
                      onChange={(e) => setExerciseForm({ ...exerciseForm, reps: Number(e.target.value) })}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 md:py-4 text-center text-xl font-bold focus:outline-none focus:border-cyan-500/50 min-h-[48px]"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Weight (kg)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={exerciseForm.weight}
                      onChange={(e) => setExerciseForm({ ...exerciseForm, weight: Number(e.target.value) })}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 md:py-4 text-center text-xl font-bold focus:outline-none focus:border-cyan-500/50 min-h-[48px]"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={addExercise}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-magenta-500 text-black font-bold text-base md:text-lg min-h-[56px]"
                  >
                    LOG EXERCISE (+{exerciseForm.sets * 10} XP)
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
