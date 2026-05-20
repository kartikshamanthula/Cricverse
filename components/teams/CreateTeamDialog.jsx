"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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

export function CreateTeamDialog({ isOpen, onClose, onTeamCreated }) {
    const [players, setPlayers] = useState([]);
    const [currentPlayerName, setCurrentPlayerName] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [logoUrl, setLogoUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            teamName: "",
            captain: "",
            players: [],
            logoUrl: "",
        },
    })

    // Reset form when opened or closed
    useEffect(() => {
        if (!isOpen) {
            form.reset({ teamName: "", captain: "", players: [], logoUrl: "" });
            setPlayers([]);
            setLogoUrl("");
            setCurrentPlayerName("");
        }
    }, [isOpen, form]);

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
    };

    const removePlayer = (playerId) => {
        const updatedPlayers = players.filter(p => p.id !== playerId);
        setPlayers(updatedPlayers);
        form.setValue('players', updatedPlayers);
    };

    async function onSubmit(values) {
        if (players.length !== 11) {
            toast.error("Exactly 11 players are required to create a team.");
            return;
        }

        setIsSubmitting(true);
        try {
            const teamData = {
                name: values.teamName,
                captain: values.captain,
                logoUrl: values.logoUrl,
                players: values.players.map(p => ({
                    name: p.name
                }))
            };

            const response = await fetch('/api/teams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(teamData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create team');
            }

            toast.success("Team Created Successfully!", {
                description: `${values.teamName} has been created.`
            });

            if (onTeamCreated) onTeamCreated(data);
            onClose();

        } catch (error) {
            console.error("Error creating team:", error);
            toast.error("Failed to create team.", {
                description: error.message
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Team</DialogTitle>
                    <DialogDescription>Register a new squad directly here without leaving the page.</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Logo Upload Section */}
                        <div className="space-y-4 pt-2">
                            <FormLabel className="text-sm font-bold">Team Logo</FormLabel>
                            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-secondary/5 rounded-2xl border border-secondary/20 border-dashed">
                                <div className="relative group grayscale-0">
                                    <div className="h-16 w-16 rounded-2xl border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-background/50 group-hover:border-primary/50 transition-all duration-300 shadow-inner">
                                        {logoUrl ? (
                                            <img src={logoUrl} alt="Logo" className="h-full w-full object-cover animate-in zoom-in-95 duration-300" />
                                        ) : (
                                            <Upload className="h-6 w-6 text-muted-foreground/30 group-hover:text-primary/50 transition-colors group-hover:scale-110 duration-300" />
                                        )}
                                    </div>
                                    {logoUrl && !isUploading && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setLogoUrl("");
                                                form.setValue('logoUrl', "");
                                            }}
                                            className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg hover:bg-destructive/90 transition-all hover:scale-110"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                                <div className="flex-1 text-center sm:text-left space-y-2">
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
                                </div>
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="captain"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Captain Name<span className="text-destructive">*</span></FormLabel>
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
                                    <h3 className="text-sm font-bold flex items-center gap-2">
                                        <Users className="h-4 w-4 text-primary" />
                                        Team Players<span className="text-destructive ml-1">*</span>
                                    </h3>
                                    <p className="text-xs text-muted-foreground">Exactly 11 players required</p>
                                </div>
                                <Badge variant={players.length === 11 ? "default" : "outline"} className="text-xs font-bold">
                                    {players.length}/11 Players
                                </Badge>
                            </div>

                            <div className="flex gap-2">
                                <Input
                                    placeholder="Player name"
                                    value={currentPlayerName}
                                    onChange={(e) => setCurrentPlayerName(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPlayer())}
                                    className="h-10 bg-background/50 border-input/50 flex-1"
                                    disabled={players.length >= 11}
                                />
                                <Button
                                    type="button"
                                    onClick={addPlayer}
                                    disabled={players.length >= 11}
                                    className="h-10 font-semibold"
                                    variant={players.length >= 11 ? "outline" : "default"}
                                >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add
                                </Button>
                            </div>

                            {/* Players List */}
                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                                {players.map((player, index) => (
                                    <div
                                        key={player.id}
                                        className="flex items-center justify-between p-2 bg-secondary/10 rounded-lg border border-secondary/20 hover:bg-secondary/20 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                {index + 1}
                                            </div>
                                            <p className="text-sm font-semibold">{player.name}</p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removePlayer(player.id)}
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3 mt-4 border-t border-border/50 pt-6">
                            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                            <Button type="submit" className="font-bold" disabled={isSubmitting}>
                                {isSubmitting ? "Creating..." : "Create Team"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
