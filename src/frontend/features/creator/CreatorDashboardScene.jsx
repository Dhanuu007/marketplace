import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function CreatorDashboardScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current

    if (!mount) {
      return
    }

    // =====================================================
    // SCENE
    // =====================================================

    const scene = new THREE.Scene()

    const width =
      mount.clientWidth || 1

    const height =
      mount.clientHeight || 1

    const camera = new THREE.PerspectiveCamera(
      45,
      width / height,
      0.1,
      100,
    )

    camera.position.set(0, 0, 8)

    // =====================================================
    // RENDERER
    // =====================================================

    const renderer =
      new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      })

    renderer.setPixelRatio(
      Math.min(
         Math.min(window.devicePixelRatio || 1, 1.5),
      ),
    )

    renderer.setSize(
      width,
      height,
    )

    renderer.setClearColor(
      0x000000,
      0,
    )

    mount.appendChild(
      renderer.domElement,
    )

    // =====================================================
    // LIGHTING
    // =====================================================

    const ambientLight =
      new THREE.AmbientLight(
        0xffffff,
        1.5,
      )

    scene.add(ambientLight)

    const tealLight =
      new THREE.PointLight(
        0x008080,
        25,
        12,
      )

    tealLight.position.set(
      2.5,
      2,
      4,
    )

    scene.add(tealLight)

    const blueLight =
      new THREE.PointLight(
        0x2563eb,
        14,
        10,
      )

    blueLight.position.set(
      -3,
      1,
      3,
    )

    scene.add(blueLight)

    // =====================================================
    // CENTRAL WIREFRAME OBJECT
    // =====================================================

    const geometry =
      new THREE.IcosahedronGeometry(
        .50,
        1,
      )

    const material =
      new THREE.MeshBasicMaterial({
        color: 0x008080,
        wireframe: true,
        transparent: true,
        opacity: 0.72,
      })

    const crystal =
      new THREE.Mesh(
        geometry,
        material,
      )

    crystal.position.set(
      7,
      2.5,
      0,
    )

    scene.add(crystal)

    // =====================================================
    // FLOATING SPHERES
    // =====================================================

    const sphereGeometry =
      new THREE.SphereGeometry(
        0.18,
        24,
        24,
      )

    const sphereMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x008080,
        roughness: 0.25,
        metalness: 0.15,
        transparent: true,
        opacity: 0.72,
      })

    const spheres = []

    const spherePositions = [
      [-2.2, 1.15, -0.3],
      [2.7, 1.2, -0.6],
      [-1.4, -0.9, 0],
      [2.3, -0.8, -0.2],
      [0.2, 1.65, -1],
      [3.1, 0.1, -1],
      [-2.8, -0.1, -0.5],
    ]

    spherePositions.forEach(
      ([x, y, z], index) => {
        const sphere =
          new THREE.Mesh(
            sphereGeometry,
            sphereMaterial.clone(),
          )

        sphere.position.set(
          x,
          y,
          z,
        )

        sphere.scale.setScalar(
          0.65 +
            (index % 3) *
              0.25,
        )

        sphere.userData.offset =
          index * 0.8

        sphere.userData.baseY =
          y

        scene.add(sphere)

        spheres.push(sphere)
      },
    )

    // =====================================================
    // PARTICLES
    // =====================================================

    const particleCount = 120

    const particlePositions =
      new Float32Array(
        particleCount * 3,
      )

    for (
      let index = 0;
      index < particleCount;
      index += 1
    ) {
      const i =
        index * 3

      particlePositions[i] =
        (Math.random() - 0.5) *
        12

      particlePositions[i + 1] =
        (Math.random() - 0.5) *
        5

      particlePositions[i + 2] =
        (Math.random() - 0.5) *
        5
    }

    const particleGeometry =
      new THREE.BufferGeometry()

    particleGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(
        particlePositions,
        3,
      ),
    )

    const particleMaterial =
      new THREE.PointsMaterial({
        color: 0x008080,
        size: 0.025,
        transparent: true,
        opacity: 0.5,
      })

    const particles =
      new THREE.Points(
        particleGeometry,
        particleMaterial,
      )

    scene.add(particles)

    // =====================================================
    // MOUSE PARALLAX
    // =====================================================

    let mouseX = 0
    let mouseY = 0

    function handleMouseMove(event) {
      mouseX =
        (event.clientX /
          window.innerWidth -
          0.5) *
        2

      mouseY =
        (event.clientY /
          window.innerHeight -
          0.5) *
        2
    }

    window.addEventListener(
      'mousemove',
      handleMouseMove,
    )

    // =====================================================
    // RESIZE
    // =====================================================

    function handleResize() {
      const currentWidth =
        mount.clientWidth || 1

      const currentHeight =
        mount.clientHeight || 1

      camera.aspect =
        currentWidth /
        currentHeight

      camera.updateProjectionMatrix()

      renderer.setSize(
        currentWidth,
        currentHeight,
      )
    }

    window.addEventListener(
      'resize',
      handleResize,
    )

    // =====================================================
    // ANIMATION
    // =====================================================

    let animationFrame = null

    const startTime =
      performance.now()

    function animate(currentTime) {
      const elapsed =
        (currentTime - startTime) /
        1000

      // ---------------------------------------------------
      // CRYSTAL ROTATION
      // ---------------------------------------------------

      crystal.rotation.x =
        elapsed * 0.12

      crystal.rotation.y =
        elapsed * 0.18

      // ---------------------------------------------------
      // FLOATING SPHERES
      // ---------------------------------------------------

      spheres.forEach(
        (sphere, index) => {
          const baseY =
            sphere.userData.baseY

          const offset =
            sphere.userData.offset

          sphere.position.y =
            baseY +
            Math.sin(
              elapsed * 0.7 +
                offset,
            ) *
              0.18

          sphere.rotation.x =
            elapsed *
            (0.08 + index * 0.01)

          sphere.rotation.y =
            elapsed *
            (0.12 + index * 0.01)
        },
      )

      // ---------------------------------------------------
      // PARTICLES
      // ---------------------------------------------------

      particles.rotation.y =
        elapsed * 0.015

      // ---------------------------------------------------
      // CAMERA PARALLAX
      // ---------------------------------------------------

      camera.position.x +=
        (
          mouseX * 0.22 -
          camera.position.x
        ) *
        0.025

      camera.position.y +=
        (
          -mouseY * 0.12 -
          camera.position.y
        ) *
        0.025

      camera.lookAt(
        0,
        0,
        0,
      )

      renderer.render(
        scene,
        camera,
      )

      animationFrame =
        requestAnimationFrame(
          animate,
        )
    }

    animationFrame =
      requestAnimationFrame(
        animate,
      )

    // =====================================================
    // CLEANUP
    // =====================================================

    return () => {
      if (
        animationFrame !== null
      ) {
        cancelAnimationFrame(
          animationFrame,
        )
      }

      window.removeEventListener(
        'mousemove',
        handleMouseMove,
      )

      window.removeEventListener(
        'resize',
        handleResize,
      )

      geometry.dispose()
      material.dispose()

      sphereGeometry.dispose()

      spheres.forEach(
        (sphere) => {
          sphere.material.dispose()
        },
      )

      particleGeometry.dispose()
      particleMaterial.dispose()

      renderer.dispose()

      if (
        mount.contains(
          renderer.domElement,
        )
      ) {
        mount.removeChild(
          renderer.domElement,
        )
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="creator-3d-scene"
      aria-hidden="true"
    />
  )
}