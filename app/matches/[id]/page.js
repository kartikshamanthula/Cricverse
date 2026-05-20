"use client"

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { ChevronLeft, Trophy, Users, Target, Calendar, MapPin, Clock, Printer, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function MatchDetailsPage() {
    const params = useParams();
    const id = params?.id;
    const router = useRouter();
    const [matchData, setMatchData] = useState(null);
    const [firstInningsScore, setFirstInningsScore] = useState(null);
    const [secondInningsScore, setSecondInningsScore] = useState(null);
    const [isMounted, setIsMounted] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const printRef = useRef(null);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        setIsMounted(true);
        if (!id) return;
        
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setCurrentUser(data);
                }
            } catch (err) {}
        };
        fetchUser();

        const fetchMatchDetails = async () => {
            try {
                const res = await fetch(`/api/matches/${id}`);
                if (!res.ok) throw new Error('Failed to fetch match details');
                const data = await res.json();

                // Format teams helper
                const formatTeam = (teamRef) => ({
                    name: teamRef.name,
                    players: teamRef.teamId?.players?.map(p => ({
                        id: p._id || p.id,
                        name: p.name,
                        role: p.role
                    })) || [],
                    id: teamRef.teamId?._id,
                    homeGround: teamRef.teamId?.homeGround,
                    logoUrl: teamRef.teamId?.logoUrl
                });

                let formattedMatch = {
                    ...data,
                    battingTeam: formatTeam(data.teamA),
                    bowlingTeam: formatTeam(data.teamB)
                };

                // Determine batting/bowling based on toss for initial state
                // This aligns with how the UI expects data (Team 1 vs Team 2)
                const tossWinner = data.toss?.winner;
                const decision = data.toss?.decision?.type || data.toss?.decision;
                const isTeamA = tossWinner === data.teamA.name;

                if (decision === 'bat') {
                    formattedMatch.battingTeam = isTeamA ? formatTeam(data.teamA) : formatTeam(data.teamB);
                    formattedMatch.bowlingTeam = isTeamA ? formatTeam(data.teamB) : formatTeam(data.teamA);
                } else if (decision === 'bowl') {
                    formattedMatch.battingTeam = isTeamA ? formatTeam(data.teamB) : formatTeam(data.teamA);
                    formattedMatch.bowlingTeam = isTeamA ? formatTeam(data.teamA) : formatTeam(data.teamB);
                }

                setMatchData(formattedMatch);

                // Extract innings data from the now formatted match (or raw data)
                // Note: The Innings objects in DB have 'battingTeam' string name, which is fine.
                // But we need the 'firstInningsScore' state to be set.

                if (data.innings && data.innings.length > 0) {
                    const firstInnings = data.innings.find(i => i.inningsNumber === 1);
                    if (firstInnings) {
                        setFirstInningsScore({
                            ...firstInnings.score,
                            battingTeam: firstInnings.battingTeam,
                            currentPlayers: firstInnings.currentPlayers,
                            battingStats: firstInnings.battingStats?.map(p => ({ ...p, name: p.playerName })), // Map playerName to name
                            bowlingStats: firstInnings.bowlingStats?.map(p => ({ ...p, name: p.playerName })), // Map playerName to name
                            lastSixBalls: firstInnings.ballHistory?.slice(-6) || []
                        });
                    }

                    const secondInnings = data.innings.find(i => i.inningsNumber === 2);
                    if (secondInnings) {
                        setSecondInningsScore({
                            ...secondInnings.score,
                            battingTeam: secondInnings.battingTeam,
                            currentPlayers: secondInnings.currentPlayers,
                            battingStats: secondInnings.battingStats?.map(p => ({ ...p, name: p.playerName })), // Map playerName to name
                            bowlingStats: secondInnings.bowlingStats?.map(p => ({ ...p, name: p.playerName })), // Map playerName to name
                            lastSixBalls: secondInnings.ballHistory?.slice(-6) || []
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching match details:", error);
            }
        };

        fetchMatchDetails();
    }, [id]);

    if (!isMounted || !matchData) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Loading match details...</p>
            </div>
        );
    }

    const displayMatchType = (matchData.matchType === 'Limited Overs' && !matchData.tournamentId)
        ? 'Box/Turf Cricket'
        : (matchData.matchType || 'Box/Turf Cricket');

    const isCompleted = matchData.status === 'completed';
    const result = matchData.result;

    const handleShare = async () => {
        if (!printRef.current || isSharing) return;
        setIsSharing(true);

        const toastId = toast.loading('Generating Match Summary PDF...', { duration: 10000 });
        const url = window.location.href;
        const _teamA = matchData.battingTeam?.name || 'Team 1';
        const _teamB = matchData.bowlingTeam?.name || 'Team 2';
        const title = `CricVerse Match: ${_teamA} vs ${_teamB}`;
        const text = `Check out the match summary for ${_teamA} vs ${_teamB} on CricVerse!`;

        try {
            const element = printRef.current;
            
            // Generate canvas from the print-only wrapper using html-to-image
            // We need to briefly make it visible, but html-to-image doesn't have an `onclone` that works identically 
            // for display:none. So we briefly make it visible on the actual DOM (offscreen) or just unhide it 
            // via a style override.
            const originalDisplay = element.style.display;
            const originalPosition = element.style.position;
            const originalLeft = element.style.left;
            const originalTop = element.style.top;
            const originalWidth = element.style.width;
            const originalHeight = element.style.height;
            const originalZIndex = element.style.zIndex;
            
            // Move safely into the viewport so the browser's paint engine doesn't cull it,
            // but keep it visually hidden behind the app background using a negative z-index.
            element.style.setProperty('display', 'block', 'important');
            element.style.position = 'fixed'; // Fixed keeps it strictly in the viewport regardless of scroll
            element.style.left = '0px'; 
            element.style.top = '0px';
            element.style.zIndex = '-9999';
            element.style.width = '794px'; // ~A4 width at 96 DPI to prevent squishing
            
            // Force layout flush so width/height are computed before toPng
            const elHeight = element.offsetHeight;
            const elWidth = element.offsetWidth;
            
            // Provide a tiny delay to allow internal lazy-loaded images or styles to settle
            await new Promise(r => setTimeout(r, 150));

            // Race condition: Timeout after 8 seconds so user isn't stuck loading forever
            let dataUrl = await Promise.race([
                toPng(element, { 
                    quality: 1.0,
                    pixelRatio: 2,
                    backgroundColor: '#ffffff',
                    cacheBust: true, // Bypass cached CORS failures
                    useCORS: true,
                    style: { margin: '0' },
                    // html-to-image can fail on external SVGs or strict CORS images, we catch them:
                    filter: (node) => {
                        // Optional: skip nodes that might crash it, but usually useCORS handles it.
                        return true;
                    }
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('PDF generation timed out waiting for external resources (like logos).')), 8000))
            ]);

            // Restore original styles
            if (originalDisplay) {
                element.style.display = originalDisplay;
            } else {
                element.style.removeProperty('display');
            }
            element.style.position = originalPosition;
            element.style.left = originalLeft;
            element.style.top = originalTop;
            element.style.width = originalWidth;
            element.style.height = originalHeight;
            element.style.zIndex = originalZIndex;

            if (!dataUrl || dataUrl === 'data:,') {
                throw new Error(`html-to-image failed to generate a valid image. (Dimensions: ${elWidth}x${elHeight})`);
            }

            // Accurately measure the image dimensions from the dataUrl
            const imgProps = await new Promise((resolve, reject) => {
                const img = new window.Image();
                img.onload = () => resolve({ w: img.width, h: img.height });
                img.onerror = () => reject(new Error(`Failed to load generated PDF image (URL length: ${dataUrl.length}). Dimensions were ${elWidth}x${elHeight}.`));
                img.src = dataUrl;
            });

            // Create PDF based on A4 dimensions
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            // Calculate height keeping aspect ratio using true image dimensions
            const imgHeight = (imgProps.h * pdfWidth) / imgProps.w;
            
            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, imgHeight);

            // Get Blob and create File object
            const pdfBlob = pdf.output('blob');
            const pdfFile = new File([pdfBlob], `CricVerse_${_teamA}_vs_${_teamB}.pdf`, { type: 'application/pdf' });

            // Check if share is supported and specifically sharing files is supported
            if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
                await navigator.share({
                    files: [pdfFile],
                    title,
                    text
                });
                toast.success('Shared successfully!', { id: toastId });
            } else {
                // Fallback: Download the PDF and copy the link text
                pdf.save(`CricVerse_${_teamA}_vs_${_teamB}.pdf`);
                await navigator.clipboard.writeText(`${text}\n\n${url}`);
                toast.success('PDF Downloaded & link copied to clipboard!', { id: toastId });
            }
        } catch (error) {
            console.error('Error generating or sharing PDF:', error);
            if (error.name !== 'AbortError') {
                toast.error('Failed to generate or share PDF.', { id: toastId });
            } else {
                toast.dismiss(toastId);
            }
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* ── PRINT-ONLY DOCUMENT ── rendered in DOM, visible only when printing ── */}
            <div ref={printRef} className="print-only" style={{ padding: '14mm 16mm', boxSizing: 'border-box', background: '#ffffff' }}>
            {/* =========================================================
                PRINT / PDF STYLES  — hidden on screen, active on print
            ========================================================= */}
            

                {/* Branded header */}
                <div className="print-header">
                    <div className="print-header-logo">
                        <div className="print-header-badge">
                            <img src="/logo.jpg" alt="CricVerse" className="h-full w-full object-cover" />
                        </div>
                        <div>
                            <div className="print-header-wordmark">Cric<span>Verse</span></div>
                            <div className="print-header-tag">Match Report</div>
                        </div>
                    </div>
                    <div className="print-header-meta">
                        <p><strong>Match Summary</strong></p>
                        <p>{matchData.matchType || 'T20'} &middot; {matchData.overs || 20} overs &middot; {isCompleted ? 'Completed' : 'In Progress'}</p>
                        <p>Printed {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                </div>

                {/* Result banner */}
                {isCompleted && result && (
                    <div className="print-result-banner">
                        <h2>{result.winnerName ? 'Match Complete' : 'Match Tied'}</h2>
                        <p>{result.winnerName ? `${result.winnerName} won by ${result.margin}` : 'The match ended in a tie'}</p>
                    </div>
                )}

                {/* Match info 4-cell grid */}
                <div className="print-info-grid">
                    <div className="print-info-cell">
                        <div className="print-info-label">Teams</div>
                        <div className="print-info-value">{matchData.battingTeam?.name || 'Team 1'} vs {matchData.bowlingTeam?.name || 'Team 2'}</div>
                    </div>
                    <div className="print-info-cell">
                        <div className="print-info-label">Format</div>
                        <div className="print-info-value">{displayMatchType} · {matchData.totalOvers || matchData.overs || 20} overs</div>
                    </div>
                    <div className="print-info-cell">
                        <div className="print-info-label">Venue</div>
                        <div className="print-info-value">{matchData.venue || matchData.battingTeam?.homeGround || matchData.bowlingTeam?.homeGround || 'Cricket Ground'}</div>
                    </div>
                    <div className="print-info-cell">
                        <div className="print-info-label">Toss</div>
                        <div className="print-info-value">{matchData.toss?.winner || '—'} · {matchData.toss?.decision?.type || matchData.toss?.decision || '—'}</div>
                    </div>
                </div>

                {/* Innings scorecards side-by-side */}
                <div className="print-innings-wrapper">
                    {[firstInningsScore, secondInningsScore].map((inning, idx) => (
                        inning && (
                            <div key={idx} className="print-innings-block">
                                <div className="print-innings-header">
                                    <h3>{inning.battingTeam || (idx === 0 ? matchData.battingTeam?.name : matchData.bowlingTeam?.name) || `Innings ${idx + 1}`}</h3>
                                    <div>
                                        <span className="score">{inning.runs}/{inning.wickets}</span>
                                        <span className="rr"> ({inning.overs} ov)</span>
                                    </div>
                                </div>

                                <div className="print-innings-section-title">Batting</div>
                                <table className="print-table">
                                    <thead>
                                        <tr>
                                            <th>Batter</th>
                                            <th className="right">R</th>
                                            <th className="right">B</th>
                                            <th className="right">4s</th>
                                            <th className="right">6s</th>
                                            <th className="right">SR</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inning.battingStats && Object.values(inning.battingStats)
                                            .filter(b => b.balls > 0 || b.isOut || (inning.currentPlayers && (inning.currentPlayers.striker?.playerId === b.playerId || inning.currentPlayers.nonStriker?.playerId === b.playerId)))
                                            .map((b, i) => (
                                                <tr key={i}>
                                                    <td className="bold">{b.name}</td>
                                                    <td className="right bold">{b.runs}</td>
                                                    <td className="right">{b.balls}</td>
                                                    <td className="right">{b.fours ?? '—'}</td>
                                                    <td className="right">{b.sixes ?? '—'}</td>
                                                    <td className="right">{b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0'}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>

                                <div className="print-innings-section-title" style={{ marginTop: '4px' }}>Bowling</div>
                                <table className="print-table">
                                    <thead>
                                        <tr>
                                            <th>Bowler</th>
                                            <th className="right">O</th>
                                            <th className="right">R</th>
                                            <th className="right">W</th>
                                            <th className="right">ECO</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inning.bowlingStats && Object.values(inning.bowlingStats)
                                            .filter(b => b.overs > 0)
                                            .map((b, i) => (
                                                <tr key={i}>
                                                    <td className="bold">{b.name}</td>
                                                    <td className="right">{b.overs}</td>
                                                    <td className="right">{b.runs}</td>
                                                    <td className="right bold">{b.wickets}</td>
                                                    <td className="right">{b.overs > 0 ? (b.runs / (Math.floor(b.overs) + (b.overs % 1) * 10 / 6)).toFixed(1) : '0.0'}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    ))}
                </div>

                {/* Teams */}
                <div className="print-teams-grid">
                    {[matchData.battingTeam, matchData.bowlingTeam].map((team, i) => team && (
                        <div key={i} className="print-team-card flex items-center gap-4">
                            {team.logoUrl && (
                                <div className="h-10 w-10 rounded-md overflow-hidden bg-muted flex items-center justify-center shrink-0 border border-gray-100">
                                    <img src={team.logoUrl} alt={team.name} className="h-full w-full object-cover" />
                                </div>
                            )}
                            <div>
                                <h4>{team.name}</h4>
                                <p>{team.players?.length || 0} players registered{team.homeGround ? ` · Home: ${team.homeGround}` : ''}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="print-footer">
                    <span>Generated by <strong>CricVerse</strong> — Your Cricket Empire</span>
                    <span>cricverse.app</span>
                </div>
            </div>
            <div className="screen-only max-w-6xl mx-auto pt-2 pb-8 px-4 sm:px-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-full no-print"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl font-black">Match Details</h1>
                        <p className="text-sm text-muted-foreground">
                            {displayMatchType} • {matchData.totalOvers || matchData.overs || 20} Overs
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleShare}
                            disabled={isSharing}
                            className="no-print flex items-center gap-2"
                        >
                            <Share2 className="h-4 w-4" />
                            {isSharing ? 'Generating...' : 'Share PDF'}
                        </Button>
                        {/* <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.print()}
                            className="no-print flex items-center gap-2"
                        >
                            <Printer className="h-4 w-4" />
                            Print Summary
                        </Button> */}
                    </div>
                </div>

                {/* Match Status Banner */}
                {isCompleted && result && (
                    <Card className="mb-6 border-2 border-primary/20 bg-primary/5">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <Trophy className="h-8 w-8 text-primary" />
                                <h2 className="text-2xl sm:text-3xl font-black text-center">
                                    {result.winnerName ? 'Match Complete!' : 'Match Tied!'}
                                </h2>
                            </div>
                            <p className="text-center text-lg sm:text-xl font-semibold text-primary">
                                {result.winnerName ? `${result.winnerName} won by ${result.margin}` : 'Match Tied'}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Match Info Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Match Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Teams</p>
                                    <p className="font-semibold">
                                        {matchData.battingTeam?.name || 'Team 1'} vs {matchData.bowlingTeam?.name || 'Team 2'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Target className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Match Type</p>
                                    <p className="font-semibold">{displayMatchType}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Venue</p>
                                    <p className="font-semibold">
                                        {matchData.venue || matchData.battingTeam?.homeGround || matchData.bowlingTeam?.homeGround || 'Cricket Stadium'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Overs</p>
                                    <p className="font-semibold">{matchData.totalOvers || matchData.overs || 20} overs per side</p>
                                </div>
                            </div>
                        </div>
                        <div className="pt-4 border-t">
                            <Badge variant={isCompleted ? "default" : "secondary"} className="text-sm">
                                {isCompleted ? "Completed" : "In Progress"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Scorecard */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Scorecard</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="innings1" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="innings1">
                                    {firstInningsScore?.battingTeam || matchData.battingTeam?.name || 'First Innings'}
                                </TabsTrigger>
                                <TabsTrigger value="innings2" disabled={!secondInningsScore}>
                                    {secondInningsScore?.battingTeam || matchData.bowlingTeam?.name || 'Second Innings'}
                                </TabsTrigger>
                            </TabsList>

                            {/* Innings Content Helper */}
                            {[
                                { value: "innings1", score: firstInningsScore, target: isCompleted ? firstInningsScore?.runs + 1 : null, title: "Target Set" },
                                { value: "innings2", score: secondInningsScore, target: firstInningsScore?.runs + 1, title: "Target" }
                            ].map((inning) => (
                                <TabsContent key={inning.value} value={inning.value} className="space-y-6 mt-4">
                                    {inning.score ? (
                                        <>
                                            {/* Innings Summary */}
                                            <div className="bg-muted/30 rounded-lg p-6 text-center border-2 border-muted">
                                                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                                                    {inning.score.battingTeam}
                                                </h3>
                                                <div className="text-5xl font-black mb-2">
                                                    {inning.score.runs}/{inning.score.wickets}
                                                </div>
                                                <div className="flex justify-center gap-4 text-muted-foreground">
                                                    <span>{inning.score.overs} overs</span>
                                                    <span>•</span>
                                                    <span>RR: {inning.score.overs > 0 ? (inning.score.runs / inning.score.overs).toFixed(2) : '0.00'}</span>
                                                </div>
                                                {inning.target && (
                                                    <div className="mt-4 pt-4 border-t border-muted/20">
                                                        <p className="text-sm text-muted-foreground">{inning.title}</p>
                                                        <p className="text-xl font-bold text-primary">
                                                            {inning.target}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Last 6 Balls */}
                                            {inning.score.lastSixBalls && inning.score.lastSixBalls.length > 0 && (
                                                <div>
                                                    <h3 className="font-bold text-lg mb-3">Last 6 Balls</h3>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {inning.score.lastSixBalls.map((ball, index) => (
                                                            <div
                                                                key={index}
                                                                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${ball.isWicket
                                                                    ? 'bg-red-500 text-white'
                                                                    : ball.isWide || ball.isNoBall
                                                                        ? 'bg-yellow-500 text-white'
                                                                        : ball.runs === 6
                                                                            ? 'bg-purple-500 text-white'
                                                                            : ball.runs === 4
                                                                                ? 'bg-blue-500 text-white'
                                                                                : 'bg-gray-200 text-gray-800'
                                                                    }`}
                                                            >
                                                                {ball.isWicket ? 'W' : ball.isWide ? `${ball.runs}WD` : ball.isNoBall ? `${ball.runs}NB` : ball.runs}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Batting Stats */}
                                            <div>
                                                <h3 className="font-bold text-lg mb-3">Batting</h3>
                                                <Card>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Batter</TableHead>
                                                                <TableHead className="text-right">R</TableHead>
                                                                <TableHead className="text-right">B</TableHead>
                                                                <TableHead className="text-right hidden sm:table-cell">4s</TableHead>
                                                                <TableHead className="text-right hidden sm:table-cell">6s</TableHead>
                                                                <TableHead className="text-right hidden sm:table-cell">SR</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {inning.score.battingStats && Object.values(inning.score.battingStats)
                                                                .filter(batter => batter.balls > 0 || batter.isOut || (inning.score.currentPlayers && (inning.score.currentPlayers.striker?.playerId === batter.playerId || inning.score.currentPlayers.nonStriker?.playerId === batter.playerId))) // Show active batsmen
                                                                .map((batter) => (
                                                                    <TableRow key={batter.name}>
                                                                        <TableCell className="font-medium">{batter.name}</TableCell>
                                                                        <TableCell className="text-right font-bold">{batter.runs}</TableCell>
                                                                        <TableCell className="text-right">{batter.balls}</TableCell>
                                                                        <TableCell className="text-right hidden sm:table-cell">{batter.fours || 0}</TableCell>
                                                                        <TableCell className="text-right hidden sm:table-cell">{batter.sixes || 0}</TableCell>
                                                                        <TableCell className="text-right hidden sm:table-cell">
                                                                            {batter.balls > 0 ? ((batter.runs / batter.balls) * 100).toFixed(1) : '0.0'}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                        </TableBody>
                                                    </Table>
                                                </Card>
                                            </div>

                                            {/* Bowling Stats */}
                                            <div>
                                                <h3 className="font-bold text-lg mb-3">Bowling</h3>
                                                <Card>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Bowler</TableHead>
                                                                <TableHead className="text-right">O</TableHead>
                                                                <TableHead className="text-right">R</TableHead>
                                                                <TableHead className="text-right">W</TableHead>
                                                                <TableHead className="text-right hidden sm:table-cell">ECO</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {inning.score.bowlingStats && Object.values(inning.score.bowlingStats)
                                                                .filter(bowler => bowler.overs > 0) // Only show bowlers who have bowled
                                                                .map((bowler) => (
                                                                    <TableRow key={bowler.name}>
                                                                        <TableCell className="font-medium">{bowler.name}</TableCell>
                                                                        <TableCell className="text-right">{bowler.overs}</TableCell>
                                                                        <TableCell className="text-right">{bowler.runs}</TableCell>
                                                                        <TableCell className="text-right font-bold">{bowler.wickets}</TableCell>
                                                                        <TableCell className="text-right hidden sm:table-cell">
                                                                            {bowler.overs > 0
                                                                                ? (bowler.runs / (Math.floor(bowler.overs) + (bowler.overs % 1) * 10 / 6)).toFixed(1)
                                                                                : '0.0'}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                        </TableBody>
                                                    </Table>
                                                </Card>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                            {inning.value === "innings1" ? "First innings data unavailable" : "Second innings not started yet"}
                                        </div>
                                    )}
                                </TabsContent>
                            ))}
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Teams Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Batting Team */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-3">
                                {matchData.battingTeam?.logoUrl ? (
                                    <div className="h-8 w-8 rounded-md overflow-hidden bg-muted flex items-center justify-center border border-border/50 shrink-0">
                                        <img src={matchData.battingTeam.logoUrl} alt={matchData.battingTeam.name} className="h-full w-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                                        {matchData.battingTeam?.name?.charAt(0).toUpperCase() || 'A'}
                                    </div>
                                )}
                                {matchData.battingTeam?.name || 'Team 1'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Players: {matchData.battingTeam?.players?.length || 0}</p>
                                {matchData.battingTeam?.homeGround && (
                                    <p className="text-sm text-muted-foreground">
                                        Home Ground: {matchData.battingTeam.homeGround}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bowling Team */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-3">
                                {matchData.bowlingTeam?.logoUrl ? (
                                    <div className="h-8 w-8 rounded-md overflow-hidden bg-muted flex items-center justify-center border border-border/50 shrink-0">
                                        <img src={matchData.bowlingTeam.logoUrl} alt={matchData.bowlingTeam.name} className="h-full w-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                                        {matchData.bowlingTeam?.name?.charAt(0).toUpperCase() || 'B'}
                                    </div>
                                )}
                                {matchData.bowlingTeam?.name || 'Team 2'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Players: {matchData.bowlingTeam?.players?.length || 0}</p>
                                {matchData.bowlingTeam?.homeGround && (
                                    <p className="text-sm text-muted-foreground">
                                        Home Ground: {matchData.bowlingTeam.homeGround}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 no-print">
                    {/* Hide this button when match is completed — gate on both status field and result object */}
                    {!isCompleted && !matchData.result && currentUser && currentUser.id === matchData.createdBy && (
                        <Button
                            className="flex-1"
                            onClick={() => {
                                // If first innings hasn't started, go to toss selection if needed, otherwise player selection
                                if (!firstInningsScore) {
                                    if (!matchData.toss?.winner) {
                                        router.push(`/matches/${id}/toss`);
                                    } else {
                                        router.push(`/matches/${id}/start-innings`);
                                    }
                                }
                                // If first innings is complete but second hasn't started, go to player selection for second innings
                                else if (firstInningsScore && !secondInningsScore) {
                                    router.push(`/matches/${id}/start-innings?innings=2`);
                                }
                                // If second innings has started, continue scoring
                                else if (secondInningsScore) {
                                    router.push(`/matches/${id}/score?innings=2`);
                                }
                            }}
                        >
                            {secondInningsScore ? 'Continue Match' : firstInningsScore ? 'Start Second Innings' : 'Start Match'}
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => matchData.tournamentId ? router.push(`/tournaments/${matchData.tournamentId}`) : router.push('/matches')}
                    >
                        {matchData.tournamentId ? 'Back to Tournament' : 'Back to Matches'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
