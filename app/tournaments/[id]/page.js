"use client"

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Calendar, MapPin, Plus, Users as UsersIcon, X, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function TournamentDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id;

    const [tournament, setTournament] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [teams, setTeams] = useState([]);
    const [showAddTeamDialog, setShowAddTeamDialog] = useState(false);
    const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamCaptain, setNewTeamCaptain] = useState('');
    const [isCreatingTeam, setIsCreatingTeam] = useState(false);
    const [showScheduleMatchDialog, setShowScheduleMatchDialog] = useState(false);
    const [selectedTeamA, setSelectedTeamA] = useState('');
    const [selectedTeamB, setSelectedTeamB] = useState('');
    const [matchVenue, setMatchVenue] = useState('');
    const [matchDate, setMatchDate] = useState('');
    const [matchOvers, setMatchOvers] = useState('20');
    const [matchStage, setMatchStage] = useState('League Match');
    const [isCreatingMatch, setIsCreatingMatch] = useState(false);
    const [viewTeamDialog, setViewTeamDialog] = useState(false);
    const [selectedTeamToView, setSelectedTeamToView] = useState(null);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [playersList, setPlayersList] = useState([]);
    const [deletingTeamId, setDeletingTeamId] = useState(null);
    const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
    const [teamToDelete, setTeamToDelete] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [showWinnerDialog, setShowWinnerDialog] = useState(false);
    const [selectedWinner, setSelectedWinner] = useState('');
    const [isSettingWinner, setIsSettingWinner] = useState(false);



    useEffect(() => {
        if (id) {
            loadTournament();
            loadTeams();
        }
    }, [id]);

    const handleDeleteTeam = async (teamId) => {
        try {
            setDeletingTeamId(teamId);

            // First remove from tournament to prevent ghost teams
            await fetch(`/api/tournaments/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    removeTeam: teamId,
                }),
            });

            // Then delete the team entirely
            const response = await fetch(`/api/teams/${teamId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete team');
            }

            toast.success('Team deleted successfully!');
            setShowDeleteConfirmDialog(false);
            setTeamToDelete(null);
            loadTournament(false);
            loadTeams();
        } catch (error) {
            console.error('Error deleting team:', error);
            toast.error(error.message || 'Failed to delete team');
        } finally {
            setDeletingTeamId(null);
        }
    };

    const loadTeams = async () => {
        try {
            const response = await fetch('/api/teams');
            const data = await response.json();
            if (response.ok) {
                setTeams(data.data || []);
            }
        } catch (error) {
            console.error('Error loading teams:', error);
        }
    };

    const loadTournament = async (showLoading = true) => {
        try {
            if (showLoading) setIsLoading(true);
            const response = await fetch(`/api/tournaments/${id}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch tournament');
            }

            setTournament(data.data);
        } catch (error) {
            console.error('Error loading tournament:', error);
        } finally {
            if (showLoading) setIsLoading(false);
        }
    };

    const handleAddTeamToTournament = async (teamId) => {
        try {
            const response = await fetch(`/api/tournaments/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    addTeam: {
                        teamId: teamId,
                    },
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to add team');
            }

            toast.success('Team added to tournament!');
            setShowAddTeamDialog(false);
            loadTournament(false); // Reload tournament data without skeleton
        } catch (error) {
            console.error('Error adding team:', error);
            toast.error(error.message || 'Failed to add team');
        }
    };

    const handleAddPlayer = () => {
        if (!newPlayerName.trim()) {
            toast.error('Please enter a player name');
            return;
        }
        if (playersList.length >= 11) {
            toast.error('A team can have a maximum of 11 players.');
            return;
        }
        setPlayersList([...playersList, { name: newPlayerName.trim() }]);
        setNewPlayerName('');
    };

    const handleRemovePlayer = (index) => {
        const updatedList = [...playersList];
        updatedList.splice(index, 1);
        setPlayersList(updatedList);
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();

        if (!newTeamName.trim()) {
            toast.error('Please enter a team name');
            return;
        }

        if (!newTeamCaptain.trim()) {
            toast.error('Please enter a captain name');
            return;
        }

        if (playersList.length !== 11) {
            toast.error('A team must have exactly 11 players.');
            return;
        }

        try {
            setIsCreatingTeam(true);
            const response = await fetch('/api/teams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newTeamName,
                    captain: newTeamCaptain,
                    players: playersList,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create team');
            }

            toast.success('Team created successfully!');
            setNewTeamName('');
            setNewTeamCaptain('');
            setPlayersList([]);
            setNewPlayerName('');
            setShowCreateTeamDialog(false);
            loadTeams(); // Reload teams list
        } catch (error) {
            console.error('Error creating team:', error);
            toast.error(error.message || 'Failed to create team');
        } finally {
            setIsCreatingTeam(false);
        }
    };

    const handleScheduleMatch = async (e) => {
        e.preventDefault();

        if (!selectedTeamA || !selectedTeamB) {
            toast.error('Please select both teams');
            return;
        }

        if (selectedTeamA === selectedTeamB) {
            toast.error('Please select different teams');
            return;
        }

        try {
            setIsCreatingMatch(true);

            // Create the match
            const matchResponse = await fetch('/api/matches', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    teamA: selectedTeamA,
                    teamB: selectedTeamB,
                    venue: matchVenue || tournament.venue,
                    date: matchDate || new Date().toISOString().split('T')[0],
                    overs: parseInt(matchOvers) || 20, // Use selected overs
                    type: tournament.type || 'League',
                    matchType: 'Tournament',
                    tournamentId: id,
                    tournamentName: tournament.name
                }),
            });

            const matchData = await matchResponse.json();

            if (!matchResponse.ok) {
                throw new Error(matchData.error || 'Failed to create match');
            }

            // Add match to tournament fixtures
            const tournamentResponse = await fetch(`/api/tournaments/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    addFixture: {
                        matchId: matchData._id, // Fixed: removed .data
                        matchNumber: matchStage === 'League Match' ? `Match ${(tournament.fixtures?.length || 0) + 1}` : matchStage,
                        teamA: selectedTeamA,
                        teamB: selectedTeamB,
                        scheduledDate: matchDate || new Date(),
                        status: 'scheduled',
                    },
                }),
            });

            if (!tournamentResponse.ok) {
                throw new Error('Failed to add match to tournament');
            }

            toast.success('Match scheduled successfully!');
            setSelectedTeamA('');
            setSelectedTeamB('');
            setMatchVenue('');
            setMatchDate('');
            setMatchOvers('20');
            setMatchStage('League Match');
            setShowScheduleMatchDialog(false);
            loadTournament(false); // Reload tournament data without skeleton
        } catch (error) {
            console.error('Error scheduling match:', error);
            toast.error(error.message || 'Failed to schedule match');
        } finally {
            setIsCreatingMatch(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6 pb-10">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/tournaments" className="hover:text-foreground flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        Tournaments
                    </Link>
                    <span>/</span>
                    <span>Loading...</span>
                </div>
                <div className="space-y-4">
                    <div className="h-12 bg-muted animate-pulse rounded" />
                    <div className="h-8 bg-muted animate-pulse rounded w-1/2" />
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i} className="animate-pulse">
                                <CardContent className="p-6">
                                    <div className="h-20 bg-muted rounded" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!tournament) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">Tournament not found</p>
                    <Button asChild variant="outline">
                        <Link href="/tournaments">Back to Tournaments</Link>
                    </Button>
                </Card>
            </div>
        );
    }

    const teamsCount = tournament.participatingTeams?.length || 0;
    const matchesCount = tournament.fixtures?.filter(f => f.matchId).length || 0;

    const handleSetWinner = async () => {
        if (!selectedWinner) {
            toast.error("Please select a team");
            return;
        }

        try {
            setIsSettingWinner(true);
            const response = await fetch(`/api/tournaments/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prize: {
                        winner: selectedWinner,
                        runnerUp: tournament.prize?.runnerUp || ''
                    },
                    status: 'completed'
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update tournament winner');
            }

            toast.success("Tournament winner declared!");
            setShowWinnerDialog(false);
            loadTournament(false);
        } catch (error) {
            console.error('Error setting winner:', error);
            toast.error(error.message || 'Failed to set winner');
        } finally {
            setIsSettingWinner(false);
        }
    };

    // Calculate dynamic team stats based on fixtures
    const teamStats = tournament.participatingTeams?.map(pt => {
        const teamName = pt.teamId?.name || pt.name;
        let played = 0;
        let won = 0;
        let lost = 0;

        tournament.fixtures?.forEach(fixture => {
            const matchData = typeof fixture.matchId === 'object' ? fixture.matchId : null;
            if (matchData && matchData.status === 'completed') {
                if (matchData.teamA?.name === teamName || matchData.teamB?.name === teamName) {
                    played++;
                    if (matchData.result?.winnerName) {
                        if (matchData.result.winnerName === teamName) {
                            won++;
                        } else {
                            lost++;
                        }
                    }
                }
            }
        });

        return {
            ...pt,
            name: teamName,
            played,
            won,
            lost
        };
    }) || [];

    return (
        <div className="space-y-6 pb-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/tournaments" className="hover:text-foreground flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    Tournaments
                </Link>
                <span>/</span>
                <span className="text-foreground" suppressHydrationWarning>{tournament.name}</span>
            </div>

            {/* Tournament Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-black mb-2" suppressHydrationWarning>{tournament.name}</h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span suppressHydrationWarning>{tournament.startDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span suppressHydrationWarning>{tournament.venue}</span>
                        </div>
                    </div>
                </div>
                <Badge
                    className="bg-green-600 text-white uppercase font-bold px-4 py-2"
                    suppressHydrationWarning
                >
                    {tournament.status || 'Upcoming'}
                </Badge>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0">
                    <TabsTrigger
                        value="overview"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                    >
                        Overview
                    </TabsTrigger>
                    <TabsTrigger
                        value="matches"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                    >
                        Matches ({matchesCount})
                    </TabsTrigger>
                    <TabsTrigger
                        value="teams"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                    >
                        Teams ({teamsCount})
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="mt-6 space-y-8">
                    {/* Champion Section */}
                    {tournament.status === 'completed' || tournament.prize?.winner ? (
                        <div className="bg-gradient-to-r from-yellow-500/10 via-yellow-500/20 to-yellow-500/10 border-2 border-yellow-500/50 rounded-xl p-8 text-center shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 text-yellow-500/20">
                                <Trophy className="w-32 h-32" />
                            </div>
                            <h2 className="text-2xl font-black text-yellow-600 dark:text-yellow-400 mb-2 uppercase tracking-widest">Tournament Champion</h2>
                            <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-yellow-400" suppressHydrationWarning>
                                🏆 {tournament.prize?.winner} 🏆
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border border-muted">
                            <div>
                                <h3 className="font-semibold text-lg">Tournament Winner</h3>
                                <p className="text-sm text-muted-foreground">Declare the champion of this tournament</p>
                            </div>
                            <Dialog open={showWinnerDialog} onOpenChange={setShowWinnerDialog}>
                                <DialogTrigger asChild>
                                    <Button disabled={teamsCount === 0}>Select Winner</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Declare Tournament Winner</DialogTitle>
                                        <DialogDescription>
                                            Select the team that won the tournament. This action will mark the tournament as completed.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Select Team</Label>
                                            <Select value={selectedWinner} onValueChange={setSelectedWinner}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select champion team" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {tournament.participatingTeams?.map((pt) => (
                                                        <SelectItem key={pt._id} value={pt.teamId?.name || pt.name}>
                                                            {pt.teamId?.name || pt.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setShowWinnerDialog(false)}>Cancel</Button>
                                        <Button onClick={handleSetWinner} disabled={!selectedWinner || isSettingWinner}>
                                            {isSettingWinner ? 'Saving...' : 'Confirm Winner'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}

                    {/* Main Stats Grid */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card>
                            <CardContent className="p-6">
                                <div className="text-sm text-muted-foreground mb-2">Tournament Type</div>
                                <div className="text-2xl font-bold" suppressHydrationWarning>{tournament.type || 'League'}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="text-sm text-muted-foreground mb-2">Teams</div>
                                <div className="text-2xl font-bold" suppressHydrationWarning>{teamsCount}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="text-sm text-muted-foreground mb-2">Matches</div>
                                <div className="text-2xl font-bold" suppressHydrationWarning>{matchesCount}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Team Performance Cards */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Team Standings</h3>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {teamStats.map((team, index) => (
                                <Card key={index} className="overflow-hidden hover:border-primary/50 transition-colors">
                                    <div className="h-2 bg-primary/20 w-full" />
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-3 mb-4">
                                            {team.teamId?.logoUrl ? (
                                                <div className="h-10 w-10 rounded-full overflow-hidden bg-muted flex items-center justify-center border shrink-0">
                                                    <img src={team.teamId.logoUrl} alt={team.name} className="h-full w-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                                                    {team.name?.substring(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                            <h4 className="font-bold text-lg truncate" suppressHydrationWarning>{team.name}</h4>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 text-center divide-x">
                                            <div>
                                                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Played</div>
                                                <div className="text-xl font-bold font-mono">{team.played}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-green-600 dark:text-green-500 uppercase tracking-wider mb-1">Won</div>
                                                <div className="text-xl font-bold font-mono text-green-600 dark:text-green-500">{team.won}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-red-600 dark:text-red-500 uppercase tracking-wider mb-1">Lost</div>
                                                <div className="text-xl font-bold font-mono text-red-600 dark:text-red-500">{team.lost}</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {teamStats.length === 0 && (
                                <div className="col-span-full text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                    No teams have joined this tournament yet.
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* Matches Tab */}
                <TabsContent value="matches" className="mt-6">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold">Tournament Matches</h2>

                            {/* Schedule Match Dialog */}
                            <Dialog open={showScheduleMatchDialog} onOpenChange={setShowScheduleMatchDialog}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="gap-2" disabled={teamsCount < 2} suppressHydrationWarning>
                                        <Plus className="h-4 w-4" />
                                        Schedule Match
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Schedule New Match</DialogTitle>
                                        <DialogDescription>
                                            Create a match between two participating teams
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleScheduleMatch} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="teamA">Team A *</Label>
                                            <Select value={selectedTeamA} onValueChange={setSelectedTeamA} required>
                                                <SelectTrigger id="teamA">
                                                    <SelectValue placeholder="Select first team" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {tournament.participatingTeams.map((pt) => (
                                                        <SelectItem
                                                            key={pt._id}
                                                            value={pt.teamId?._id || pt.teamId}
                                                            disabled={selectedTeamB === (pt.teamId?._id || pt.teamId)}
                                                        >
                                                            {pt.teamId?.name || 'Unknown Team'}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="teamB">Team B *</Label>
                                            <Select value={selectedTeamB} onValueChange={setSelectedTeamB} required>
                                                <SelectTrigger id="teamB">
                                                    <SelectValue placeholder="Select second team" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {tournament.participatingTeams.map((pt) => (
                                                        <SelectItem
                                                            key={pt._id}
                                                            value={pt.teamId?._id || pt.teamId}
                                                            disabled={selectedTeamA === (pt.teamId?._id || pt.teamId)}
                                                        >
                                                            {pt.teamId?.name || 'Unknown Team'}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="matchVenue">Venue (Optional)</Label>
                                            <Input
                                                id="matchVenue"
                                                placeholder={`Default: ${tournament.venue}`}
                                                value={matchVenue}
                                                onChange={(e) => setMatchVenue(e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="matchDate">Date (Optional)</Label>
                                            <Input
                                                id="matchDate"
                                                type="date"
                                                value={matchDate}
                                                onChange={(e) => setMatchDate(e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="matchOvers">Overs *</Label>
                                            <Input
                                                id="matchOvers"
                                                type="number"
                                                min="1"
                                                max="50"
                                                placeholder="20"
                                                value={matchOvers}
                                                onChange={(e) => setMatchOvers(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="matchStage">Match Stage *</Label>
                                            <Select value={matchStage} onValueChange={setMatchStage} required>
                                                <SelectTrigger id="matchStage">
                                                    <SelectValue placeholder="Select match stage" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="League Match">League Match</SelectItem>
                                                    <SelectItem value="Semi-Final">Semi-Final</SelectItem>
                                                    <SelectItem value="Final">Final</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <DialogFooter>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setShowScheduleMatchDialog(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={isCreatingMatch}>
                                                {isCreatingMatch ? 'Scheduling...' : 'Schedule Match'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                        {matchesCount > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {tournament.fixtures.filter(f => f.matchId).map((fixture, index) => {
                                    // Get team names by matching IDs from participating teams
                                    let teamAName = 'Team A';
                                    let teamBName = 'Team B';

                                    // Convert fixture team IDs to strings for comparison
                                    const fixtureTeamAId = fixture.teamA?.toString();
                                    const fixtureTeamBId = fixture.teamB?.toString();

                                    // Find team A by matching ID
                                    const teamAMatch = tournament.participatingTeams.find(pt => {
                                        const ptId = (pt.teamId?._id || pt.teamId)?.toString();
                                        return ptId === fixtureTeamAId;
                                    });

                                    if (teamAMatch) {
                                        teamAName = teamAMatch.teamId?.name || teamAMatch.name || 'Team A';
                                    }

                                    // Find team B by matching ID
                                    const teamBMatch = tournament.participatingTeams.find(pt => {
                                        const ptId = (pt.teamId?._id || pt.teamId)?.toString();
                                        return ptId === fixtureTeamBId;
                                    });

                                    if (teamBMatch) {
                                        teamBName = teamBMatch.teamId?.name || teamBMatch.name || 'Team B';
                                    }

                                    const status = fixture.status || 'scheduled';

                                    // Get match data if available
                                    const matchData = typeof fixture.matchId === 'object' ? fixture.matchId : null;
                                    const isCompleted = status === 'completed' || matchData?.status === 'completed';
                                    const isLive = status === 'live' || matchData?.status === 'live';

                                    const isSemiFinal = fixture.matchNumber === 'Semi-Final';
                                    const isFinal = fixture.matchNumber === 'Final';

                                    let cardClassName = "hover:shadow-md transition-all duration-300 relative overflow-hidden group";
                                    if (isFinal) {
                                        cardClassName += " border-2 border-yellow-500/50 hover:border-yellow-500 hover:shadow-xl hover:shadow-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-transparent";
                                    } else if (isSemiFinal) {
                                        cardClassName += " border-2 border-primary/40 hover:border-primary hover:shadow-xl hover:shadow-primary/20 bg-gradient-to-br from-primary/5 to-transparent";
                                    }

                                    return (
                                        <Card key={index} className={cardClassName}>
                                            {isFinal && <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600" />}
                                            {isSemiFinal && <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/60 via-primary to-primary/80" />}
                                            <CardContent className="p-5">
                                                {/* Header */}
                                                <div className="flex items-center justify-between mb-3 relative z-10">
                                                    <span className={`font-bold flex items-center gap-2 ${isFinal ? 'text-yellow-600 dark:text-yellow-400 text-lg uppercase tracking-widest' : isSemiFinal ? 'text-primary text-base uppercase tracking-wider' : 'text-sm text-muted-foreground'}`}>
                                                        {isFinal && <Trophy className="h-4 w-4" />}
                                                        {isSemiFinal && <Trophy className="h-4 w-4" />}
                                                        {fixture.matchNumber || `Match ${index + 1}`}
                                                    </span>
                                                    <Badge
                                                        variant={
                                                            isLive ? 'destructive' :
                                                                isCompleted ? 'secondary' :
                                                                    'outline'
                                                        }
                                                        className={
                                                            isLive ? 'bg-red-500 text-white' :
                                                                isCompleted ? 'bg-green-500 text-white' :
                                                                    ''
                                                        }
                                                        suppressHydrationWarning
                                                    >
                                                        {isLive ? '🔴 Live' :
                                                            isCompleted ? '✓ Completed' :
                                                                '📅 Scheduled'}
                                                    </Badge>
                                                </div>

                                                {/* Match Content */}
                                                {isCompleted ? (
                                                    // Completed match with score
                                                    <div className="space-y-3">
                                                        {/* Teams and Scores */}
                                                        <div className="space-y-2">
                                                            {/* Team A */}
                                                            <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                                                                <span className={`font-semibold ${matchData?.result?.winnerName === teamAName ? 'text-primary' : ''}`}>
                                                                    {teamAName}
                                                                    {matchData?.result?.winnerName === teamAName && ' 🏆'}
                                                                </span>
                                                                <span className="font-bold text-lg" suppressHydrationWarning>
                                                                    {matchData?.innings?.[0]?.battingTeam === teamAName
                                                                        ? `${matchData.innings[0]?.score?.runs || 0}/${matchData.innings[0]?.score?.wickets || 0}`
                                                                        : matchData?.innings?.[1]?.battingTeam === teamAName
                                                                            ? `${matchData.innings[1]?.score?.runs || 0}/${matchData.innings[1]?.score?.wickets || 0}`
                                                                            : '0/0'}
                                                                </span>
                                                            </div>

                                                            {/* Team B */}
                                                            <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                                                                <span className={`font-semibold ${matchData?.result?.winnerName === teamBName ? 'text-primary' : ''}`}>
                                                                    {teamBName}
                                                                    {matchData?.result?.winnerName === teamBName && ' 🏆'}
                                                                </span>
                                                                <span className="font-bold text-lg" suppressHydrationWarning>
                                                                    {matchData?.innings?.[0]?.battingTeam === teamBName
                                                                        ? `${matchData.innings[0]?.score?.runs || 0}/${matchData.innings[0]?.score?.wickets || 0}`
                                                                        : matchData?.innings?.[1]?.battingTeam === teamBName
                                                                            ? `${matchData.innings[1]?.score?.runs || 0}/${matchData.innings[1]?.score?.wickets || 0}`
                                                                            : '0/0'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Result */}
                                                        {matchData?.result?.margin ? (
                                                            <div className="text-center space-y-1">
                                                                <p className="font-bold text-primary" suppressHydrationWarning>
                                                                    Winner: {matchData.result.winnerName} 🏆
                                                                </p>
                                                                <p className="text-sm text-muted-foreground font-medium" suppressHydrationWarning>
                                                                    won by {matchData.result.margin}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            matchData?.result?.winnerName ? (
                                                                <p className="text-center font-bold text-primary" suppressHydrationWarning>
                                                                    Winner: {matchData.result.winnerName} 🏆
                                                                </p>
                                                            ) : (
                                                                <p className="text-center font-bold text-muted-foreground" suppressHydrationWarning>
                                                                    Match Completed
                                                                </p>
                                                            )
                                                        )}

                                                        {/* View Details Button */}
                                                        <Button size="sm" variant="outline" className="w-full" asChild>
                                                            <Link href={`/matches/${typeof fixture.matchId === 'object' ? fixture.matchId?._id : fixture.matchId || fixture._id}`}>
                                                                View Full Scorecard
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    // Scheduled or Live match (simple layout)
                                                    <div className="space-y-3">
                                                        <p className="font-semibold text-lg text-center" suppressHydrationWarning>
                                                            {teamAName} <span className="text-muted-foreground font-normal">vs</span> {teamBName}
                                                        </p>
                                                        <div className="flex flex-col gap-2">
                                                            {isLive ? (
                                                                <Button size="sm" variant="outline" className="w-full" asChild>
                                                                    <Link href={`/matches/${typeof fixture.matchId === 'object' ? fixture.matchId?._id : fixture.matchId || fixture._id}`}>
                                                                        Watch Live
                                                                    </Link>
                                                                </Button>
                                                            ) : (
                                                                !isCompleted && (
                                                                    <Button size="sm" className="w-full" asChild>
                                                                        <Link href={`/matches/${typeof fixture.matchId === 'object' ? fixture.matchId?._id : fixture.matchId || fixture._id}/toss`}>
                                                                            Start Match
                                                                        </Link>
                                                                    </Button>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <Card className="border-dashed">
                                <CardContent className="p-12 text-center">
                                    <p className="text-muted-foreground mb-2">No matches scheduled yet.</p>
                                    <p className="text-sm text-red-500">Add at least 2 teams to start scheduling matches.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                {/* Teams Tab */}
                <TabsContent value="teams" className="mt-6">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold">Participating Teams</h2>

                            {/* Add Team Dialog */}
                            <Dialog open={showAddTeamDialog} onOpenChange={setShowAddTeamDialog}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Add Team
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Add Team to Tournament</DialogTitle>
                                        <DialogDescription>
                                            Select an existing team or create a new one
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4">
                                        {/* Create Team Button */}
                                        <Dialog open={showCreateTeamDialog} onOpenChange={setShowCreateTeamDialog}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" className="w-full gap-2">
                                                    <Plus className="h-4 w-4" />
                                                    Create New Team
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[425px]">
                                                <DialogHeader>
                                                    <DialogTitle>Create New Team</DialogTitle>
                                                    <DialogDescription>
                                                        Create a new team to add to this tournament
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <form onSubmit={handleCreateTeam} className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="teamName">Team Name *</Label>
                                                        <Input
                                                            id="teamName"
                                                            placeholder="Enter team name"
                                                            value={newTeamName}
                                                            onChange={(e) => setNewTeamName(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="captain">Captain *</Label>
                                                        <Input
                                                            id="captain"
                                                            placeholder="Enter captain name"
                                                            value={newTeamCaptain}
                                                            onChange={(e) => setNewTeamCaptain(e.target.value)}
                                                            required
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label>Add Players ({playersList.length}/11)</Label>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                placeholder="Enter player name"
                                                                value={newPlayerName}
                                                                onChange={(e) => setNewPlayerName(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault();
                                                                        handleAddPlayer();
                                                                    }
                                                                }}
                                                                disabled={playersList.length >= 11}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="secondary"
                                                                onClick={handleAddPlayer}
                                                                disabled={playersList.length >= 11}
                                                            >
                                                                Add
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {playersList.length > 0 && (
                                                        <div className="space-y-2">
                                                            <Label>Team Roster ({playersList.length})</Label>
                                                            <div className="border rounded-md p-2 h-32 overflow-y-auto space-y-2 bg-muted/30">
                                                                {playersList.map((player, index) => (
                                                                    <div key={index} className="flex items-center justify-between bg-background p-2 rounded border shadow-sm">
                                                                        <span className="text-sm font-medium">{player.name}</span>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                                            onClick={() => handleRemovePlayer(index)}
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <DialogFooter>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => setShowCreateTeamDialog(false)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button type="submit" disabled={isCreatingTeam}>
                                                            {isCreatingTeam ? 'Creating...' : 'Create Team'}
                                                        </Button>
                                                    </DialogFooter>
                                                </form>
                                            </DialogContent>
                                        </Dialog>

                                        {/* Existing Teams List */}
                                        <div className="space-y-2">
                                            <h3 className="font-semibold text-sm text-muted-foreground">Select Existing Team</h3>
                                            {teams.length > 0 ? (
                                                <div className="grid gap-2">
                                                    {teams
                                                        .filter(team => !tournament.participatingTeams?.some(pt => pt.teamId?._id === team._id))
                                                        .map((team) => (
                                                            <Card
                                                                key={team._id}
                                                                className="cursor-pointer hover:bg-accent transition-colors"
                                                                onClick={() => handleAddTeamToTournament(team._id)}
                                                            >
                                                                <CardContent className="p-4 flex items-center justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                                            <UsersIcon className="h-5 w-5 text-primary" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-semibold">{team.name}</p>
                                                                            <p className="text-sm text-muted-foreground">
                                                                                Captain: {team.captain || 'TBD'} • {team.players?.length || 0} players
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <Plus className="h-5 w-5 text-muted-foreground" />
                                                                </CardContent>
                                                            </Card>
                                                        ))}
                                                    {teams.filter(team => !tournament.participatingTeams?.some(pt => pt.teamId?._id === team._id)).length === 0 && (
                                                        <p className="text-sm text-muted-foreground text-center py-4">
                                                            All available teams have been added to this tournament
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground text-center py-4">
                                                    No teams available. Create a new team to get started.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                        {teamsCount > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {tournament.participatingTeams.map((participatingTeam, index) => (
                                    <Card key={participatingTeam._id || index} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-5">
                                            <div className="flex items-center gap-3 mb-4">
                                                {participatingTeam.teamId?.logo || participatingTeam.teamId?.logoUrl ? (
                                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex shrink-0 items-center justify-center border">
                                                        <img src={participatingTeam.teamId.logo || participatingTeam.teamId.logoUrl} alt={participatingTeam.teamId?.name || 'Team Logo'} className="h-full w-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                        <UsersIcon className="h-6 w-6 text-primary" />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-semibold text-lg" suppressHydrationWarning>
                                                        {participatingTeam.teamId?.name || participatingTeam.name || 'Unknown Team'}
                                                    </p>
                                                    {participatingTeam.teamId?.captain && (
                                                        <p className="text-sm text-muted-foreground">
                                                            Captain: {participatingTeam.teamId.captain}
                                                        </p>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-muted-foreground hover:text-destructive shrink-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setTeamToDelete(participatingTeam.teamId?._id || participatingTeam.teamId);
                                                        setShowDeleteConfirmDialog(true);
                                                    }}
                                                    disabled={deletingTeamId === (participatingTeam.teamId?._id || participatingTeam.teamId)}
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => {
                                                    setSelectedTeamToView(participatingTeam.teamId);
                                                    setViewTeamDialog(true);
                                                }}
                                            >
                                                View Team
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="border-dashed">
                                <CardContent className="p-12 text-center">
                                    <p className="text-muted-foreground">No teams added yet.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* View Team Dialog */}
            <Dialog open={viewTeamDialog} onOpenChange={setViewTeamDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedTeamToView?.name || 'Team Details'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedTeamToView?.captain && `Captain: ${selectedTeamToView.captain}`}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-3">Players ({selectedTeamToView?.players?.length || 0})</h3>
                            {selectedTeamToView?.players && selectedTeamToView.players.length > 0 ? (
                                <div className="grid gap-2 max-h-[400px] overflow-y-auto">
                                    {selectedTeamToView.players.map((player, index) => (
                                        <Card key={index}>
                                            <CardContent className="p-3 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <span className="text-sm font-semibold text-primary">
                                                        {index + 1}
                                                    </span>
                                                </div>
                                                <span className="font-medium">
                                                    {typeof player === 'object' ? player.name : player}
                                                </span>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Card className="border-dashed">
                                    <CardContent className="p-8 text-center">
                                        <p className="text-muted-foreground">No players added to this team yet.</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewTeamDialog(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Team Confirmation Dialog */}
            <Dialog open={showDeleteConfirmDialog} onOpenChange={(open) => {
                if (!open && !deletingTeamId) {
                    setShowDeleteConfirmDialog(false);
                    setTeamToDelete(null);
                }
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Team</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this team? This action cannot be undone and will remove the team from the entire platform.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex space-x-2 justify-end mt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowDeleteConfirmDialog(false);
                                setTeamToDelete(null);
                            }}
                            disabled={deletingTeamId !== null}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (teamToDelete) {
                                    handleDeleteTeam(teamToDelete);
                                }
                            }}
                            disabled={deletingTeamId !== null}
                        >
                            {deletingTeamId ? 'Deleting...' : 'Delete Team'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
