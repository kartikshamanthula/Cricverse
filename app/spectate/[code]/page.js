'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Trophy, ShieldAlert } from 'lucide-react';
import MatchDetailsPage from '@/app/matches/[id]/page';

export default function SpectateMagicPage() {
    const router = useRouter();
    const params = useParams();
    const code = params?.code;
    const [resolvedMatchId, setResolvedMatchId] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        if (!code) return;

        const resolveSpectateLink = async () => {
            let res;
            try {
                res = await fetch(`/api/matches?shareCode=${code.trim().toUpperCase()}`);
                
                if (!res.ok) {
                    if (res.status === 410) {
                        setIsExpired(true);
                        const errData = await res.json();
                        throw new Error(errData.error || 'This spectate link has expired');
                    }
                    throw new Error('Spectating code not found or has expired');
                }
                
                const match = await res.json();
                toast.success('Spectator access granted!');
                setResolvedMatchId(match._id);
            } catch (err) {
                console.error(err);
                setErrorMsg(err.message || 'Invalid spectate link');
                toast.error(err.message || 'Failed to spectate match.');
                
                // Redirect back to dashboard after a delay if not a permanent 410 expiration error
                if (!res || res.status !== 410) {
                    setTimeout(() => {
                        router.replace('/dashboard');
                    }, 4000);
                }
            }
        };

        resolveSpectateLink();
    }, [code, router]);

    // If resolved, embed the scorecard page directly so raw database ID is never shown in the URL
    if (resolvedMatchId) {
        return <MatchDetailsPage overrideMatchId={resolvedMatchId} isSpectator={true} />;
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
            <div className="space-y-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto shadow-inner">
                    {isExpired ? (
                        <ShieldAlert className="h-8 w-8 text-destructive animate-pulse" />
                    ) : (
                        <Trophy className="h-8 w-8 text-primary animate-bounce" />
                    )}
                </div>
                
                <div className="space-y-2">
                    <h2 className="text-xl font-black tracking-tight text-foreground">
                        CricVerse Spectator Gallery
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {errorMsg ? (
                            <span className="text-destructive font-semibold">
                                {errorMsg}
                                {!isExpired && '. Redirecting to dashboard...'}
                            </span>
                        ) : (
                            <span>Resolving secure code <span className="font-mono font-bold text-primary uppercase tracking-wider">{code}</span>...</span>
                        )}
                    </p>
                </div>

                {!errorMsg && (
                    <div className="flex justify-center pt-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary opacity-80" />
                    </div>
                )}
            </div>
        </div>
    );
}
