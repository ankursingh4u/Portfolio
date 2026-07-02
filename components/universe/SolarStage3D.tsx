'use client'

/**
 * SolarStage3D — a REAL Three.js solar system.
 *
 * The physics the 2.5D stage could only fake are structural here:
 *  • The solar system never moves — planets orbit the sun at the world origin.
 *  • Mouse input drives ONLY the camera (OrbitControls, target locked to the
 *    sun). Drag = orbit the view, wheel/pinch = dolly. NASA-Eyes feel.
 *  • The starfield is a 5000-point BufferGeometry attached to the SCENE (not
 *    the camera), so the sky holds still in world space and wheels past
 *    naturally as you orbit.
 *
 * Planet surface textures: CC BY 4.0 — solarsystemscope.com/textures.
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useReducedMotion } from 'framer-motion'
import { PLANETS, positionFor } from '@/lib/ephemeris'
import { PLANET_NAV, type PlanetNav } from '@/lib/universe-nav'
import { PLANET_TEXTURE_1K, PLANET_TEXTURE_2K } from '@/lib/planet-textures'
import { useUniverse } from '@/lib/hooks/useUniverse'

const TWO_PI = Math.PI * 2

// Synthetic-but-Keplerian orbital speeds (inner fast, outer slow), driven by
// elapsed time only — mouse input never touches these.
const aMin = Math.min(...PLANETS.map((p) => p.el[0]))
const INNER_PERIOD_SEC = 22
const omegaFor = (a: number) => TWO_PI / (INNER_PERIOD_SEC * Math.pow(a / aMin, 0.55))

const easeInOutCubic = (u: number) =>
  u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2
// One tour hop: rise OVER the system in an arc, sweep sideways, descend onto
// the next planet. Scripted (deterministic), so it can never wobble.
const TOUR_FLY_MS = 1900

// Evenly-spaced orbit radii (world units) — readable, never overlapping.
const ORBIT_A = PLANETS.map((_, i) => 26 + i * 13)
// Planet sphere radii.
const RADII = PLANETS.map((p) => 1.15 + p.size * 0.42)

// NATURAL moons are REALISTIC — right counts, grey rock, decorative (hover
// shows their real name). Earth has exactly one Moon.
// Your content orbits as MAN-MADE SATELLITES instead (see PLANET_NAV moons):
// small tinted spacecraft in fast low orbit — you launched them.
const NATURAL_MOONS: Record<string, { name: string; r: number; size: number; period: number }[]> = {
  Earth: [{ name: 'The Moon', r: 2.7, size: 0.27, period: 11 }],
  Mars: [
    { name: 'Phobos', r: 1.9, size: 0.12, period: 5 },
    { name: 'Deimos', r: 2.5, size: 0.1, period: 8 },
  ],
  Jupiter: [
    { name: 'Io', r: 1.8, size: 0.14, period: 4 },
    { name: 'Europa', r: 2.2, size: 0.13, period: 6 },
    { name: 'Ganymede', r: 2.7, size: 0.2, period: 9 },
    { name: 'Callisto', r: 3.3, size: 0.18, period: 13 },
  ],
  Saturn: [{ name: 'Titan', r: 3.2, size: 0.2, period: 12 }],
  Uranus: [{ name: 'Miranda', r: 2.0, size: 0.12, period: 7 }],
  Neptune: [{ name: 'Triton', r: 2.2, size: 0.16, period: 9 }],
}

/** 80% white / 15% blue / 5% yellow star cloud on a big sphere shell. */
function makeStarfield(count: number, rMin: number, rMax: number, size: number) {
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    // Uniform direction, radius biased outward (shell-ish).
    const u = Math.random() * 2 - 1
    const phi = Math.random() * TWO_PI
    const s = Math.sqrt(1 - u * u)
    const r = rMin + (rMax - rMin) * Math.cbrt(Math.random())
    positions[i * 3] = s * Math.cos(phi) * r
    positions[i * 3 + 1] = u * r
    positions[i * 3 + 2] = s * Math.sin(phi) * r
    const roll = Math.random()
    let cr = 1
    let cg = 1
    let cb = 1
    if (roll > 0.95) {
      cr = 1
      cg = 0.9
      cb = 0.72 // yellow-tinted
    } else if (roll > 0.8) {
      cr = 0.72
      cg = 0.82
      cb = 1 // blue-tinted
    }
    const dim = 0.55 + Math.random() * 0.45
    colors[i * 3] = cr * dim
    colors[i * 3 + 1] = cg * dim
    colors[i * 3 + 2] = cb * dim
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  const mat = new THREE.PointsMaterial({
    size,
    vertexColors: true,
    sizeAttenuation: true,
    depthWrite: false,
  })
  return new THREE.Points(geo, mat)
}

/** Dense milky-way band: points clustered around a tilted great circle. */
function makeMilkyWay(count: number, radius: number) {
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const gauss = () => (Math.random() + Math.random() + Math.random()) / 3 - 0.5
  for (let i = 0; i < count; i++) {
    const phi = Math.random() * TWO_PI
    const spread = gauss() * 0.5
    const v = new THREE.Vector3(
      Math.cos(phi) * radius,
      spread * radius * 0.55,
      Math.sin(phi) * radius,
    )
    v.applyEuler(new THREE.Euler(1.05, 0, 0.35))
    positions[i * 3] = v.x
    positions[i * 3 + 1] = v.y
    positions[i * 3 + 2] = v.z
    const dim = 0.16 + Math.random() * 0.3
    colors[i * 3] = 0.78 * dim
    colors[i * 3 + 1] = 0.82 * dim
    colors[i * 3 + 2] = 1 * dim
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  const mat = new THREE.PointsMaterial({
    size: 1.6,
    vertexColors: true,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  return new THREE.Points(geo, mat)
}

/** Soft radial glow sprite (canvas-generated — no image assets). */
function makeGlowSprite(color: string, size: number, inner = 0.12) {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(128, 128, 256 * inner * 0.5, 128, 128, 128)
  g.addColorStop(0, color)
  g.addColorStop(0.4, color.replace(/[\d.]+\)$/, '0.35)'))
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  const tex = new THREE.CanvasTexture(c)
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const sprite = new THREE.Sprite(mat)
  sprite.scale.setScalar(size)
  return sprite
}

export function SolarStage3D() {
  const hostRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  const {
    enterWorld,
    openBio,
    registerPlanet,
    setSpotlight,
    tourActive,
    tourIndex,
    frozen,
    phase,
    active,
  } = useUniverse()

  // The render loop reads live state through refs (never re-creates the scene).
  const tourRef = useRef({ active: false, index: 0 })
  const frozenRef = useRef(false)
  const reduceRef = useRef(false)
  const enterWorldRef = useRef(enterWorld)
  const openBioRef = useRef(openBio)
  useEffect(() => {
    tourRef.current = { active: tourActive, index: tourIndex }
  }, [tourActive, tourIndex])
  useEffect(() => {
    frozenRef.current = frozen
  }, [frozen])
  // Warp choreography: entering a world DIVES the camera into that planet in
  // sync with the warp overlay; exiting restores a comfortable distance.
  const warpRef = useRef<{ diving: string | null; restore: boolean }>({
    diving: null,
    restore: false,
  })
  useEffect(() => {
    if (phase === 'warping-in' && active) {
      warpRef.current.diving = active.name
    } else if (phase === 'warping-out' || phase === 'home') {
      if (warpRef.current.diving) warpRef.current.restore = true
      warpRef.current.diving = null
    }
  }, [phase, active])
  useEffect(() => {
    reduceRef.current = !!reduce
  }, [reduce])
  useEffect(() => {
    enterWorldRef.current = enterWorld
    openBioRef.current = openBio
  }, [enterWorld, openBio])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    // ── Renderer / scene / camera ────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(host.clientWidth, host.clientHeight)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    host.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x02030a)

    const camera = new THREE.PerspectiveCamera(
      55,
      host.clientWidth / host.clientHeight,
      0.1,
      5000,
    )
    camera.position.set(0, 62, 135)

    // ── OrbitControls — the ONLY thing mouse input moves ─────────────────
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 0, 0) // locked on the sun
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enableZoom = true
    controls.zoomSpeed = 0.5
    controls.rotateSpeed = 0.3
    controls.minDistance = 20
    controls.maxDistance = 800
    controls.enablePan = false // the sun stays centred — orbit + zoom only

    // ── Static universe: starfield + milky way live on the SCENE ─────────
    const stars = makeStarfield(5000, 900, 2000, 0.7 * 3) // size in world units
    scene.add(stars)
    const milky = makeMilkyWay(2600, 1500)
    scene.add(milky)

    // ── Lights ───────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x8090b8, 0.32))
    const sunLight = new THREE.PointLight(0xfff0d0, 2.6, 0, 0)
    scene.add(sunLight)

    // ── The Sun ──────────────────────────────────────────────────────────
    const sunGroup = new THREE.Group()
    const sunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(8, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0xffd34d }),
    )
    sunMesh.userData.kind = 'sun'
    sunGroup.add(sunMesh)
    sunGroup.add(makeGlowSprite('rgba(255,190,80,0.9)', 46))
    sunGroup.add(makeGlowSprite('rgba(255,150,40,0.5)', 110))
    scene.add(sunGroup)

    // ── Planets, orbit lines, moons ──────────────────────────────────────
    const texLoader = new THREE.TextureLoader()
    const maxAniso = renderer.capabilities.getMaxAnisotropy()
    const disposables: { dispose: () => void }[] = []
    const planetGroups: THREE.Group[] = []
    const planetMeshes: THREE.Mesh[] = []
    const moonMeshes: THREE.Mesh[] = []
    const ringMats: THREE.LineBasicMaterial[] = []
    const moonPivots: { pivot: THREE.Group; period: number }[] = []
    const angle0 = PLANETS.map((p) => positionFor(p, new Date()).longitude)
    const omega = PLANETS.map((p) => omegaFor(p.el[0]))

    // Lazy quality bump: the moment a planet is focused/toured, its 1K map is
    // swapped for the 2K one — close-ups stay crisp without a heavy first load.
    const upgraded = PLANETS.map(() => false)
    const upgradeTexture = (i: number) => {
      if (upgraded[i]) return
      upgraded[i] = true
      texLoader.load(PLANET_TEXTURE_2K[PLANETS[i].name], (t2) => {
        t2.colorSpace = THREE.SRGBColorSpace
        t2.anisotropy = maxAniso
        const m = planetMeshes[i].material as THREE.MeshStandardMaterial
        const old = m.map
        m.map = t2
        m.needsUpdate = true
        old?.dispose()
        disposables.push(t2)
      })
    }

    PLANETS.forEach((p, i) => {
      const r = RADII[i]
      const group = new THREE.Group()

      const tex = texLoader.load(PLANET_TEXTURE_1K[p.name])
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = maxAniso
      const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 1, metalness: 0 })
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 64, 64), mat)
      mesh.userData = { kind: 'planet', name: p.name, index: i }
      group.add(mesh)
      disposables.push(mesh.geometry, mat, tex)

      // Saturn's ring.
      if (p.name === 'Saturn') {
        const ringGeo = new THREE.RingGeometry(r * 1.45, r * 2.3, 64)
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xe3d2a0,
          transparent: true,
          opacity: 0.42,
          side: THREE.DoubleSide,
        })
        const ring = new THREE.Mesh(ringGeo, ringMat)
        ring.rotation.x = -Math.PI / 2 + 0.32
        group.add(ring)
        disposables.push(ringGeo, ringMat)
      }

      // NATURAL moons — realistic counts, grey rock, hover shows the real name.
      for (const nm of NATURAL_MOONS[p.name] ?? []) {
        const pivot = new THREE.Group()
        const nmGeo = new THREE.SphereGeometry(Math.max(0.35, r * nm.size), 18, 18)
        const nmMat = new THREE.MeshStandardMaterial({ color: 0xa8a8b0, roughness: 1 })
        const moon = new THREE.Mesh(nmGeo, nmMat)
        moon.position.set(r * nm.r, 0, 0)
        moon.userData = { kind: 'nmoon', label: nm.name }
        pivot.rotation.x = 0.1
        pivot.rotation.y = nm.r * 2.3
        pivot.add(moon)
        group.add(pivot)
        moonPivots.push({ pivot, period: nm.period })
        moonMeshes.push(moon)
        disposables.push(nmGeo, nmMat)
      }

      // (Content sub-destinations live inside the worlds — the sky stays a
      // clean, realistic system. PLANET_NAV moons still power the sections.)

      scene.add(group)
      planetGroups.push(group)
      planetMeshes.push(mesh)

      // Orbit line (a true circle in the ecliptic plane).
      const pts = new THREE.EllipseCurve(0, 0, ORBIT_A[i], ORBIT_A[i]).getPoints(160)
      const lineGeo = new THREE.BufferGeometry().setFromPoints(
        pts.map((q) => new THREE.Vector3(q.x, 0, q.y)),
      )
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x8ca3d8,
        transparent: true,
        opacity: 0.3,
      })
      const line = new THREE.LineLoop(lineGeo, lineMat)
      scene.add(line)
      ringMats.push(lineMat)
      disposables.push(lineGeo, lineMat)
    })

    // ── Interaction: hover label + click-to-travel (never moves the world) ─
    const raycaster = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    let hovered: THREE.Mesh | null = null
    let downX = 0
    let downY = 0
    // Camera focus: -1 = the sun; 0..7 = riding alongside that planet.
    let focusIdx = -1

    const pickAt = (clientX: number, clientY: number): THREE.Mesh | null => {
      const rect = renderer.domElement.getBoundingClientRect()
      ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1
      ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(ndc, camera)
      const hits = raycaster.intersectObjects([sunMesh, ...planetMeshes, ...moonMeshes], false)
      return (hits[0]?.object as THREE.Mesh) ?? null
    }
    const pick = (e: PointerEvent) => pickAt(e.clientX, e.clientY)

    /** Planet whose projected screen position is nearest the cursor (px). */
    const nearestPlanetOnScreen = (clientX: number, clientY: number, maxPx: number) => {
      const rect = renderer.domElement.getBoundingClientRect()
      let best = -1
      let bestD = maxPx
      const pv = new THREE.Vector3()
      for (let i = 0; i < planetGroups.length; i++) {
        pv.copy(planetGroups[i].position).project(camera)
        if (pv.z > 1) continue // behind the camera
        const sx = (pv.x * 0.5 + 0.5) * rect.width + rect.left
        const sy = (-pv.y * 0.5 + 0.5) * rect.height + rect.top
        const d = Math.hypot(sx - clientX, sy - clientY)
        if (d < bestD) {
          bestD = d
          best = i
        }
      }
      return best
    }

    // Zooming IN while aiming at (or near) a planet locks the camera onto it —
    // the target rides the planet, so you dolly toward THAT world, not the sun.
    // Zooming far back out hands focus back to the sun automatically.
    const onWheel = (e: WheelEvent) => {
      if (tourRef.current.active || frozenRef.current) return
      if (e.deltaY < 0) {
        const hit = pickAt(e.clientX, e.clientY)
        if (hit && hit.userData.kind === 'planet') {
          focusIdx = hit.userData.index as number
        } else if (!hit) {
          const near = nearestPlanetOnScreen(e.clientX, e.clientY, 70)
          if (near >= 0) focusIdx = near
        }
        if (focusIdx >= 0) upgradeTexture(focusIdx)
      }
    }
    renderer.domElement.addEventListener('wheel', onWheel, { passive: true })

    const onPointerMove = (e: PointerEvent) => {
      const hit = pick(e)
      if (hit !== hovered) {
        hovered = hit
        // Natural moons are lore, not links — no pointer cursor for them.
        renderer.domElement.style.cursor =
          hit && hit.userData.kind !== 'nmoon' ? 'pointer' : 'grab'
        ringMats.forEach((m, i) => {
          const isHover = hovered?.userData.index === i
          m.opacity = isHover ? 0.9 : 0.3
          m.color.set(isHover ? PLANETS[i].color : '#8ca3d8')
        })
        const label = labelRef.current
        if (label) label.style.opacity = hit ? '1' : '0'
      }
    }
    const onPointerDown = (e: PointerEvent) => {
      downX = e.clientX
      downY = e.clientY
    }
    const onPointerUp = (e: PointerEvent) => {
      // A real click, not the tail end of an orbit drag.
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return
      const hit = pick(e)
      if (!hit) return
      if (hit.userData.kind === 'sun') {
        openBioRef.current()
        return
      }
      if (hit.userData.kind === 'nmoon') return // real moons: look, don't click
      if (hit.userData.kind === 'moon') {
        // Moons are sub-destinations: '#anchor' lands on the parent world and
        // scrolls to that section; URLs are satellites → open externally.
        const mn = hit.userData.moon as { target: string }
        const parent = PLANET_NAV[hit.userData.planetName as string]
        if (mn.target.startsWith('#')) {
          if (parent) enterWorldRef.current(parent, mn.target)
        } else {
          window.open(mn.target, '_blank', 'noopener,noreferrer')
        }
        return
      }
      const nav = PLANET_NAV[hit.userData.name as string]
      if (!nav) return
      if (nav.kind === 'world') enterWorldRef.current(nav)
      else if (nav.target) window.open(nav.target, '_blank', 'noopener,noreferrer')
    }
    renderer.domElement.addEventListener('pointermove', onPointerMove)
    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('pointerup', onPointerUp)
    renderer.domElement.style.cursor = 'grab'
    renderer.domElement.style.touchAction = 'none'

    // ── Resize ───────────────────────────────────────────────────────────
    const onResize = () => {
      const w = host.clientWidth
      const h = host.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    // ── Animation loop ───────────────────────────────────────────────────
    // Orbits advance on ELAPSED TIME only. Tour flies the camera; free mode
    // hands the camera to OrbitControls. The world itself never reacts to
    // the mouse.
    let raf = 0
    let t = 0
    let prev = performance.now()
    const v3 = new THREE.Vector3()
    const desiredTarget = new THREE.Vector3()
    const camDir = new THREE.Vector3()
    const UP = new THREE.Vector3(0, 1, 0)
    // Scripted tour-flight state (captured at each step change).
    let flyKey = -999
    let flyT0 = 0
    let flyLen0 = 1
    const flyDir0 = new THREE.Vector3(0, 0.5, 1)
    const flyTarget0 = new THREE.Vector3()
    const tmpTarget = new THREE.Vector3()

    const tick = () => {
      const now = performance.now()
      const dt = Math.min(0.05, (now - prev) / 1000)
      prev = now

      if (!reduceRef.current && !frozenRef.current) t += dt

      // Planets orbit the sun; surfaces spin on their own axes.
      for (let i = 0; i < planetGroups.length; i++) {
        const th = angle0[i] + t * omega[i]
        planetGroups[i].position.set(
          ORBIT_A[i] * Math.cos(th),
          0,
          ORBIT_A[i] * Math.sin(th),
        )
        planetMeshes[i].rotation.y += dt * (0.12 + i * 0.015)

        // Publish projected screen offsets (used by warp/tour overlays).
        v3.copy(planetGroups[i].position).project(camera)
        registerPlanet(
          PLANETS[i].name,
          (v3.x * 0.5) * host.clientWidth,
          (-v3.y * 0.5) * host.clientHeight,
        )
      }
      for (const m of moonPivots) m.pivot.rotation.y = t * (TWO_PI / m.period)

      // ── Camera choreography ────────────────────────────────────────────
      const tour = tourRef.current
      const warp = warpRef.current
      controls.enabled = !tour.active && !frozenRef.current && !warp.diving
      const k = 1 - Math.exp(-dt / 0.45)
      if (warp.diving) {
        // Entering a world: DIVE into the planet in sync with the warp overlay.
        const idx = PLANETS.findIndex((p) => p.name === warp.diving)
        if (idx >= 0) {
          focusIdx = -1
          const kf = 1 - Math.exp(-dt / 0.16)
          controls.target.lerp(planetGroups[idx].position, kf)
          camDir.copy(camera.position).sub(controls.target)
          const len = camDir.length() || 1
          camDir.multiplyScalar(1 / len)
          camera.position
            .copy(controls.target)
            .addScaledVector(camDir, THREE.MathUtils.lerp(len, RADII[idx] * 2.0, kf))
        }
      } else if (tour.active) {
        let dist: number | null = null
        if (tour.index <= 0) {
          desiredTarget.set(0, 0, 0)
          dist = 58
        } else if (tour.index <= PLANETS.length) {
          const gi = tour.index - 1
          upgradeTexture(gi) // crisp close-up for the spotlight
          desiredTarget.copy(planetGroups[gi].position)
          dist = RADII[gi] * 9 + 8
        } else {
          desiredTarget.set(0, 0, 0)
          dist = 190
        }

        // New step → capture the flight's starting pose.
        if (tour.index !== flyKey) {
          flyKey = tour.index
          flyT0 = now
          flyTarget0.copy(controls.target)
          flyDir0.copy(camera.position).sub(controls.target)
          flyLen0 = flyDir0.length() || 1
          flyDir0.multiplyScalar(1 / flyLen0)
        }
        // Scripted arc: rise over the system, sweep sideways, descend onto the
        // (still-moving) planet. Deterministic — can't wobble or overshoot.
        const u = Math.min(1, (now - flyT0) / TOUR_FLY_MS)
        const e = easeInOutCubic(u)
        const arc = Math.sin(Math.PI * e)
        tmpTarget.lerpVectors(flyTarget0, desiredTarget, e)
        controls.target.copy(tmpTarget)
        camDir.copy(flyDir0).applyAxisAngle(UP, arc * 0.5) // sideways sweep
        camDir.y = THREE.MathUtils.lerp(flyDir0.y, 0.42, e) + arc * 0.35 // rise
        camDir.normalize()
        const len = THREE.MathUtils.lerp(flyLen0, dist!, e) * (1 + arc * 0.45)
        camera.position.copy(controls.target).addScaledVector(camDir, len)

        // Leader-line anchor for the Tour caption.
        if (tour.index >= 1 && tour.index <= PLANETS.length) {
          const gi = tour.index - 1
          v3.copy(planetGroups[gi].position).project(camera)
          const w = host.clientWidth
          const h = host.clientHeight
          const sx = (v3.x * 0.5 + 0.5) * w
          const sy = (-v3.y * 0.5 + 0.5) * h
          const d = camera.position.distanceTo(planetGroups[gi].position)
          const rScr =
            (RADII[gi] / d) * ((h / 2) / Math.tan(((camera.fov / 2) * Math.PI) / 180))
          setSpotlight({ x: sx, y: sy, r: rScr * 1.5 })
        } else {
          setSpotlight(null)
        }
      } else {
        setSpotlight(null)
        flyKey = -999
        // Coming back from a world: glide out to a comfortable overview.
        if (warp.restore) {
          const d = controls.getDistance()
          const nl = THREE.MathUtils.lerp(d, 135, k)
          camDir.copy(camera.position).sub(controls.target).normalize()
          camera.position.copy(controls.target).addScaledVector(camDir, nl)
          if (Math.abs(nl - 135) < 4) warp.restore = false
        }
        if (focusIdx >= 0) {
          // Focused: the orbit pivot RIDES the planet — zoom dives at it, drag
          // orbits around it, and it stays locked while it travels its orbit.
          controls.target.lerp(planetGroups[focusIdx].position, k)
          controls.minDistance = RADII[focusIdx] * 2.4
          // Pull far enough back and focus returns to the sun.
          if (controls.getDistance() > 180) focusIdx = -1
        } else {
          controls.minDistance = 20
          controls.target.lerp(desiredTarget.set(0, 0, 0), k * 0.6)
        }
      }

      controls.update() // every frame — damping needs it
      renderer.render(scene, camera)

      // Track the hovered body with the DOM label.
      const label = labelRef.current
      if (label && hovered) {
        hovered.getWorldPosition(v3).project(camera)
        const w = host.clientWidth
        const h = host.clientHeight
        label.style.transform = `translate(-50%, -130%) translate(${((v3.x * 0.5 + 0.5) * w).toFixed(0)}px, ${((-v3.y * 0.5 + 0.5) * h).toFixed(0)}px)`
        if (hovered.userData.kind === 'sun') {
          label.textContent = 'Ankur Singh · who I am'
        } else if (hovered.userData.kind === 'nmoon') {
          label.textContent = `${hovered.userData.label as string} · moon`
        } else if (hovered.userData.kind === 'moon') {
          const mn = hovered.userData.moon as { label: string; tag?: string }
          label.textContent = mn.tag ? `${mn.label} · ${mn.tag}` : mn.label
        } else {
          const nav: PlanetNav | undefined = PLANET_NAV[hovered.userData.name as string]
          label.textContent = nav
            ? `${nav.label.replace(' ↗', '')} · ${nav.tag}`
            : (hovered.userData.name as string)
        }
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    // ── Cleanup ──────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      renderer.domElement.removeEventListener('wheel', onWheel)
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointerup', onPointerUp)
      controls.dispose()
      disposables.forEach((d) => d.dispose())
      stars.geometry.dispose()
      ;(stars.material as THREE.Material).dispose()
      milky.geometry.dispose()
      ;(milky.material as THREE.Material).dispose()
      renderer.dispose()
      host.removeChild(renderer.domElement)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={hostRef} className="fixed inset-0 z-0 bg-[#02030a]">
      {/* Hover label — driven imperatively from the render loop. */}
      <div
        ref={labelRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-20 whitespace-nowrap rounded-md bg-white px-2.5 py-1 font-mono text-[11px] font-medium text-slate-900 opacity-0 shadow-lg transition-opacity duration-200"
      />
    </div>
  )
}
