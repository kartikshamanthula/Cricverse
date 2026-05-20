"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Users, User, Shield, X, UserPlus, Upload } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"

const formSchema = z.object({
    teamName: z.string().min(2, {
        message: "Team name must be at least 2 characters.",
    }),
    captain: z.string().min(2, {
        message: "Captain name must be at least 2 characters.",
    }),
    players: z.array(z.object({
        name: z.string(),
    })).min(1, {
        message: "At least 1 player is required.",
    }).max(11, {
        message: "Maximum 11 players allowed.",
    }),
    logoUrl: z.string().optional(),
})

export default function EditTeamPage() {
    const params = useParams();
    const router = useRouter();
    const teamId = params.id;

    const [players, setPlayers] = useState([]);
    const [currentPlayerName, setCurrentPlayerName] = useState("");
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [logoUrl, setLogoUrl] = useState("");

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            teamName: "",
            captain: "",
            players: [],
            logoUrl: "",
        },
    })

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Invalid file type. Please upload an image (JPEG, PNG, WebP, etc.)");
            return;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            toast.error("File too large. Maximum size is 5MB");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            setLogoUrl(data.url);
            form.setValue('logoUrl', data.url);
            toast.success("Logo uploaded successfully");
        } catch (error) {
            console.error('Upload error:', error);
            toast.error("Failed to upload logo", {
                description: error.message
            });
        } finally {
            setIsUploading(false);
        }
    };

    // Load team data from API
    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const response = await fetch(`/api/teams/${teamId}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch team');
                }

                const team = data.data;
                form.setValue('teamName', team.name);
                form.setValue('captain', team.captain);
                form.setValue('logoUrl', team.logoUrl || "");
                setLogoUrl(team.logoUrl || "");

                // Ensure players have IDs for key prop
                const teamPlayers = (team.players || []).map((player, index) => ({
                    ...player,
                    name: player.name,
                    id: player._id || `player-${index}-${Date.now()}`
                }));

                setPlayers(teamPlayers);
                form.setValue('players', teamPlayers);
            } catch (error) {
                console.error("Error fetching team:", error);
                toast.error("Team not found");
                router.push('/teams');
            } finally {
                setLoading(false);
            }
        };

        if (teamId) {
            fetchTeam();
        }
    }, [teamId, form, router]);

    const addPlayer = () => {
        if (!currentPlayerName.trim()) {
            toast.error("Player name is required");
            return;
        }
        if (players.some(p => p.name.toLowerCase() === currentPlayerName.trim().toLowerCase())) {
            toast.error("Player with this name already exists");
            return;
        }
        if (players.length >= 11) {
            toast.error("Maximum 11 players allowed per team");
            return;
        }

        const newPlayer = {
            id: Date.now(), // Temporary ID for UI
            name: currentPlayerName.trim(),
        };

        const updatedPlayers = [...players, newPlayer];
        setPlayers(updatedPlayers);
        form.setValue('players', updatedPlayers);
        setCurrentPlayerName("");
        toast.success(`${newPlayer.name} added to the team`);
    };

    const removePlayer = (playerId) => {
        const updatedPlayers = players.filter(p => p.id !== playerId);
        setPlayers(updatedPlayers);
        form.setValue('players', updatedPlayers);
        toast.success("Player removed");
    };

    async function onSubmit(values) {
        try {
            const teamData = {
                name: values.teamName,
                captain: values.captain,
                logoUrl: values.logoUrl,
                players: values.players.map(p => ({
                    name: p.name
                }))
            };

            const response = await fetch(`/api/teams/${teamId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(teamData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update team');
            }

            toast.success("Team Updated Successfully!", {
                description: `${values.teamName} has been updated.`
            });

            // Redirect to teams page after a short delay
            setTimeout(() => {
                router.push('/teams');
            }, 1000);

        } catch (error) {
            console.error("Error updating team:", error);
            toast.error("Failed to update team.", {
                description: error.message
            });
        }
    }

    // Watch values for live preview
    const watchedValues = form.watch()

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading team data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PageHeader
                title="Edit Team"
                description="Update your team details and roster."
                backHref="/teams"
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Form */}
                <div className="lg:col-span-7">
                    <Card className="border-secondary/20 shadow-2xl bg-card/50 backdrop-blur-md h-full">
                        <CardHeader>
                            <CardTitle>Team Details</CardTitle>
                            <CardDescription>Update the core details for your team.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="teamName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Team Name</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Shield className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                                        <Input placeholder="e.g. Royal Strikers" {...field} className="pl-10 h-12 text-lg bg-background/50 border-input/50 focus:border-primary focus:ring-primary/20 transition-all font-semibold" />
                                                    </div>
                                                </FormControl>
                                                <FormDescription>
                                                    This is the public display name.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Logo Upload Section */}
                                    <div className="space-y-4 pt-2">
                                        <FormLabel className="text-base font-bold">Team Logo</FormLabel>
                                        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-secondary/5 rounded-2xl border border-secondary/20 border-dashed">
                                            <div className="relative group grayscale-0">
                                                <div className="h-24 w-24 rounded-2xl border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-background/50 group-hover:border-primary/50 transition-all duration-300 shadow-inner">
                                                    {logoUrl ? (
                                                        <img src={logoUrl} alt="Logo" className="h-full w-full object-cover animate-in zoom-in-95 duration-300" />
                                                    ) : (
                                                        <Upload className="h-8 w-8 text-muted-foreground/30 group-hover:text-primary/50 transition-colors group-hover:scale-110 duration-300" />
                                                    )}
                                                    {isUploading && (
                                                        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center">
                                                            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                        </div>
                                                    )}
                                                </div>
                                                {logoUrl && !isUploading && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setLogoUrl("");
                                                            form.setValue('logoUrl', "");
                                                        }}
                                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg hover:bg-destructive/90 transition-all hover:scale-110 animate-in fade-in zoom-in duration-200"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex-1 text-center sm:text-left space-y-3">
                                                <div>
                                                    <p className="text-sm font-bold">Upload your team's visual identity</p>
                                                    <p className="text-xs text-muted-foreground/70 mt-1">Make your team stand out with a custom logo.</p>
                                                </div>
                                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                                                    <label className="relative">
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            className="sr-only"
                                                            onChange={handleImageUpload}
                                                            disabled={isUploading}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant={logoUrl ? "outline" : "default"}
                                                            size="sm"
                                                            className="font-bold pointer-events-none shadow-sm"
                                                            disabled={isUploading}
                                                        >
                                                            <Upload className="h-4 w-4 mr-2" />
                                                            {logoUrl ? "Change Logo" : "Upload Logo"}
                                                        </Button>
                                                    </label>
                                                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/50">PNG, JPG or WebP (Max 5MB)</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="captain"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Captain Name</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Input placeholder="e.g. Virat K." {...field} className="pl-9 h-11 bg-background/50 border-input/50" />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Player Management Section */}
                                    <div className="space-y-4 pt-4 border-t border-border/50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold flex items-center gap-2">
                                                    <Users className="h-5 w-5 text-primary" />
                                                    Team Players
                                                </h3>
                                                <p className="text-sm text-muted-foreground">Add players to your squad (max 11)</p>
                                            </div>
                                            <Badge variant="outline" className="text-sm font-bold">
                                                {players.length}/11 Players
                                            </Badge>
                                        </div>

                                        {/* Add Player Form */}
                                        <div className="flex gap-3">
                                            <Input
                                                placeholder="Player name"
                                                value={currentPlayerName}
                                                onChange={(e) => setCurrentPlayerName(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPlayer())}
                                                className="h-11 bg-background/50 border-input/50 flex-1"
                                            />
                                            <Button
                                                type="button"
                                                onClick={addPlayer}
                                                disabled={players.length >= 11}
                                                className="h-11 font-semibold"
                                                variant={players.length >= 11 ? "outline" : "default"}
                                            >
                                                <UserPlus className="h-4 w-4 mr-2" />
                                                Add
                                            </Button>
                                        </div>

                                        {/* Players List */}
                                        {players.length > 0 ? (
                                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                                {players.map((player, index) => (
                                                    <div
                                                        key={player.id}
                                                        className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg border border-secondary/20 hover:bg-secondary/20 transition-colors group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                                                {index + 1}
                                                            </div>
                                                            <p className="font-semibold">{player.name}</p>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removePlayer(player.id)}
                                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed border-muted-foreground/20">
                                                <Users className="h-12 w-12 mx-auto text-muted-foreground/40 mb-2" />
                                                <p className="text-sm text-muted-foreground">No players added yet</p>
                                                <p className="text-xs text-muted-foreground/60">Add players using the form above</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 flex justify-end gap-3">
                                        <Link href="/teams">
                                            <Button variant="outline" size="lg" type="button" className="border-primary/20 hover:bg-primary/10 hover:text-primary">Cancel</Button>
                                        </Link>
                                        <Button type="submit" size="lg" className="font-bold shadow-lg shadow-primary/25 w-full md:w-auto">Update Team</Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Live Preview */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="sticky top-8">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" /> Live Preview
                        </h2>
                        <Card className="overflow-hidden border-primary/20 shadow-primary/10 shadow-2xl bg-linear-to-br from-card to-background">
                            <div className="h-32 bg-linear-to-r from-primary/20 to-secondary/20 flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-grid-white/10 mask-[linear-gradient(0deg,transparent,black)]" />
                                {watchedValues.logoUrl ? (
                                    <div className="relative z-10 h-24 w-24 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-background/50">
                                        <img src={watchedValues.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                                    </div>
                                ) : (
                                    <Shield className="h-20 w-20 text-primary/40 animate-pulse" />
                                )}
                            </div>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-2xl font-black tracking-tight text-primary">
                                            {watchedValues.teamName || "Team Name"}
                                        </CardTitle>
                                    </div>
                                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                        T20
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3 bg-secondary/10 p-3 rounded-lg border border-secondary/20">
                                    <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center">
                                        <span className="font-bold text-lg">C</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Captain</p>
                                        <p className="font-semibold">{watchedValues.captain || "Captain Name"}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                    <div className="bg-muted/50 p-2 rounded">
                                        <span className="block font-bold text-lg text-primary">{players.length}</span>
                                        <span className="text-xs text-muted-foreground">Players</span>
                                    </div>
                                    <div className="bg-muted/50 p-2 rounded">
                                        <span className="block font-bold text-lg text-green-500">0</span>
                                        <span className="text-xs text-muted-foreground">Won</span>
                                    </div>
                                    <div className="bg-muted/50 p-2 rounded">
                                        <span className="block font-bold text-lg text-red-500">0</span>
                                        <span className="text-xs text-muted-foreground">Lost</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/20 border-t items-center justify-center p-3">
                                <p className="text-xs text-muted-foreground">Preview of how the team card will appear.</p>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
