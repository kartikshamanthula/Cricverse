"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Users, Edit } from 'lucide-react';
import { RosterModal } from '@/components/teams/RosterModal';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const mockTeams = [
    { id: 1, name: "Royal Strikers", captain: "Virat K.", players: 15, logo: "/logos/royal.png", color: "from-yellow-400 to-orange-500", stats: { won: 12, played: 15 } },
    { id: 2, name: "Thunder XI", captain: "Rohit S.", players: 14, logo: "/logos/thunder.png", color: "from-blue-400 to-indigo-600", stats: { won: 8, played: 14 } },
    { id: 3, name: "Spartans", captain: "MS Dhoni", players: 16, logo: "/logos/spartans.png", color: "from-red-500 to-pink-600", stats: { won: 10, played: 12 } },
    { id: 4, name: "Ninjas", captain: "Kane W.", players: 13, logo: "/logos/ninjas.png", color: "from-emerald-400 to-green-600", stats: { won: 5, played: 10 } },
    { id: 5, name: "Super Kings", captain: "Faf D.", players: 18, logo: "/logos/superkings.png", color: "from-yellow-300 to-yellow-500", stats: { won: 9, played: 11 } },
];

// Helper function to generate color gradient for teams
const getTeamColor = (index) => {
    const colors = [
        "from-yellow-400 to-orange-500",
        "from-blue-400 to-indigo-600",
        "from-red-500 to-pink-600",
        "from-emerald-400 to-green-600",
        "from-purple-400 to-purple-600",
        "from-cyan-400 to-cyan-600",
    ];
    return colors[index % colors.length];
};

// Export as dynamic component with SSR disabled to prevent hydration mismatches
import dynamic from 'next/dynamic';

function TeamsPage() {
    // ... existing component code ...
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [isRosterOpen, setIsRosterOpen] = useState(false);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [teamToDelete, setTeamToDelete] = useState(null);

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/teams');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch teams');
            }

            // Process teams for display
            const processedTeams = data.data.map((team, index) => ({
                ...team,
                id: team._id, // MongoDB uses _id
                playerCount: Array.isArray(team.players) ? team.players.length : 0,
                color: team.color || getTeamColor(index),
                stats: {
                    won: team.stats?.won || 0,
                    played: team.stats?.played || 0,
                }
            }));

            setTeams(processedTeams);
        } catch (error) {
            console.error('Error fetching teams:', error);
            setError(error.message);
            toast.error('Failed to load teams', {
                description: error.message || 'Please try again later.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleViewRoster = (team) => {
        setSelectedTeam(team);
        setIsRosterOpen(true);
    };

    const handleDeleteClick = (team) => {
        setTeamToDelete(team);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteTeam = async () => {
        if (!teamToDelete) return;

        try {
            const response = await fetch(`/api/teams/${teamToDelete.id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete team');
            }

            // Update state to remove from UI
            setTeams(teams.filter(team => team.id !== teamToDelete.id));

            toast.success("Team Deleted", {
                description: `${teamToDelete.name} has been removed successfully.`
            });
            setDeleteDialogOpen(false);
            setTeamToDelete(null);
        } catch (error) {
            console.error('Error deleting team:', error);
            toast.error('Failed to delete team', {
                description: error.message || 'Please try again later.'
            });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground drop-shadow-md">Teams</h1>
                    <p className="text-muted-foreground text-base sm:text-lg">Manage squads and player rosters.</p>
                </div>
                <Button asChild size="lg" className="w-full sm:w-auto font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                    <Link href="/teams/create">
                        <Plus className="mr-2 h-5 w-5" /> Register Team
                    </Link>
                </Button>
            </div>

            {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="overflow-hidden bg-card/40 backdrop-blur-md animate-pulse">
                            <div className="h-1.5 bg-primary/20" />
                            <CardHeader className="text-center pt-10 pb-2">
                                <div className="w-24 h-24 mx-auto rounded-3xl bg-muted/50 mb-4" />
                                <div className="h-6 bg-muted/50 rounded w-3/4 mx-auto mb-2" />
                                <div className="h-4 bg-muted/50 rounded w-1/2 mx-auto" />
                            </CardHeader>
                            <CardContent className="pb-6">
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="h-16 bg-muted/50 rounded-2xl" />
                                    <div className="h-16 bg-muted/50 rounded-2xl" />
                                    <div className="h-16 bg-muted/50 rounded-2xl" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : error ? (
                <Card className="p-8 text-center">
                    <p className="text-destructive font-semibold mb-2">Failed to load teams</p>
                    <p className="text-muted-foreground text-sm mb-4">{error}</p>
                    <Button onClick={fetchTeams} variant="outline">
                        Try Again
                    </Button>
                </Card>
            ) : teams.length === 0 ? (
                <Card className="p-12 text-center">
                    <Users className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                    <h3 className="text-xl font-bold mb-2">No Teams Yet</h3>
                    <p className="text-muted-foreground mb-6">Get started by creating your first team</p>
                    <Button asChild>
                        <Link href="/teams/create">
                            <Plus className="mr-2 h-4 w-4" /> Create Team
                        </Link>
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {teams.map((team) => (
                        <Card key={team.id} className="group overflow-hidden bg-card/40 backdrop-blur-md hover:bg-card/60 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 relative border border-primary/5">
                            <div className={`absolute top-0 left-0 w-full h-1.5 bg-linear-to-r ${team.color} z-20`} />

                            {/* Status Badge */}
                            <div className="absolute top-4 left-4 z-20">
                                <div className="px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20 text-[10px] font-black uppercase text-green-500 tracking-wider">
                                    Active
                                </div>
                            </div>

                            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 z-20">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteClick(team)}
                                    className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm border border-destructive/20 hover:bg-destructive/20 hover:border-destructive/40"
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>

                            <CardHeader className="text-center pt-10 pb-2 relative z-10 transition-transform duration-500 group-hover:scale-105">
                                <div className="relative mx-auto mb-4">
                                    <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-linear-to-br ${team.color} flex items-center justify-center shadow-2xl group-hover:rotate-6 transition-all duration-500 ring-4 ring-background/50 overflow-hidden`}>
                                        {team.logoUrl ? (
                                            <img src={team.logoUrl} alt={team.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-3xl sm:text-4xl font-black text-white drop-shadow-lg">{team.name.substring(0, 1)}</span>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-background p-1.5 rounded-xl shadow-lg border border-primary/10">
                                        <Users className="h-4 w-4 text-primary" />
                                    </div>
                                </div>
                                <CardTitle className="text-xl sm:text-2xl font-black tracking-tight" suppressHydrationWarning>{team.name}</CardTitle>
                                <p className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1" suppressHydrationWarning>Captain: <span className="text-primary">{team.captain}</span></p>
                            </CardHeader>

                            <CardContent className="pb-6 relative z-10">
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="flex flex-col items-center p-2 sm:p-3 bg-secondary/20 rounded-2xl transition-colors group-hover:bg-secondary/30">
                                        <span className="font-black text-lg sm:text-xl" suppressHydrationWarning>{team.playerCount}</span>
                                        <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">Players</span>
                                    </div>
                                    <div className="flex flex-col items-center p-2 sm:p-3 bg-green-500/5 rounded-2xl transition-colors group-hover:bg-green-500/10">
                                        <span className="font-black text-lg sm:text-xl text-green-500" suppressHydrationWarning>{team.stats.won}</span>
                                        <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">Won</span>
                                    </div>
                                    <div className="flex flex-col items-center p-2 sm:p-3 bg-primary/5 rounded-2xl transition-colors group-hover:bg-primary/10">
                                        <span className="font-black text-lg sm:text-xl text-primary" suppressHydrationWarning>{team.stats.played}</span>
                                        <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">Played</span>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="pb-6 pt-0 relative z-10 px-6 flex gap-2">
                                <Button asChild
                                    className="flex-1 font-black text-sm uppercase tracking-widest h-12 rounded-xl border-2 hover:bg-primary hover:text-white hover:border-transparent transition-all duration-500 shadow-md hover:shadow-xl"
                                    variant="outline"
                                >
                                    <Link href={`/teams/${team.id}/edit`}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </Link>
                                </Button>
                                <Button
                                    onClick={() => handleViewRoster(team)}
                                    className="flex-1 font-black text-sm uppercase tracking-widest h-12 rounded-xl border-2 hover:bg-primary hover:text-white hover:border-transparent transition-all duration-500 shadow-md hover:shadow-xl"
                                    variant="outline"
                                >
                                    View Squad
                                </Button>
                            </CardFooter>

                            {/* Background Decorative Elements */}
                            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl group-hover:from-primary/20 transition-all duration-700" />
                            <div className="absolute -top-12 -left-12 w-32 h-32 bg-gradient-to-br from-secondary/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                        </Card>
                    ))}
                </div>
            )}

            <RosterModal
                isOpen={isRosterOpen}
                onClose={() => setIsRosterOpen(false)}
                team={selectedTeam}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Team</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-semibold">{teamToDelete?.name}</span>?
                            This action cannot be undone and all player data for this team will be lost.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDeleteTeam}
                        >
                            Delete Team
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default dynamic(() => Promise.resolve(TeamsPage), {
    ssr: false
});
