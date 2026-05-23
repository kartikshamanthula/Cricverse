'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, RefreshCw, Swords, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = [
    { key: 'my', label: 'My Match', emptyMsg: 'No live matches right now. Start a match to see it here.' },
    { key: 'live', label: 'Live', emptyMsg: 'No live matches right now.' },
    { key: 'played', label: 'Played', emptyMsg: 'No recent results.' },
    { key: 'upcoming', label: 'Upcoming', emptyMsg: 'No upcoming matches found.' },
];

const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'odi', label: 'ODI' },
    { key: 't20', label: 'T20' },
    { key: 'ipl', label: 'IPL' },
    { key: 'mens', label: "Men's" },
    { key: 'womens', label: "Women's" },
];

function applyFilter(matches, filter) {
    if (filter === 'all') return matches;
    if (filter === 'odi') return matches.filter((m) => m.matchType === 'odi');
    if (filter === 't20') return matches.filter((m) => m.matchType === 't20');
    if (filter === 'ipl') return matches.filter((m) => m.name?.toLowerCase().includes('ipl') || m.name?.toLowerCase().includes('indian premier league'));
    if (filter === 'mens') return matches.filter((m) => !m.teams?.some((t) => t.toLowerCase().includes('women')));
    if (filter === 'womens') return matches.filter((m) => m.teams?.some((t) => t.toLowerCase().includes('women')));
    return matches;
}

const MATCH_TYPE_COLOR = {
    t20: 'bg-violet-500/15 text-violet-400 border border-violet-500/30',
    odi: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    test: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    unknown: 'bg-muted/50 text-muted-foreground border border-border',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getScoreForTeam(teamName, scoreArr) {
    if (!scoreArr?.length || !teamName) return null;
    const innings = scoreArr.filter((s) =>
        s.inning?.toLowerCase().includes(teamName.toLowerCase())
    );
    return innings[innings.length - 1] ?? null;
}

function formatMatchDate(dateTimeGMT) {
    if (!dateTimeGMT) return '';
    try {
        return new Date(dateTimeGMT).toLocaleString('en-IN', {
            month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
            timeZone: 'Asia/Kolkata',
        }) + ' IST';
    } catch {
        return dateTimeGMT;
    }
}

// ─── Sub-components (International) ───────────────────────────────────────────

function TeamFlag({ info }) {
    if (!info?.img) {
        return (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0 ring-2 ring-border">
                {info?.shortname?.slice(0, 2) ?? '??'}
            </div>
        );
    }
    return (
        <img
            src={info.img}
            alt={info.shortname ?? ''}
            width={32} height={32}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-border shrink-0"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
    );
}

function ScoreRow({ teamName, teamInfo, score, isWinner }) {
    const info = teamInfo?.find((t) => t.name === teamName || t.shortname === teamName);
    const inning = getScoreForTeam(teamName, score);

    return (
        <div className={`flex items-center justify-between gap-2 ${isWinner ? 'opacity-100' : 'opacity-75'}`}>
            <div className="flex items-center gap-2 min-w-0">
                <TeamFlag info={info} />
                <span className={`text-sm truncate ${isWinner ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}>
                    {teamName ?? 'TBD'}
                </span>
            </div>
            {inning ? (
                <span className={`text-sm tabular-nums shrink-0 ${isWinner ? 'font-black text-foreground' : 'font-medium text-muted-foreground'}`}>
                    {inning.r}/{inning.w}
                    <span className="text-[11px] font-normal ml-1 text-muted-foreground">({inning.o} ov)</span>
                </span>
            ) : (
                <span className="text-sm text-muted-foreground shrink-0">—</span>
            )}
        </div>
    );
}

function inferWinner(status, teams) {
    if (!status || !teams?.length) return null;
    const lower = status.toLowerCase();
    for (const t of teams) {
        if (lower.startsWith(t.toLowerCase())) return t;
    }
    return null;
}

function MatchCard({ match, tab }) {
    const typeClass = MATCH_TYPE_COLOR[match.matchType?.toLowerCase()] ?? MATCH_TYPE_COLOR.unknown;
    const winner = tab === 'played' ? inferWinner(match.status, match.teams) : null;
    const [team1, team2] = match.teams;

    return (
        <Card className="bg-card/70 backdrop-blur-sm border border-border/60 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <CardContent className="p-4 flex flex-col gap-3">

                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full ${typeClass}`}>
                        {match.matchType?.toUpperCase() ?? 'MATCH'}
                    </span>

                    {tab === 'live' && (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-400 uppercase tracking-widest">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                <span className="relative rounded-full h-2 w-2 bg-green-500" />
                            </span>
                            Live
                        </span>
                    )}
                    {tab === 'played' && (
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Final</span>
                    )}
                    {tab === 'upcoming' && match.dateTimeGMT && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatMatchDate(match.dateTimeGMT)}
                        </span>
                    )}
                </div>

                {/* Teams */}
                <div className="flex flex-col gap-2">
                    <ScoreRow
                        teamName={team1} teamInfo={match.teamInfo}
                        score={match.score} isWinner={winner === team1}
                    />
                    <div className="border-t border-border/40 mx-1" />
                    <ScoreRow
                        teamName={team2} teamInfo={match.teamInfo}
                        score={match.score} isWinner={winner === team2}
                    />
                </div>

                {/* Status / Result */}
                {match.status && match.status !== 'Match not started' && (
                    <p className="text-xs text-muted-foreground leading-snug border-t border-border/40 pt-2 line-clamp-2">
                        {match.status}
                    </p>
                )}

                {/* Venue for upcoming */}
                {tab === 'upcoming' && match.venue && (
                    <p className="flex items-start gap-1 text-[11px] text-muted-foreground line-clamp-1">
                        <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                        {match.venue}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

// ─── My Match Live Card ────────────────────────────────────────────────────────

function TeamScoreBlock({ teamName, logoUrl, innings }) {
    // find innings where this team is batting
    const battingInnings = innings?.filter(
        (inn) => inn.battingTeam === teamName
    ) ?? [];

    return (
        <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
                {logoUrl ? (
                    <img
                        src={logoUrl}
                        alt={teamName}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-border shrink-0"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary shrink-0 ring-2 ring-border">
                        {teamName?.slice(0, 2).toUpperCase() ?? '??'}
                    </div>
                )}
                <span className="text-sm font-semibold text-foreground truncate">{teamName}</span>
            </div>
            <div className="flex flex-col items-end shrink-0">
                {battingInnings.length > 0 ? battingInnings.map((inn, i) => (
                    <span key={i} className="text-sm font-black tabular-nums text-foreground">
                        {inn.score?.runs ?? 0}/{inn.score?.wickets ?? 0}
                        <span className="text-[11px] font-normal ml-1 text-muted-foreground">
                            ({inn.score?.overs ?? 0}.{inn.score?.balls ?? 0} ov)
                        </span>
                    </span>
                )) : (
                    <span className="text-sm text-muted-foreground font-medium">Yet to bat</span>
                )}
            </div>
        </div>
    );
}

function CurrentBattingStatus({ match }) {
    // Use the last innings by number — the scoring page doesn't set innings.status
    const innings = match.innings ?? [];
    const liveInnings = innings.length > 0
        ? innings.reduce((a, b) => (a.inningsNumber >= b.inningsNumber ? a : b))
        : null;
    if (!liveInnings) return null;

    const striker = liveInnings.currentPlayers?.striker;
    const nonStriker = liveInnings.currentPlayers?.nonStriker;
    const bowler = liveInnings.currentPlayers?.bowler;

    const sr = (runs, balls) => balls > 0 ? ((runs / balls) * 100).toFixed(1) : '0.0';

    // Bowler economy: overs stored as 1.3 means 1 over 3 balls
    const bowlerOversRaw = bowler?.overs ?? 0;
    const fullOvers = Math.floor(bowlerOversRaw);
    const extraBalls = Math.round((bowlerOversRaw % 1) * 10);
    const totalBalls = fullOvers * 6 + extraBalls;
    const bowlerEcon = totalBalls > 0
        ? ((bowler.runs ?? 0) / (totalBalls / 6)).toFixed(1)
        : '0.0';

    return (
        <div className="bg-muted/40 rounded-lg border border-border/40 overflow-hidden text-xs">

            {/* Batting header */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-muted/70 border-b border-border/40">
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">🏏 Batting</span>
                <span className="text-[10px] text-muted-foreground">{liveInnings.battingTeam} · Inn {liveInnings.inningsNumber}</span>
            </div>

            {/* Column labels — fixed widths match data rows exactly */}
            <div className="grid grid-cols-[1fr_2rem_2rem_3rem_3.2rem] gap-x-2 px-3 pt-1.5 pb-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/55">
                <span>Batter</span>
                <span className="text-right">R</span>
                <span className="text-right">B</span>
                <span className="text-right">4s/6s</span>
                <span className="text-right">SR</span>
            </div>

            {/* Striker */}
            {striker && (
                <div className="grid grid-cols-[1fr_2rem_2rem_3rem_3.2rem] gap-x-2 items-center px-3 py-1.5 border-b border-border/20">
                    <span className="font-bold text-foreground flex items-center gap-1 min-w-0 truncate">
                        <span className="text-yellow-400 shrink-0 text-[11px]">&#9733;</span>
                        <span className="truncate">{striker.playerName}</span>
                    </span>
                    <span className="tabular-nums font-black text-foreground text-right">{striker.runs}</span>
                    <span className="tabular-nums text-muted-foreground text-right">{striker.balls}</span>
                    <span className="tabular-nums text-muted-foreground text-right">{striker.fours ?? 0}/{striker.sixes ?? 0}</span>
                    <span className="tabular-nums text-muted-foreground text-right">{sr(striker.runs, striker.balls)}</span>
                </div>
            )}

            {/* Non-striker */}
            {nonStriker && (
                <div className="grid grid-cols-[1fr_2rem_2rem_3rem_3.2rem] gap-x-2 items-center px-3 py-1 opacity-65">
                    <span className="text-muted-foreground flex items-center gap-1 min-w-0 truncate">
                        <span className="shrink-0 text-[9px]">●</span>
                        <span className="truncate">{nonStriker.playerName}</span>
                    </span>
                    <span className="tabular-nums text-muted-foreground text-right">{nonStriker.runs}</span>
                    <span className="tabular-nums text-muted-foreground text-right">{nonStriker.balls}</span>
                    <span className="tabular-nums text-muted-foreground text-right">{nonStriker.fours ?? 0}/{nonStriker.sixes ?? 0}</span>
                    <span className="tabular-nums text-muted-foreground text-right">{sr(nonStriker.runs, nonStriker.balls)}</span>
                </div>
            )}

            {/* Bowler section */}
            {bowler && (
                <>
                    {/* Bowling header */}
                    <div className="px-3 py-1.5 bg-muted/70 border-t border-border/40">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">⚾ Bowling</span>
                    </div>
                    {/* Bowling column labels — same fixed col grid as data row */}
                    <div className="grid grid-cols-[1fr_3.5rem_3rem_3rem] gap-x-2 px-3 pt-1.5 pb-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/55">
                        <span>Bowler</span>
                        <span className="text-right">Ov(B)</span>
                        <span className="text-right">W/R</span>
                        <span className="text-right">Econ</span>
                    </div>
                    {/* Bowler data row */}
                    <div className="grid grid-cols-[1fr_3.5rem_3rem_3rem] gap-x-2 items-center px-3 py-1.5">
                        <span className="font-semibold text-foreground truncate">{bowler.playerName}</span>
                        <span className="tabular-nums text-muted-foreground text-right">
                            {bowlerOversRaw}<span className="text-[9px]">({totalBalls})</span>
                        </span>
                        <span className="tabular-nums text-right">
                            <span className="font-black text-foreground">{bowler.wickets ?? 0}</span>
                            <span className="text-muted-foreground">/{bowler.runs ?? 0}</span>
                        </span>
                        <span className="tabular-nums text-muted-foreground text-right">{bowlerEcon}</span>
                    </div>
                </>
            )}
        </div>
    );
}

function RecentBalls({ match }) {
    const innings = match.innings ?? [];
    const liveInnings = innings.length > 0
        ? innings.reduce((a, b) => (a.inningsNumber >= b.inningsNumber ? a : b))
        : null;
    if (!liveInnings?.ballHistory?.length) return null;

    const recent = [...liveInnings.ballHistory].slice(-6).reverse();

    const ballStyle = (ball) => {
        if (ball.isWicket) return 'bg-red-500 text-white font-black';
        if (ball.ballType === 'wide') return 'bg-amber-500/20 text-amber-400 border border-amber-500/40';
        if (ball.ballType === 'no_ball') return 'bg-orange-500/20 text-orange-400 border border-orange-500/40';
        if (ball.runs === 6) return 'bg-green-500 text-white font-black';
        if (ball.runs === 4) return 'bg-blue-500 text-white font-bold';
        return 'bg-muted text-muted-foreground border border-border';
    };

    const ballLabel = (ball) => {
        if (ball.isWicket) return 'W';
        if (ball.ballType === 'wide') return 'wd';
        if (ball.ballType === 'no_ball') return 'nb';
        return ball.runs;
    };

    return (
        <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mr-1">Last balls:</span>
            {recent.map((ball, i) => (
                <span
                    key={i}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] ${ballStyle(ball)}`}
                >
                    {ballLabel(ball)}
                </span>
            ))}
        </div>
    );
}

function MyMatchCard({ match, tab = 'live' }) {
    const teamA = match.teamA?.name;
    const teamB = match.teamB?.name;
    const innings = match.innings ?? [];

    const liveInnings = innings.length > 0
        ? innings.reduce((a, b) => (a.inningsNumber >= b.inningsNumber ? a : b))
        : null;

    const runRate = liveInnings?.score?.runRate != null
        ? liveInnings.score.runRate.toFixed(2)
        : (liveInnings?.score?.runs && liveInnings?.score?.overs && liveInnings.score.overs > 0
            ? (liveInnings.score.runs / liveInnings.score.overs).toFixed(2)
            : '—');

    const firstInnings = innings.find(i => i.inningsNumber === 1);
    const target = liveInnings?.inningsNumber === 2 ? firstInnings?.score?.runs : undefined;
    const battingTeam = liveInnings?.battingTeam;
    const inn2 = liveInnings?.inningsNumber === 2;
    const needed = inn2 && target != null
        ? target + 1 - (liveInnings?.score?.runs ?? 0)
        : null;

    let borderClass = 'border-border/40 hover:border-border/80 shadow-md';
    if (tab === 'live') {
        borderClass = 'border-green-500/30 shadow-lg shadow-green-500/5 hover:shadow-green-500/10 hover:border-green-500/50';
    } else if (tab === 'played') {
        borderClass = 'border-l-4 border-l-slate-400 border-t-border/40 border-r-border/40 border-b-border/40 shadow-sm';
    } else if (tab === 'upcoming') {
        borderClass = 'border-l-4 border-l-blue-400 border-t-border/40 border-r-border/40 border-b-border/40 shadow-sm';
    }

    return (
        <Card className={`bg-card transition-all duration-300 w-full ${borderClass}`}>
            <CardContent className="p-4 flex flex-col gap-3">

                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        {tab === 'live' && (
                            <>
                                <span className="relative flex h-2.5 w-2.5 shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                    <span className="relative rounded-full h-2.5 w-2.5 bg-green-500" />
                                </span>
                                <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Live</span>
                            </>
                        )}
                        {tab === 'upcoming' && (
                            <>
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Upcoming</span>
                            </>
                        )}
                        {tab === 'played' && (
                            <>
                                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Result</span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                        <span className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full whitespace-nowrap">
                            {match.totalOvers || match.overs || 20} ov • {match.matchType ?? 'Match'}
                        </span>
                        {match.venue && (
                            <span className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                                <MapPin className="h-2 w-2" />{match.venue}
                            </span>
                        )}
                    </div>
                </div>

                {/* Match name & Date */}
                <div className="flex flex-col gap-0.5 mt-0.5">
                    <p className="text-xs font-bold text-foreground/80">
                        {teamA} vs {teamB}
                        {match.tournamentName && <span className="ml-1 text-muted-foreground font-normal">• {match.tournamentName}</span>}
                    </p>
                    {tab === 'upcoming' && match.matchDate && (
                        <p className="text-[11px] text-muted-foreground font-medium">
                            {new Date(match.matchDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    )}
                </div>

                {/* Team scores */}
                <div className="flex flex-col gap-2 mt-1">
                    <TeamScoreBlock
                        teamName={teamA}
                        logoUrl={match.teamA?.logo}
                        innings={match.innings}
                    />
                    <div className="border-t border-border/40 mx-1" />
                    <TeamScoreBlock
                        teamName={teamB}
                        logoUrl={match.teamB?.logo}
                        innings={match.innings}
                    />
                </div>

                {/* Live Stats */}
                {tab === 'live' && liveInnings && (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                            <span>CRR: <span className="font-semibold text-foreground">{runRate}</span></span>
                            {needed != null && needed > 0 && (
                                <span className="text-amber-500 font-semibold">
                                    {battingTeam} need {needed} more
                                </span>
                            )}
                            {target != null && inn2 && (
                                <span>Target: <span className="font-semibold text-foreground">{target + 1}</span></span>
                            )}
                        </div>
                        <CurrentBattingStatus match={match} />
                        <RecentBalls match={match} />
                    </div>
                )}

                {/* Played Result Banner */}
                {tab === 'played' && match.result?.winnerName && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-md py-2 px-3 flex items-center gap-2 mt-1">
                        <span className="text-lg">🏆</span>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-green-600 dark:text-green-500">{match.result.winnerName} won</span>
                            {match.result.margin && (
                                <span className="text-[10px] text-green-600/80 dark:text-green-500/80 font-medium tracking-wide">by {match.result.margin}</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Go to match */}
                <Link
                    href={`/matches/${match._id}`}
                    className="flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors border-t border-border/40 pt-3 mt-1 -mx-1 group"
                >
                    View Full Scorecard <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </CardContent>
        </Card>
    );
}

function NoLiveMatch() {
    return (
        <div className="col-span-full flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center">
                <Swords className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-foreground">No Live Matches</p>
                <p className="text-xs text-muted-foreground">Start a match and its live score will appear here.</p>
            </div>
            <Link
                href="/matches/create"
                className="text-xs font-bold text-primary hover:text-primary/80 border border-primary/30 px-4 py-2 rounded-lg hover:bg-primary/5 transition-all"
            >
                + Start a Match
            </Link>
        </div>
    );
}

function SkeletonCard() {
    return (
        <div className="rounded-xl border border-border/60 bg-card/50 p-4 flex flex-col gap-4 animate-pulse">
            <div className="flex justify-between">
                <div className="h-4 w-12 rounded-full bg-muted" />
                <div className="h-4 w-10 rounded-full bg-muted" />
            </div>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="ml-auto h-4 w-16 rounded bg-muted" />
            </div>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
                <div className="h-4 w-20 rounded bg-muted" />
                <div className="ml-auto h-4 w-16 rounded bg-muted" />
            </div>
            <div className="h-3 w-full rounded bg-muted" />
        </div>
    );
}

// ─── Main Widget ──────────────────────────────────────────────────────────────

export function LiveScoreWidget() {
    const { user } = useAuth();
    const [data, setData] = useState({ live: [], played: [], upcoming: [] });
    const [myMatches, setMyMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myLoading, setMyLoading] = useState(true);
    const [error, setError] = useState(null);
    const [category, setCategory] = useState('international'); // 'international' | 'local'
    const [statusTab, setStatusTab] = useState('live'); // 'live' | 'upcoming' | 'played'
    const [activeFilter, setActiveFilter] = useState('all');
    const [lastUpdated, setLastUpdated] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    // Guard browser-only renders to avoid SSR/client hydration mismatch
    const [mounted, setMounted] = useState(false);

    // Resolve dynamic permissions with admin bypass
    const p = user?.role === 'admin' ? {
        liveScoreInternational: true,
        liveScoreLocal: true
    } : (user?.permissions ?? {
        liveScoreInternational: true,
        liveScoreLocal: true
    });

    const hasInternational = p.liveScoreInternational !== false;
    const hasLocal = p.liveScoreLocal !== false;

    // Automatically fall back category to whatever is permitted
    useEffect(() => {
        if (!hasInternational && hasLocal) {
            setCategory('local');
        } else if (hasInternational) {
            setCategory('international');
        }
    }, [hasInternational, hasLocal]);
    // Fetch local matches (mine + everyone else's live matches)
    const fetchMyMatches = useCallback(async () => {
        try {
            const res = await fetch('/api/matches?dashboard=true');
            const json = res.ok ? await res.json() : [];
            setMyMatches(Array.isArray(json) ? json : []);
        } catch {
            setMyMatches([]);
        } finally {
            setMyLoading(false);
        }
    }, []);

    // Fetch international scores
    const fetchScores = useCallback(async () => {
        try {
            const res = await fetch('/api/live-scores');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            setData({ live: json.live ?? [], played: json.played ?? [], upcoming: json.upcoming ?? [] });
            setLastUpdated(new Date());
            setError(json.error || null);

            setStatusTab((prev) => {
                if (prev !== 'live') return prev;
                if ((json.live ?? []).length > 0) return 'live';
                if ((json.played ?? []).length > 0) return 'played';
                return 'upcoming';
            });
        } catch {
            setError('Unable to fetch scores. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [category]); // Depend on category for conditional logic inside handleRefresh

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        if (category === 'international') {
            await fetchScores();
        } else {
            await fetchMyMatches();
        }
        setRefreshing(false);
    }, [category, fetchScores, fetchMyMatches]);

    useEffect(() => {
        setMounted(true);
        fetchMyMatches();
        fetchScores();
        // Poll own matches every 15s for near-real-time updates
        const myId = setInterval(fetchMyMatches, 15_000);
        // Poll international scores every 60s
        const intlId = setInterval(fetchScores, 60_000);
        return () => { clearInterval(myId); clearInterval(intlId); };
    }, [fetchScores, fetchMyMatches]);

    // Categorise my matches
    const myLive = myMatches.filter(m => m.status !== 'completed' && m.innings?.length > 0);
    const myUpcoming = myMatches.filter(m => m.status !== 'completed' && (!m.innings || m.innings.length === 0));
    const myPlayed = myMatches.filter(m => m.status === 'completed');
    const myCounts = { live: myLive.length, upcoming: myUpcoming.length, played: myPlayed.length };
    const intlCounts = { live: data.live.length, upcoming: data.upcoming.length, played: data.played.length };

    const activeCounts = category === 'local' ? myCounts : intlCounts;
    const currentLoading = category === 'local' ? myLoading : loading;

    const mySubMatches = statusTab === 'live' ? myLive : statusTab === 'upcoming' ? myUpcoming : myPlayed;
    const currentMatches = category === 'local'
        ? mySubMatches
        : applyFilter(data[statusTab] ?? [], activeFilter);

    if (!hasInternational && !hasLocal) {
        return null; // Hide the widget entirely if both match modules are restricted
    }

    return (
        <section className="space-y-5">
            {/* ── Level 1: Header & Category Toggle ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-3">
                <div className="flex items-center justify-between w-full md:w-auto gap-4">
                    <div className="flex items-center gap-2.5 shrink-0">
                        {statusTab === 'live' && activeCounts.live > 0 && (
                            <span className="relative flex h-3 w-3 shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60" />
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                            </span>
                        )}
                        <h2 className="text-xl font-black tracking-tight text-foreground whitespace-nowrap">Dashboard</h2>
                    </div>

                    {/* Refresh on mobile is placed here next to title */}
                    <div className="flex md:hidden items-center gap-2 shrink-0">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className={`flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-muted/30 hover:bg-muted text-muted-foreground transition-all duration-200 active:scale-95 ${refreshing ? 'ring-2 ring-primary/20' : ''}`}
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Main Category Tabs */}
                {hasInternational && hasLocal && (
                    <div className="flex bg-muted/40 p-1.5 rounded-xl border border-border/50 self-start md:self-auto shadow-sm">
                        <button
                            onClick={() => setCategory('international')}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm transition-all duration-300 ${category === 'international'
                                    ? 'bg-background text-foreground font-bold shadow opacity-100'
                                    : 'text-muted-foreground font-semibold hover:text-foreground opacity-70'
                                }`}
                        >
                            International
                        </button>
                        <button
                            onClick={() => setCategory('local')}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm transition-all duration-300 ${category === 'local'
                                    ? 'bg-background text-foreground font-bold shadow opacity-100'
                                    : 'text-muted-foreground font-semibold hover:text-foreground opacity-70'
                                }`}
                        >
                            Local Matches
                            {myCounts.live > 0 && category !== 'local' && (
                                <span className="flex h-2 w-2 rounded-full bg-green-500 shrink-0" />
                            )}
                        </button>
                    </div>
                )}

                {/* Refresh and Time (Desktop) */}
                <div className="hidden md:flex items-center gap-3 shrink-0">
                    {mounted && lastUpdated && (
                        <span className="text-xs font-medium text-muted-foreground">
                            Updated {lastUpdated.toLocaleTimeString()}
                        </span>
                    )}
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        title="Refresh scores"
                        className={`flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-95 ${refreshing ? 'ring-2 ring-primary/20' : ''}`}
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* ── Level 2: Status Sub-tabs & (Optional) Formats ── */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-muted/20 px-4 py-3 rounded-xl border border-border/40">

                {/* Status Tabs (Live / Upcoming / Played) */}
                <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
                    {[
                        { key: 'live', label: 'Live', dot: true },
                        { key: 'upcoming', label: 'Upcoming', dot: false },
                        { key: 'played', label: 'Played', dot: false },
                    ].map(({ key, label, dot }) => (
                        <button
                            key={key}
                            onClick={() => setStatusTab(key)}
                            className={`relative flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex-1 lg:flex-none ${statusTab === key
                                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                        >
                            {dot && activeCounts[key] > 0 && (
                                <span className={`flex h-2 w-2 rounded-full ${statusTab === key ? 'bg-primary-foreground' : 'bg-green-500'}`} />
                            )}
                            {label}
                            {activeCounts[key] > 0 && (
                                <span className={`text-[10px] rounded-full px-1.5 py-0.5 ml-1 ${statusTab === key ? 'bg-primary-foreground/20' : 'bg-border/60'
                                    }`}>
                                    {activeCounts[key]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Level 3: Format Filters (Always visible for International, hidden for Local) */}
                {category === 'international' && (
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-hide shrink-0">
                        {FILTERS.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setActiveFilter(key)}
                                className={`px-3 py-1.5 rounded-md shrink-0 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${activeFilter === key
                                        ? 'bg-foreground text-background shadow-sm'
                                        : 'bg-transparent text-muted-foreground border-border hover:bg-muted/50 hover:text-foreground border'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Content Grid ── */}
            {error && category === 'international' ? (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm px-4 py-3">
                    {error}
                </div>
            ) : category === 'local' ? (
                /* LOCAL MATCHES */
                <div className="space-y-0">
                    {myLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : mySubMatches.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-xl border border-dashed border-border/60 bg-muted/10">
                            <Swords className="h-8 w-8 text-muted-foreground/30" />
                            <p className="text-sm font-medium text-muted-foreground">
                                {statusTab === 'live' ? 'No live local matches. Start scoring to see them here.' :
                                    statusTab === 'upcoming' ? 'No upcoming matches scheduled.' :
                                        'No completed matches yet.'}
                            </p>
                            {statusTab !== 'live' && (
                                <Link
                                    href="/matches/create"
                                    className="text-xs font-bold text-primary border border-primary/30 px-5 py-2.5 rounded-lg hover:bg-primary/5 transition-all mt-2"
                                >
                                    + Schedule Match
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {mySubMatches.map((m) => (
                                <MyMatchCard key={m._id} match={m} tab={statusTab} />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                /* INTERNATIONAL MATCHES */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentLoading ? (
                        Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
                    ) : currentMatches.length === 0 ? (
                        <div className="col-span-full py-16 flex flex-col items-center justify-center text-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/10">
                            <span className="text-4xl opacity-30">🤔</span>
                            <p className="text-sm font-medium text-muted-foreground mt-2">
                                No {activeFilter !== 'all' ? FILTERS.find(f => f.key === activeFilter)?.label : ''} matches found in {statusTab}.
                            </p>
                        </div>
                    ) : (
                        currentMatches.map((m) => (
                            <MatchCard key={m.id} match={m} tab={statusTab} />
                        ))
                    )}
                </div>
            )}
        </section>
    );
}
