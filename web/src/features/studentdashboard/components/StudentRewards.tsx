import React, { useState } from 'react';
import { Heart, Sprout, Circle, Trophy, Star, Flame, Target, Palette, Wallet, CheckCircle2 } from 'lucide-react';

interface Tier {
    id: string;
    label: string;
    icon: React.ReactNode;
    threshold: number;
}

interface Achievement {
    id: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    points: number;
    claimed: boolean;
}

const TIERS: Tier[] = [
    { id: 'sprout', label: 'Sprout', icon: <Sprout className="w-4 h-4" />, threshold: 0 },
    { id: 'scout', label: 'Scout', icon: <Circle className="w-4 h-4" />, threshold: 200 },
    { id: 'keeper', label: 'Keeper', icon: <Heart className="w-4 h-4" />, threshold: 500 },
    { id: 'champion', label: 'Champion', icon: <Trophy className="w-4 h-4" />, threshold: 1000 },
    { id: 'legend', label: 'Legend', icon: <Star className="w-4 h-4" />, threshold: 2000 },
];

const STREAK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
    { id: 'first-purchase', icon: <Target className="w-5 h-5 text-emerald-400" />, title: 'First Purchase', description: 'Made your first payment', points: 10, claimed: true },
    { id: 'saver-star', icon: <Palette className="w-5 h-5 text-emerald-400" />, title: 'Saver Star', description: 'Reached a savings goal', points: 25, claimed: true },
    { id: 'budget-boss', icon: <Wallet className="w-5 h-5 text-amber-400" />, title: 'Budget Boss', description: 'Stayed under limit 7 days', points: 50, claimed: false },
    { id: 'streak-master', icon: <Flame className="w-5 h-5 text-orange-400" />, title: 'Streak Master', description: '7-day spending streak', points: 75, claimed: false },
    { id: 'zero-waste', icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />, title: 'Zero Waste', description: 'No flagged purchases in a month', points: 100, claimed: false },
];

function getCurrentTier(totalPoints: number): { current: Tier; next: Tier | null } {
    let current = TIERS[0];
    let next: Tier | null = null;
    for (let i = 0; i < TIERS.length; i++) {
        if (totalPoints >= TIERS[i].threshold) {
            current = TIERS[i];
            next = TIERS[i + 1] ?? null;
        }
    }
    return { current, next };
}

const StudentRewards: React.FC = () => {
    const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
    const [bonusPoints, setBonusPoints] = useState(0);
    const [streakActive] = useState<boolean[]>(Array(7).fill(true));

    const basePoints = 680;
    const totalPoints = basePoints + bonusPoints;
    const { current, next } = getCurrentTier(totalPoints);
    const pointsToNext = next ? next.threshold - totalPoints : 0;
    const progressPct = next
        ? Math.min(100, ((totalPoints - current.threshold) / (next.threshold - current.threshold)) * 100)
        : 100;

    const claim = (id: string) => {
        setAchievements(list =>
            list.map(a => {
                if (a.id === id && !a.claimed) {
                    setBonusPoints(p => p + a.points);
                    return { ...a, claimed: true };
                }
                return a;
            })
        );
    };

    return (
        <div className="pb-24 max-w-7xl mx-auto px-4 py-5 space-y-5 bg-slate-950 min-h-screen">
            <div className="rounded-3xl p-5 shadow-sm bg-gradient-to-br from-violet-900/60 via-slate-900 to-slate-900 border border-violet-800/40">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs text-slate-400 mb-1">Current Tier</p>
                        <div className="flex items-center gap-2 text-white">
                            <span className="text-violet-400">{current.icon}</span>
                            <span className="text-xl font-bold">{current.label}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-violet-400">{totalPoints}</p>
                        <p className="text-xs text-slate-400">total points</p>
                    </div>
                </div>

                {next && (
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-slate-400 mb-2">
                            <span>{current.label}</span>
                            <span>{pointsToNext} pts to <span className="text-white font-medium">{next.label}</span></span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-amber-400 transition-all"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="rounded-3xl p-5 shadow-sm bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-4 h-4 text-violet-400" />
                    <h3 className="text-sm font-semibold text-white">Tier Roadmap</h3>
                </div>
                <div className="flex items-start justify-between">
                    {TIERS.map((tier, i) => {
                        const reached = totalPoints >= tier.threshold;
                        const isCurrent = tier.id === current.id;
                        return (
                            <React.Fragment key={tier.id}>
                                <div className="flex flex-col items-center gap-2 flex-1">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all
                                            ${isCurrent ? 'bg-violet-600 border-violet-400 text-white shadow-[0_0_12px_rgba(139,92,246,0.6)]' :
                                              reached ? 'bg-slate-800 border-violet-700 text-violet-300' :
                                              'bg-slate-800 border-slate-700 text-slate-500'}`}
                                    >
                                        {tier.icon}
                                    </div>
                                    <span className={`text-[11px] text-center ${isCurrent ? 'text-violet-300 font-semibold' : 'text-slate-500'}`}>
                                        {tier.label}
                                    </span>
                                </div>
                                {i < TIERS.length - 1 && (
                                    <div className={`h-px flex-1 mt-5 ${totalPoints >= TIERS[i + 1].threshold ? 'bg-violet-600' : 'bg-slate-700'}`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            <div className="rounded-3xl p-5 shadow-sm bg-slate-900 border border-emerald-900/40 shadow-[0_0_20px_-8px_rgba(16,185,129,0.4)]">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <h3 className="text-sm font-semibold text-white">7-Day Streak</h3>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-900/30 px-3 py-1 rounded-full">
                        <Flame className="w-3 h-3" /> Keep it going!
                    </span>
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {STREAK_DAYS.map((d, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
                                    ${streakActive[i] ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}
                            >
                                {streakActive[i] ? '✓' : ''}
                            </div>
                            <span className="text-[11px] text-slate-500">{d}</span>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-slate-400 mt-4">Complete today's purchase to keep your streak!</p>
            </div>

            <div>
                <h3 className="text-base font-semibold text-white mb-3">Achievements</h3>
                <div className="space-y-3">
                    {achievements.map(a => (
                        <div key={a.id} className="rounded-3xl p-4 shadow-sm bg-slate-900 border border-slate-800 flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-slate-800 flex items-center justify-center flex-shrink-0">
                                {a.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white">{a.title}</p>
                                <p className="text-xs text-slate-400">{a.description}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                <span className="text-xs text-violet-400 font-medium">+{a.points}</span>
                                {a.claimed ? (
                                    <span className="text-[11px] font-medium text-emerald-400 bg-emerald-900/30 px-2.5 py-1 rounded-full">
                                        ✓ Claimed
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => claim(a.id)}
                                        className="text-[11px] font-semibold text-white bg-violet-600 hover:bg-violet-500 px-3 py-1 rounded-full transition"
                                    >
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