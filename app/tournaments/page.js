"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trophy, Calendar, Users, ArrowRight, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function TournamentsPage() {
    const [tournaments, setTournaments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [tournamentToDelete, setTournamentToDelete] = useState(null);

    useEffect(() => {
        loadTournaments();
    }, []);

    const loadTournaments = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/tournaments');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch tournaments');
            }

            setTournaments(data.data);
        } catch (error) {
            console.error('Error loading tournaments:', error);
            toast.error('Failed to load tournaments');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (e, tournament) => {
        e.preventDefault();
        setTournamentToDelete(tournament);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!tournamentToDelete) return;

        try {
            const response = await fetch(`/api/tournaments/${tournamentToDelete._id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete tournament');
            }

            setTournaments(tournaments.filter(t => t._id !== tournamentToDelete._id));
            toast.success("Tournament deleted successfully");
            setDeleteDialogOpen(false);
            setTournamentToDelete(null);
        } catch (error) {
            console.error('Error deleting tournament:', error);
            toast.error('Failed to delete tournament');
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-foreground drop-shadow-md">Tournaments</h1>
                        <p className="text-muted-foreground text-lg">Manage leagues, cups, and series.</p>
                    </div>
                    <Button asChild size="lg" className="font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                        <Link href="/tournaments/create">
                            <Plus className="mr-2 h-5 w-5" /> Host Tournament
                        </Link>
                    </Button>
                </div>
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {[1, 2].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="h-16 bg-muted rounded" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground drop-shadow-md">Tournaments</h1>
                    <p className="text-muted-foreground text-lg">Manage leagues, cups, and series.</p>
                </div>
                <Button asChild size="lg" className="font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                    <Link href="/tournaments/create">
                        <Plus className="mr-2 h-5 w-5" /> Host Tournament
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {tournaments.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-muted/20 rounded-xl border-2 border-dashed">
                        <p className="text-muted-foreground mb-4">No tournaments found</p>
                        <Button asChild variant="outline">
                            <Link href="/tournaments/create">Create your first tournament</Link>
                        </Button>
                    </div>
                ) : (
                    tournaments.map((tournament) => (
                        <Card
                            key={tournament._id}
                            className="group overflow-hidden border-0 bg-gradient-to-br from-card via-card to-card/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative"
                        >
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            <CardContent className="p-6 relative">
                                <div className="flex flex-col sm:flex-row gap-6">
                                    {/* Left side - Icon/Trophy */}
                                    <div className="flex-shrink-0">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <Trophy className="h-8 w-8 text-primary" />
                                        </div>
                                    </div>

                                    {/* Middle - Tournament Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-xl font-black tracking-tight group-hover:text-primary transition-colors truncate" suppressHydrationWarning>
                                                    {tournament.name}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span suppressHydrationWarning>Starts {tournament.startDate}</span>
                                                </div>
                                            </div>

                                            {/* Status badges */}
                                            <div className="flex flex-col gap-2 items-end">
                                                <Badge
                                                    variant="outline"
                                                    className="border-primary/30 bg-primary/10 text-primary font-semibold text-xs uppercase tracking-wide"
                                                    suppressHydrationWarning
                                                >
                                                    {tournament.type || 'League'}
                                                </Badge>
                                                {tournament.status === 'ongoing' && (
                                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                                                        <span className="flex h-2 w-2">
                                                            <span className="animate-ping absolute h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                        </span>
                                                        <span className="text-xs font-semibold text-green-600 dark:text-green-400">Live</span>
                                                    </div>
                                                )}
                                                {tournament.status === 'completed' && (
                                                    <Badge className="bg-green-600 text-xs">Completed</Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center gap-6 mt-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Teams</p>
                                                    <p className="text-sm font-bold" suppressHydrationWarning>{tournament.participatingTeams?.length || 0}</p>
                                                </div>
                                            </div>

                                            <div className="w-px h-10 bg-border" />

                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                                    <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Matches</p>
                                                    <p className="text-sm font-bold" suppressHydrationWarning>{tournament.fixtures?.filter(f => f.matchId).length || 0}</p>
                                                </div>
                                            </div>

                                            {tournament.rules?.oversPerMatch && (
                                                <>
                                                    <div className="w-px h-10 bg-border" />
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                                            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{tournament.rules.oversPerMatch}</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Overs</p>
                                                            <p className="text-sm font-bold">Per Innings</p>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 mt-5">
                                            <Button
                                                asChild
                                                className="flex-1 font-semibold shadow-md group-hover:shadow-lg group-hover:shadow-primary/20 transition-all"
                                            >
                                                <Link href={`/tournaments/${tournament._id}`} className="flex items-center justify-center gap-2">
                                                    Manage Tournament
                                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-10 w-10 border-destructive/20 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/40 transition-all"
                                                onClick={(e) => handleDeleteClick(e, tournament)}
                                                title="Delete Tournament"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Tournament</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-semibold">{tournamentToDelete?.name}</span>?
                            This action cannot be undone. Note that this will not delete the matches linked to it.
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
                            onClick={confirmDelete}
                        >
                            Delete Tournament
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
