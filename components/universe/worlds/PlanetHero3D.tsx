'use client'

/**
 * PlanetHero3D — a single, real Three.js planet for a world-page hero.
 *
 * The homepage is a 3D solar system; a world page shouldn't drop to a flat
 * CSS circle. This renders just ONE lit, textured, slowly-rotating sphere
 * (with atmosphere glow, and Saturn's ring) in its own small canvas — premium
 * and on-brand, cheap because it's one mesh.
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { PLANET_TEXTURE_2K } from '@/lib/planet-textures'

export function PlanetHero3D({
  planet,
  accent,
  className = '',
}: {
  planet: string
  accent: string
  className?: string
}) {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const w = host.clientWidth
    const h = host.clientHeight
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100)
    camera.position.set(0, 0.5, 6.6)

    // Sun-style key light from upper-left → a real day/night terminator.
    scene.add(new THREE.AmbientLight(0x8090b8, 0.28))
    const key = new THREE.DirectionalLight(0xfff2d8, 2.4)
    key.position.set(-4, 2.5, 4)
    scene.add(key)
    const rim = new THREE.PointLight(new THREE.Color(accent), 0.7, 0, 0)
    rim.position.set(4, -1, -3)
    scene.add(rim)

    // The body. The Sun is a self-lit star (no texture); planets are lit rock.
    const isSun = planet === 'Sun'
    const R = 2.1
    const geo = new THREE.SphereGeometry(R, 96, 96)
    let tex: THREE.Texture | null = null
    let mat: THREE.Material
    if (isSun) {
      mat = new THREE.MeshBasicMaterial({ color: 0xffcf5a })
      key.intensity = 0.2
    } else {
      tex = new THREE.TextureLoader().load(PLANET_TEXTURE_2K[planet])
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
      mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 1, metalness: 0 })
    }
    const mesh = new THREE.Mesh(geo, mat)
    mesh.rotation.z = 0.16
    scene.add(mesh)

    // Atmosphere glow — a back-lit shell in the accent colour.
    const glowGeo = new THREE.SphereGeometry(R * 1.13, 64, 64)
    const glowMat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(accent) } },
      vertexShader: `
        varying float vI;
        void main() {
          vec3 vn = normalize(normalMatrix * normal);
          vec3 vp = normalize(-(modelViewMatrix * vec4(position, 1.0)).xyz);
          vI = pow(1.0 - abs(dot(vn, vp)), 2.6);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        varying float vI;
        uniform vec3 uColor;
        void main() { gl_FragColor = vec4(uColor, vI * 0.9); }`,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    })
    const glow = new THREE.Mesh(glowGeo, glowMat)
    glow.scale.setScalar(isSun ? 1.25 : 1) // the sun's corona blazes wider
    scene.add(glow)

    // Saturn ring.
    let ringGeo: THREE.RingGeometry | null = null
    let ringMat: THREE.MeshBasicMaterial | null = null
    if (planet === 'Saturn') {
      ringGeo = new THREE.RingGeometry(R * 1.5, R * 2.5, 96)
      ringMat = new THREE.MeshBasicMaterial({
        color: 0xe3d2a0,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = -Math.PI / 2 + 0.42
      ring.rotation.y = 0.12
      scene.add(ring)
    }

    const onResize = () => {
      const nw = host.clientWidth
      const nh = host.clientHeight
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    }
    window.addEventListener('resize', onResize)

    let raf = 0
    const tick = () => {
      if (!reduce) mesh.rotation.y += 0.0016
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    // One static frame under reduced motion, otherwise animate.
    if (reduce) renderer.render(scene, camera)
    else raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      geo.dispose()
      mat.dispose()
      tex?.dispose()
      glowGeo.dispose()
      glowMat.dispose()
      ringGeo?.dispose()
      ringMat?.dispose()
      renderer.dispose()
      host.removeChild(renderer.domElement)
    }
  }, [planet, accent])

  return <div ref={hostRef} className={className} aria-hidden="true" />
}
