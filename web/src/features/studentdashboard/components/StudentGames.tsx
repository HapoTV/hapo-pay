import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Gamepad2, Play, X, RotateCcw } from 'lucide-react';

// ─── Memory Game ───────────────────────────────────────────────
const EMOJIS = ['🍎', '🎯', '🚀', '💎', '🎵', '🌟', '🦋', '🎨'];

const MemoryGame: React.FC<{ onClose: () => void; onWin: (pts: number) => void }> = ({ onClose, onWin }) => {
    const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([]);
    const [selected, setSelected] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [won, setWon] = useState(false);

    const init = useCallback(() => {
        const doubled = [...EMOJIS, ...EMOJIS].map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
        setCards(doubled.sort(() => Math.random() - 0.5));
        setSelected([]); setMoves(0); setWon(false);
    }, []);

    useEffect(() => { init(); }, [init]);

    const flip = (i: number) => {
        if (selected.length === 2 || cards[i].flipped || cards[i].matched) return;
        const newCards = [...cards];
        newCards[i].flipped = true;
        const newSelected = [...selected, i];
        setCards(newCards);
        setSelected(newSelected);

        if (newSelected.length === 2) {
            setMoves(m => m + 1);
            const [a, b] = newSelected;
            if (newCards[a].emoji === newCards[b].emoji) {
                newCards[a].matched = true; newCards[b].matched = true;
                setCards([...newCards]); setSelected([]);
                if (newCards.every(c => c.matched)) { setWon(true); onWin(50); }
            } else {
                setTimeout(() => {
                    newCards[a].flipped = false; newCards[b].flipped = false;
                    setCards([...newCards]); setSelected([]);
                }, 800);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-900">🧠 Memory Game</h2>
                    <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
                </div>
                <div className="flex justify-between text-sm text-slate-500 mb-4">
                    <span>Moves: <b>{moves}</b></span>
                    <button onClick={init} className="flex items-center gap-1 text-purple-600"><RotateCcw className="w-4 h-4" /> Reset</button>
                </div>
                {won ? (
                    <div className="text-center py-6">
                        <p className="text-4xl mb-2">🎉</p>
                        <p className="text-xl font-bold text-purple-600">You Won!</p>
                        <p className="text-slate-500 text-sm mt-1">+50 points earned in {moves} moves</p>
                        <button onClick={init} className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition font-semibold">Play Again</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-2">
                        {cards.map((card, i) => (
                            <button key={card.id} onClick={() => flip(i)}
                                className={`h-14 rounded-2xl text-2xl font-bold transition-all duration-300 ${card.flipped || card.matched ? 'bg-purple-100 border-2 border-purple-300' : 'bg-slate-100 border-2 border-slate-200 hover:border-purple-300'}`}>
                                {card.flipped || card.matched ? card.emoji : '?'}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Math Game ──────────────────────────────────────────────────
const MathGame: React.FC<{ onClose: () => void; onWin: (pts: number) => void }> = ({ onClose, onWin }) => {
    const [score, setScore] = useState(0);
    const [q, setQ] = useState({ a: 0, b: 0, op: '+', answer: 0 });
    const [input, setInput] = useState('');
    const [feedback, setFeedback] = useState('');
    const [timeLeft, setTimeLeft] = useState(30);
    const [gameOver, setGameOver] = useState(false);

    const newQ = useCallback(() => {
        const ops = ['+', '-', '×'];
        const op = ops[Math.floor(Math.random() * ops.length)];
        const a = Math.floor(Math.random() * 12) + 1;
        const b = Math.floor(Math.random() * 12) + 1;
        const answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
        setQ({ a, b, op, answer }); setInput(''); setFeedback('');
    }, []);

    useEffect(() => { newQ(); }, [newQ]);

    useEffect(() => {
        if (gameOver) return;
        const t = setInterval(() => setTimeLeft(prev => { if (prev <= 1) { setGameOver(true); onWin(score * 2); return 0; } return prev - 1; }), 1000);
        return () => clearInterval(t);
    }, [gameOver, score, onWin]);

    const check = () => {
        if (parseInt(input) === q.answer) {
            setScore(s => s + 1); setFeedback('✅ Correct!'); setTimeout(newQ, 600);
        } else {
            setFeedback('❌ Try again!');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-900">🔢 Math Game</h2>
                    <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
                </div>
                {gameOver ? (
                    <div className="text-center py-6">
                        <p className="text-4xl mb-2">🏆</p>
                        <p className="text-xl font-bold text-purple-600">Time's Up!</p>
                        <p className="text-slate-500 text-sm mt-1">Score: {score} correct | +{score * 2} points</p>
                        <button onClick={() => { setScore(0); setTimeLeft(30); setGameOver(false); newQ(); }}
                            className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition font-semibold">Play Again</button>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between text-sm text-slate-500 mb-6">
                            <span>Score: <b className="text-purple-600">{score}</b></span>
                            <span className={`font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-slate-700'}`}>⏱ {timeLeft}s</span>
                        </div>
                        <div className="text-center mb-6">
                            <p className="text-4xl font-bold text-slate-900">{q.a} {q.op} {q.b} = ?</p>
                        </div>
                        {feedback && <p className="text-center text-sm mb-3 font-medium">{feedback}</p>}
                        <input type="number" value={input} onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && check()}
                            placeholder="Your answer"
                            className="w-full border border-slate-300 rounded-2xl p-3 text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3" />
                        <button onClick={check} className="w-full bg-purple-600 text-white py-3 rounded-full font-semibold hover:bg-purple-700 transition">
                            Submit
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

// ─── Tap Game ────────────────────────────────────────────────────
const TapGame: React.FC<{ onClose: () => void; onWin: (pts: number) => void }> = ({ onClose, onWin }) => {
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [pos, setPos] = useState({ x: 50, y: 50 });
    const [gameOver, setGameOver] = useState(false);
    const [started, setStarted] = useState(false);

    const moveTarget = () => {
        setPos({ x: Math.random() * 75 + 10, y: Math.random() * 70 + 10 });
    };

    useEffect(() => {
        if (!started || gameOver) return;
        const t = setInterval(() => setTimeLeft(prev => {
            if (prev <= 1) { setGameOver(true); onWin(score); return 0; }
            return prev - 1;
        }), 1000);
        return () => clearInterval(t);
    }, [started, gameOver, score, onWin]);

    const handleTap = () => { setScore(s => s + 1); moveTarget(); };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-900">🎯 Tap Game</h2>
                    <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
                </div>
                {gameOver ? (
                    <div className="text-center py-6">
                        <p className="text-4xl mb-2">🎯</p>
                        <p className="text-xl font-bold text-purple-600">Done!</p>
                        <p className="text-slate-500 text-sm mt-1">Tapped {score} times | +{score} points</p>
                        <button onClick={() => { setScore(0); setTimeLeft(15); setGameOver(false); setStarted(false); setPos({ x: 50, y: 50 }); }}
                            className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition font-semibold">Play Again</button>
                    </div>
                ) : !started ? (
                    <div className="text-center py-6">
                        <p className="text-slate-500 mb-4 text-sm">Tap the target as fast as you can for 15 seconds!</p>
                        <button onClick={() => { setStarted(true); moveTarget(); }}
                            className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700 transition">
                            Start!
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between text-sm text-slate-500 mb-2">
                            <span>Taps: <b className="text-purple-600">{score}</b></span>
                            <span className={`font-bold ${timeLeft <= 5 ? 'text-red-500' : 'text-slate-700'}`}>⏱ {timeLeft}s</span>
                        </div>
                        <div className="relative bg-slate-100 rounded-2xl" style={{ height: '280px' }}>
                            <button onClick={handleTap} style={{ position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%,-50%)' }}
                                className="w-12 h-12 bg-purple-600 rounded-full text-white text-2xl hover:scale-110 transition-transform shadow-lg shadow-purple-300">
                                🎯
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// ─── Main StudentGames Component ────────────────────────────────
const games = [
    { title: 'Memory Game', desc: 'Match pairs of cards to test your memory', emoji: '🧠', points: '50 pts per win', color: 'bg-purple-100 text-purple-600' },
    { title: 'Math Game', desc: 'Solve math questions against the clock', emoji: '🔢', points: '2 pts per correct answer', color: 'bg-indigo-100 text-indigo-600' },
    { title: 'Tap Game', desc: 'Tap the target as fast as you can!', emoji: '🎯', points: '1 pt per tap', color: 'bg-violet-100 text-violet-600' },
];

const StudentGames: React.FC = () => {
    const [activeGame, setActiveGame] = useState<string | null>(null);
    const [pointsToday, setPointsToday] = useState(0);
    const [gamesPlayed, setGamesPlayed] = useState(0);

    const handleWin = (pts: number) => {
        setPointsToday(p => p + pts);
        setGamesPlayed(g => g + 1);
    };

    return (
        <div className="pb-20 md:pb-0 max-w-7xl mx-auto px-4 py-5 space-y-5">
            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-purple-600">Games</p>
                    <h1 className="mt-2 text-xl font-semibold text-slate-950">My Games</h1>
                </div>
                <p className="text-xs text-slate-500">Play games and earn points for rewards!</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-100 rounded-2xl p-3">
                            <Trophy className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Points Earned Today</p>
                            <p className="text-2xl font-semibold text-slate-950">{pointsToday}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-100 rounded-2xl p-3">
                            <Gamepad2 className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Games Played</p>
                            <p className="text-2xl font-semibold text-slate-950">{gamesPlayed}</p>
                        </div>
                    </div>
                </div>
            </div>

            <h2 className="text-lg font-semibold text-slate-950">Available Games</h2>
            <div className="grid gap-4 md:grid-cols-3">
                {games.map((game) => (
                    <div key={game.title} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-base font-semibold text-slate-950 mb-1">{game.title}</h3>
                                    <p className="text-slate-500 text-sm">{game.desc}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-2xl ${game.color} flex items-center justify-center text-2xl`}>
                                    {game.emoji}
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-3 mb-4">
                                <p className="text-xs text-slate-500">🏆 {game.points}</p>
                            </div>
                            <button onClick={() => setActiveGame(game.title)}
                                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-full text-sm transition">
                                <Play className="w-4 h-4" /> Play Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {activeGame === 'Memory Game' && <MemoryGame onClose={() => setActiveGame(null)} onWin={handleWin} />}
            {activeGame === 'Math Game' && <MathGame onClose={() => setActiveGame(null)} onWin={handleWin} />}
            {activeGame === 'Tap Game' && <TapGame onClose={() => setActiveGame(null)} onWin={handleWin} />}
        </div>
    );
};

export default StudentGames;