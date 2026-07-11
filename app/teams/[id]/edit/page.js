"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Link from "next/link"
import { ChevronLeft, Upload, Users, User, Shield, X, UserPlus, Search } from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

const formSchema = z.object({
    teamName: z.string().min(2, {
        message: "Team name must be at least 2 characters.",
    }),
    captain: z.string().min(2, {
        message: "Captain name must be at least 2 characters.",
    }),
    players: z.array(z.string()).min(1, {
        message: "At least 1 player is required.",
    }).max(11, {
        message: "Maximum 11 players allowed.",
    }),
    logoUrl: z.string().optional(),
})

export default function EditTeamPage() {
    const router = useRouter();
    const params = useParams();
    const teamId = params.id;

    const [players, setPlayers] = useState([]); // Array of full player objects to show in UI
    const [globalPlayers, setGlobalPlayers] = useState([]); // All players from DB
    const [searchQuery, setSearchQuery] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [logoUrl, setLogoUrl] = useState("");
    const [loading, setLoading] = useState(true);
    
    // New Player Form State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newPlayerName, setNewPlayerName] = useState("");
    const [newPlayerMobile, setNewPlayerMobile] = useState("");
    const [newPlayerEmail, setNewPlayerEmail] = useState("");
    const [newPlayerRole, setNewPlayerRole] = useState("Unknown");
    const [newPlayerPhotoUrl, setNewPlayerPhotoUrl] = useState("");
    const [isPlayerUploading, setIsPlayerUploading] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            teamName: "",
            captain: "",
            players: [],
            logoUrl: "",
        },
    })

    useEffect(() => {
        const fetchGlobalPlayers = async () => {
            try {
                const res = await fetch('/api/players');
                const data = await res.json();
                if (data.success) {
                    setGlobalPlayers(data.data);
                }
            } catch (err) {
                console.error("Failed to fetch players", err);
            }
        };
        fetchGlobalPlayers();
    }, []);

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

                // Map populated players
                const teamPlayers = team.players || [];
                setPlayers(teamPlayers);
                form.setValue('players', teamPlayers.map(p => p._id));
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

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Invalid file type. Please upload an image.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
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

            if (!response.ok) throw new Error(data.error || 'Upload failed');

            setLogoUrl(data.url);
            form.setValue('logoUrl', data.url);
            toast.success("Logo uploaded successfully");
        } catch (error) {
            toast.error("Failed to upload logo", { description: error.message });
        } finally {
            setIsUploading(false);
        }
    };

    const handlePlayerImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Invalid file type. Please upload an image.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File too large. Maximum size is 5MB");
            return;
        }

        setIsPlayerUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Upload failed');

            setNewPlayerPhotoUrl(data.url);
            toast.success("Player photo uploaded successfully");
        } catch (error) {
            toast.error("Failed to upload player photo", { description: error.message });
        } finally {
            setIsPlayerUploading(false);
        }
    };

    const addExistingPlayer = (playerObj) => {
        if (players.some(p => p._id === playerObj._id)) {
            toast.error("Player already in team");
            return;
        }
        if (players.length >= 11) {
            toast.error("Maximum 11 players allowed per team");
            return;
        }

        const updatedPlayers = [...players, playerObj];
        setPlayers(updatedPlayers);
        form.setValue('players', updatedPlayers.map(p => p._id));
        toast.success(`${playerObj.name} added to the team`);
    };

    const handleCreateNewPlayer = async () => {
        if (!newPlayerName.trim()) {
            toast.error("Player name is required");
            return;
        }
        try {
            const res = await fetch('/api/players', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newPlayerName,
                    profilePhotoUrl: newPlayerPhotoUrl,
                    mobileNumber: newPlayerMobile,
                    emailId: newPlayerEmail,
                    role: newPlayerRole,
                })
            });
            const data = await res.json();
            if (data.success) {
                setGlobalPlayers([data.data, ...globalPlayers]);
                addExistingPlayer(data.data);
                setIsCreateModalOpen(false);
                setNewPlayerName("");
                setNewPlayerMobile("");
                setNewPlayerEmail("");
                setNewPlayerPhotoUrl("");
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error("Failed to create player");
        }
    };

    const removePlayer = (playerId) => {
        const updatedPlayers = players.filter(p => p._id !== playerId);
        setPlayers(updatedPlayers);
        form.setValue('players', updatedPlayers.map(p => p._id));
        toast.success("Player removed");
    };

    async function onSubmit(values) {
        try {
            const response = await fetch(`/api/teams/${teamId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: values.teamName,
                    captain: values.captain,
                    players: values.players,
                    logoUrl: values.logoUrl
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update team');
            }

            toast.success("Team Updated Successfully!", {
                description: `${values.teamName} has been saved.`
            });

            setTimeout(() => {
                router.push('/teams');
            }, 1000);
        } catch (error) {
            toast.error("Failed to update team", {
                description: error.message || "Please try again later."
            });
        }
    }

    const watchedValues = form.watch()
    const filteredGlobalPlayers = globalPlayers.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

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
                                                        <Input placeholder="e.g. Royal Strikers" {...field} className="pl-10 h-12 text-lg bg-background/50 border-input/50 focus:border-primary font-semibold" suppressHydrationWarning />
                                                    </div>
                                                </FormControl>
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
                                                        <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Upload className="h-8 w-8 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-1 text-center sm:text-left space-y-3">
                                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                                                    <label className="relative">
                                                        <Input type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} disabled={isUploading} />
                                                        <Button type="button" variant="outline" size="sm" className="font-bold pointer-events-none shadow-sm" disabled={isUploading}>
                                                            <Upload className="h-4 w-4 mr-2" /> Upload Logo
                                                        </Button>
                                                    </label>
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
                                                        <Input placeholder="e.g. Virat K." {...field} className="pl-9 h-11 bg-background/50 border-input/50" suppressHydrationWarning />
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
                                                    <Users className="h-5 w-5 text-primary" /> Team Players
                                                </h3>
                                            </div>
                                            <Badge variant="outline" className="text-sm font-bold">
                                                {players.length}/11 Players
                                            </Badge>
                                        </div>

                                        {/* Player Search and Add */}
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input 
                                                    placeholder="Search global players to add..." 
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="pl-9"
                                                />
                                            </div>
                                            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline"><UserPlus className="h-4 w-4 mr-2"/> New Player</Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Create Global Player</DialogTitle>
                                                        <DialogDescription>Add a new player to the global database. They can be added to any team later.</DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-4 pt-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-16 w-16 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden bg-background">
                                                                {newPlayerPhotoUrl ? (
                                                                    <img src={newPlayerPhotoUrl} alt="Player" className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <User className="h-6 w-6 text-muted-foreground/50" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <label className="relative">
                                                                    <Input type="file" accept="image/*" className="sr-only" onChange={handlePlayerImageUpload} disabled={isPlayerUploading} />
                                                                    <Button type="button" variant="outline" size="sm" className="pointer-events-none" disabled={isPlayerUploading}>
                                                                        {isPlayerUploading ? "Uploading..." : "Upload Photo"}
                                                                    </Button>
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium">Name</label>
                                                            <Input value={newPlayerName} onChange={e=>setNewPlayerName(e.target.value)} placeholder="Player Name" />
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium">Mobile Number</label>
                                                            <Input value={newPlayerMobile} onChange={e=>setNewPlayerMobile(e.target.value)} placeholder="+91 9876543210" />
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium">Email ID</label>
                                                            <Input value={newPlayerEmail} onChange={e=>setNewPlayerEmail(e.target.value)} placeholder="player@example.com" />
                                                        </div>
                                                        <Button onClick={handleCreateNewPlayer} className="w-full">Create & Add to Team</Button>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>

                                        {/* Search Results */}
                                        {searchQuery && (
                                            <div className="bg-secondary/10 border rounded-lg max-h-40 overflow-y-auto p-2">
                                                {filteredGlobalPlayers.length > 0 ? filteredGlobalPlayers.map(p => (
                                                    <div key={p._id} className="flex items-center justify-between p-2 hover:bg-secondary/20 rounded cursor-pointer" onClick={() => { addExistingPlayer(p); setSearchQuery(""); }}>
                                                        <div className="font-semibold">{p.name}</div>
                                                        <div className="text-xs text-muted-foreground">{p.role}</div>
                                                    </div>
                                                )) : (
                                                    <p className="text-sm text-center text-muted-foreground p-2">No players found.</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Added Players List */}
                                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                            {players.map((player, index) => (
                                                <div key={player._id} className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg border border-secondary/20 group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{index + 1}</div>
                                                        <div>
                                                            <p className="font-semibold">{player.name}</p>
                                                            <p className="text-xs text-muted-foreground">{player.mobileNumber || "No Phone"}</p>
                                                        </div>
                                                    </div>
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removePlayer(player._id)} className="hover:bg-destructive/10 hover:text-destructive">
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end gap-3">
                                        <Link href="/teams">
                                            <Button variant="outline" size="lg" type="button">Cancel</Button>
                                        </Link>
                                        <Button type="submit" size="lg" className="font-bold">Update Team</Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Live Preview */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="sticky top-8">
                        <Card className="overflow-hidden border-primary/20 shadow-primary/10 shadow-2xl bg-linear-to-br from-card to-background">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-2xl font-black tracking-tight text-primary" suppressHydrationWarning>
                                    {watchedValues.teamName || "Team Name"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                    <div className="bg-muted/50 p-2 rounded">
                                        <span className="block font-bold text-lg text-primary">{players.length}</span>
                                        <span className="text-xs text-muted-foreground">Players</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
