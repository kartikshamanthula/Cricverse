"use client"

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Swords, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function MatchTossPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id;

    const [match, setMatch] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [tossWinner, setTossWinner] = useState('');
    const [tossDecision, setTossDecision] = useState('Bat');
    const [coinFlipping, setCoinFlipping] = useState(false);
    const [coinResult, setCoinResult] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (id) {
            loadMatch();
        }
    }, [id]);

    const loadMatch = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/matches/${id}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch match');
            }

            setMatch(data);
            if (data.toss?.winner) {
                setTossWinner(data.toss.winner);
                setTossDecision(data.toss.decision === 'bowl' ? 'Bowl' : 'Bat');
            }
        } catch (error) {
            console.error('Error loading match:', error);
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const flipCoin = () => {
        if (coinFlipping) return;

        setCoinFlipping(true);
        setCoinResult(null);

        setTimeout(() => {
            const result = Math.random() > 0.5 ? 'Heads' : 'Tails';
            setCoinResult(result);
            setCoinFlipping(false);
        }, 3000);
    };

    const handleStartMatch = async () => {
        if (!tossWinner) {
            toast.error('Please select toss winner');
            return;
        }

        try {
            setIsUpdating(true);
            const response = await fetch(`/api/matches/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    toss: {
                        winner: tossWinner,
                        decision: tossDecision.toLowerCase(),
                    },
                    status: 'live'
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update toss info');
            }

            toast.success('Wait! Match is starting...');
            router.push(`/matches/${id}/start-innings?innings=1`);
        } catch (error) {
            console.error('Error starting match:', error);
            toast.error(error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!match) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold">Match not found</h2>
                <Button asChild variant="link" className="mt-4">
                    <Link href="/matches">Back to matches</Link>
                </Button>
            </div>
        );
    }

    const teamA = match.teamA;
    const teamB = match.teamB;

    return (
        <div className="min-h-screen bg-slate-50/30 flex flex-col pb-10">
            <div className="max-w-4xl mx-auto w-full px-4 pt-2 space-y-6">
                {/* Header Section */}
                <div className="flex items-start gap-4">
                    <Link href={`/matches/${id}`} className="mt-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <ChevronLeft className="h-6 w-6" />
                    </Link>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 leading-none mb-2">Toss</h1>
                        <p className="text-slate-500 font-medium">Flip the coin to decide who bats first.</p>
                    </div>
                </div>

                {/* Question 1: Who won the toss? */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-700">Who won the toss?</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[teamA, teamB].map((team) => (
                            <div
                                key={team.name}
                                onClick={() => setTossWinner(team.name)}
                                className={cn(
                                    "cursor-pointer rounded-xl border p-6 flex flex-col items-center justify-center gap-4 transition-all duration-300",
                                    tossWinner === team.name
                                        ? "border-primary/50 bg-primary/5 shadow-md ring-2 ring-primary/20"
                                        : "border-slate-200 bg-white hover:border-primary/30 hover:bg-slate-50/50"
                                )}
                            >
                                <div className="h-20 w-20 rounded-full flex items-center justify-center bg-muted overflow-hidden border border-slate-100 shadow-sm">
                                    {(team.teamId?.logoUrl || team.logo) ? (
                                        <img src={team.teamId?.logoUrl || team.logo} alt={team.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-black text-slate-400">{team.name[0]}</span>
                                    )}
                                </div>
                                <span className="font-bold text-lg text-slate-800">{team.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Question 2: Winner elected to? */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-700">Winner of the toss elected to?</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {['Bat', 'Bowl'].map((decision) => (
                            <div
                                key={decision}
                                onClick={() => setTossDecision(decision)}
                                className={cn(
                                    "cursor-pointer rounded-xl border p-6 flex flex-col items-center justify-center gap-4 transition-all duration-300",
                                    tossDecision === decision
                                        ? (decision === 'Bat' ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-500/10" : "border-green-500 bg-green-50 shadow-md ring-2 ring-green-500/10")
                                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                                )}
                            >
                                <div className={cn(
                                    "h-16 w-16 rounded-full flex items-center justify-center text-white shadow-md",
                                    decision === 'Bat' ? "bg-blue-500" : "bg-green-500"
                                )}>
                                    {decision === 'Bat' ? <Swords className="h-8 w-8" /> : <div className="h-8 w-8 rounded-full border-4 border-white/80 bg-white/20" />}
                                </div>
                                <span className="font-bold text-lg text-slate-800">{decision}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Coin Flip Section */}
                <div className="text-center space-y-2 pt-2 pb-0">
                    <h3 className="text-xl font-bold text-slate-600 uppercase tracking-wide">
                        Tap the coin to flip
                    </h3>

                    <div className="relative flex justify-center perspective-1000 h-52">
                        <div
                            className={cn(
                                "absolute bottom-10 w-40 h-8 bg-black/10 rounded-[100%] blur-xl transition-all duration-[3000ms]",
                                coinFlipping ? "animate-shadow-shrink" : "scale-100 opacity-60"
                            )}
                        />

                        <div
                            onClick={flipCoin}
                            className={cn(
                                "relative h-56 w-56 cursor-pointer preserve-3d transition-transform duration-700",
                                coinFlipping ? "animate-coin-toss" : ""
                            )}
                            style={{
                                transform: coinResult
                                    ? (coinResult === 'Heads' ? 'rotateY(0deg)' : 'rotateY(180deg)')
                                    : 'rotateY(0deg)'
                            }}
                        >
                            {/* EDGE LAYERS */}
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute inset-0 rounded-full border border-yellow-700/30"
                                    style={{ transform: `translateZ(-${i}px)` }}
                                />
                            ))}

                            {/* Front (Heads) */}
                            <div className="absolute inset-0 rounded-full bg-linear-to-br from-[#FFD700] via-[#FDB931] to-[#D4AF37] shadow-[inset_-5px_-5px_20px_rgba(0,0,0,0.4),inset_5px_5px_10px_rgba(255,255,255,0.7)] flex items-center justify-center border-2 border-yellow-600 backface-hidden z-10">
                                <div className="absolute inset-1 rounded-full border-4 border-dashed border-yellow-800/10" />
                                <div className="absolute inset-3 rounded-full border border-yellow-600/20 bg-linear-to-tr from-[#FDB931] to-[#FFD700]" />
                                <div className="relative z-20 flex flex-col items-center justify-center">
                                    <div className="text-[0.6rem] font-bold tracking-[0.2em] text-yellow-900/60 mb-1 uppercase">CricVerse</div>
                                    <div className="h-24 w-24 bg-linear-to-br from-yellow-700 to-yellow-900 rounded-full flex items-center justify-center shadow-inner border border-yellow-600/30">
                                        <Trophy className="h-14 w-14 text-yellow-100/90 drop-shadow-md" strokeWidth={2} />
                                    </div>
                                    <span className="block font-black text-3xl text-yellow-900/80 mt-2 tracking-widest drop-shadow-sm font-serif">HEADS</span>
                                </div>
                                <div className="absolute top-0 left-0 w-full h-full rounded-full bg-linear-to-tr from-white/40 via-transparent to-transparent opacity-30 pointer-events-none" />
                            </div>

                            {/* Back (Tails) */}
                            <div className="absolute inset-0 rounded-full bg-linear-to-br from-slate-200 via-slate-300 to-slate-400 shadow-[inset_-5px_-5px_20px_rgba(0,0,0,0.4),inset_5px_5px_10px_rgba(255,255,255,0.7)] flex items-center justify-center border-2 border-slate-500 backface-hidden z-10" style={{ transform: 'rotateY(180deg)' }}>
                                <div className="absolute inset-1 rounded-full border-4 border-dashed border-slate-600/10" />
                                <div className="absolute inset-3 rounded-full border border-slate-400/20 bg-linear-to-tr from-slate-300 to-slate-100" />
                                <div className="relative z-20 flex flex-col items-center justify-center">
                                    <div className="text-[0.6rem] font-bold tracking-[0.2em] text-slate-700/60 mb-1 uppercase">CricVerse</div>
                                    <div className="h-24 w-24 bg-linear-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center shadow-inner border border-slate-500/30">
                                        <span className="font-serif text-6xl font-bold text-slate-200/90 drop-shadow-md">I</span>
                                    </div>
                                    <span className="block font-black text-3xl text-slate-800/80 mt-2 tracking-widest drop-shadow-sm font-serif">TAILS</span>
                                </div>
                                <div className="absolute top-0 left-0 w-full h-full rounded-full bg-linear-to-tr from-white/40 via-transparent to-transparent opacity-30 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="h-10 flex items-center justify-center">
                        {coinResult && (
                            <div className="px-10 py-3 rounded-full bg-slate-100 border border-slate-200 text-3xl font-black animate-in zoom-in slide-in-from-bottom-2 duration-300 text-slate-800 uppercase tracking-widest shadow-sm">
                                {coinResult}!
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Action Section */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/matches/${id}`)}
                        className="h-11 px-8 border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                    >
                        Back
                    </Button>
                    <Button
                        onClick={handleStartMatch}
                        disabled={!tossWinner || isUpdating}
                        className="h-11 px-10 bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20 active:scale-95 transition-all w-full sm:w-auto"
                    >
                        {isUpdating ? "Starting..." : "Start Match"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
