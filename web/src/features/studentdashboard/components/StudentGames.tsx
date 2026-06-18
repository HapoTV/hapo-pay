import React, { useState, useEffect, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

type GameType = 'memory' | 'math' | 'fun' | null;

interface ActivityEntry {
  name: string;
  pts: number;
  time: string;
}

// ─── Game data ────────────────────────────────────────────────────────────────

const availableGames = [
    {
        id: 'memory' as GameType,
        title: 'Memory Games',
        description: 'Test your memory skills by matching pairs of cards',
        icon: '🧠',
        grades: [
            { range: '3-5:', points: '30 (100+)' },
            { range: '6-8:', points: '50 (200+)' },
            { range: '9-12:', points: '75 (300+)' }
        ]
    },
    {
        id: 'fun' as GameType,
        title: 'Fun Games',
        description: 'Tap the targets as fast as you can!',
        icon: '🧩',
        grades: [
            { range: 'Primary:', points: '40' },
            { range: 'High School:', points: '60' }
        ]
    },
    {
        id: 'math' as GameType,
        title: 'Math Games',
        description: 'Practice math skills across levels and earn points',
        icon: '⭕',
        grades: [
            { range: 'Primary:', points: '20' },
            { range: 'High School:', points: '40' }
        ]
    }
];

// ─── Memory Game ──────────────────────────────────────────────────────────────

const MEM_EMOJIS = ['🌟','🎯','🚀','🌈','🎵','🦋','🍎','💎'];

interface MemoryState {
    deck: string[];
    flipped: number[];
    matched: number[];
    moves: number;
    locked: boolean;
    won: boolean;
    points: number;
}

function initMemory(): MemoryState {
    const deck = [...MEM_EMOJIS, ...MEM_EMOJIS].sort(() => Math.random() - 0.5);
    return { deck, flipped: [], matched: [], moves: 0, locked: false, won: false, points: 0 };
}

const MemoryGame: React.FC<{ onComplete: (pts: number) => void }> = ({ onComplete }) => {
    const [state, setState] = useState<MemoryState>(initMemory);

    const flip = useCallback((i: number) => {
        setState(s => {
            if (s.locked || s.flipped.includes(i) || s.matched.includes(i) || s.won) return s;
            const flipped = [...s.flipped, i];
            if (flipped.length < 2) return { ...s, flipped };
            const [a, b] = flipped;
            const moves = s.moves + 1;
            if (s.deck[a] === s.deck[b]) {
                const matched = [...s.matched, a, b];
                const won = matched.length === 16;
                const points = won ? (moves <= 12 ? 75 : moves <= 18 ? 50 : 30) : 0;
                return { ...s, flipped: [], matched, moves, won, points };
            }
            return { ...s, flipped, moves, locked: true };
        });
    }, []);

    // Unlock after mismatch delay
    useEffect(() => {
        if (!state.locked) return;
        const t = setTimeout(() => setState(s => ({ ...s, flipped: [], locked: false })), 900);
        return () => clearTimeout(t);
    }, [state.locked, state.moves]);

    if (state.won) {
        return (
            <div className="text-center py-4">
                <div className="text-5xl mb-3">🎉</div>
                <p className="text-lg font-semibold text-slate-900 mb-1">
                    All pairs matched in {state.moves} moves!
                </p>
                <p className="text-4xl font-bold text-red-500 my-3">+{state.points} pts</p>
                <p className="text-slate-500 text-sm mb-6">
                    {state.moves <= 12 ? 'Perfect run!' : state.moves <= 18 ? 'Great job!' : 'Well done!'}
                </p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => setState(initMemory())}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-5 rounded-lg"
                    >Play Again</button>
                    <button
                        onClick={() => onComplete(state.points)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-5 rounded-lg"
                    >Done</button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-between text-sm text-slate-500 mb-3">
                <span>Matches: {state.matched.length / 2} / 8</span>
                <span>Moves: {state.moves}</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
                {state.deck.map((emoji, i) => {
                    const isFlipped = state.flipped.includes(i);
                    const isMatched = state.matched.includes(i);
                    const show = isFlipped || isMatched;
                    return (
                        <button
                            key={i}
                            onClick={() => flip(i)}
                            className={`h-16 rounded-xl text-2xl flex items-center justify-center border transition-all
                                ${isMatched ? 'bg-red-50 border-red-300 cursor-default' :
                                  isFlipped ? 'bg-white border-red-400' :
                                  'bg-slate-100 border-slate-200 hover:bg-slate-200'}`}
                        >
                            {show ? emoji : ''}
                        </button>
                    );
                })}
            </div>
            <div className="text-center mt-4">
                <button
                    onClick={() => setState(initMemory())}
                    className="text-sm text-slate-400 hover:text-slate-600 underline"
                >Restart</button>
            </div>
        </>
    );
};

// ─── Math Game ────────────────────────────────────────────────────────────────

type MathOp = '+' | '-' | '×';

interface MathQuestion {
    label: string;
    answer: number;
    options: number[];
}

function makeMathQuestion(): MathQuestion {
    const ops: MathOp[] = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * 3)];
    let a: number, b: number, answer: number;
    if (op === '+') { a = Math.floor(Math.random() * 50) + 1; b = Math.floor(Math.random() * 50) + 1; answer = a + b; }
    else if (op === '-') { a = Math.floor(Math.random() * 50) + 10; b = Math.floor(Math.random() * a) + 1; answer = a - b; }
    else { a = Math.floor(Math.random() * 12) + 1; b = Math.floor(Math.random() * 12) + 1; answer = a * b; }
    const optSet = new Set<number>([answer]);
    while (optSet.size < 4) {
        const candidate = answer + Math.floor(Math.random() * 10) - 5 + Math.floor(Math.random() * 3);
        if (candidate !== answer && candidate >= 0) optSet.add(candidate);
    }
    return { label: `${a} ${op} ${b} = ?`, answer, options: [...optSet].sort(() => Math.random() - 0.5) };
}

const MATH_ROUNDS = 8;

const MathGame: React.FC<{ onComplete: (pts: number) => void }> = ({ onComplete }) => {
    const [round, setRound] = useState(1);
    const [score, setScore] = useState(0);
    const [question, setQuestion] = useState<MathQuestion>(makeMathQuestion);
    const [chosen, setChosen] = useState<number | null>(null);
    const [done, setDone] = useState(false);

    const answer = (val: number) => {
        if (chosen !== null) return;
        setChosen(val);
        const correct = val === question.answer;
        const newScore = correct ? score + 1 : score;
        if (correct) setScore(newScore);
        setTimeout(() => {
            if (round >= MATH_ROUNDS) {
                setDone(true);
                setScore(newScore);
            } else {
                setRound(r => r + 1);
                setQuestion(makeMathQuestion());
                setChosen(null);
            }
        }, 700);
    };

    const pts = Math.round((score / MATH_ROUNDS) * 40);

    if (done) {
        return (
            <div className="text-center py-4">
                <div className="text-5xl mb-3">🎉</div>
                <p className="text-lg font-semibold text-slate-900 mb-1">{score}/{MATH_ROUNDS} correct!</p>
                <p className="text-4xl font-bold text-red-500 my-3">+{pts} pts</p>
                <div className="flex gap-3 justify-center mt-6">
                    <button
                        onClick={() => { setRound(1); setScore(0); setQuestion(makeMathQuestion()); setChosen(null); setDone(false); }}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-5 rounded-lg"
                    >Play Again</button>
                    <button
                        onClick={() => onComplete(pts)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-5 rounded-lg"
                    >Done</button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-between text-sm text-slate-500 mb-2">
                <span>Question {round} of {MATH_ROUNDS}</span>
                <span>Score: {score}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mb-5">
                <div
                    className="bg-red-500 h-2 rounded-full transition-all"
                    style={{ width: `${((round - 1) / MATH_ROUNDS) * 100}%` }}
                />
            </div>
            <p className="text-3xl font-bold text-center text-slate-900 my-6">{question.label}</p>
            <div className="grid grid-cols-2 gap-3">
                {question.options.map(opt => {
                    let cls = 'border-slate-200 bg-slate-50 hover:bg-slate-100';
                    if (chosen !== null) {
                        if (opt === question.answer) cls = 'border-green-400 bg-green-50';
                        else if (opt === chosen) cls = 'border-red-400 bg-red-50';
                    }
                    return (
                        <button
                            key={opt}
                            onClick={() => answer(opt)}
                            className={`py-4 rounded-xl border-2 text-xl font-semibold text-slate-800 transition-all ${cls}`}
                        >{opt}</button>
                    );
                })}
            </div>
        </>
    );
};

// ─── Fun (Tap) Game ───────────────────────────────────────────────────────────

const FUN_TARGETS = ['🌟','🎯','🚀','💥','⚡','🎪','🎀','🍕'];
const FUN_DURATION = 20;

const FunGame: React.FC<{ onComplete: (pts: number) => void }> = ({ onComplete }) => {
    const [started, setStarted] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(FUN_DURATION);
    const [target, setTarget] = useState(() => FUN_TARGETS[Math.floor(Math.random() * FUN_TARGETS.length)]);
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (!started || done) return;
        if (timeLeft <= 0) { setDone(true); return; }
        const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
        return () => clearTimeout(t);
    }, [started, timeLeft, done]);

    const tap = () => {
        setScore(s => s + 1);
        setTarget(FUN_TARGETS[Math.floor(Math.random() * FUN_TARGETS.length)]);
    };

    const pts = Math.min(score * 3, 60);

    if (done) {
        return (
            <div className="text-center py-4">
                <div className="text-5xl mb-3">🎉</div>
                <p className="text-lg font-semibold text-slate-900 mb-1">You tapped {score} targets!</p>
                <p className="text-4xl font-bold text-red-500 my-3">+{pts} pts</p>
                <div className="flex gap-3 justify-center mt-6">
                    <button
                        onClick={() => { setScore(0); setTimeLeft(FUN_DURATION); setDone(false); setStarted(false); }}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-5 rounded-lg"
                    >Play Again</button>
                    <button
                        onClick={() => onComplete(pts)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-5 rounded-lg"
                    >Done</button>
                </div>
            </div>
        );
    }

    if (!started) {
        return (
            <div className="text-center py-6">
                <div className="text-5xl mb-4">🎯</div>
                <p className="text-slate-700 mb-2 font-semibold">Tap targets as fast as you can!</p>
                <p className="text-slate-500 text-sm mb-6">You have {FUN_DURATION} seconds. Go!</p>
                <button
                    onClick={() => setStarted(true)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg text-lg"
                >Start</button>
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-between text-sm text-slate-500 mb-2">
                <span>Score: {score}</span>
                <span>Time: {timeLeft}s</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mb-6">
                <div
                    className="bg-red-500 h-2 rounded-full transition-all"
                    style={{ width: `${(timeLeft / FUN_DURATION) * 100}%` }}
                />
            </div>
            <div className="flex justify-center items-center h-32">
                <button
                    onClick={tap}
                    className="w-24 h-24 rounded-full bg-red-500 hover:bg-red-600 active:scale-90 text-4xl flex items-center justify-center transition-transform shadow-md border-none"
                >{target}</button>
            </div>
            <p className="text-center text-slate-400 text-sm mt-4">Tap it!</p>
        </>
    );
};

// ─── Modal wrapper ────────────────────────────────────────────────────────────

const gameLabels: Record<NonNullable<GameType>, string> = {
    memory: 'Memory Game',
    math: 'Math Game',
    fun: 'Tap Game',
};

const GameModal: React.FC<{
    game: NonNullable<GameType>;
    onComplete: (pts: number) => void;
    onClose: () => void;
}> = ({ game, onComplete, onClose }) => (
    <div
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
        <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-900">{gameLabels[game]}</h2>
                <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
                    aria-label="Close"
                >×</button>
            </div>
            {game === 'memory' && <MemoryGame onComplete={onComplete} />}
            {game === 'math'   && <MathGame   onComplete={onComplete} />}
            {game === 'fun'    && <FunGame    onComplete={onComplete} />}
        </div>
    </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────

const StudentGames: React.FC = () => {
    const [activeGame, setActiveGame] = useState<NonNullable<GameType> | null>(null);
    const [totalPoints, setTotalPoints] = useState(0);
    const [gamesPlayed, setGamesPlayed] = useState(0);
    const [activity, setActivity] = useState<ActivityEntry[]>([]);

    const handleComplete = useCallback((pts: number) => {
        if (!activeGame) return;
        setTotalPoints(p => p + pts);
        setGamesPlayed(g => g + 1);
        const now = new Date();
        const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
        setActivity(a => [{ name: gameLabels[activeGame], pts, time }, ...a].slice(0, 20));
        setActiveGame(null);
    }, [activeGame]);

    return (
        <div className="pb-20 md:pb-0 max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900">My Games</h1>
                <p className="text-slate-500">Play games and earn points for rewards!</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2 mb-12">
                <div className="bg-white rounded-2xl p-6 shadow-md border-t-4 border-t-red-500">
                    <div className="flex items-center gap-4">
                        <div className="bg-red-500 rounded-full p-4">
                            <span className="text-2xl">🏆</span>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm">Points Earned Today</p>
                            <p className="text-4xl font-bold text-slate-900">{totalPoints}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-md border-t-4 border-t-red-500">
                    <div className="flex items-center gap-4">
                        <div className="bg-red-500 rounded-full p-4">
                            <span className="text-2xl">🎮</span>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm">Games Played</p>
                            <p className="text-4xl font-bold text-slate-900">{gamesPlayed}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Game cards */}
            <h2 className="text-2xl font-bold mb-6">Available Games</h2>
            <div className="grid gap-6 md:grid-cols-3 mb-12">
                {availableGames.map((game) => (
                    <div key={game.title} className="bg-white rounded-2xl overflow-hidden shadow-md">
                        <div className="h-1 bg-red-500" />
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-1">{game.title}</h3>
                                    <p className="text-slate-500 text-sm">{game.description}</p>
                                </div>
                                <div className="text-5xl">{game.icon}</div>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4 mb-4">
                                <h4 className="text-sm font-semibold text-slate-700 mb-3">Points per Grade</h4>
                                <div className="space-y-2">
                                    {game.grades.map((grade, idx) => (
                                        <div key={idx} className="flex justify-between text-sm text-slate-600">
                                            <span>{grade.range}</span>
                                            <span className="font-semibold">{grade.points}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveGame(game.id as NonNullable<GameType>)}
                                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
                            >
                                ▶ Play Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Activity */}
            <h2 className="text-2xl font-bold mb-6">Recent Game Activity</h2>
            <div className="bg-white rounded-2xl overflow-hidden shadow-md">
                <div className="h-1 bg-red-500" />
                {activity.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-6xl mb-4 opacity-40">🎮</div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No games played yet</h3>
                        <p className="text-slate-500">Start playing games to see your activity here</p>
                    </div>
                ) : (
                    <ul>
                        {activity.map((entry, i) => (
                            <li
                                key={i}
                                className="flex justify-between items-center px-6 py-4 border-b border-slate-100 last:border-0"
                            >
                                <span className="font-medium text-slate-800">{entry.name}</span>
                                <span className="text-slate-400 text-sm">{entry.time}</span>
                                <span className="text-red-500 font-bold">+{entry.pts} pts</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Game modal */}
            {activeGame && (
                <GameModal
                    game={activeGame}
                    onComplete={handleComplete}
                    onClose={() => setActiveGame(null)}
                />
            )}
        </div>
    );
};

export default StudentGames;
