import React from 'react';

const availableGames = [
    {
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
        title: 'Fun Games',
        description: 'Enjoy a variety of fun mini-games and earn points!',
        icon: '🧩',
        grades: [
            { range: 'Primary:', points: '40' },
            { range: 'High School:', points: '60' }
        ]
    },
    {
        title: 'Math Games',
        description: 'Practice math skills across levels and earn points',
        icon: '⭕',
        grades: [
            { range: 'Primary:', points: '20' },
            { range: 'High School:', points: '40' }
        ]
    }
];

const StudentGames: React.FC = () => (
    <div className="pb-20 md:pb-0 max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">My Games</h1>
            <p className="text-slate-500">Play games and earn points for rewards!</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-md border-t-4 border-t-red-500">
                <div className="flex items-center gap-4">
                    <div className="bg-red-500 rounded-full p-4">
                        <span className="text-2xl">🏆</span>
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm">Points Earned Today</p>
                        <p className="text-4xl font-bold text-slate-900">0</p>
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
                        <p className="text-4xl font-bold text-slate-900">0</p>
                    </div>
                </div>
            </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Available Games</h2>
        <div className="grid gap-6 md:grid-cols-3 mb-12">
            {availableGames.map((game) => (
                <div key={game.title} className="bg-white rounded-2xl overflow-hidden shadow-md">
                    <div className="h-1 bg-red-500"></div>
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

                        <button className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                            ▶ Play Now
                        </button>
                    </div>
                </div>
            ))}
        </div>

        <h2 className="text-2xl font-bold mb-6">Recent Game Activity</h2>
        <div className="bg-white rounded-2xl overflow-hidden shadow-md">
            <div className="h-1 bg-red-500"></div>
            <div className="p-12 text-center">
                <div className="text-6xl mb-4 opacity-40">🎮</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No games played yet</h3>
                <p className="text-slate-500">Start playing games to see your activity here</p>
            </div>
        </div>
    </div>
);

export default StudentGames;