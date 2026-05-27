export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-[var(--border)]/40 ${className}`}
    >
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/5"
        style={{ animation: 'shimmer 1.6s infinite' }}
      />
      <style>
        {`@keyframes shimmer { 100% { transform: translateX(100%); } }`}
      </style>
    </div>
  )
}
