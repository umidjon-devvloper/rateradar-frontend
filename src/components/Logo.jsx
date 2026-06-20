import { cn } from '@/lib/utils';

export function Logo({ className, showText = true }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="relative w-9 h-9 rounded-xl shrink-0 grid place-items-center font-bold text-base text-white
                      bg-gradient-to-br from-primary to-[hsl(221_83%_42%)]
                      shadow-[0_4px_14px_-2px_hsl(var(--primary)/0.55)]
                      ring-1 ring-white/20">
        <span className="relative z-10">R</span>
        {/* yuqori yorug'lik */}
        <span className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/25 to-transparent" />
      </div>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-[15px] tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            TheHotelSaaS
          </span>
          <span className="text-[10px] text-muted-foreground font-medium tracking-[0.12em] uppercase">
            Rate Intelligence
          </span>
        </div>
      )}
    </div>
  );
}
