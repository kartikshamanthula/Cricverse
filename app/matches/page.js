"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, Video, Trophy, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';

// ─── Status helpers ──────────────────────────────────────────────────────────

function getMatchCategory(match) {
    if (match.status === 'completed') return 'played';
    if (match.status === 'live' || (match.innings && match.innings.length > 0)) return 'live';
    return 'upcoming';
}

const TABS = [
    {
        key: 'live',
        label: 'Live',
        emptyMsg: 'No live matches right now.',
        emptyAction: null,
        dot: true,
    },
    {
        key: 'upcoming',
        label: 'Upcoming',
        emptyMsg: 'No upcoming matches scheduled.',
        emptyAction: 'Schedule a match',
    },
    {
        key: 'played',
        label: 'Played',
        emptyMsg: 'No completed matches yet.',
        emptyAction: null,
    },
];

// ─── Match Card ───────────────────────────────────────────────────────────────

function MatchCard({ match, onDeleteClick }) {
    const category = getMatchCategory(match);
    const isCompleted = category === 'played';
    const isLive = category === 'live';

    const innings1 = match.innings?.find(i => i.inningsNumber === 1);
    const innings2 = match.innings?.find(i => i.inningsNumber === 2);

    let scoreDisplay = 'Yet to start';
    if (innings2) {
        scoreDisplay = `${innings2.battingTeam || 'Inn 2'}: ${innings2.score?.runs ?? 0}/${innings2.score?.wickets ?? 0} (${innings2.score?.overs ?? 0} ov)`;
    } else if (innings1) {
        scoreDisplay = `${innings1.battingTeam || 'Inn 1'}: ${innings1.score?.runs ?? 0}/${innings1.score?.wickets ?? 0} (${innings1.score?.overs ?? 0} ov)`;
    }

    const displayMatchType = (match.matchType === 'Limited Overs' && !match.tournamentId)
        ? 'Box/Turf Cricket'
        : (match.matchType || 'Box/Turf Cricket');

    const borderColor = isCompleted
        ? 'border-l-green-500'
        : isLive
            ? 'border-l-red-500'
            : 'border-l-blue-400';

    return (
        <Card className={`group overflow-hidden border-0 bg-card hover:bg-card/60 transition-all duration-300 hover:shadow-xl relative border-l-4 ${borderColor}`}>
            <CardContent className="p-0">
                <div className="grid md:grid-cols-12 gap-4 items-center p-6">

                    {/* Status & Type */}
                    <div className="md:col-span-2 flex flex-col items-center md:items-start gap-1">
                        {isCompleted ? (
                            <Badge className="bg-green-600">COMPLETED</Badge>
                        ) : isLive ? (
                            <Badge className="bg-red-600 animate-pulse border-0">LIVE</Badge>
                        ) : (
                            <Badge variant="secondary" className="bg-blue-500/15 text-blue-400 border border-blue-500/30">UPCOMING</Badge>
                        )}
                        <span className="text-xs font-mono text-muted-foreground mt-1" suppressHydrationWarning>
                            {displayMatchType} • {match.totalOvers || match.overs || 20} Overs
                        </span>
                        {match.matchDate && (
                            <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1" suppressHydrationWarning>
                                <CalendarIcon className="h-3 w-3" />
                                {format(new Date(match.matchDate), 'MMM d, yyyy')}
                            </div>
                        )}
                    </div>

                    {/* Teams & Score */}
                    <div className="md:col-span-6 flex flex-col md:flex-row items-center justify-start gap-6">
                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                            <h3 className="text-lg font-bold truncate w-24 md:w-32 text-right" suppressHydrationWarning>
                                {match.teamA?.name || 'Team A'}
                            </h3>
                            <div className="text-xl font-black text-muted-foreground/30 px-2">VS</div>
                            <h3 className="text-lg font-bold truncate w-24 md:w-32 text-left" suppressHydrationWarning>
                                {match.teamB?.name || 'Team B'}
                            </h3>
                        </div>
                        {(isLive || isCompleted) && (
                            <div className="text-sm font-semibold text-muted-foreground bg-muted/50 px-3 py-1 rounded-full" suppressHydrationWarning>
                                {scoreDisplay}
                            </div>
                        )}
                    </div>

                    {/* Venue & Actions */}
                    <div className="md:col-span-4 flex flex-col md:flex-row items-center justify-end gap-3">
                        <div className="text-right hidden md:block mr-2">
                            <div className="text-xs text-muted-foreground flex items-center justify-end gap-2" suppressHydrationWarning>
                                <MapPin className="h-3 w-3" />
                                {match.venue || 'Stadium'}
                            </div>
                            {isCompleted && match.result?.winnerName && (
                                <div className="text-xs font-bold text-green-600 flex items-center justify-end gap-1 mt-1" suppressHydrationWarning>
                                    <Trophy className="h-3 w-3" />
                                    {match.result.winnerName} Won
                                </div>
                            )}
                        </div>

                        <Button
                            asChild
                            size="sm"
                            variant={isCompleted ? 'outline' : 'default'}
                            className={isLive ? 'bg-red-600 hover:bg-red-700' : ''}
                        >
                            <Link href={`/matches/${match._id}`}>
                                {isLive ? <><Video className="mr-2 h-4 w-4" />Live Center</> :
                                    isCompleted ? 'Match Details' : 'View Match'}
                            </Link>
                        </Button>

                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => onDeleteClick(e, match)}
                            title="Delete Match"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Tab Bar ──────────────────────────────────────────────────────────────────

function TabBar({ activeTab, counts, onChange }) {
    return (
        <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-1 w-fit">
            {TABS.map(({ key, label, dot }) => (
                <button
                    key={key}
                    onClick={() => onChange(key)}
                    className={`relative flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${activeTab === key
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    {dot && counts[key] > 0 && (
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative rounded-full h-2 w-2 bg-green-500" />
                        </span>
                    )}
                    {label}
                    {counts[key] > 0 && (
                        <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-bold ${activeTab === key ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            {counts[key]}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MatchesPage() {
    const [matches, setMatches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('live');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [matchToDelete, setMatchToDelete] = useState(null);

    useEffect(() => {
        loadMatches();
    }, []);

    const loadMatches = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/matches');
            if (!res.ok) throw new Error('Failed to fetch matches');
            const data = await res.json();
            setMatches(data);

            // Auto-select the most interesting tab
            const cats = data.map(getMatchCategory);
            if (cats.includes('live')) setActiveTab('live');
            else if (cats.includes('upcoming')) setActiveTab('upcoming');
            else setActiveTab('played');
        } catch (error) {
            console.error(error);
            toast.error('Failed to load matches');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (e, match) => {
        e.preventDefault();
        setMatchToDelete(match);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!matchToDelete) return;
        try {
            const res = await fetch(`/api/matches/${matchToDelete._id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete match');
            setMatches(prev => prev.filter(m => m._id !== matchToDelete._id));
            toast.success('Match deleted successfully');
            setDeleteDialogOpen(false);
            setMatchToDelete(null);
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete match');
        }
    };

    // ── Categorise ──
    const categorised = {
        live: matches.filter(m => getMatchCategory(m) === 'live'),
        upcoming: matches.filter(m => getMatchCategory(m) === 'upcoming'),
        played: matches.filter(m => getMatchCategory(m) === 'played'),
    };
    const counts = { live: categorised.live.length, upcoming: categorised.upcoming.length, played: categorised.played.length };
    const activeMatches = categorised[activeTab] ?? [];
    const activeTab_ = TABS.find(t => t.key === activeTab);

    if (isLoading) {
        return (
            <div className="space-y-8 pb-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="space-y-2">
                        <div className="h-10 w-48 bg-muted animate-pulse rounded" />
                        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                    </div>
                    <div className="h-12 w-40 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-10 w-72 bg-muted animate-pulse rounded-lg" />
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">

            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground drop-shadow-md">Match Center</h1>
                    <p className="text-muted-foreground text-lg">Live scores, fixtures, and results.</p>
                </div>
                <Button asChild size="lg" className="font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform bg-primary hover:bg-primary/90">
                    <Link href="/matches/create">
                        <Plus className="mr-2 h-5 w-5" /> Schedule Match
                    </Link>
                </Button>
            </div>

            {/* Tab bar */}
            <TabBar activeTab={activeTab} counts={counts} onChange={setActiveTab} />

            {/* Match list */}
            <div className="space-y-4">
                {activeMatches.length === 0 ? (
                    <div className="text-center py-16 bg-muted/20 rounded-xl border-2 border-dashed">
                        <p className="text-muted-foreground mb-4">{activeTab_?.emptyMsg}</p>
                        {activeTab_?.emptyAction && (
                            <Button asChild variant="outline">
                                <Link href="/matches/create">{activeTab_.emptyAction}</Link>
                            </Button>
                        )}
                    </div>
                ) : (
                    activeMatches.map((match) => (
                        <MatchCard key={match._id} match={match} onDeleteClick={handleDeleteClick} />
                    ))
                )}
            </div>

            {/* Delete confirmation dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Match</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the match between{' '}
                            <span className="font-semibold">{matchToDelete?.teamA?.name}</span> and{' '}
                            <span className="font-semibold">{matchToDelete?.teamB?.name}</span>?
                            This action cannot be undone and all scoring data will be lost.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete Match</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
