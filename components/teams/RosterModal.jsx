"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Trophy, Star, ShieldCheck, Zap, Target } from "lucide-react"
import { teamPlayers } from "@/lib/team-players-data"

export function RosterModal({ isOpen, onClose, team }) {
    if (!team) return null

    const players = teamPlayers[team.id] || (Array.isArray(team.players) ? team.players : [])

    const getRoleIcon = (role) => {
        if (!role) return <Star className="h-4 w-4 text-yellow-500" />
        if (role.toLowerCase().includes("batsman")) return <Target className="h-4 w-4 text-blue-500" />
        if (role.toLowerCase().includes("bowler")) return <Zap className="h-4 w-4 text-orange-500" />
        if (role.toLowerCase().includes("keeper")) return <ShieldCheck className="h-4 w-4 text-green-500" />
        return <Star className="h-4 w-4 text-yellow-500" />
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-card border-primary/20 shadow-2xl p-6">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-2xl font-black flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-linear-to-br ${team.color} flex items-center justify-center text-white text-lg shadow-md overflow-hidden`}>
                            {team.logoUrl ? (
                                <img src={team.logoUrl} alt={team.name} className="h-full w-full object-cover" />
                            ) : (
                                team.name.substring(0, 1)
                            )}
                        </div>
                        {team.name}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" /> {Array.isArray(team.players) ? team.players.length : team.players} Players
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                        {players.map((player, index) => (
                            <div
                                key={`${player.id}-${index}`}
                                className="flex items-center justify-between p-3 rounded-xl bg-secondary/10 border border-secondary/10 hover:border-primary/20 hover:bg-secondary/20 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                                        <AvatarFallback className={`bg-linear-to-br ${team.color} text-white font-bold`}>
                                            {player.name.substring(0, 1)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold text-sm flex items-center gap-2">
                                            {player.name}
                                            {player.id === 101 || player.id === 201 || player.id === 301 ? (
                                                <Badge variant="secondary" className="text-[10px] h-4 bg-primary/10 text-primary border-0">Captain</Badge>
                                            ) : null}
                                        </p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            {getRoleIcon(player.role)} {player.role || "All-rounder"}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-primary">{player.stats}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
