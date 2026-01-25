'use client'

export function CyberGrid() {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '40%',
        pointerEvents: 'none',
        zIndex: 0,
        perspective: '500px',
        perspectiveOrigin: '50% 100%',
        maskImage: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 100%)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '-50%',
          width: '200%',
          height: '200%',
          transform: 'rotateX(75deg)',
          transformOrigin: 'center bottom',
          backgroundImage: `
            linear-gradient(rgba(34, 197, 94, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite',
        }}
      />
      <style jsx>{`
        @keyframes gridMove {
          0% {
            transform: rotateX(75deg) translateY(0);
          }
          100% {
            transform: rotateX(75deg) translateY(50px);
          }
        }
      `}</style>
    </div>
  )
}
