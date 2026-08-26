import { useEffect, useRef } from 'react'
import * as THREE from 'three'

import './Credits.css'


export default function Credits({ onClose }) {

  const canvasRef = useRef(null)


  useEffect(() => {

    if (!canvasRef.current) {
      return
    }


    const canvas = canvasRef.current


    const scene = new THREE.Scene()


    const camera = new THREE.PerspectiveCamera(
      45,
      1,
      0.1,
      100,
    )

    camera.position.z = 5


    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    })


    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2),
    )

    renderer.setSize(
      420,
      420,
      false,
    )

    renderer.outputColorSpace =
      THREE.SRGBColorSpace


    /* =====================================================
       LIGHTING
    ===================================================== */

    const ambientLight =
      new THREE.AmbientLight(
        0xffffff,
        1.8,
      )

    scene.add(ambientLight)


    const tealLight =
      new THREE.PointLight(
        0x14b8a6,
        5,
        10,
      )

    tealLight.position.set(
      2,
      2,
      4,
    )

    scene.add(tealLight)


    const blueLight =
      new THREE.PointLight(
        0x3b82f6,
        4,
        10,
      )

    blueLight.position.set(
      -3,
      -1,
      3,
    )

    scene.add(blueLight)


    /* =====================================================
       CENTRAL 3D OBJECT
    ===================================================== */

    const group =
      new THREE.Group()

    scene.add(group)


    const geometry =
      new THREE.IcosahedronGeometry(
        1.35,
        2,
      )


    const material =
      new THREE.MeshStandardMaterial({
        color: 0x14b8a6,
        roughness: 0.25,
        metalness: 0.55,
        transparent: true,
        opacity: 0.9,
      })


    const object =
      new THREE.Mesh(
        geometry,
        material,
      )

    group.add(object)


    /* =====================================================
       INNER OBJECT
    ===================================================== */

    const innerGeometry =
      new THREE.IcosahedronGeometry(
        0.75,
        1,
      )


    const innerMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.2,
        metalness: 0.25,
        transparent: true,
        opacity: 0.18,
        wireframe: true,
      })


    const innerObject =
      new THREE.Mesh(
        innerGeometry,
        innerMaterial,
      )


    group.add(innerObject)


    /* =====================================================
       ORBIT RING
    ===================================================== */

    const ringGeometry =
      new THREE.TorusGeometry(
        1.75,
        0.018,
        16,
        100,
      )


    const ringMaterial =
      new THREE.MeshBasicMaterial({
        color: 0x5eead4,
        transparent: true,
        opacity: 0.55,
      })


    const ring =
      new THREE.Mesh(
        ringGeometry,
        ringMaterial,
      )


    ring.rotation.x =
      Math.PI / 2.7

    group.add(ring)


    /* =====================================================
       PARTICLES
    ===================================================== */

    const particleCount = 100

    const particlePositions =
      new Float32Array(
        particleCount * 3,
      )


    for (
      let index = 0;
      index < particleCount;
      index += 1
    ) {

      const radius =
        2.1 +
        Math.random() * 1.5

      const angle =
        Math.random() *
        Math.PI *
        2

      const height =
        (Math.random() - 0.5) *
        3.5


      particlePositions[
        index * 3
      ] =
        Math.cos(angle) *
        radius

      particlePositions[
        index * 3 + 1
      ] =
        height

      particlePositions[
        index * 3 + 2
      ] =
        Math.sin(angle) *
        radius
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
        color: 0x99f6e4,
        size: 0.035,
        transparent: true,
        opacity: 0.7,
      })


    const particles =
      new THREE.Points(
        particleGeometry,
        particleMaterial,
      )

    scene.add(particles)


    /* =====================================================
       MOUSE MOVEMENT
    ===================================================== */

    let mouseX = 0
    let mouseY = 0


    function handleMouseMove(event) {

      mouseX =
        (event.clientX /
          window.innerWidth -
          0.5) *
        0.4

      mouseY =
        (event.clientY /
          window.innerHeight -
          0.5) *
        0.4
    }


    window.addEventListener(
      'mousemove',
      handleMouseMove,
    )


    /* =====================================================
       ANIMATION
    ===================================================== */

    const clock =
      new THREE.Clock()


    let animationFrame


    function animate() {

      const elapsed =
        clock.getElapsedTime()


      object.rotation.x =
        elapsed * 0.22

      object.rotation.y =
        elapsed * 0.35


      innerObject.rotation.x =
        -elapsed * 0.3

      innerObject.rotation.y =
        -elapsed * 0.2


      ring.rotation.z =
        elapsed * 0.3


      particles.rotation.y =
        elapsed * 0.04


      group.position.y =
        Math.sin(
          elapsed * 1.2,
        ) * 0.08


      group.rotation.x +=
        (mouseY -
          group.rotation.x) *
        0.02


      group.rotation.z +=
        (mouseX -
          group.rotation.z) *
        0.02


      renderer.render(
        scene,
        camera,
      )


      animationFrame =
        requestAnimationFrame(
          animate,
        )
    }


    animate()


    /* =====================================================
       CLEANUP
    ===================================================== */

    return () => {

      cancelAnimationFrame(
        animationFrame,
      )


      window.removeEventListener(
        'mousemove',
        handleMouseMove,
      )


      geometry.dispose()
      material.dispose()

      innerGeometry.dispose()
      innerMaterial.dispose()

      ringGeometry.dispose()
      ringMaterial.dispose()

      particleGeometry.dispose()
      particleMaterial.dispose()

      renderer.dispose()
    }

  }, [])


  return (
    <div
      className="credits-overlay"
      onMouseDown={(event) => {

        if (
          event.target ===
          event.currentTarget
        ) {
          onClose()
        }

      }}
    >

      <div className="credits-card">

        <button
          type="button"
          className="credits-close"
          onClick={onClose}
          aria-label="Close credits"
        >
          ×
        </button>


        <div className="credits-visual">

          <canvas
            ref={canvasRef}
            className="credits-canvas"
          />

        </div>


        <div className="credits-content">

          <span className="credits-label">
            MARKETPLACE
          </span>


          <h2>
            Designed & Developed By
          </h2>


          <h1>
            Dhananjay Bhite
          </h1>


          <p className="credits-role">
            Full-Stack Developer · Creator
          </p>


          <div className="credits-divider" />


          <p className="credits-description">
            This Marketplace was designed,
            developed, and built end-to-end
            from concept to working product.
          </p>


          <div className="credits-grid">

            <span>
              Product Architecture
            </span>

            <span>
              UI / UX Design
            </span>

            <span>
              Frontend Development
            </span>

            <span>
              Backend Development
            </span>

            <span>
              Database & APIs
            </span>

            <span>
              Authentication
            </span>

            <span>
              Payment System
            </span>

            <span>
              Admin Dashboard
            </span>

            <span>
              Creator Workflows
            </span>

            <span>
              Buyer Workflows
            </span>

            <span>
                Production & Deployment
            </span>


          </div>


          <p className="credits-footer-text">
            Built from concept to product.
          </p>

        </div>

      </div>

    </div>
  )
}