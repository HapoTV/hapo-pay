import React from 'react';
import { Cpu, Puzzle, Gamepad2, Trophy, Play } from 'lucide-react';

const availableGames = [
    {
        title: 'Memory Games',
        description: 'Test your memory skills by matching pairs of cards',
        icon: <Cpu className="w-6 h-6 text-slate-700" />,
        grades: [
            { range: '3-5:', points: '30 (100+)' },
            { range: '6-8:', points: '50 (200+)' },
            { range: '9-12:', points: '75 (300+)' }
        ]
    },
    {
        title: 'Fun Games',
        description: 'Enjoy a variety of fun mini-games and earn points!',
        icon: <Puzzle className="w-6 h-6 text-slate-700" />,
        grades: [
            { range: 'Primary:', points: '40' },
            { range: 'High School:', points: '60' }
        ]
    },
    {
        title: 'Math Games',
        description: 'Practice math skills across levels and earn points',
        icon: <Gamepad2 className="w-6 h-6 text-slate-700" />,
        grades: [
            { range: 'Primary:', points: '20' },
            { range: 'High School:', points: '40' }
        ]
    }
];

const StudentGames: React.FC = () => (
    <div className="pb-20 md:pb-0 max-w-7xl mx-auto px-4 py-5 space-y-5">
        <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-rose-500">Games</p>
                <h1 className="mt-2 text-xl font-semibold text-slate-950">My Games</h1>
            </div>
            <p className="text-xs text-slate-500">Play games and earn points for rewards!</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mb-10">
            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-rose-100 rounded-2xl p-3">
                        <Trophy className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Points Earned Today</p>
                        <p className="text-2xl font-semibold text-slate-950">0</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-rose-100 rounded-2xl p-3">
                        <Gamepad2 className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Games Played</p>
                        <p className="text-2xl font-semibold text-slate-950">0</p>
                    </div>
                </div>
            </div>
        </div>

        <h2 className="text-lg font-semibold text-slate-950 mb-4">Available Games</h2>
        <div className="grid gap-4 md:grid-cols-3 mb-10">
            {availableGames.map((game) => (
                <div key={game.title} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4">
                        <div className="flex items-start justify-between mb-3 gap-3">
                            <div>
                                <h3 className="text-base font-semibold text-slate-950 mb-1">{game.title}</h3>
                                <p className="text-slate-500 text-sm">{game.description}</p>
                            </div>
                            <div className="text-3xl">{game.icon}</div>
                        </div>

                        <div className="bg-slate-50 rounded-3xl p-3 mb-4">
                            <h4 className="text-xs font-semibold text-slate-700 mb-2">Points per Grade</h4>
                            <div className="space-y-2 text-sm text-slate-600">
                                {game.grades.map((grade, idx) => (
                                    <div key={idx} className="flex justify-between">
                                        <span>{grade.range}</span>
                                        <span className="font-semibold">{grade.points}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 rounded-full text-sm">
                            <Play className="w-4 h-4" />
                            Play Now
                        </button>
                    </div>
                </div>
            ))}
        </div>

        <h2 className="text-lg font-semibold text-slate-950 mb-4">Recent Game Activity</h2>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 shadow-sm">
                    <Trophy className="w-6 h-6 text-slate-500" />
                </div>
                <h3 className="text-base font-semibold text-slate-950 mb-2">No games played yet</h3>
                <p className="text-slate-500 text-sm">Start playing games to see your activity here.</p>
            </div>
        </div>
    </div>
);

export default StudentGames;