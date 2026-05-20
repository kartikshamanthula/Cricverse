import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Crown } from 'lucide-react';

const battingStats = [
    { rank: 1, name: "Virat K.", team: "Royal Strikers", runs: 456, matches: 8, avg: 57.0, sr: 145.5, podium: "gold" },
    { rank: 2, name: "Rohit S.", team: "Thunder XI", runs: 398, matches: 8, avg: 49.7, sr: 152.1, podium: "silver" },
    { rank: 3, name: "Faf D.", team: "Super Kings", runs: 375, matches: 7, avg: 53.5, sr: 138.8, podium: "bronze" },
    { rank: 4, name: "Shubman G.", team: "Titans", runs: 350, matches: 8, avg: 43.7, sr: 135.2 },
    { rank: 5, name: "S. Samson", team: "Royals", runs: 320, matches: 7, avg: 45.7, sr: 160.2 },
];

export default function LeaderboardPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-6 sm:py-8">
                <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 drop-shadow-sm">Hall of Fame</h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl px-4">The best performers of the season across all leagues.</p>
            </div>

            <Tabs defaultValue="batting" className="w-full">
                <div className="flex justify-center mb-8">
                    <TabsList className="grid w-full max-w-md grid-cols-2 h-11 sm:h-12">
                        <TabsTrigger value="batting" className="text-sm sm:text-lg font-bold">Orange Cap (Batting)</TabsTrigger>
                        <TabsTrigger value="bowling" className="text-sm sm:text-lg font-bold">Purple Cap (Bowling)</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="batting">
                    {/* Podium Section */}
                    <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-4 mb-12 min-h-[300px]">
                        {/* Silver - Order 2 on mobile, Order 1 on desktop (left) */}
                        <Card className="w-full max-w-sm md:max-w-none md:w-1/3 border-slate-400/30 bg-gradient-to-b from-slate-400/10 to-transparent order-2 md:order-1">
                            <CardContent className="flex flex-col items-center pt-6">
                                <div className="relative">
                                    <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-slate-400 shadow-xl">
                                        <AvatarFallback className="text-xl sm:text-2xl bg-slate-800 text-slate-200">RS</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-400 text-slate-900 font-bold px-3 py-0.5 rounded-full text-sm shadow-md flex items-center gap-1">
                                        <span className="text-xs">#</span>2
                                    </div>
                                </div>
                                <h3 className="mt-4 text-lg sm:text-xl font-bold">Rohit S.</h3>
                                <p className="text-sm text-slate-400 font-mono">Thunder XI</p>
                                <div className="mt-4 text-2xl sm:text-3xl font-black text-slate-200">398</div>
                                <p className="text-xs uppercase tracking-wider text-muted-foreground">Runs</p>
                            </CardContent>
                        </Card>

                        {/* Gold - Order 1 on mobile (first), Order 2 on desktop (center) */}
                        <Card className="w-full max-w-sm md:max-w-none md:w-1/3 border-yellow-500/30 bg-gradient-to-b from-yellow-500/10 to-transparent md:scale-110 shadow-2xl shadow-yellow-500/10 order-1 md:order-2">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                                <Crown className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-500 filter drop-shadow-lg animate-pulse" />
                            </div>
                            <CardContent className="flex flex-col items-center pt-8">
                                <div className="relative">
                                    <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-yellow-400 shadow-2xl">
                                        <AvatarFallback className="text-3xl sm:text-4xl bg-yellow-900/50 text-yellow-200">VK</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 font-bold px-4 py-1 rounded-full text-base shadow-md flex items-center gap-1">
                                        <span className="text-xs">#</span>1
                                    </div>
                                </div>
                                <h3 className="mt-5 text-xl sm:text-2xl font-black">Virat K.</h3>
                                <p className="text-sm text-yellow-500/80 font-mono">Royal Strikers</p>
                                <div className="mt-4 text-3xl sm:text-4xl font-black text-yellow-400">456</div>
                                <p className="text-xs uppercase tracking-wider text-muted-foreground">Runs</p>
                            </CardContent>
                        </Card>

                        {/* Bronze - Order 3 on both mobile and desktop (right) */}
                        <Card className="w-full max-w-sm md:max-w-none md:w-1/3 border-orange-700/30 bg-gradient-to-b from-orange-700/10 to-transparent order-3">
                            <CardContent className="flex flex-col items-center pt-6">
                                <div className="relative">
                                    <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-orange-700 shadow-xl">
                                        <AvatarFallback className="text-xl sm:text-2xl bg-orange-950 text-orange-200">FD</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-700 text-orange-100 font-bold px-3 py-0.5 rounded-full text-sm shadow-md flex items-center gap-1">
                                        <span className="text-xs">#</span>3
                                    </div>
                                </div>
                                <h3 className="mt-4 text-lg sm:text-xl font-bold">Faf D.</h3>
                                <p className="text-sm text-orange-500 font-mono">Super Kings</p>
                                <div className="mt-4 text-2xl sm:text-3xl font-black text-orange-200">375</div>
                                <p className="text-xs uppercase tracking-wider text-muted-foreground">Runs</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Top Run Scorers</CardTitle>
                            <CardDescription>Full leaderboard for the season.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">Rank</TableHead>
                                            <TableHead>Player</TableHead>
                                            <TableHead>Team</TableHead>
                                            <TableHead className="text-right">Runs</TableHead>
                                            <TableHead className="text-right">Avg</TableHead>
                                            <TableHead className="text-right">SR</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {battingStats.map((player) => (
                                            <TableRow key={player.rank}>
                                                <TableCell className="font-medium">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${player.rank <= 3 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                                        {player.rank}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-bold">{player.name}</TableCell>
                                                <TableCell className="text-muted-foreground">{player.team}</TableCell>
                                                <TableCell className="text-right font-black text-lg">{player.runs}</TableCell>
                                                <TableCell className="text-right text-muted-foreground">{player.avg}</TableCell>
                                                <TableCell className="text-right text-muted-foreground">{player.sr}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="bowling">
                    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-muted rounded-xl bg-secondary/10">
                        <Trophy className="h-16 w-16 text-muted-foreground/50 mb-4" />
                        <h3 className="text-2xl font-bold">Data Coming Soon</h3>
                        <p className="text-muted-foreground">Bowling statistics are currently being compiled.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
