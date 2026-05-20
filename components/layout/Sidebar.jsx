import Link from 'next/link';
import { Home, Users, Trophy, ClipboardList, PenTool, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  return (
    <div className="flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border text-sidebar-foreground fixed left-0 top-0 z-40">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight text-primary">CricVerse</h1>
      </div>
      <nav className="flex-1 space-y-2 px-4">
        <Link href="/" passHref>
          <Button variant="ghost" className="w-full justify-start text-lg">
            <Home className="mr-3 h-5 w-5" />
            Home
          </Button>
        </Link>
        <Link href="/teams" passHref>
          <Button variant="ghost" className="w-full justify-start text-lg">
            <Users className="mr-3 h-5 w-5" />
            Teams
          </Button>
        </Link>
        <Link href="/tournaments" passHref>
          <Button variant="ghost" className="w-full justify-start text-lg">
            <Trophy className="mr-3 h-5 w-5" />
            Tournaments
          </Button>
        </Link>
        <Link href="/matches" passHref>
          <Button variant="ghost" className="w-full justify-start text-lg">
            <PenTool className="mr-3 h-5 w-5" />
            Matches
          </Button>
        </Link>
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Leaderboards</p>
          <Link href="/leaderboard/players" passHref>
            <Button variant="ghost" className="w-full justify-start text-base">
              <ClipboardList className="mr-3 h-4 w-4" />
              Player Leaderboard
            </Button>
          </Link>
          <Link href="/leaderboard/teams" passHref>
            <Button variant="ghost" className="w-full justify-start text-base">
              <Trophy className="mr-3 h-4 w-4" />
              Team Leaderboard
            </Button>
          </Link>
        </div>
        <Link href="/store" passHref>
          <Button variant="ghost" className="w-full justify-start text-lg">
            <ShoppingBag className="mr-3 h-5 w-5" />
            Store
          </Button>
        </Link>
      </nav>
      <div className="p-6 border-t border-sidebar-border">
        <p className="text-sm text-sidebar-muted-foreground">© 2025 CricVerse</p>
      </div>
    </div>
  );
}
