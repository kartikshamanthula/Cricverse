"use client"

import { useState, useEffect } from "react"
import { Users, Search, UserPlus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"

export default function PlayersPage() {
    const [players, setPlayers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const res = await fetch('/api/players');
                const data = await res.json();
                if (data.success) {
                    setPlayers(data.data);
                }
            } catch (error) {
                console.error("Error fetching players", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlayers();
    }, []);

    const filteredPlayers = players.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PageHeader
                title="Global Players Database"
                description="Manage all your registered players and their career statistics."
                action={{
                    label: "Add New Player",
                    href: "#",
                    icon: UserPlus,
                }}
            />

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search players by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-12 bg-background/50 border-input/50"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : filteredPlayers.length === 0 ? (
                <div className="text-center py-24 bg-card/50 backdrop-blur-sm rounded-2xl border border-secondary/20 border-dashed">
                    <Users className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-2xl font-bold mb-2">No players found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or add a new player.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPlayers.map((player) => (
                        <Card key={player._id} className="overflow-hidden hover:shadow-xl hover:border-primary/50 transition-all duration-300 group bg-card/50 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary group-hover:scale-110 transition-transform">
                                        {player.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{player.name}</h3>
                                        <div className="flex gap-2 mt-1">
                                            <Badge variant="outline">{player.role}</Badge>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Mobile:</span>
                                        <span className="font-medium">{player.mobileNumber || "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Email:</span>
                                        <span className="font-medium truncate max-w-[150px]">{player.emailId || "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-border/50">
                                        <span className="text-muted-foreground">Matches:</span>
                                        <span className="font-bold">{player.careerStats.matches}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Runs:</span>
                                        <span className="font-bold">{player.careerStats.runs}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Wickets:</span>
                                        <span className="font-bold">{player.careerStats.wickets}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
