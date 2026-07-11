'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import { Image as ImageIcon, Download, Share2, Trophy, Swords, Calendar, MapPin, Palette } from 'lucide-react';

export default function ShareCardModal({ matchData, firstInningsScore, secondInningsScore, isCompleted }) {
    const cardRef = useRef(null);
    const [theme, setTheme] = useState('charcoal');
    const [downloading, setDownloading] = useState(false);
    const [open, setOpen] = useState(false);

    // Compute MVPs
    const getMVPs = () => {
        let bestBatter = null;
        let bestBowler = null;

        const processInnings = (score) => {
            if (!score) return;
            
            // Batting
            if (score.battingStats && score.battingStats.length > 0) {
                score.battingStats.forEach(b => {
                    if (!bestBatter || b.runs > bestBatter.runs) {
                        bestBatter = b;
                    }
                });
            }

            // Bowling
            if (score.bowlingStats && score.bowlingStats.length > 0) {
                score.bowlingStats.forEach(w => {
                    if (!bestBowler || w.wickets > bestBowler.wickets || (w.wickets === bestBowler.wickets && w.runs < bestBowler.runs)) {
                        bestBowler = w;
                    }
                });
            }
        };

        processInnings(firstInningsScore);
        processInnings(secondInningsScore);

        return { bestBatter, bestBowler };
    };

    const { bestBatter, bestBowler } = getMVPs();

    // Theme Class Map
    const themes = {
        charcoal: {
            bg: 'bg-gradient-to-br from-gray-950 via-slate-900 to-zinc-950',
            border: 'border-slate-800',
            accent: 'text-slate-400',
            badgeBg: 'bg-slate-900/80 border-slate-700/50',
            text: 'text-white',
            vsBg: 'bg-slate-800 text-slate-200'
        },
        pitch: {
            bg: 'bg-gradient-to-br from-emerald-950 via-green-900 to-emerald-950',
            border: 'border-emerald-800/60',
            accent: 'text-emerald-400',
            badgeBg: 'bg-emerald-900/60 border-emerald-700/30',
            text: 'text-emerald-50',
            vsBg: 'bg-green-800 text-green-100'
        },
        royal: {
            bg: 'bg-gradient-to-br from-neutral-950 via-stone-900 to-zinc-950',
            border: 'border-amber-900/40',
            accent: 'text-amber-500',
            badgeBg: 'bg-stone-900/80 border-amber-800/30',
            text: 'text-white',
            vsBg: 'bg-amber-950 text-amber-200'
        },
        electric: {
            bg: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950',
            border: 'border-indigo-950',
            accent: 'text-cyan-400',
            badgeBg: 'bg-indigo-950/80 border-indigo-700/30',
            text: 'text-cyan-50',
            vsBg: 'bg-cyan-950 text-cyan-200'
        }
    };

    const activeTheme = themes[theme] || themes.charcoal;

    const handleDownload = async () => {
        if (!cardRef.current || downloading) return;
        setDownloading(true);
        const toastId = toast.loading('Generating Share Card...');

        try {
            // Delay slightly to ensure high quality rendering
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const dataUrl = await toPng(cardRef.current, {
                quality: 1.0,
                pixelRatio: 3, // Premium quality for social sharing
                backgroundColor: null, // Let gradient handle it
                cacheBust: true,
                useCORS: true
            });

            if (!dataUrl || dataUrl === 'data:,') {
                throw new Error('Image conversion returned empty data');
            }

            const link = document.createElement('a');
            link.download = `CricVerse_${matchData.teamA?.name || 'TeamA'}_vs_${matchData.teamB?.name || 'TeamB'}_Scorecard.png`;
            link.href = dataUrl;
            link.click();
            toast.success('Share Card downloaded successfully!', { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error('Failed to generate image. Please try again.', { id: toastId });
        } finally {
            setDownloading(false);
        }
    };

    const handleWebShare = async () => {
        if (!cardRef.current) return;
        const toastId = toast.loading('Preparing image for sharing...');
        
        try {
            await new Promise(resolve => setTimeout(resolve, 200));
            const dataUrl = await toPng(cardRef.current, {
                quality: 0.95,
                pixelRatio: 2,
                cacheBust: true,
                useCORS: true
            });

            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], 'Scorecard.png', { type: 'image/png' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Match Scorecard via CricVerse',
                    text: `Check out this match summary between ${matchData.teamA?.name} and ${matchData.teamB?.name}!`
                });
                toast.success('Shared successfully!', { id: toastId });
            } else {
                toast.error('Native sharing not supported on this device. Download the image instead.', { id: toastId });
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to share image.', { id: toastId });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="no-print flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Share Card
                </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto flex flex-col items-center">
                <DialogHeader className="w-full">
                    <DialogTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5 text-primary" />
                        Custom Social Share Card
                    </DialogTitle>
                </DialogHeader>

                {/* Theme Selector */}
                <div className="flex gap-2 w-full justify-center py-3 border-b mb-4">
                    {[
                        { key: 'charcoal', label: '🌑 Carbon' },
                        { key: 'pitch', label: '🌿 Pitch' },
                        { key: 'royal', label: '⚜️ Gold' },
                        { key: 'electric', label: '⚡ Neon' },
                    ].map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTheme(t.key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                theme === t.key
                                    ? 'bg-primary text-primary-foreground shadow-md scale-105'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ── CARD CAPTURE VIEW ── */}
                <div
                    ref={cardRef}
                    className={`w-[450px] h-[450px] p-6 rounded-2xl flex flex-col justify-between border ${activeTheme.bg} ${activeTheme.border} ${activeTheme.text} shadow-xl relative overflow-hidden`}
                    style={{ minWidth: '450px', minHeight: '450px' }}
                >
                    {/* Decorative Background Accents */}
                    <div className="absolute -right-20 -top-20 w-48 h-48 rounded-full bg-white/5 blur-3xl pointer-events-none" />
                    <div className="absolute -left-20 -bottom-20 w-48 h-48 rounded-full bg-white/5 blur-3xl pointer-events-none" />

                    {/* Top Row: Meta Header */}
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                            <Trophy className={`h-5 w-5 ${activeTheme.accent}`} />
                            <span className="text-xs font-black tracking-widest uppercase opacity-85">
                                {matchData.tournamentId ? 'Tournament Match' : 'Match Summary'}
                            </span>
                        </div>
                        <div className="flex flex-col items-end text-[10px] opacity-75">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{matchData.matchDate ? new Date(matchData.matchDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : new Date().toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Main score section */}
                    <div className="grid grid-cols-11 items-center py-2">
                        {/* Team A */}
                        <div className="col-span-5 text-center space-y-1">
                            <div className="font-extrabold text-lg leading-tight uppercase tracking-tight line-clamp-2">
                                {matchData.teamA?.name || 'Team A'}
                            </div>
                            {firstInningsScore ? (
                                <div className="space-y-0.5">
                                    <div className="text-2xl font-black tracking-tighter">
                                        {firstInningsScore.runs}/{firstInningsScore.wickets}
                                    </div>
                                    <div className="text-[10px] opacity-75">
                                        {firstInningsScore.overs} overs
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm font-semibold opacity-60">Yet to bat</div>
                            )}
                        </div>

                        {/* VS Divider */}
                        <div className="col-span-1 flex justify-center">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-black tracking-widest uppercase ${activeTheme.vsBg}`}>
                                VS
                            </span>
                        </div>

                        {/* Team B */}
                        <div className="col-span-5 text-center space-y-1">
                            <div className="font-extrabold text-lg leading-tight uppercase tracking-tight line-clamp-2">
                                {matchData.teamB?.name || 'Team B'}
                            </div>
                            {secondInningsScore ? (
                                <div className="space-y-0.5">
                                    <div className="text-2xl font-black tracking-tighter">
                                        {secondInningsScore.runs}/{secondInningsScore.wickets}
                                    </div>
                                    <div className="text-[10px] opacity-75">
                                        {secondInningsScore.overs} overs
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm font-semibold opacity-60">Yet to bat</div>
                            )}
                        </div>
                    </div>

                    {/* Match Status Banner */}
                    <div className="py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-center font-bold text-sm tracking-wide">
                        {isCompleted && matchData.result?.winnerName ? (
                            <span className="flex items-center justify-center gap-1.5">
                                🏆 {matchData.result.winnerName} won by {matchData.result.margin}
                            </span>
                        ) : isCompleted ? (
                            <span>🤝 Match Ended in a Tie</span>
                        ) : (
                            <span className="animate-pulse">🔴 Match In Progress</span>
                        )}
                    </div>

                    {/* Key Performers (Dynamic MVPs) */}
                    {(bestBatter || bestBowler) && (
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                            {/* Best Batter */}
                            {bestBatter ? (
                                <div className={`p-3 rounded-xl ${activeTheme.badgeBg} flex flex-col justify-between`}>
                                    <span className="text-[9px] uppercase tracking-wider font-extrabold opacity-70">Top Batter</span>
                                    <div className="font-bold text-sm line-clamp-1 mt-0.5">{bestBatter.name || bestBatter.playerName}</div>
                                    <div className="text-sm font-black mt-1">
                                        {bestBatter.runs} <span className="text-xs font-normal opacity-75">({bestBatter.balls}b)</span>
                                    </div>
                                </div>
                            ) : (
                                <div className={`p-3 rounded-xl ${activeTheme.badgeBg} flex flex-col justify-center items-center opacity-40`}>
                                    <span className="text-[10px] font-bold">No batting record</span>
                                </div>
                            )}

                            {/* Best Bowler */}
                            {bestBowler ? (
                                <div className={`p-3 rounded-xl ${activeTheme.badgeBg} flex flex-col justify-between`}>
                                    <span className="text-[9px] uppercase tracking-wider font-extrabold opacity-70">Top Bowler</span>
                                    <div className="font-bold text-sm line-clamp-1 mt-0.5">{bestBowler.name || bestBowler.playerName}</div>
                                    <div className="text-sm font-black mt-1">
                                        {bestBowler.wickets} W <span className="text-xs font-normal opacity-75">({bestBowler.runs} runs)</span>
                                    </div>
                                </div>
                            ) : (
                                <div className={`p-3 rounded-xl ${activeTheme.badgeBg} flex flex-col justify-center items-center opacity-40`}>
                                    <span className="text-[10px] font-bold">No bowling record</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer Branded Row */}
                    <div className="flex justify-between items-center text-[10px] opacity-75 pt-3 border-t border-white/5">
                        <div className="flex items-center gap-1 font-bold">
                            <Swords className="h-3 w-3" />
                            <span>CricVerse</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="line-clamp-1 max-w-[200px]">{matchData.venue || 'Stadium'}</span>
                        </div>
                    </div>
                </div>

                {/* Download/Share Actions */}
                <div className="flex gap-3 w-full mt-6">
                    <Button onClick={handleDownload} disabled={downloading} className="flex-1 gap-2 font-bold shadow-lg">
                        <Download className="h-4 w-4" />
                        Download PNG
                    </Button>
                    {typeof navigator !== 'undefined' && navigator.share && (
                        <Button onClick={handleWebShare} variant="secondary" className="gap-2 font-bold">
                            <Share2 className="h-4 w-4" />
                            Share
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
