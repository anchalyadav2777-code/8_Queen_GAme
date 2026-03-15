/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Trophy, Music, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface Track {
  id: number;
  title: string;
  artist: string;
  url: string;
  color: string;
}

// --- Constants ---
const TRACKS: Track[] = [
  {
    id: 1,
    title: "Cyberpunk Dreams",
    artist: "Neon Synth",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    color: "text-cyan-400"
  },
  {
    id: 2,
    title: "Midnight Drive",
    artist: "Retro Wave",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    color: "text-pink-500"
  },
  {
    id: 3,
    title: "Digital Horizon",
    artist: "Future Bass",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    color: "text-purple-500"
  }
];

const BOARD_SIZE = 8;

export default function App() {
  // --- Music State ---
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);

  // --- Game State ---
  // queens[row] = col index, or -1 if no queen in that row
  const [queens, setQueens] = useState<number[]>(new Array(BOARD_SIZE).fill(-1));
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("Place 8 Queens!");
  const [isGameWon, setIsGameWon] = useState(false);

  // --- Music Logic ---
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      setProgress((current / duration) * 100 || 0);
    }
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  // --- Game Logic ---
  const isValid = (row: number, col: number, currentQueens: number[]) => {
    for (let i = 0; i < row; i++) {
      const otherCol = currentQueens[i];
      if (otherCol === -1) continue;
      
      // Same column
      if (otherCol === col) return false;
      
      // Diagonals
      if (Math.abs(otherCol - col) === Math.abs(i - row)) return false;
    }
    return true;
  };

  const handleCellClick = (row: number, col: number) => {
    if (isGameWon) return;

    const newQueens = [...queens];
    
    // If clicking on existing queen, remove it
    if (newQueens[row] === col) {
      newQueens[row] = -1;
      setQueens(newQueens);
      setMessage("Queen removed.");
      return;
    }

    // Check if move is valid
    if (isValid(row, col, newQueens)) {
      newQueens[row] = col;
      setQueens(newQueens);
      
      const count = newQueens.filter(q => q !== -1).length;
      setScore(count * 100);

      if (count === BOARD_SIZE) {
        setMessage("VICTORY! All 8 Queens placed safely!");
        setIsGameWon(true);
      } else {
        setMessage(`${count} Queens placed...`);
      }
    } else {
      setMessage("Invalid position! Queens are attacking each other.");
    }
  };

  const resetGame = () => {
    setQueens(new Array(BOARD_SIZE).fill(-1));
    setScore(0);
    setMessage("Place 8 Queens!");
    setIsGameWon(false);
  };

  const currentTrack = TRACKS[currentTrackIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Panel: Music Player */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Music className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">Neon Beats</h2>
            </div>

            {/* Album Art Placeholder */}
            <div className="relative aspect-square rounded-2xl overflow-hidden mb-6 group">
              <div className={`absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center`}>
                <motion.div
                  animate={isPlaying ? { rotate: 360 } : {}}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className={`w-32 h-32 rounded-full border-4 border-dashed ${currentTrack.color} opacity-50 flex items-center justify-center`}
                >
                  <Music className="w-12 h-12" />
                </motion.div>
              </div>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            </div>

            {/* Track Info */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-1 truncate">{currentTrack.title}</h3>
              <p className="text-slate-400 font-medium">{currentTrack.artist}</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full bg-gradient-to-r from-cyan-500 to-purple-500`}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              <button 
                onClick={prevTrack}
                className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
              >
                <SkipBack className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-5 bg-white text-slate-950 rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
              </button>
              <button 
                onClick={nextTrack}
                className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
              >
                <SkipForward className="w-6 h-6" />
              </button>
            </div>

            <audio 
              ref={audioRef}
              src={currentTrack.url}
              onTimeUpdate={handleTimeUpdate}
              onEnded={nextTrack}
            />
          </motion.div>

          {/* Score Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/20 rounded-2xl">
                <Trophy className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Score</p>
                <p className="text-2xl font-black text-white">{score}</p>
              </div>
            </div>
            <button 
              onClick={resetGame}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-300 transition-colors"
              title="Reset Game"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </motion.div>
        </div>

        {/* Center Panel: 8 Queens Game */}
        <div className="lg:col-span-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Game Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight mb-2">8 Queens Puzzle</h1>
                <p className={`text-sm font-medium ${isGameWon ? 'text-green-400' : 'text-slate-400'}`}>
                  {message}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-white/5">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-tighter">Live Session</span>
              </div>
            </div>

            {/* The Grid */}
            <div className="aspect-square w-full max-w-[500px] mx-auto grid grid-cols-8 gap-1.5 p-2 bg-slate-950/50 rounded-2xl border border-white/5 shadow-inner">
              {Array.from({ length: BOARD_SIZE }).map((_, rowIndex) => (
                Array.from({ length: BOARD_SIZE }).map((_, colIndex) => {
                  const isBlack = (rowIndex + colIndex) % 2 === 1;
                  const hasQueen = queens[rowIndex] === colIndex;
                  const isAttacked = !hasQueen && !isValid(rowIndex, colIndex, queens);

                  return (
                    <motion.button
                      key={`${rowIndex}-${colIndex}`}
                      whileHover={{ scale: 0.98 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      className={`
                        relative rounded-md flex items-center justify-center transition-all duration-300
                        ${isBlack ? 'bg-slate-900' : 'bg-slate-800/50'}
                        ${hasQueen ? 'shadow-[0_0_20px_rgba(34,211,238,0.4)] ring-2 ring-cyan-500/50' : 'hover:bg-slate-700/50'}
                        ${isAttacked && !isGameWon ? 'opacity-40' : ''}
                      `}
                    >
                      <AnimatePresence>
                        {hasQueen && (
                          <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 45 }}
                            className="text-cyan-400"
                          >
                            <Crown className="w-6 h-6 md:w-8 md:h-8 fill-current drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      {/* Coordinates (Subtle) */}
                      <span className="absolute bottom-0.5 right-1 text-[8px] text-slate-600 font-mono pointer-events-none">
                        {String.fromCharCode(65 + colIndex)}{rowIndex + 1}
                      </span>
                    </motion.button>
                  );
                })
              ))}
            </div>

            {/* Game Footer / Instructions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Rule 1</p>
                <p className="text-xs text-slate-300">One queen per row and column.</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Rule 2</p>
                <p className="text-xs text-slate-300">No queens on the same diagonal.</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Goal</p>
                <p className="text-xs text-slate-300">Place all 8 queens safely.</p>
              </div>
            </div>

            {/* Victory Overlay */}
            <AnimatePresence>
              {isGameWon && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center z-50 p-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0.5, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="p-6 bg-cyan-500/20 rounded-full mb-6"
                  >
                    <Trophy className="w-16 h-16 text-cyan-400" />
                  </motion.div>
                  <h2 className="text-5xl font-black text-white mb-4">GRANDMASTER</h2>
                  <p className="text-slate-400 max-w-md mb-8">
                    You've successfully solved the legendary 8-Queens puzzle while vibing to the neon beats.
                  </p>
                  <button 
                    onClick={resetGame}
                    className="px-8 py-4 bg-cyan-500 text-slate-950 font-bold rounded-2xl hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(34,211,238,0.4)]"
                  >
                    Play Again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="mt-12 text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-4">
        <span>8 Queens Engine v1.0</span>
        <div className="w-1 h-1 rounded-full bg-slate-800" />
        <span>Neon Audio Core</span>
        <div className="w-1 h-1 rounded-full bg-slate-800" />
        <span>2026 AI Studio Build</span>
      </footer>
    </div>
  );
}
