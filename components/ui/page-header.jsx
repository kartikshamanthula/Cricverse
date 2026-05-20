import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PageHeader({ title, description, backHref, onBack }) {
    const BackButton = (
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary" onClick={onBack}>
            <ChevronLeft className="h-6 w-6" />
        </Button>
    )

    return (
        <div className="flex items-center gap-4 mb-8">
            {backHref ? (
                <Link href={backHref}>
                    {BackButton}
                </Link>
            ) : (
                onBack ? BackButton : null
            )}
            <div>
                <h1 className="text-3xl font-black tracking-tight drop-shadow-md">{title}</h1>
                <p className="text-lg text-muted-foreground mt-1">{description}</p>
            </div>
        </div>
    )
}
