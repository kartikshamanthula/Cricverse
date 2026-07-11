"use client"

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Circle, Zap, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function MatchScorePage() {
    const params = useParams();
    const id = params?.id;
    const searchParams = useSearchParams();
    const [matchData, setMatchData] = useState(null);
    const [selectedPlayers, setSelectedPlayers] = useState(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);



    // Load match data and selected players
    useEffect(() => {
        // Get match ID from params
        const matchId = id;

        // Load match data from API
        const fetchMatchData = async () => {
            try {
                const res = await fetch(`/api/matches/${matchId}`);
                if (!res.ok) throw new Error("Failed to fetch match");
                const data = await res.json();

                // Map DB teams to frontend structure (if needed)
                // DB: teamA: { teamId: {_id, players...}, name... }
                // Frontend expects: battingTeam: { name, players... }

                // Helper to format team
                const formatTeam = (teamRef) => ({
                    name: teamRef.name,
                    players: teamRef.teamId?.players?.map(p => ({
                        id: p._id || p.id,
                        name: p.name,
                        role: p.role
                    })) || [],
                    id: teamRef.teamId?._id,
                    logoUrl: teamRef.teamId?.logoUrl
                });

                let formattedMatch = {
                    ...data,
                    battingTeam: formatTeam(data.teamA), // Default, will swap if needed
                    bowlingTeam: formatTeam(data.teamB)
                };

                // Determine batting/bowling based on toss
                // If toss winner decided to bat
                const tossWinner = data.toss?.winner;
                const decision = data.toss?.decision?.type || data.toss?.decision;
                const isTeamA = tossWinner === data.teamA.name;

                if (decision === 'bat') {
                    formattedMatch.battingTeam = isTeamA ? formatTeam(data.teamA) : formatTeam(data.teamB);
                    formattedMatch.bowlingTeam = isTeamA ? formatTeam(data.teamB) : formatTeam(data.teamA);
                } else {
                    formattedMatch.battingTeam = isTeamA ? formatTeam(data.teamB) : formatTeam(data.teamA);
                    formattedMatch.bowlingTeam = isTeamA ? formatTeam(data.teamA) : formatTeam(data.teamB);
                }

                // Check for second innings param and swap if needed
                const inningsParam = searchParams.get('innings');
                if (inningsParam === '2') {
                    const temp = formattedMatch.battingTeam;
                    formattedMatch.battingTeam = formattedMatch.bowlingTeam;
                    formattedMatch.bowlingTeam = temp;
                }

                setMatchData(formattedMatch);

                // Load existing innings state if available
                const currentInningsNum = inningsParam === '2' ? 2 : 1;
                const savedInnings = data.innings?.find(i => i.inningsNumber === currentInningsNum);

                if (savedInnings) {
                    setScore(savedInnings.score);

                    // Restore stats
                    // DB array -> Client Object
                    const restoredBatsmanStats = {};
                    savedInnings.battingStats?.forEach(p => {
                        restoredBatsmanStats[p.playerId] = {
                            id: p.playerId,
                            name: p.playerName,
                            runs: p.runs,
                            balls: p.balls,
                            fours: p.fours,
                            sixes: p.sixes
                        };
                    });
                    setBatsmanStats(restoredBatsmanStats);

                    // Restore dismissed batsmen from isOut flags
                    const dismissed = savedInnings.battingStats
                        ?.filter(p => p.isOut)
                        .map(p => p.playerId) || [];
                    if (dismissed.length > 0) {
                        setDismissedBatsmen(dismissed);
                    }

                    const restoredBowlerStats = {};
                    savedInnings.bowlingStats?.forEach(p => {
                        restoredBowlerStats[p.playerId] = {
                            name: p.playerName,
                            overs: p.overs,
                            runs: p.runs,
                            wickets: p.wickets
                        };
                    });
                    setBowlerStats(restoredBowlerStats);

                    // Restore current striker/non-striker/bowler from saved innings data
                    // This handles the case where user navigates away and returns (URL params are lost)
                    const cp = savedInnings.currentPlayers;
                    const urlStriker = searchParams.get('striker');
                    const urlNonStriker = searchParams.get('nonStriker');
                    const urlBowler = searchParams.get('bowler');

                    // Only restore from DB if URL params are absent (user returned to page without params)
                    if (!urlStriker && !urlNonStriker && cp) {
                        if (cp.striker?.playerId) setStrikerId(cp.striker.playerId);
                        if (cp.nonStriker?.playerId) setNonStrikerId(cp.nonStriker.playerId);
                    }

                    if (!urlBowler && cp?.bowler?.playerId) {
                        setCurrentBowlerId(cp.bowler.playerId);
                        setBowler({
                            name: cp.bowler.playerName || cp.bowler.name || 'Bowler',
                            overs: cp.bowler.overs || 0,
                            runs: cp.bowler.runs || 0,
                            wickets: cp.bowler.wickets || 0
                        });
                    }
                }

                // Load first innings score if we're in second innings
                if (currentInningsNum === 2) {
                    const firstInnings = data.innings?.find(i => i.inningsNumber === 1);
                    if (firstInnings && firstInnings.score) {
                        setFirstInningsScore(firstInnings.score);
                    }
                }

            } catch (error) {
                console.error("Error loading match:", error);
                toast.error("Failed to load match data");
            }
        };

        if (matchId) {
            fetchMatchData();
        }

        // Get selected players from URL parameters
        const strikerId = searchParams.get('striker');
        const nonStrikerId = searchParams.get('nonStriker');
        const bowlerId = searchParams.get('bowler');

        setSelectedPlayers({
            strikerId,
            nonStrikerId,
            bowlerId
        });
    }, [id, searchParams]);

    // Get actual player data
    const getPlayerById = (playerId, team) => {
        if (!matchData || !playerId) return null;
        return team?.players?.find(p => p.id === playerId);
    };

    const strikerPlayer = getPlayerById(selectedPlayers?.strikerId, matchData?.battingTeam);
    const nonStrikerPlayer = getPlayerById(selectedPlayers?.nonStrikerId, matchData?.battingTeam);
    const bowlerPlayer = getPlayerById(selectedPlayers?.bowlerId, matchData?.bowlingTeam);

    // State
    const [score, setScore] = useState({ runs: 0, wickets: 0, overs: 0.0 });

    // Track which batsman is on strike by ID
    // Initialize with null to avoid hydration mismatch, set in useEffect
    const [strikerId, setStrikerId] = useState(null);
    const [nonStrikerId, setNonStrikerId] = useState(null);

    // Track all batsman stats by ID
    const [batsmanStats, setBatsmanStats] = useState({});

    // Track current bowler by ID to avoid stale reference issues
    const [currentBowlerId, setCurrentBowlerId] = useState(null);

    const [bowler, setBowler] = useState({
        name: "Bowler",
        overs: 0.0,
        runs: 0,
        wickets: 0
    });
    const [showBowlerDialog, setShowBowlerDialog] = useState(false);
    const [showBatsmanDialog, setShowBatsmanDialog] = useState(false);
    const [lastSixBalls, setLastSixBalls] = useState([]);
    const [history, setHistory] = useState([]); // For undo functionality
    const [previousBowlerId, setPreviousBowlerId] = useState(null); // Track the bowler who just completed an over
    const [bowlerStats, setBowlerStats] = useState({}); // Track cumulative stats for all bowlers
    const [dismissedBatsmen, setDismissedBatsmen] = useState([]); // Track batsmen who are out

    // Innings completion state
    const [maxOvers, setMaxOvers] = useState(0); // Default to 0, will be set from matchData
    const [inningsComplete, setInningsComplete] = useState(false);
    const [showInningsEndDialog, setShowInningsEndDialog] = useState(false);

    // Match completion state
    const [currentInnings, setCurrentInnings] = useState(null); // Track which innings (1 or 2), null initially to prevent hydration mismatch
    const [firstInningsScore, setFirstInningsScore] = useState(null); // Store first innings result
    const [matchComplete, setMatchComplete] = useState(false);
    const [showMatchResultDialog, setShowMatchResultDialog] = useState(false);
    const [matchResult, setMatchResult] = useState(null);

    // No Ball Handling State
    const [showNoBallDialog, setShowNoBallDialog] = useState(false);

    // Initialize IDs from selectedPlayers on client side only
    useEffect(() => {
        if (selectedPlayers && !strikerId && !nonStrikerId) {
            setStrikerId(selectedPlayers.strikerId);
            setNonStrikerId(selectedPlayers.nonStrikerId);
        }
    }, [selectedPlayers, strikerId, nonStrikerId]);

    // Initialize batsman stats when data loads
    useEffect(() => {
        if (matchData?.battingTeam?.players && Object.keys(batsmanStats).length === 0) {
            const initialStats = {};
            matchData.battingTeam.players.forEach(player => {
                initialStats[player.id] = {
                    id: player.id,
                    name: player.name,
                    runs: 0,
                    balls: 0,
                    fours: 0,
                    sixes: 0
                };
            });
            setBatsmanStats(initialStats);
        }

        // Initialize bowler from URL params only once
        if (bowlerPlayer && !currentBowlerId) {
            setBowler({
                name: bowlerPlayer.name,
                overs: 0.0,
                runs: 0,
                wickets: 0
            });
            setCurrentBowlerId(bowlerPlayer.id);
        }

        // Initialize bowler stats for all bowlers using player IDs as keys
        if (matchData?.bowlingTeam?.players && Object.keys(bowlerStats).length === 0) {
            const initialStats = {};
            matchData.bowlingTeam.players.forEach(player => {
                initialStats[player.id] = {
                    name: player.name,
                    overs: 0.0,
                    runs: 0,
                    wickets: 0
                };
            });
            setBowlerStats(initialStats);
        }

        // Set maxOvers from matchData
        if (matchData?.totalOvers || matchData?.overs) {
            setMaxOvers(parseInt(matchData.totalOvers || matchData.overs));
        }

        // Detect current innings from URL (client-side only)
        const innings = searchParams.get('innings');
        setCurrentInnings(innings === '2' ? 2 : 1);

        // Load first innings score if in second innings
        if (innings === '2') {
            const storedFirstInnings = localStorage.getItem(`match_${id}_innings1`);
            if (storedFirstInnings) {
                setFirstInningsScore(JSON.parse(storedFirstInnings));
            }
        }
    }, [matchData, batsmanStats, bowlerStats, bowlerPlayer, currentBowlerId, id, searchParams]);

    const saveToApi = useCallback(async () => {
        if (!id || !currentInnings || !matchData) return;
        
        // Prevent auto-save from overwriting a completed match status
        if (matchComplete || showMatchResultDialog) return;

        // Construct DB Schema compatible innings object
        const battingStatsArray = Object.values(batsmanStats).map(p => ({
            playerId: p.id,
            playerName: p.name,
            runs: p.runs,
            balls: p.balls,
            fours: p.fours || 0,
            sixes: p.sixes || 0,
            isOut: dismissedBatsmen.includes(p.id)
        }));

        const bowlingStatsArray = Object.entries(bowlerStats).map(([pid, p]) => ({
            playerId: pid,
            playerName: p.name,
            overs: p.overs,
            runs: p.runs,
            wickets: p.wickets
        }));

        const currentPlayersData = {
            striker: battingStatsArray.find(b => b.playerId === strikerId),
            nonStriker: battingStatsArray.find(b => b.playerId === nonStrikerId),
            bowler: bowlingStatsArray.find(b => b.playerId === currentBowlerId)
        };

        const inningsData = {
            inningsNumber: currentInnings,
            battingTeam: matchData.battingTeam.name,
            bowlingTeam: matchData.bowlingTeam.name,
            score: score,
            battingStats: battingStatsArray,
            bowlingStats: bowlingStatsArray,
            currentPlayers: currentPlayersData
        };

        try {
            // We need to UPDATE the innings array. 
            // Better to fetch current match, update array, and save? 
            // Or send a specialized PUT.
            // Let's assume PUT /api/matches/[id] merges or we rely on full replace.
            // Ideally we need an endpoint to update JUST one innings.
            // For now, I'll send the innings object and let backend handle it?
            // "PUT /api/matches/[id]" updates the MATCH document.
            // If I send { innings: [...] }, I overwrite.
            // I need to preserve other innings.

            // To be safe: I will read matchData.innings from state (which should remain up to date if we re-fetch, but we don't re-fetch often)
            // Actually, we loaded matchData on mount.
            // We can construct the new innings array.

            const existingInnings = matchData.innings || [];
            const otherInnings = existingInnings.filter(i => i.inningsNumber !== currentInnings);
            const newInningsArray = [...otherInnings, inningsData].sort((a, b) => a.inningsNumber - b.inningsNumber);

            await fetch(`/api/matches/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ innings: newInningsArray, status: 'live' })
            });

        } catch (error) {
            console.error("Error saving match:", error);
        }

    }, [id, currentInnings, matchData, score, batsmanStats, bowlerStats, matchComplete, showMatchResultDialog]);

    useEffect(() => {
        const timer = setTimeout(() => {
            saveToApi();
        }, 2000); // Debounce 2s
        return () => clearTimeout(timer);
    }, [saveToApi, score]); // Trigger save when score changes

    // Get current striker and non-striker stats
    const striker = batsmanStats[strikerId] || { name: "Striker", runs: 0, balls: 0 };
    const nonStriker = batsmanStats[nonStrikerId] || { name: "Non-Striker", runs: 0, balls: 0 };

    // Available bowlers from bowling team
    const availableBowlers = matchData?.bowlingTeam?.players?.map((player, index) => ({
        id: player.id || index,
        name: player.name,
        overs: bowlerStats[player.id]?.overs || 0.0,
        runs: bowlerStats[player.id]?.runs || 0,
        wickets: bowlerStats[player.id]?.wickets || 0
    })) || [];

    // Available batsmen from batting team (excluding current batsmen and dismissed batsmen)
    const availableBatsmen = matchData?.battingTeam?.players?.filter(player =>
        player.id !== strikerId &&
        player.id !== nonStrikerId &&
        !dismissedBatsmen.includes(player.id)
    ).map((player) => ({
        id: player.id,
        name: player.name,
        runs: batsmanStats[player.id]?.runs || 0,
        balls: batsmanStats[player.id]?.balls || 0
    })) || [];

    // Mock Graph Data
    const runData = [
        { over: 0, TeamA: 0, TeamB: 0 },
        { over: 5, TeamA: 45, TeamB: 40 },
        { over: 10, TeamA: 85, TeamB: 78 },
        { over: 15, TeamA: score.runs, TeamB: null },
    ];

    // Helper function to properly increment overs (6 balls per over)
    const incrementOvers = (currentOvers) => {
        const overs = Math.floor(currentOvers);
        const balls = Math.round((currentOvers - overs) * 10);

        if (balls >= 5) {
            // After 6th ball (0-5), move to next over
            return overs + 1;
        } else {
            // Increment ball count
            return Number((overs + (balls + 1) / 10).toFixed(1));
        }
    };

    // Check if team is all out
    const checkAllOut = (currentWickets) => {
        const totalPlayers = matchData?.battingTeam?.players?.length || 11;
        // Team is all out when wickets = total players - 1 (need at least 2 batsmen)
        return currentWickets >= (totalPlayers - 1);
    };

    // Check if target is achieved (second innings only)
    const checkTargetAchieved = (currentRuns) => {
        if (currentInnings === 2 && firstInningsScore) {
            const target = firstInningsScore.runs + 1;
            return currentRuns >= target;
        }
        return false;
    };

    // Calculate match result
    const calculateMatchResult = (secondInningsScore) => {
        if (!firstInningsScore) return null;

        const target = firstInningsScore.runs + 1;
        const chasingTeam = matchData?.battingTeam?.name || "Team 2";
        const defendingTeam = matchData?.bowlingTeam?.name || "Team 1";

        if (secondInningsScore.runs >= target) {
            // Chasing team won
            const wicketsRemaining = (matchData?.battingTeam?.players?.length || 11) - 1 - secondInningsScore.wickets;
            return {
                winner: matchData?.battingTeam?.id, // Team ID
                winnerName: chasingTeam,
                margin: `${wicketsRemaining} wicket${wicketsRemaining !== 1 ? 's' : ''}`,
                chasingScore: secondInningsScore,
                defendingScore: firstInningsScore
            };
        } else if (secondInningsScore.runs === firstInningsScore.runs) {
            // Match tied
            return {
                winner: null,
                winnerName: null,
                margin: "Tie",
                chasingScore: secondInningsScore,
                defendingScore: firstInningsScore
            };
        } else {
            // Defending team won
            const runMargin = firstInningsScore.runs - secondInningsScore.runs;
            return {
                winner: matchData?.bowlingTeam?.id, // Team ID
                winnerName: defendingTeam,
                margin: `${runMargin} run${runMargin !== 1 ? 's' : ''}`,
                chasingScore: secondInningsScore,
                defendingScore: firstInningsScore
            };
        }
    };

    // Check if innings is complete
    const checkInningsComplete = (currentOvers, currentWickets) => {
        const completedOvers = Math.floor(currentOvers);
        const balls = Math.round((currentOvers - completedOvers) * 10);

        // Innings complete when we reach maxOvers.0 (e.g., 6.0 for 6 overs) OR team is all out
        if ((completedOvers >= maxOvers && balls === 0) || checkAllOut(currentWickets)) {
            return true;
        }
        return false;
    };

    // Handle innings/match completion
    const handleInningsOrMatchComplete = async (currentScore, reason = "overs", finalBatsmanStats = batsmanStats, finalBowlerStats = bowlerStats) => {
        setInningsComplete(true);

        // Prepare data for final save
        const battingStatsArray = Object.values(finalBatsmanStats).map(p => ({
            playerId: p.id,
            playerName: p.name,
            runs: p.runs,
            balls: p.balls,
            fours: p.fours || 0,
            sixes: p.sixes || 0,
            isOut: dismissedBatsmen.includes(p.id)
        }));

        const bowlingStatsArray = Object.entries(finalBowlerStats).map(([pid, p]) => ({
            playerId: pid,
            playerName: p.name,
            overs: p.overs,
            runs: p.runs,
            wickets: p.wickets
        }));

        const currentPlayersData = {
            striker: battingStatsArray.find(b => b.playerId === strikerId),
            nonStriker: battingStatsArray.find(b => b.playerId === nonStrikerId),
            bowler: bowlingStatsArray.find(b => b.playerId === currentBowlerId)
        };

        const inningsData = {
            inningsNumber: currentInnings,
            battingTeam: matchData?.battingTeam?.name,
            bowlingTeam: matchData?.bowlingTeam?.name,
            score: currentScore,
            battingStats: battingStatsArray,
            bowlingStats: bowlingStatsArray,
            currentPlayers: currentPlayersData
        };

        const existingInnings = matchData.innings || [];
        const otherInnings = existingInnings.filter(i => i.inningsNumber !== currentInnings);
        const newInningsArray = [...otherInnings, inningsData].sort((a, b) => a.inningsNumber - b.inningsNumber);

        let updatePayload = { innings: newInningsArray };

        if (currentInnings === 1) {
            // First innings complete
            setShowInningsEndDialog(true);
            const message = reason === "allout" ? "All Out! Innings Complete!" : "Innings Complete!";
            toast.success(message, {
                position: 'bottom-center',
                duration: 3000,
                icon: '🎉'
            });
        } else {
            // Second innings complete
            const result = calculateMatchResult(currentScore);
            setMatchResult(result);
            setMatchComplete(true);
            setShowMatchResultDialog(true);

            updatePayload.status = 'completed';
            updatePayload.result = {
                winner: result.winner,
                winnerName: result.winnerName,
                margin: result.margin
            };

            toast.success("Match Complete!", {
                position: 'bottom-center',
                duration: 3000,
                icon: '🏆'
            });
        }

        // Save final state to API
        try {
            await fetch(`/api/matches/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload)
            });
        } catch (error) {
            console.error("Error saving final state:", error);
            toast.error("Failed to save match result");
        }
    };

    // Helper function to swap striker and non-striker
    const swapBatsmen = () => {
        // Capture current values from closure
        const tempStriker = striker;
        const tempNonStriker = nonStriker;

        // Swap using the captured values
        // React will batch these updates
        setStriker(tempNonStriker);
        setNonStriker(tempStriker);
    };

    // Helper function to save current state for undo
    const saveHistory = () => {
        setHistory(prev => [...prev, {
            score: { ...score },
            strikerId: strikerId,
            nonStrikerId: nonStrikerId,
            batsmanStats: JSON.parse(JSON.stringify(batsmanStats)),
            bowler: { ...bowler },
            lastSixBalls: [...lastSixBalls],
            bowlerStats: { ...bowlerStats },
            previousBowlerId: previousBowlerId,
            dismissedBatsmen: [...dismissedBatsmen]
        }]);
    };

    // Undo last ball
    const undoLastBall = () => {
        if (history.length === 0) {
            toast.error("No action to undo", {
                position: 'bottom-center',
                duration: 1500,
            });
            return;
        }

        const lastState = history[history.length - 1];
        setScore(lastState.score);
        setStrikerId(lastState.strikerId);
        setNonStrikerId(lastState.nonStrikerId);
        setBatsmanStats(lastState.batsmanStats);
        setBowler(lastState.bowler);
        setLastSixBalls(lastState.lastSixBalls);
        setBowlerStats(lastState.bowlerStats);
        setPreviousBowlerId(lastState.previousBowlerId);
        setDismissedBatsmen(lastState.dismissedBatsmen || []);
        setHistory(prev => prev.slice(0, -1));

        toast.success("Last ball undone", {
            position: 'bottom-center',
            duration: 1500,
        });
    };

    // Select new batsman after wicket
    const selectBatsman = (selectedBatsman) => {
        setStrikerId(selectedBatsman.id);
        setShowBatsmanDialog(false);
        toast.success(`${selectedBatsman.name} is now batting`, {
            position: 'bottom-center',
            duration: 2000,
        });
    };

    // Handle legal delivery (0, 1, 2, 3, 4, 6 runs)
    const handleLegalDelivery = (run) => {
        // Check if innings/match is already complete
        if (inningsComplete || matchComplete) {
            toast.error(currentInnings === 2 ? "Match is complete!" : "Innings is complete!", {
                position: 'bottom-center',
                duration: 2000,
            });
            return;
        }

        saveHistory(); // Save state for undo

        let message = `+${run} Run${run !== 1 ? 's' : ''}`;
        if (run === 4) message = "FOUR Runs!";
        if (run === 6) message = "SIX Runs!";

        toast.success(message, {
            position: 'bottom-center',
            duration: 1500,
            icon: '🏏'
        });

        const currentBalls = Math.round((score.overs - Math.floor(score.overs)) * 10);
        const isOverComplete = currentBalls === 5; // After this ball, over will be complete

        const newOvers = incrementOvers(score.overs);

        // Strike rotation logic: odd runs (1, 3, 5) or end of over
        const isOddRun = run % 2 === 1;
        const shouldChangeStrike = isOddRun || isOverComplete;

        // Update team score
        setScore(prev => ({
            ...prev,
            runs: prev.runs + run,
            overs: newOvers
        }));

        const currentStrikerId = strikerId;
        const newBatsmanStats = {
            ...batsmanStats,
            [currentStrikerId]: {
                ...batsmanStats[currentStrikerId],
                runs: (batsmanStats[currentStrikerId]?.runs || 0) + run,
                balls: (batsmanStats[currentStrikerId]?.balls || 0) + 1,
                fours: (batsmanStats[currentStrikerId]?.fours || 0) + (run === 4 ? 1 : 0),
                sixes: (batsmanStats[currentStrikerId]?.sixes || 0) + (run === 6 ? 1 : 0)
            }
        };

        const bowlerNewOvers = incrementOvers(bowler.overs);
        const newBowlerStats = {
            ...bowlerStats,
            [currentBowlerId]: {
                name: bowlerStats[currentBowlerId]?.name || bowler.name,
                overs: bowlerNewOvers,
                runs: (bowlerStats[currentBowlerId]?.runs || 0) + run,
                wickets: bowlerStats[currentBowlerId]?.wickets || 0
            }
        };

        // CRITICAL: Update striker's stats FIRST, using strikerId to identify the correct batsman
        // This ensures runs are always added to the striker, regardless of state updates
        setBatsmanStats(newBatsmanStats);

        // Update bowler stats (runs conceded and balls bowled)
        // CRITICAL: Use currentBowlerId to ensure we update the correct bowler's stats
        setBowler(prev => ({
            ...prev,
            runs: prev.runs + run,
            overs: bowlerNewOvers
        }));

        // Update cumulative bowler stats using currentBowlerId
        setBowlerStats(newBowlerStats);

        // Update last 6 balls tracker
        setLastSixBalls(prev => {
            const newBall = { runs: run, type: 'legal', isWicket: false, isWide: false };
            const updated = [...prev, newBall];
            return updated.slice(-6);
        });

        // Check if target is achieved (second innings only)
        if (checkTargetAchieved(score.runs + run)) {
            handleInningsOrMatchComplete(
                { runs: score.runs + run, wickets: score.wickets, overs: newOvers },
                "target",
                newBatsmanStats,
                newBowlerStats
            );
            return;
        }

        // Check if innings is complete after this ball
        if (checkInningsComplete(newOvers, score.wickets)) {
            handleInningsOrMatchComplete(
                { runs: score.runs + run, wickets: score.wickets, overs: newOvers },
                "overs",
                newBatsmanStats,
                newBowlerStats
            );
            return; // Don't show bowler dialog or rotate strike
        }

        // Check if over is complete
        if (isOverComplete) {
            // Set previousBowlerId to current bowler's ID for cooldown tracking
            setPreviousBowlerId(currentBowlerId);
            setShowBowlerDialog(true);
            setLastSixBalls([]);
        }

        // Handle strike rotation AFTER updating stats
        if (shouldChangeStrike) {
            setTimeout(() => {
                const currentStrikerName = batsmanStats[currentStrikerId]?.name || "Striker";
                const currentNonStrikerName = batsmanStats[nonStrikerId]?.name || "Non-Striker";

                // Swap striker and non-striker IDs
                setStrikerId(nonStrikerId);
                setNonStrikerId(currentStrikerId);

                if (isOverComplete) {
                    toast.info(`End of over - Strike changed: ${currentStrikerName} ↔ ${currentNonStrikerName}`, {
                        position: 'bottom-center',
                        duration: 2000,
                    });
                } else if (isOddRun) {
                    toast.info(`Strike changed: ${currentStrikerName} ↔ ${currentNonStrikerName}`, {
                        position: 'bottom-center',
                        duration: 1500,
                    });
                }
            }, 100);
        }
    };

    // Handle wicket
    const handleWicket = () => {
        // Check if innings/match is already complete
        if (inningsComplete || matchComplete) {
            toast.error(currentInnings === 2 ? "Match is complete!" : "Innings is complete!", {
                position: 'bottom-center',
                duration: 2000,
            });
            return;
        }

        saveHistory(); // Save state for undo

        toast.success("WICKET!", {
            position: 'bottom-center',
            duration: 1500,
            icon: '☝️'
        });

        // Add the dismissed batsman to the dismissed list
        const dismissedBatsmanId = strikerId;
        setDismissedBatsmen(prev => [...prev, dismissedBatsmanId]);

        const currentBalls = Math.round((score.overs - Math.floor(score.overs)) * 10);
        const isOverComplete = currentBalls === 5;

        const newOvers = incrementOvers(score.overs);

        // Update team score (wickets only, no runs)
        setScore(prev => ({
            ...prev,
            wickets: prev.wickets + 1,
            overs: newOvers
        }));

        // Update striker stats (balls faced, but out) using strikerId
        const currentStrikerId = strikerId;
        const newBatsmanStats = {
            ...batsmanStats,
            [currentStrikerId]: {
                ...batsmanStats[currentStrikerId],
                balls: (batsmanStats[currentStrikerId]?.balls || 0) + 1
            }
        };

        const bowlerNewOvers = incrementOvers(bowler.overs);
        const newBowlerStats = {
            ...bowlerStats,
            [currentBowlerId]: {
                name: bowlerStats[currentBowlerId]?.name || bowler.name,
                overs: bowlerNewOvers,
                runs: bowlerStats[currentBowlerId]?.runs || 0,
                wickets: (bowlerStats[currentBowlerId]?.wickets || 0) + 1
            }
        };

        // Update striker stats (balls faced, but out) using strikerId
        setBatsmanStats(newBatsmanStats);

        // Update bowler stats (wicket taken and balls bowled)
        // CRITICAL: Use currentBowlerId to ensure wickets are attributed correctly
        setBowler(prev => ({
            ...prev,
            wickets: prev.wickets + 1,
            overs: bowlerNewOvers
        }));

        // Update cumulative bowler stats using currentBowlerId
        setBowlerStats(newBowlerStats);

        // Update last 6 balls tracker
        setLastSixBalls(prev => {
            const newBall = { runs: 0, type: 'wicket', isWicket: true, isWide: false };
            const updated = [...prev, newBall];
            return updated.slice(-6);
        });

        // Check if team is all out or innings is complete after this wicket
        const newWickets = score.wickets + 1;
        if (checkAllOut(newWickets)) {
            handleInningsOrMatchComplete(
                { runs: score.runs, wickets: newWickets, overs: newOvers },
                "allout",
                newBatsmanStats,
                newBowlerStats
            );
            return; // Don't show bowler or batsman dialog
        }

        // Check if innings is complete after this ball (overs)
        if (checkInningsComplete(newOvers, newWickets)) {
            handleInningsOrMatchComplete(
                { runs: score.runs, wickets: newWickets, overs: newOvers },
                "overs",
                newBatsmanStats,
                newBowlerStats
            );
            return; // Don't show bowler or batsman dialog
        }

        // Check if over is complete
        if (isOverComplete) {
            setPreviousBowlerId(currentBowlerId);
            setShowBowlerDialog(true);
            setLastSixBalls([]);
        }

        // Strike does NOT change on wicket - new batsman comes to striker end
        // Show batsman selection dialog
        setShowBatsmanDialog(true);
    };

    // Handle wide ball
    const handleWide = () => {
        // Check if innings/match is already complete
        if (inningsComplete || matchComplete) {
            toast.error(currentInnings === 2 ? "Match is complete!" : "Innings is complete!", {
                position: 'bottom-center',
                duration: 2000,
            });
            return;
        }

        saveHistory(); // Save state for undo

        toast.success("Wide Ball (+1)", {
            position: 'bottom-center',
            duration: 1500,
            icon: '🏏'
        });

        const newBowlerStats = {
            ...bowlerStats,
            [currentBowlerId]: {
                name: bowlerStats[currentBowlerId]?.name || bowler.name,
                overs: bowlerStats[currentBowlerId]?.overs || 0.0,
                runs: (bowlerStats[currentBowlerId]?.runs || 0) + 1,
                wickets: bowlerStats[currentBowlerId]?.wickets || 0
            }
        };

        // Wide ball: add 1 run, but NO over increment, NO batsman ball increment
        setScore(prev => ({
            ...prev,
            runs: prev.runs + 1
            // overs NOT incremented - illegal delivery
        }));

        // Striker stats NOT updated - illegal delivery

        // Update bowler stats (runs conceded but NOT balls bowled)
        // CRITICAL: Use currentBowlerId to ensure stats are attributed correctly
        setBowler(prev => ({
            ...prev,
            runs: prev.runs + 1
            // overs NOT incremented - illegal delivery
        }));

        // Update cumulative bowler stats (runs only, no overs)
        setBowlerStats(newBowlerStats);

        // Update last 6 balls tracker (wides are shown but don't count as legal balls)
        setLastSixBalls(prev => {
            const newBall = { runs: 1, type: 'wide', isWicket: false, isWide: true };
            const updated = [...prev, newBall];
            return updated.slice(-6);
        });

        // Check target here as well since a wide can win a match
        if (checkTargetAchieved(score.runs + 1)) {
            handleInningsOrMatchComplete(
                { runs: score.runs + 1, wickets: score.wickets, overs: score.overs },
                "target",
                batsmanStats, // No change to batsman stats
                newBowlerStats
            );
            return;
        }

        // Strike does NOT change on wide ball
    };

    // Handle no ball
    const handleNoBall = (run = 0) => {
        // Check if innings/match is already complete
        if (inningsComplete || matchComplete) {
            toast.error(currentInnings === 2 ? "Match is complete!" : "Innings is complete!", {
                position: 'bottom-center',
                duration: 2000,
            });
            return;
        }

        saveHistory(); // Save state for undo

        toast.success(`No Ball (+${run + 1})`, {
            position: 'bottom-center',
            duration: 1500,
            icon: '🏏'
        });

        // No ball: add 1 run penalty + any runs scored by batsman
        // It's an illegal delivery (doesn't count toward over)
        const totalRuns = run + 1;

        const currentStrikerId = strikerId;
        const newBatsmanStats = {
            ...batsmanStats,
            [currentStrikerId]: {
                ...batsmanStats[currentStrikerId],
                runs: (batsmanStats[currentStrikerId]?.runs || 0) + run, // Only batsman's runs, not the penalty
                fours: (batsmanStats[currentStrikerId]?.fours || 0) + (run === 4 ? 1 : 0),
                sixes: (batsmanStats[currentStrikerId]?.sixes || 0) + (run === 6 ? 1 : 0)
                // balls NOT incremented - illegal delivery
            }
        };

        const newBowlerStats = {
            ...bowlerStats,
            [currentBowlerId]: {
                name: bowlerStats[currentBowlerId]?.name || bowler.name,
                overs: bowlerStats[currentBowlerId]?.overs || 0.0,
                runs: (bowlerStats[currentBowlerId]?.runs || 0) + totalRuns,
                wickets: bowlerStats[currentBowlerId]?.wickets || 0
            }
        };

        setScore(prev => ({
            ...prev,
            runs: prev.runs + totalRuns
            // overs NOT incremented - illegal delivery
        }));

        // Update striker stats (runs scored, but balls NOT incremented) using strikerId
        setBatsmanStats(newBatsmanStats);

        // Update bowler stats (runs conceded but NOT balls bowled)
        // CRITICAL: Use currentBowlerId to ensure stats are attributed correctly
        setBowler(prev => ({
            ...prev,
            runs: prev.runs + totalRuns // Penalty + batsman runs
            // overs NOT incremented - illegal delivery
        }));

        // Update cumulative bowler stats (runs only, no overs)
        setBowlerStats(newBowlerStats);

        // Update last 6 balls tracker
        setLastSixBalls(prev => {
            const newBall = { runs: totalRuns, type: 'noball', isWicket: false, isWide: false, isNoBall: true };
            const updated = [...prev, newBall];
            return updated.slice(-6);
        });

        // Check target since a No Ball can win a match
        if (checkTargetAchieved(score.runs + totalRuns)) {
            handleInningsOrMatchComplete(
                { runs: score.runs + totalRuns, wickets: score.wickets, overs: score.overs },
                "target",
                newBatsmanStats,
                newBowlerStats
            );
            return;
        }

        // Strike rotation: only if batsman scored odd runs
        const isOddRun = run % 2 === 1;
        if (isOddRun) {
            setTimeout(() => {
                setStrikerId(nonStrikerId);
                setNonStrikerId(currentStrikerId);
                toast.info("Strike changed", {
                    position: 'bottom-center',
                    duration: 1500,
                });
            }, 500);
        }
    };

    // Main function to handle all ball types
    const addRun = (run, type = "runs") => {
        if (type === "wicket") {
            handleWicket();
        } else if (type === "wide") {
            handleWide();
        } else if (type === "noball") {
            setShowNoBallDialog(true);
        } else {
            // Legal delivery
            handleLegalDelivery(run);
        }
    };

    const selectBowler = (selectedBowler) => {
        // Logic-level enforcement: Prevent selecting the previous bowler by ID
        if (selectedBowler.id === previousBowlerId) {
            toast.error(`${selectedBowler.name} cannot bowl consecutive overs`, {
                position: 'bottom-center',
                duration: 2000,
            });
            return; // Block the selection
        }

        // CRITICAL: Set currentBowlerId immediately to ensure stats are attributed correctly
        setCurrentBowlerId(selectedBowler.id);

        // Reset the new bowler's CURRENT stats to 0 (they start fresh for this spell)
        // The cumulative stats are maintained separately in bowlerStats
        setBowler({
            name: selectedBowler.name,
            overs: 0.0,
            runs: 0,
            wickets: 0
        });
        setShowBowlerDialog(false);
        toast.success(`${selectedBowler.name} is now bowling`, {
            position: 'bottom-center',
            duration: 2000,
        });
    };

    // Keyboard Shortcuts - Temporarily disabled for debugging
    // useEffect(() => {
    //     const handleKeyPress = (e) => {
    //         if (e.key === '0') addRun(0);
    //         if (e.key === '1') addRun(1);
    //         if (e.key === '2') addRun(2);
    //         if (e.key === '3') addRun(3);
    //         if (e.key === '4') addRun(4);
    //         if (e.key === '6') addRun(6);
    //         if (e.key.toLowerCase() === 'w') addRun(0, "wicket");
    //     };
    //     window.addEventListener('keydown', handleKeyPress);
    //     return () => window.removeEventListener('keydown', handleKeyPress);
    // }, [addRun]); // Add addRun to dependencies

    if (!isMounted) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" suppressHydrationWarning>
            {/* TV Style Header */}
            <div className="relative rounded-xl overflow-hidden bg-black border border-white/10 shadow-2xl">
                {/* Background Effect */}
                <div className="absolute inset-0 bg-linear-to-r from-blue-900/50 via-black to-red-900/50 opacity-50" />

                <div className="relative p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-blue-600/50 overflow-hidden border-2 border-white/20">
                            {matchData?.battingTeam?.logoUrl ? (
                                <img src={matchData.battingTeam.logoUrl} alt={matchData.battingTeam.name} className="h-full w-full object-cover" />
                            ) : (
                                matchData?.battingTeam?.name?.substring(0, 2).toUpperCase() || 'BT'
                            )}
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tight uppercase">{matchData?.battingTeam?.name || 'Batting Team'}</h2>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black text-yellow-400 drop-shadow-lg">{score.runs}/{score.wickets}</span>
                                <span className="text-xl text-white/80 font-mono">({score.overs} ov)</span>
                            </div>

                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <Badge variant="outline" className="text-sm px-3 py-1 border-white/20 text-white/60 mb-2 uppercase tracking-widest">{matchData?.matchType || 'T20'} • {maxOvers} Overs</Badge>
                        <div className="text-2xl font-bold text-white vs-text">VS</div>
                        <div className="flex items-center gap-2 mt-2">
                            <Circle className="h-3 w-3 fill-red-500 text-red-500 animate-pulse" />
                            <span className="text-red-400 font-bold tracking-widest text-sm">LIVE</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-center md:text-right">
                        <div>
                            <h2 className="text-2xl font-black text-white/60 tracking-tight uppercase">{matchData?.bowlingTeam?.name || 'Bowling Team'}</h2>
                            <p className="text-lg text-white/40 mt-1" suppressHydrationWarning>
                                {isMounted && currentInnings === 2 && firstInningsScore
                                    ? `${firstInningsScore.runs}/${firstInningsScore.wickets} (${firstInningsScore.overs} ov)`
                                    : 'Yet to bat'}
                            </p>
                            <p className="text-sm text-red-300 font-medium mt-1" suppressHydrationWarning>
                                {isMounted && currentInnings === 2 && firstInningsScore
                                    ? `Target: ${firstInningsScore.runs + 1}`
                                    : 'Target: --'}
                            </p>
                        </div>
                        <div className="h-16 w-16 bg-red-900/50 border-2 border-red-600/50 rounded-full flex items-center justify-center text-2xl font-bold text-white/60 overflow-hidden">
                            {matchData?.bowlingTeam?.logoUrl ? (
                                <img src={matchData.bowlingTeam.logoUrl} alt={matchData.bowlingTeam.name} className="h-full w-full object-cover opacity-80" />
                            ) : (
                                matchData?.bowlingTeam?.name?.substring(0, 2).toUpperCase() || 'WT'
                            )}
                        </div>
                    </div>
                </div>
                {/* Info Strip */}
                <div className="bg-white/5 p-3 flex justify-between items-center text-xs md:text-sm text-white/70 backdrop-blur-md border-t border-white/10">
                    <span>🏟️ {matchData?.venue || matchData?.battingTeam?.homeGround || matchData?.bowlingTeam?.homeGround || 'Cricket Stadium'}</span>
                    <Link
                        href={`/matches/${id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1 rounded-sm transition-colors text-white hover:text-white"
                    >
                        View Match Details ↗
                    </Link>
                </div>
            </div>

            <div className="w-full space-y-6">
                <div className="grid gap-6 md:grid-cols-12">
                    {/* Main Controls - Left Side */}
                    <div className="md:col-span-8 space-y-6">
                        <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Ball Control</span>
                                    <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded-sm">Hotkeys Enabled (0-6, W)</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-4 gap-3 sm:gap-4 mb-6">
                                    {[0, 1, 2, 3].map((run) => (
                                        <Button key={run} disabled={inningsComplete} className="h-14 sm:h-20 text-2xl font-bold bg-muted text-foreground hover:bg-primary hover:text-primary-foreground transition-all active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" variant="outline" onClick={() => addRun(run)}>
                                            {run}
                                        </Button>
                                    ))}
                                    <Button disabled={inningsComplete} className="h-14 sm:h-20 text-2xl font-black bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white border-green-500/50 shadow-green-500/10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" variant="outline" onClick={() => addRun(4)}>{4}</Button>
                                    <Button disabled={inningsComplete} className="h-14 sm:h-20 text-2xl font-black bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white border-purple-500/50 shadow-purple-500/10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" variant="outline" onClick={() => addRun(6)}>{6}</Button>
                                    <Button disabled={inningsComplete} className="h-14 sm:h-20 text-xl font-bold bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border-destructive/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" variant="outline" onClick={() => addRun(0, "wicket")}>OUT</Button>
                                    <Button disabled={inningsComplete} className="h-14 sm:h-20 text-xl font-bold bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-white border-yellow-500/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" variant="outline" onClick={() => addRun(0, "wide")}>WD</Button>
                                    <Button disabled={inningsComplete} className="h-14 sm:h-20 text-xl font-bold bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white border-orange-500/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" variant="outline" onClick={() => addRun(0, "noball")}>NB</Button>
                                </div>
                                <div className="flex gap-4">
                                    <Button disabled={inningsComplete} className="flex-1 h-12 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed" variant="secondary" onClick={undoLastBall}><RefreshCw className="mr-2 h-4 w-4" /> Undo Last Ball</Button>
                                    <Link href={`/matches/${id}`} className="flex-1">
                                        <Button className="w-full h-12 text-base font-semibold" variant="outline">
                                            Match Details
                                        </Button>
                                    </Link>
                                </div>
                                {inningsComplete && (
                                    <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg text-center">
                                        <p className="text-sm font-semibold text-primary">Innings Complete - {score.overs} overs</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Stats Sidebar - Right Side */}
                    <div className="md:col-span-4 space-y-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">On Strike</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-primary">{striker.name}*</h3>
                                        <p className="text-xs text-muted-foreground">Right Hand Bat</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-3xl font-mono font-black">{striker.runs}</span>
                                        <span className="text-sm text-muted-foreground block font-mono">({striker.balls})</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Non-Striker</CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">{nonStriker.name}</h3>
                                <div className="text-right">
                                    <span className="text-xl font-mono font-bold">{nonStriker.runs}</span>
                                    <span className="text-xs text-muted-foreground ml-1">({nonStriker.balls})</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Current Bowler</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-lg font-semibold">{bowler.name}</h3>
                                    <div className="font-mono font-bold text-lg">{bowler.wickets}-{bowler.runs} <span className="text-sm text-muted-foreground">({bowler.overs})</span></div>
                                </div>
                                <div className="mt-2">
                                    <p className="text-xs text-muted-foreground mb-2">Last 6 balls:</p>
                                    <div className="flex gap-1.5">
                                        {lastSixBalls.map((ball, index) => (
                                            <div
                                                key={index}
                                                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${ball.isWicket
                                                    ? 'bg-red-500 text-white'
                                                    : ball.isWide
                                                        ? 'bg-yellow-500 text-white'
                                                        : ball.isNoBall
                                                            ? 'bg-orange-500 text-white'
                                                            : ball.runs === 6
                                                                ? 'bg-purple-500 text-white'
                                                                : ball.runs === 4
                                                                    ? 'bg-green-500 text-white'
                                                                    : ball.runs === 0
                                                                        ? 'bg-gray-400 text-white'
                                                                        : 'bg-blue-500 text-white'
                                                    }`}
                                            >
                                                {ball.isWicket ? 'W' : ball.isWide ? 'WD' : ball.isNoBall ? (ball.runs > 1 ? `${ball.runs}NB` : 'NB') : ball.runs}
                                            </div>
                                        ))}
                                        {/* Fill remaining slots with empty circles */}
                                        {Array.from({ length: 6 - lastSixBalls.length }).map((_, index) => (
                                            <div
                                                key={`empty-${index}`}
                                                className="h-8 w-8 rounded-full border-2 border-dashed border-muted-foreground/30"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>



            {/* Bowler Selection Dialog */}
            <Dialog open={showBowlerDialog} onOpenChange={setShowBowlerDialog}>
                <DialogContent className="sm:max-w-[600px]" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Select Next Bowler</DialogTitle>
                        <DialogDescription>
                            Over completed! Choose the bowler for the next over.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 py-4 max-h-[400px] overflow-y-auto">
                        {availableBowlers.map((bowlerOption) => {
                            const isPreviousBowler = bowlerOption.id === previousBowlerId;
                            return (
                                <Card
                                    key={bowlerOption.id}
                                    className={`transition-colors border-2 ${isPreviousBowler
                                        ? 'border-red-500 bg-red-50/50 cursor-not-allowed opacity-60'
                                        : 'cursor-pointer hover:bg-accent hover:border-primary'
                                        }`}
                                    onClick={() => !isPreviousBowler && selectBowler(bowlerOption)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-lg font-bold">{bowlerOption.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {bowlerOption.overs} overs • {bowlerOption.wickets} wickets
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-mono font-bold">
                                                    {bowlerOption.wickets}-{bowlerOption.runs}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Batsman Selection Dialog */}
            <Dialog open={showBatsmanDialog} onOpenChange={setShowBatsmanDialog}>
                <DialogContent className="sm:max-w-[600px]" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Select Next Batsman</DialogTitle>
                        <DialogDescription>
                            Wicket! Choose the next batsman to come in.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 py-4 max-h-[400px] overflow-y-auto">
                        {availableBatsmen.map((batsmanOption) => (
                            <Card
                                key={batsmanOption.id}
                                className="cursor-pointer hover:bg-accent transition-colors border-2 hover:border-primary"
                                onClick={() => selectBatsman(batsmanOption)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-bold">{batsmanOption.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Ready to bat
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-mono font-bold">
                                                {batsmanOption.runs}({batsmanOption.balls})
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Innings End Dialog */}
            <Dialog open={showInningsEndDialog} onOpenChange={setShowInningsEndDialog}>
                <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-bold text-center">🎉 Innings Complete!</DialogTitle>
                        <DialogDescription className="text-center text-base">
                            {checkAllOut(score.wickets)
                                ? `All Out! ${matchData?.battingTeam?.name || "Team"} has been bowled out.`
                                : "First innings has ended"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-6">
                        {/* Match Summary */}
                        <div className="bg-primary/5 rounded-lg p-6 space-y-4">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                                    {matchData?.battingTeam?.name || "Team"}
                                </h3>
                                <div className="text-5xl font-black text-primary">
                                    {score.runs}/{score.wickets}
                                </div>
                                <p className="text-xl font-semibold text-muted-foreground mt-2">
                                    {score.overs} overs
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Run Rate</p>
                                    <p className="text-2xl font-bold">
                                        {score.overs > 0 ? (score.runs / score.overs).toFixed(2) : "0.00"}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Target</p>
                                    <p className="text-2xl font-bold text-primary">
                                        {score.runs + 1}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Top Performers */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground">Top Scorer</h4>
                            {(() => {
                                const topScorer = Object.values(batsmanStats).reduce((max, player) =>
                                    player.runs > (max?.runs || 0) ? player : max, null);
                                return topScorer ? (
                                    <div className="flex justify-between items-center bg-muted/50 rounded-lg p-3">
                                        <span className="font-semibold">{topScorer.name}</span>
                                        <span className="font-mono font-bold text-lg">
                                            {topScorer.runs} ({topScorer.balls}) • {topScorer.fours || 0}x4, {topScorer.sixes || 0}x6
                                        </span>
                                    </div>
                                ) : null;
                            })()}
                        </div>

                        {/* Action Button */}
                        <Button
                            className="w-full h-12 text-lg font-bold"
                            size="lg"
                            onClick={() => {
                                // Navigate to player selection for second innings
                                window.location.href = `/matches/${id}/start-innings?innings=2`;
                            }}
                        >
                            Start Second Innings
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Match Result Dialog */}
            <Dialog open={showMatchResultDialog} onOpenChange={setShowMatchResultDialog}>
                <DialogContent className="sm:max-w-[600px]" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="text-4xl font-black text-center">
                            {matchResult?.winnerName ? '🏆 Match Complete!' : '🤝 Match Tied!'}
                        </DialogTitle>
                        <DialogDescription className="text-center text-lg font-semibold mt-2">
                            {matchResult?.winnerName
                                ? `${matchResult.winnerName} won by ${matchResult.margin}`
                                : 'Match Tied'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-6">
                        {/* Match Summary */}
                        <div className="space-y-4">
                            {/* First Innings Score */}
                            <div className="bg-muted/30 rounded-lg p-4 border-2">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                                            {matchResult?.defendingScore?.battingTeam || "Team 1"}
                                        </h3>
                                        <div className="text-3xl font-black">
                                            {matchResult?.defendingScore?.runs}/{matchResult?.defendingScore?.wickets}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Overs</p>
                                        <p className="text-xl font-bold">{matchResult?.defendingScore?.overs}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Second Innings Score */}
                            <div className="bg-muted/30 rounded-lg p-4 border-2">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                                            {matchData?.battingTeam?.name || "Team 2"}
                                        </h3>
                                        <div className="text-3xl font-black">
                                            {score.runs}/{score.wickets}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Overs</p>
                                        <p className="text-xl font-bold">{score.overs}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Winner Highlight */}
                        {matchResult?.winnerName && (
                            <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-6 text-center">
                                <p className="text-sm text-muted-foreground mb-2">Winner</p>
                                <h2 className="text-3xl font-black text-primary mb-2">
                                    {matchResult.winnerName}
                                </h2>
                                <p className="text-lg font-semibold">
                                    Won by {matchResult.margin}
                                </p>
                            </div>
                        )}

                        {/* Top Performers */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-muted-foreground">Top Scorer (This Innings)</h4>
                            {(() => {
                                const topScorer = Object.values(batsmanStats).reduce((max, player) =>
                                    player.runs > (max?.runs || 0) ? player : max, null);
                                return topScorer ? (
                                    <div className="flex justify-between items-center bg-muted/50 rounded-lg p-3">
                                        <span className="font-semibold">{topScorer.name}</span>
                                        <span className="font-mono font-bold text-lg">
                                            {topScorer.runs} ({topScorer.balls}) • {topScorer.fours || 0}x4, {topScorer.sixes || 0}x6
                                        </span>
                                    </div>
                                ) : null;
                            })()}
                        </div>

                        {/* Action Button */}
                        <Button
                            className="w-full h-12 text-base font-semibold"
                            onClick={() => {
                                window.location.href = `/matches/${id}`;
                            }}
                        >
                            View Match Details
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            {/* No Ball Dialog */}
            <Dialog open={showNoBallDialog} onOpenChange={setShowNoBallDialog}>
                <DialogContent className="sm:max-w-[400px]" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">No Ball Actions</DialogTitle>
                        <DialogDescription>
                            How many runs were scored off the bat on this No Ball? <br />
                            <span className="text-orange-500 font-semibold mt-2 inline-block">(1 penalty run is added automatically)</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-4 gap-3 py-4">
                        {[0, 1, 2, 3, 4, 6].map((runs) => (
                            <Button
                                key={`nb-${runs}`}
                                className={`h-14 text-xl font-bold transition-all active:scale-95 ${runs === 4
                                    ? 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white border-green-500/50'
                                    : runs === 6
                                        ? 'bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white border-purple-500/50'
                                        : 'bg-muted text-foreground hover:bg-primary hover:text-primary-foreground'
                                    }`}
                                variant="outline"
                                onClick={() => {
                                    handleNoBall(runs);
                                    setShowNoBallDialog(false);
                                }}
                            >
                                {runs}
                            </Button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
