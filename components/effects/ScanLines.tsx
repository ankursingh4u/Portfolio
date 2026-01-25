'use client'

interface ScanLinesProps {
  opacity?: number
  movingLine?: boolean
  className?: string
}

export function ScanLines({
  opacity = 0.03,
  movingLine = true,
  className = ''
}: ScanLinesProps) {
  return (
    <div className={`pointer-events-none ${className}`}>
      {/* Static scan lines */}
      <div
        className="fixed inset-0 z-[5]"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, ${opacity}) 2px,
            rgba(0, 0, 0, ${opacity}) 4px
          )`,
        }}
      />

      {/* Moving scan line - subtle */}
      {movingLine && (
        <div
          className="fixed left-0 right-0 h-[1px] z-[5] animate-scan-line"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.05), transparent)',
            boxShadow: '0 0 5px rgba(34, 197, 94, 0.1)',
          }}
        />
      )}
    </div>
  )
}
