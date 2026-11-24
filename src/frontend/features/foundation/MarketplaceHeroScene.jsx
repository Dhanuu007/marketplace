
import { useEffect, useRef } from 'react'
import * as THREE from 'three'


function createPanelTexture(accent, title, subtitle) {
  const canvas = document.createElement('canvas')
  canvas.width = 768
  canvas.height = 500

  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = '#10101f'
  ctx.fillRect(0, 0, 768, 500)

  // Browser toolbar
  ctx.fillStyle = '#19192e'
  ctx.fillRect(0, 0, 768, 54)

  // Browser controls
  ;['#fb7185', '#fbbf24', '#34d399'].forEach((color, i) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(24 + i * 24, 27, 7, 0, Math.PI * 2)
    ctx.fill()
  })

  // Address bar
  ctx.fillStyle = '#292941'
  ctx.beginPath()
  ctx.roundRect(130, 14, 470, 26, 8)
  ctx.fill()

  ctx.fillStyle = '#a5a5c0'
  ctx.font = '12px Arial'
  ctx.fillText('www.creativestudio.com', 150, 31)

  // Navigation
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 22px Arial'
  ctx.fillText(title, 36, 105)

  ctx.font = '12px Arial'
  ctx.fillStyle = '#a5a5c0'
  ctx.fillText('HOME', 440, 103)
  ctx.fillText('ABOUT', 510, 103)
  ctx.fillText('CONTACT', 585, 103)

  // Hero background
  const gradient = ctx.createLinearGradient(30, 130, 730, 350)
  gradient.addColorStop(0, accent)
  gradient.addColorStop(1, '#17172d')

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.roundRect(28, 135, 712, 225, 16)
  ctx.fill()

  // Hero heading
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 34px Arial'
  ctx.fillText('Build Something', 65, 210)
  ctx.fillText('Extraordinary.', 65, 252)

  // Description
  ctx.fillStyle = 'rgba(255,255,255,.72)'
  ctx.font = '15px Arial'
  ctx.fillText(subtitle, 67, 286)

  // CTA button
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.roundRect(65, 310, 145, 32, 7)
  ctx.fill()

  ctx.fillStyle = '#17172d'
  ctx.font = 'bold 12px Arial'
  ctx.fillText('Explore Now  →', 82, 331)

  // Three content cards
  const cardColors = [
    'rgba(255,255,255,.13)',
    'rgba(255,255,255,.09)',
    'rgba(255,255,255,.13)',
  ]

  cardColors.forEach((color, i) => {
    const x = 30 + i * 245

    ctx.fillStyle = color
    ctx.beginPath()
    ctx.roundRect(x, 385, 220, 85, 10)
    ctx.fill()

    ctx.fillStyle = accent
    ctx.beginPath()
    ctx.arc(x + 28, 412, 10, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(x + 48, 405, 120, 7)

    ctx.fillStyle = 'rgba(255,255,255,.4)'
    ctx.fillRect(x + 48, 423, 145, 5)
    ctx.fillRect(x + 48, 436, 105, 5)
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace

  return texture
}


function addPanelOutline(panel, color) {
  const edges = new THREE.EdgesGeometry(panel.geometry)

  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 1,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  })

  const outline = new THREE.LineSegments(edges, material)

  outline.scale.setScalar(1.012)
  outline.renderOrder = 10

  panel.add(outline)

  return { edges, material }
}

export default function MarketplaceHeroScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const isMobile = window.innerWidth < 768

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100,
    )

    camera.position.set(0, 0.3, 10)

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
    })

    renderer.setSize(
      mount.clientWidth,
      mount.clientHeight,
    )

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio || 1,
        isMobile ? 1.5 : 2,
      ),
    )

    mount.appendChild(renderer.domElement)

    // Lighting
    const ambient = new THREE.AmbientLight(0x7777aa, 1.7)
    scene.add(ambient)

    const violetLight = new THREE.PointLight(0x8b5cf6, 35, 35)
    violetLight.position.set(4, 4, 5)
    scene.add(violetLight)

    const cyanLight = new THREE.PointLight(0x22d3ee, 25, 35)
    cyanLight.position.set(-4, -3, 4)
    scene.add(cyanLight)


    // Cinematic violet spotlight
    const violetSpot = new THREE.SpotLight(
      0x8b5cf6,
      45,
      22,
      Math.PI / 5,
      0.6,
      1,
    )

    violetSpot.position.set(3, 5, 6)
    violetSpot.target.position.set(0, 0, 0)

    scene.add(violetSpot)
    scene.add(violetSpot.target)

    // Cyan fill spotlight
    const cyanSpot = new THREE.SpotLight(
      0x22d3ee,
      30,
      20,
      Math.PI / 4,
      0.7,
      1,
    )

    cyanSpot.position.set(-5, -2, 5)
    cyanSpot.target.position.set(0, 0, 0)

    scene.add(cyanSpot)
    scene.add(cyanSpot.target)


    const group = new THREE.Group()
    scene.add(group)

    const resources = []

    const addMesh = (
      geometry,
      material,
      position,
      rotation = [0, 0, 0],
    ) => {
      const mesh = new THREE.Mesh(geometry, material)

      mesh.position.set(...position)
      mesh.rotation.set(...rotation)

      group.add(mesh)

      resources.push(geometry, material)

      if (material.map) {
        resources.push(material.map)
      }

      return mesh
    }

    // =========================================
    // MAIN WEBSITE PREVIEW
    // =========================================

    // Soft ambient halo behind the preview for extra depth
    const haloCanvas = document.createElement('canvas')
    haloCanvas.width = 512
    haloCanvas.height = 360

    const haloContext = haloCanvas.getContext('2d')
    const haloGradient = haloContext.createRadialGradient(
      256,
      180,
      25,
      256,
      180,
      180,
    )

    haloGradient.addColorStop(0, 'rgba(139, 92, 246, 0.62)')
    haloGradient.addColorStop(0.52, 'rgba(34, 211, 238, 0.34)')
    haloGradient.addColorStop(1, 'rgba(34, 211, 238, 0)')

    haloContext.fillStyle = haloGradient
    haloContext.fillRect(0, 0, 512, 360)

    const haloTexture = new THREE.CanvasTexture(haloCanvas)
    haloTexture.colorSpace = THREE.SRGBColorSpace

    const haloGlow = addMesh(
      new THREE.PlaneGeometry(5.8, 4.25),
      new THREE.MeshBasicMaterial({
        map: haloTexture,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
      [0, 0.65, -0.28],
    )

    // Glass backing behind the main preview
    const glassBacking = addMesh(
      new THREE.BoxGeometry(4.48, 3.08, 0.08),
      new THREE.MeshBasicMaterial({
        color: 0x7c3aed,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
      }),
      [0, 0.65, -0.13],
    )

    glassBacking.rotation.y = -0.04
    glassBacking.rotation.x = 0.025


    const mainTexture = createPanelTexture(
      '#8b5cf6',
      'CREATIVE STUDIO',
      'Premium website preview',
    )

    const mainPanel = addMesh(
      new THREE.BoxGeometry(4.2, 2.8, 0.12),
      new THREE.MeshBasicMaterial({
        map: mainTexture,
        toneMapped: false,
      }),
      [0, 0.65, 0],
    )

    // Violet outline
    const mainOutline = addPanelOutline(
      mainPanel,
      0xc4b5fd,
    )

    resources.push(
      mainTexture,
      mainOutline.edges,
      mainOutline.material,
    )

    // =========================================
    // SUBTLE LIGHT TRAILS AROUND MAIN PREVIEW
    // =========================================

    const createLightTrail = (startAngle, endAngle, color) => {
      const points = []

      for (let i = 0; i <= 48; i += 1) {
        const progress = i / 48
        const angle =
          startAngle + (endAngle - startAngle) * progress

        points.push(
          new THREE.Vector3(
            Math.cos(angle) * 2.34,
            Math.sin(angle) * 1.57,
            0,
          ),
        )
      }

      const curve = new THREE.CatmullRomCurve3(points)

      return addMesh(
        new THREE.TubeGeometry(curve, 80, 0.012, 8, false),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.38,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          toneMapped: false,
        }),
        [0, 0.65, 0.24],
      )
    }

    const topLightTrail = createLightTrail(
      Math.PI * 0.12,
      Math.PI * 0.88,
      0x67e8f9,
    )

    const bottomLightTrail = createLightTrail(
      Math.PI * 1.12,
      Math.PI * 1.88,
      0xa78bfa,
    )

    // =========================================
    // PAYMENT PREVIEW
    // =========================================

    const paymentTexture = createPanelTexture(
      '#22d3ee',
      'Payment received',
      'Your purchase is confirmed',
    )

    const paymentPanel = addMesh(
      new THREE.BoxGeometry(2.05, 1.35, 0.09),
      new THREE.MeshBasicMaterial({
        map: paymentTexture,
        toneMapped: false,
      }),
      [-2.25, -1.55, 1.1],
      [-0.12, 0.35, 0.08],
    )

    const paymentOutline = addPanelOutline(
      paymentPanel,
      0x22d3ee,
    )

    resources.push(
      paymentTexture,
      paymentOutline.edges,
      paymentOutline.material,
    )

    // =========================================
    // APPROVAL PREVIEW
    // =========================================

    const approvalTexture = createPanelTexture(
      '#34d399',
      'APPROVED',
      'Your website is ready to sell',
    )

    const approvalPanel = addMesh(
      new THREE.BoxGeometry(1.8, 1.15, 0.08),
      new THREE.MeshBasicMaterial({
        map: approvalTexture,
        toneMapped: false,
      }),
      [2.45, 1.85, 0.8],
      [0.1, -0.4, -0.05],
    )

    const approvalOutline = addPanelOutline(
      approvalPanel,
      0x34d399,
    )

    resources.push(
      approvalTexture,
      approvalOutline.edges,
      approvalOutline.material,
    )

    // =========================================
    // FLOATING ZIP CUBE
    // =========================================

    const zipMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x4c1d95,
      emissiveIntensity: 0.55,
      metalness: 0.6,
      roughness: 0.25,
    })

    const zipCube = addMesh(
      new THREE.BoxGeometry(0.85, 0.85, 0.85),
      zipMaterial,
      [2.65, -1.25, 1.2],
    )

    zipCube.rotation.set(0.35, 0.5, 0.2)

    // =========================================
    // NEON CYAN RING
    // =========================================

    const ring = addMesh(
      new THREE.TorusGeometry(2.7, 0.018, 12, 100),
      new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.85,
        toneMapped: false,
      }),
      [0, 0.5, -0.8],
      [Math.PI / 2.4, 0, 0],
    )

    // =========================================
    // FLOATING VIOLET RING
    // =========================================

    const accentRing = addMesh(
      new THREE.TorusGeometry(0.48, 0.12, 20, 64),
      new THREE.MeshStandardMaterial({
        color: 0xa78bfa,
        emissive: 0x6d28d9,
        emissiveIntensity: 0.7,
        metalness: 0.7,
        roughness: 0.25,
      }),
      [-3.1, 1.9, -0.6],
    )

    let particles = null

    // =========================================
    // FLOATING PARTICLES
    // =========================================

    if (!isMobile) {
      const count = 180
      const positions = new Float32Array(count * 3)

      for (let i = 0; i < count; i += 1) {
        positions[i * 3] =
          (Math.random() - 0.5) * 13

        positions[i * 3 + 1] =
          (Math.random() - 0.5) * 8

        positions[i * 3 + 2] =
          (Math.random() - 0.5) * 6
      }

      const particleGeometry = new THREE.BufferGeometry()

      particleGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3),
      )

      const particleMaterial = new THREE.PointsMaterial({
        color: 0xa78bfa,
        size: 0.035,
        transparent: true,
        opacity: 0.75,
        toneMapped: false,
      })

      particles = new THREE.Points(
        particleGeometry,
        particleMaterial,
        )

      scene.add(particles)

      resources.push(
        particleGeometry,
        particleMaterial,
      )
    }

    // =========================================
    // MOUSE MOVEMENT
    // =========================================

    let targetX = 0
    let targetY = 0

    // Scroll-driven parallax state (normal page scrolling stays enabled)
    let targetScrollProgress = 0
    let currentScrollProgress = 0

    const handleScroll = () => {
      const rect = mount.getBoundingClientRect()
      const totalTravel = window.innerHeight + rect.height
      const progress =
        totalTravel > 0
          ? (window.innerHeight - rect.top) / totalTravel
          : 0

      targetScrollProgress = THREE.MathUtils.clamp(
        progress - 0.5,
        -0.5,
        0.5,
      )
    }

    const handlePointerMove = (event) => {
      const rect = mount.getBoundingClientRect()

      targetX =
        ((event.clientX - rect.left) / rect.width - 0.5) * 2

      targetY =
        ((event.clientY - rect.top) / rect.height - 0.5) * 2
    }

    window.addEventListener(
      'pointermove',
      handlePointerMove,
    )

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    })
    handleScroll()

    // =========================================
    // ANIMATION
    // =========================================

    const clock = new THREE.Clock()
    let animationFrame = 0

    
const animate = () => {
  animationFrame = requestAnimationFrame(animate)

  const time = clock.getElapsedTime()

  if (!reduceMotion) {
    // Main website preview — gentle floating
    mainPanel.position.y =
      0.65 + Math.sin(time * 0.65) * 0.12

    mainPanel.rotation.y =
      Math.sin(time * 0.3) * 0.07

    mainPanel.rotation.x =
      Math.sin(time * 0.25) * 0.025

    // Keep glass backing synchronized with main panel
    glassBacking.position.y = mainPanel.position.y
    glassBacking.rotation.y = mainPanel.rotation.y
    glassBacking.rotation.x = mainPanel.rotation.x + 0.025
    // Glass backing breathing glow
    glassBacking.material.opacity =
      0.13 + (Math.sin(time * 1.4) + 1) * 0.035

    // Very subtle ambient halo pulse
    haloGlow.material.opacity =
      0.78 + (Math.sin(time * 0.9) + 1) * 0.1

    // Payment card
    paymentPanel.position.y =
      -1.55 + Math.sin(time * 0.7 + 2) * 0.1

    paymentPanel.rotation.z =
      Math.sin(time * 0.4) * 0.025

    // Approval card
    approvalPanel.position.y =
      1.85 + Math.sin(time * 0.55 + 1) * 0.1

    approvalPanel.rotation.z =
      Math.sin(time * 0.35 + 1) * 0.025

    // ZIP cube
    zipCube.rotation.x = 0.35 + time * 0.4
    zipCube.rotation.y = 0.5 + time * 0.55

    zipCube.position.y =
      -1.25 + Math.sin(time * 0.8) * 0.12

    // Neon rings
    ring.rotation.z = time * 0.12

    accentRing.rotation.x = time * 0.35
    accentRing.rotation.y = time * 0.5

    // Gentle light-trail shimmer
    topLightTrail.material.opacity =
      0.3 + (Math.sin(time * 1.25) + 1) * 0.07

    bottomLightTrail.material.opacity =
      0.3 + (Math.sin(time * 1.25 + Math.PI) + 1) * 0.07

    topLightTrail.position.y = mainPanel.position.y
    bottomLightTrail.position.y = mainPanel.position.y

            // Subtle animated glow pulse
        const glowPulse = 0.75 + Math.sin(time * 1.8) * 0.2

        mainOutline.material.opacity = glowPulse
        paymentOutline.material.opacity =
        0.7 + Math.sin(time * 2 + 1) * 0.25

        approvalOutline.material.opacity =
        0.7 + Math.sin(time * 2 + 2) * 0.25

    // Smooth mouse movement
    group.rotation.y +=
      (targetX * 0.13 - group.rotation.y) * 0.035

    group.rotation.x +=
      (targetY * 0.08 - group.rotation.x) * 0.035

    // Smooth scroll-linked movement without locking or hijacking page scroll
    currentScrollProgress +=
      (targetScrollProgress - currentScrollProgress) * 0.045

    group.position.y = -currentScrollProgress * 0.7
    group.rotation.z = currentScrollProgress * 0.055
    camera.position.z = 10 + Math.abs(currentScrollProgress) * 0.45
  }

  // Slowly animate background particles
        if (particles && !reduceMotion) {
        particles.rotation.y = time * 0.012
        particles.rotation.x = Math.sin(time * 0.15) * 0.025
        }

  renderer.render(scene, camera)
}


    animate()

    // =========================================
    // RESPONSIVE RESIZING
    // =========================================

    const handleResize = () => {
      const width = mount.clientWidth
      const height = mount.clientHeight

      if (!width || !height) return

      camera.aspect = width / height
      camera.updateProjectionMatrix()

      renderer.setSize(width, height)
    }

    const resizeObserver = new ResizeObserver(
      handleResize,
    )

    resizeObserver.observe(mount)

    // =========================================
    // CLEANUP
    // =========================================

    return () => {
      cancelAnimationFrame(animationFrame)

      window.removeEventListener(
        'pointermove',
        handlePointerMove,
      )
      window.removeEventListener('scroll', handleScroll)

      resizeObserver.disconnect()

      resources.forEach((resource) => {
        resource.dispose()
      })

      renderer.dispose()

      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="marketplace-hero-scene"
      aria-hidden="true"
    />
  )
}
