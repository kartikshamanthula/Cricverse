"use client"

import { useState, useEffect, use, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, Users, Target, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { PageHeader } from "@/components/ui/page-header"

function StartInningsContent({ id }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const innings = searchParams.get('innings') // Get innings parameter (1 or 2)

    const [striker, setStriker] = useState(null)
    const [nonStriker, setNonStriker] = useState(null)
    const [bowler, setBowler] = useState(null)
    const [matchData, setMatchData] = useState(null)
    const [loading, setLoading] = useState(true)

    // Load match data from API
    useEffect(() => {
        const fetchMatch = async () => {
            try {
                const res = await fetch(`/api/matches/${id}`);
                if (!res.ok) throw new Error("Failed to fetch match");
                const data = await res.json();
                setMatchData(data);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load match data");
            } finally {
                setLoading(false);
            }
        };
        fetchMatch();
    }, [id]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading match data...</div>;
    }

    if (!matchData) {
        return <div className="min-h-screen flex items-center justify-center">Match not found</div>;
    }

    // Determine Batting and Bowling Team
    // API structure: teamA: { name, teamId: { players: [] } }, toss: { winner: 'Name', decision: 'bat' }

    // Helper to get team object with players
    const getTeamWithPlayers = (teamSide) => {
        // teamSide is 'teamA' or 'teamB'
        const teamRef = matchData[teamSide];
        if (!teamRef || !teamRef.teamId) return { name: teamRef?.name || 'Unknown', players: [] };
        return {
            name: teamRef.name,
            players: teamRef.teamId.players || [],
            id: teamRef.teamId._id
        };
    };

    const teamA = getTeamWithPlayers('teamA');
    const teamB = getTeamWithPlayers('teamB');

    // Logic to determine who is batting
    let battingTeamObj, bowlingTeamObj;

    // Check toss
    const tossWinnerName = matchData.toss?.winner;
    const tossDecision = matchData.toss?.decision?.type || matchData.toss?.decision; // Schema might be { type: 'bat' } or just 'bat' (if I standardized)

    // Assume tossWinnerName matches teamA.name or teamB.name
    const isTeamA = tossWinnerName === teamA.name;

    if (tossDecision === 'bat') {
        battingTeamObj = isTeamA ? teamA : teamB;
        bowlingTeamObj = isTeamA ? teamB : teamA;
    } else {
        battingTeamObj = isTeamA ? teamB : teamA;
        bowlingTeamObj = isTeamA ? teamA : teamB;
    }

    // Swap teams for second innings
    // In second innings, the team that bowled first now bats, and vice versa
    const isSecondInnings = innings === '2';

    const battingTeam = isSecondInnings ? bowlingTeamObj : battingTeamObj;
    const bowlingTeam = isSecondInnings ? battingTeamObj : bowlingTeamObj;

    const handleStartScoring = () => {
        if (!striker) {
            toast.error("Please select a striker")
            return
        }
        if (!nonStriker) {
            toast.error("Please select a non-striker")
            return
        }
        if (!bowler) {
            toast.error("Please select a bowler")
            return
        }
        if (striker === nonStriker) {
            toast.error("Striker and non-striker must be different players")
            return
        }

        // Navigate to scoring page with selected players and innings parameter
        const inningsParam = innings ? `&innings=${innings}` : '';
        // Pass player IDs. The scoring page will need to fetch match data from API too.
        router.push(`/matches/${id}/score?striker=${striker}&nonStriker=${nonStriker}&bowler=${bowler}${inningsParam}`)
    }

    const displayMatchType = (matchData.matchType === 'Limited Overs' && !matchData.tournamentId)
        ? 'Box/Turf Cricket'
        : (matchData.matchType || 'Box/Turf Cricket');

    return (
        <div className="min-h-screen bg-background" suppressHydrationWarning>
            <div className="max-w-4xl mx-auto pt-2 pb-8 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <PageHeader
                    title={isSecondInnings ? "Start second innings" : "Start innings"}
                    description={isSecondInnings
                        ? "Select the opening batsmen and bowler for the second innings. Teams have been swapped."
                        : "Select the opening batsmen and bowler to begin the match."
                    }
                    onBack={() => router.back()}
                />

                <div className="mb-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <Target className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Match Format</p>
                            <p className="font-bold text-foreground">{displayMatchType}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Overs</p>
                            <p className="font-bold text-foreground">{matchData.totalOvers || matchData.overs || 20} Overs</p>
                        </div>
                    </div>
                </div>

                {/* Batting Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="h-5 w-5 text-primary" />
                        <h2 className="text-base sm:text-lg font-bold text-foreground">Batting - {battingTeam.name}</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Striker Selection */}
                        <PlayerSelectionCard
                            title="Select striker"
                            icon="striker"
                            players={battingTeam.players}
                            selectedPlayer={striker}
                            onSelect={setStriker}
                            disabledPlayers={nonStriker ? [nonStriker] : []}
                        />

                        {/* Non-Striker Selection */}
                        <PlayerSelectionCard
                            title="Select non-striker"
                            icon="non-striker"
                            players={battingTeam.players}
                            selectedPlayer={nonStriker}
                            onSelect={setNonStriker}
                            disabledPlayers={striker ? [striker] : []}
                        />
                    </div>
                </div>

                {/* Bowling Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="h-5 w-5 text-primary" />
                        <h2 className="text-base sm:text-lg font-bold text-foreground">Bowling - {bowlingTeam.name}</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Bowler Selection */}
                        <PlayerSelectionCard
                            title="Select bowler"
                            icon="bowler"
                            players={bowlingTeam.players}
                            selectedPlayer={bowler}
                            onSelect={setBowler}
                        />
                    </div>
                </div>

                {/* Action Button */}
                <div className="mt-8">
                    <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 py-6 text-lg"
                        onClick={handleStartScoring}
                    >
                        Start scoring
                    </Button>
                </div>
            </div>
        </div>
    )
}

function PlayerSelectionCard({ title, icon, players, selectedPlayer, onSelect, disabledPlayers = [] }) {
    const [isOpen, setIsOpen] = useState(false)

    const selectedPlayerData = players.find(p => p._id === selectedPlayer)

    const getIconSvg = () => {
        if (icon === "striker") {
            return (
                <svg viewBox="0 0 200 240" className="w-full h-full">
                    <defs>
                        <linearGradient id="batGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#8B4513" />
                            <stop offset="100%" stopColor="#654321" />
                        </linearGradient>
                        <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#2C5F8D" />
                            <stop offset="100%" stopColor="#1E4A6F" />
                        </linearGradient>
                        <filter id="shadow">
                            <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.3" />
                        </filter>
                    </defs>

                    {/* Batsman in striking pose */}
                    <g transform="translate(100, 120)">
                        {/* Shadow */}
                        <ellipse cx="0" cy="90" rx="40" ry="8" fill="black" opacity="0.2" />

                        {/* Bat - raised for striking */}
                        <g transform="rotate(-35)" filter="url(#shadow)">
                            <rect x="-50" y="-70" width="12" height="80" fill="url(#batGradient)" rx="6" />
                            <rect x="-48" y="-68" width="3" height="76" fill="#A0522D" opacity="0.5" />
                            <rect x="-50" y="-75" width="12" height="8" fill="#654321" rx="2" />
                        </g>

                        {/* Back leg */}
                        <g>
                            <rect x="8" y="25" width="10" height="45" fill="#1E4A6F" rx="5" transform="rotate(10 13 47)" />
                            <rect x="8" y="65" width="12" height="30" fill="#E8E8E8" rx="3" />
                        </g>

                        {/* Body */}
                        <ellipse cx="0" cy="0" rx="18" ry="28" fill="url(#bodyGradient)" />
                        <rect x="-12" y="-15" width="24" height="35" fill="url(#bodyGradient)" rx="8" />

                        {/* Front leg */}
                        <g>
                            <rect x="-18" y="25" width="10" height="45" fill="#1E4A6F" rx="5" transform="rotate(-5 -13 47)" />
                            <rect x="-20" y="65" width="12" height="30" fill="#E8E8E8" rx="3" />
                        </g>

                        {/* Arms */}
                        <g transform="rotate(-30)">
                            <rect x="-8" y="-35" width="8" height="40" fill="#2C5F8D" rx="4" />
                            <circle cx="-4" cy="-38" r="5" fill="#D4A574" />
                        </g>
                        <g transform="rotate(-45)">
                            <rect x="0" y="-40" width="8" height="45" fill="#2C5F8D" rx="4" />
                            <circle cx="4" cy="-43" r="5" fill="#D4A574" />
                        </g>

                        {/* Neck */}
                        <rect x="-6" y="-32" width="12" height="8" fill="#D4A574" rx="3" />

                        {/* Head */}
                        <circle cx="0" cy="-40" r="14" fill="#D4A574" />

                        {/* Helmet */}
                        <path d="M -12,-45 Q -14,-52 0,-54 Q 14,-52 12,-45 L 10,-40 Q 8,-38 0,-38 Q -8,-38 -10,-40 Z"
                            fill="#1A1A2E" stroke="#0F0F1E" strokeWidth="1" />
                        <ellipse cx="0" cy="-42" rx="11" ry="10" fill="#1A1A2E" />
                        <path d="M -10,-42 Q -8,-35 -2,-35" stroke="#333" strokeWidth="1.5" fill="none" />
                        <circle cx="8" cy="-42" r="2" fill="#444" />

                        {/* Gloves */}
                        <circle cx="-4" cy="-38" r="6" fill="#FFFFFF" opacity="0.9" />
                        <circle cx="4" cy="-43" r="6" fill="#FFFFFF" opacity="0.9" />

                        {/* Stumps behind */}
                        <g transform="translate(35, 55)">
                            <rect x="-3" y="0" width="3" height="35" fill="#D4A574" />
                            <rect x="2" y="0" width="3" height="35" fill="#D4A574" />
                            <rect x="7" y="0" width="3" height="35" fill="#D4A574" />
                            <rect x="-3" y="-2" width="13" height="2" fill="#D4A574" />
                        </g>
                    </g>
                </svg>
            )
        } else if (icon === "non-striker") {
            return (
                <svg viewBox="0 0 200 240" className="w-full h-full">
                    <defs>
                        <linearGradient id="batGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#8B4513" />
                            <stop offset="100%" stopColor="#654321" />
                        </linearGradient>
                        <linearGradient id="bodyGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#2C5F8D" />
                            <stop offset="100%" stopColor="#1E4A6F" />
                        </linearGradient>
                    </defs>

                    {/* Batsman in ready/standing pose */}
                    <g transform="translate(100, 120)">
                        {/* Shadow */}
                        <ellipse cx="0" cy="90" rx="35" ry="7" fill="black" opacity="0.2" />

                        {/* Bat - held down beside */}
                        <g transform="translate(18, 20) rotate(75)">
                            <rect x="-6" y="0" width="10" height="70" fill="url(#batGradient2)" rx="5" />
                            <rect x="-5" y="2" width="3" height="66" fill="#A0522D" opacity="0.5" />
                            <rect x="-6" y="-5" width="10" height="7" fill="#654321" rx="2" />
                        </g>

                        {/* Legs */}
                        <rect x="-16" y="25" width="11" height="50" fill="#1E4A6F" rx="5" />
                        <rect x="5" y="25" width="11" height="50" fill="#1E4A6F" rx="5" />

                        {/* Pads */}
                        <rect x="-18" y="30" width="13" height="40" fill="#E8E8E8" rx="4" opacity="0.9" />
                        <rect x="5" y="30" width="13" height="40" fill="#E8E8E8" rx="4" opacity="0.9" />
                        <line x1="-11" y1="35" x2="-11" y2="65" stroke="#CCC" strokeWidth="1" />
                        <line x1="11" y1="35" x2="11" y2="65" stroke="#CCC" strokeWidth="1" />

                        {/* Body */}
                        <rect x="-15" y="-20" width="30" height="45" fill="url(#bodyGradient2)" rx="10" />
                        <ellipse cx="0" cy="0" rx="16" ry="25" fill="url(#bodyGradient2)" />

                        {/* Arms */}
                        <rect x="-20" y="-10" width="8" height="35" fill="#2C5F8D" rx="4" transform="rotate(-15 -16 7)" />
                        <rect x="12" y="-10" width="8" height="35" fill="#2C5F8D" rx="4" transform="rotate(15 16 7)" />

                        {/* Hands */}
                        <circle cx="-18" cy="20" r="5" fill="#D4A574" />
                        <circle cx="18" cy="20" r="5" fill="#D4A574" />

                        {/* Gloves */}
                        <circle cx="-18" cy="20" r="6" fill="#FFFFFF" opacity="0.8" />
                        <circle cx="18" cy="20" r="6" fill="#FFFFFF" opacity="0.8" />

                        {/* Neck */}
                        <rect x="-7" y="-30" width="14" height="10" fill="#D4A574" rx="4" />

                        {/* Head */}
                        <circle cx="0" cy="-38" r="15" fill="#D4A574" />

                        {/* Helmet */}
                        <path d="M -13,-43 Q -15,-51 0,-53 Q 15,-51 13,-43 L 11,-38 Q 9,-36 0,-36 Q -9,-36 -11,-38 Z"
                            fill="#1A1A2E" stroke="#0F0F1E" strokeWidth="1" />
                        <ellipse cx="0" cy="-40" rx="12" ry="11" fill="#1A1A2E" />
                        <path d="M -11,-40 Q -9,-33 -3,-33" stroke="#333" strokeWidth="1.5" fill="none" />
                        <circle cx="9" cy="-40" r="2" fill="#444" />
                    </g>
                </svg>
            )
        } else if (icon === "bowler") {
            return (
                <svg viewBox="0 0 200 240" className="w-full h-full">
                    <defs>
                        <linearGradient id="bodyGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#8D2C2C" />
                            <stop offset="100%" stopColor="#6F1E1E" />
                        </linearGradient>
                        <radialGradient id="ballGradient">
                            <stop offset="0%" stopColor="#FF4444" />
                            <stop offset="100%" stopColor="#CC0000" />
                        </radialGradient>
                    </defs>

                    {/* Bowler in action pose */}
                    <g transform="translate(100, 120)">
                        {/* Shadow */}
                        <ellipse cx="5" cy="90" rx="38" ry="8" fill="black" opacity="0.2" />

                        {/* Back leg - bent */}
                        <g transform="rotate(25 10 50)">
                            <rect x="8" y="30" width="10" height="40" fill="#6F1E1E" rx="5" />
                            <rect x="8" y="65" width="10" height="25" fill="#6F1E1E" rx="5" transform="rotate(-45 13 77)" />
                        </g>

                        {/* Front leg - extended */}
                        <g transform="rotate(-20 -10 50)">
                            <rect x="-18" y="25" width="11" height="50" fill="#6F1E1E" rx="5" />
                            <rect x="-18" y="70" width="11" height="20" fill="#6F1E1E" rx="5" />
                        </g>

                        {/* Body - leaning forward */}
                        <g transform="rotate(-10)">
                            <ellipse cx="0" cy="0" rx="17" ry="26" fill="url(#bodyGradient3)" />
                            <rect x="-14" y="-18" width="28" height="40" fill="url(#bodyGradient3)" rx="9" />
                        </g>

                        {/* Back arm */}
                        <g transform="rotate(-120 -8 -15)">
                            <rect x="-10" y="-20" width="8" height="35" fill="#8D2C2C" rx="4" />
                            <circle cx="-6" cy="-23" r="5" fill="#D4A574" />
                        </g>

                        {/* Bowling arm - raised high */}
                        <g transform="rotate(-160 8 -15)">
                            <rect x="5" y="-25" width="9" height="50" fill="#8D2C2C" rx="4" />
                            <circle cx="9" cy="-28" r="6" fill="#D4A574" />
                        </g>

                        {/* Neck */}
                        <rect x="-6" y="-30" width="12" height="8" fill="#D4A574" rx="3" />

                        {/* Head */}
                        <circle cx="0" cy="-38" r="14" fill="#D4A574" />

                        {/* Hair */}
                        <path d="M -12,-45 Q -14,-50 -10,-52 Q -5,-54 0,-53 Q 5,-54 10,-52 Q 14,-50 12,-45"
                            fill="#2C2C2C" />

                        {/* Face details */}
                        <circle cx="-4" cy="-40" r="1.5" fill="#1A1A1A" />
                        <circle cx="4" cy="-40" r="1.5" fill="#1A1A1A" />
                        <path d="M -3,-35 Q 0,-33 3,-35" stroke="#C4A574" strokeWidth="1" fill="none" />

                        {/* Cricket ball - in hand */}
                        <g transform="translate(15, -75)">
                            <circle cx="0" cy="0" r="7" fill="url(#ballGradient)" />
                            <path d="M -5,-3 Q -2,-5 0,-3 Q 2,-5 5,-3" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
                            <path d="M -5,3 Q -2,1 0,3 Q 2,1 5,3" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
                            <ellipse cx="0" cy="0" rx="7" ry="7" fill="none" stroke="#AA0000" strokeWidth="0.5" />
                        </g>

                        {/* Motion lines */}
                        <path d="M 20,-70 Q 25,-75 30,-70" stroke="#DDD" strokeWidth="2" opacity="0.4" fill="none" />
                        <path d="M 22,-65 Q 27,-70 32,-65" stroke="#DDD" strokeWidth="2" opacity="0.3" fill="none" />
                    </g>
                </svg>
            )
        }
    }

    return (
        <div className="relative">
            <Card
                className={cn(
                    "bg-white/95 backdrop-blur-sm border-2 cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02]",
                    selectedPlayer ? "border-teal-500 shadow-lg shadow-teal-500/20" : "border-gray-200"
                )}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="p-4 sm:p-6 flex flex-col items-center gap-3 sm:gap-4">
                    {/* Icon */}
                    <div className={cn(
                        "w-20 h-24 sm:w-24 sm:h-28 rounded-2xl flex items-center justify-center transition-all",
                        selectedPlayer ? "bg-teal-50" : "bg-gray-100"
                    )}>
                        <div className={cn(
                            "w-16 h-20 sm:w-20 sm:h-24",
                            selectedPlayer ? "text-teal-600" : "text-gray-400"
                        )}>
                            {getIconSvg()}
                        </div>
                    </div>

                    {/* Title and Selection */}
                    <div className="text-center w-full">
                        <p className={cn(
                            "text-xs sm:text-sm font-semibold mb-1",
                            selectedPlayer ? "text-teal-600" : "text-gray-600"
                        )}>
                            {title}
                        </p>
                        {selectedPlayerData && (
                            <p className="text-sm sm:text-base font-bold text-gray-900 truncate">
                                {selectedPlayerData.name}
                            </p>
                        )}
                    </div>
                </div>
            </Card>

            {/* Player Selection Dropdown */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-30"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-64 overflow-y-auto z-40">
                        {players.map((player) => {
                            const playerId = player._id || player.id;
                            const isDisabled = disabledPlayers.includes(playerId)
                            const isSelected = selectedPlayer === playerId

                            return (
                                <button
                                    key={playerId}
                                    className={cn(
                                        "w-full px-4 py-3 text-left transition-colors border-b border-gray-100 last:border-0",
                                        isDisabled && "opacity-40 cursor-not-allowed",
                                        !isDisabled && !isSelected && "hover:bg-gray-50",
                                        isSelected && "bg-teal-50 text-teal-700 font-semibold"
                                    )}
                                    onClick={() => {
                                        if (!isDisabled) {
                                            onSelect(playerId)
                                            setIsOpen(false)
                                        }
                                    }}
                                    disabled={isDisabled}
                                >
                                    {player.name}
                                </button>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}

// Wrapper component with Suspense to prevent hydration errors
export default function StartInningsPage({ params }) {
    const { id } = use(params)

    return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <StartInningsContent id={id} />
        </Suspense>
    )
}
