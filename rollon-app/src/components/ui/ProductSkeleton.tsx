export function ProductSkeleton() {
    return (
        <div className="flex flex-col h-full bg-white/[0.02] border border-white/5 rounded-[2rem] overflow-hidden">
            <div className="relative aspect-[4/5] bg-white/5 animate-pulse" />
            <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
                        <div className="h-3 w-8 bg-white/10 rounded animate-pulse" />
                    </div>
                    <div className="h-7 w-3/4 bg-white/10 rounded animate-pulse" />
                    <div className="h-7 w-1/2 bg-white/10 rounded animate-pulse" />
                </div>
                <div className="pt-4 border-t border-white/5">
                    <div className="h-8 w-24 bg-white/10 rounded animate-pulse" />
                </div>
            </div>
        </div>
    );
}
