export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-3">
        <div className="h-8 w-72 rounded-full bg-white/10" />
        <div className="h-4 w-[28rem] max-w-full rounded-full bg-white/5" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 rounded-[28px] border border-white/10 bg-white/[0.04]" />
        ))}
      </div>
      <div className="h-[28rem] rounded-[32px] border border-white/10 bg-white/[0.03]" />
    </div>
  )
}
