import React from 'react';
import { Trophy, Star, Zap, Target } from 'lucide-react';

const tiers = [
    { name: 'Sprout', icon: '🌱', points: 0 },
    { name: 'Scout', icon: '🔍', points: 200 },
    { name: 'Keeper', icon: '💜', points: 500 },
    { name: 'Champion', icon: '🏆', points: 1000 },
    { name: 'Legend', icon: '⭐', points: 2000 },
];

const currentPoints = 680;
const currentTierIndex = 2;

const achievements = [
    { icon: <Target className="w-5 h-5" />, title: 'First Purchase', desc: 'Made your first payment', points: 10, claimed: true },
    { icon: <Star className="w-5 h-5" />, title: 'Saver Star', desc: 'Reached a savings goal', points: 25, claimed: true },
    { icon: <Zap className="w-5 h-5" />, title: 'Budget Boss', desc: 'Stayed under limit 7 days', points: 50, claimed: false },
    { icon: <Trophy className="w-5 h-5" />, title: 'Streak Master', desc: '7-day spending streak', points: 75, claimed: false },
];

const StudentRewards: React.FC = () => {
    const [claimed, setClaimed] = React.useState(achievements.map(a => a.claimed));
    const [totalPoints, setTotalPoints] = React.useState(currentPoints);

    const handleClaim = (i: number) => {
        if (!claimed[i]) {
            const updated = [...claimed];
            updated[i] = true;
            setClaimed(updated);
            setTotalPoints(prev => prev + achievements[i].points);
        }
    };

    const nextTier = tiers[currentTierIndex + 1];
    const ptsToNext = nextTier ? nextTier.points - totalPoints : 0;
    const progress = nextTier ? ((totalPoints - tiers[currentTierIndex].points) / (nextTier.points - tiers[currentTierIndex].points)) * 100 : 100;

    return (
        <div className="pb-20 md:pb-0 max-w-7xl mx-auto px-4 py-5 space-y-5">
            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-purple-600">Rewards</p>
                <h1 className="mt-2 text-xl font-semibold text-slate-950">My Rewards</h1>
            </div>

            {/* Current Tier */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-5 text-white">
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Current Tier</p>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">💜</span>
                        <h2 className="text-2xl font-bold">Keeper</h2>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-purple-400">{totalPoints}</p>
                        <p className="text-xs text-slate-400">total points</p>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Keeper</span>
                        <span>{ptsToNext > 0 ? `${ptsToNext} pts to ${nextTier?.name}` : 'Max tier reached!'}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full">
                        <div className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-yellow-400" style={{ width: `${Math.min(progress, 100)}%` }} />
                    </div>
                </div>
            </div>

            {/* Tier Roadmap */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-slate-950">Tier Roadmap</h3>
                </div>
                <div className="flex items-center justify-between">
                    {tiers.map((tier, i) => (
                        <div key={tier.name} className="flex flex-col items-center gap-1 flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 ${i <= currentTierIndex ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-300 bg-white'}`}>
                                {i <= currentTierIndex ? '✓' : tier.icon}
                            </div>
                            {i < tiers.length - 1 && (
                                <div className={`h-0.5 w-full mt-[-22px] ${i < currentTierIndex ? 'bg-purple-600' : 'bg-slate-200'}`} />
                            )}
                            <p className={`text-xs font-medium mt-1 ${i === currentTierIndex ? 'text-purple-600' : 'text-slate-400'}`}>{tier.name}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
                <h3 className="font-semibold text-slate-950 mb-4">Achievements</h3>
                <div className="space-y-3">
                    {achievements.map((a, i) => (
                        <div key={a.title} className={`flex items-center gap-3 p-3 rounded-2xl border ${claimed[i] ? 'bg-purple-50 border-purple-100' : 'bg-slate-50 border-slate-200'}`}>
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${claimed[i] ? 'bg-purple-100 text-purple-600' : 'bg-slate-200 text-slate-500'}`}>
                                {a.icon}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-900">{a.title}</p>
                                <p className="text-xs text-slate-500">{a.desc}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-xs text-slate-400">⭐ +{a.points}</span>
                                {claimed[i] ? (
                                    <span className="text-xs text-purple-600 font-medium">✓ Claimed</span>
                                ) : (
                                    <button onClick={() => handleClaim(i)}
                                        className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full hover:bg-purple-700 transition font-semibold">
                                        Claim!
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentRewards;