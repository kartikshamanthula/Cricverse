import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Trophy } from 'lucide-react';
import { LiveScoreWidget } from '@/components/dashboard/LiveScoreWidget';
import { Suspense } from 'react';

export default function Home() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground drop-shadow-lg">CricVerse

          </h1>
          <p className="text-muted-foreground mt-1 text-base sm:text-lg">Welcome back to CricVerse. Your cricket empire awaits.</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto justify-center md:justify-end">
          <Link href="/matches/create" className="flex-1 sm:flex-none">
            <Button size="lg" className="w-full font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
              <Plus className="mr-2 h-5 w-5" /> Quick Match
            </Button>
          </Link>
          <Link href="/tournaments/create" className="flex-1 sm:flex-none">
            <Button size="lg" variant="secondary" className="w-full font-bold shadow-xl shadow-secondary/20 hover:scale-105 transition-transform">
              <Trophy className="mr-2 h-5 w-5" /> New League
            </Button>
          </Link>
        </div>
      </section>

      {/* Live Scores Section */}
      <Suspense fallback={<div className="text-center py-8 text-muted-foreground animate-pulse font-semibold">Loading live scores...</div>}>
        <LiveScoreWidget />
      </Suspense>
    </div>
  );
}
