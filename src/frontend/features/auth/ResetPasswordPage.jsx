import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  Link,
  useSearchParams,
} from 'react-router-dom'

import * as THREE from 'three'

import { resetPassword } from './authApi.js'

import './reset-password.css'


function SecurityShield3D() {
  const containerRef =
    useRef(null)


  useEffect(() => {
    const container =
      containerRef.current

    if (!container) {
      return
    }


    // =========================================================
    // SCENE
    // =========================================================

    const scene =
      new THREE.Scene()


    const camera =
      new THREE.PerspectiveCamera(
        35,
        1,
        0.1,
        100,
      )

    camera.position.z = 4


    const renderer =
      new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      })


    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        2,
      ),
    )


    renderer.setSize(
      120,
      120,
      false,
    )


    renderer.outputColorSpace =
      THREE.SRGBColorSpace


    container.appendChild(
      renderer.domElement,
    )


    // =========================================================
    // SHIELD SHAPE
    // =========================================================

    const shape =
      new THREE.Shape()


    shape.moveTo(
      0,
      1.25,
    )

    shape.lineTo(
      0.95,
      0.85,
    )

    shape.lineTo(
      0.82,
      -0.15,
    )

    shape.quadraticCurveTo(
      0.62,
      -0.9,
      0,
      -1.25,
    )

    shape.quadraticCurveTo(
      -0.62,
      -0.9,
      -0.82,
      -0.15,
    )

    shape.lineTo(
      -0.95,
      0.85,
    )

    shape.lineTo(
      0,
      1.25,
    )


    const geometry =
      new THREE.ExtrudeGeometry(
        shape,
        {
          depth: 0.28,
          bevelEnabled: true,
          bevelSegments: 3,
          bevelSize: 0.06,
          bevelThickness: 0.05,
          curveSegments: 12,
        },
      )


    geometry.center()


    const material =
      new THREE.MeshStandardMaterial({
        color: 0x0aa89f,
        metalness: 0.55,
        roughness: 0.28,
        emissive: 0x063d3a,
        emissiveIntensity: 0.35,
      })


    const shield =
      new THREE.Mesh(
        geometry,
        material,
      )


    shield.scale.set(
      0.72,
      0.72,
      0.72,
    )


    scene.add(
      shield,
    )


    // =========================================================
    // SHIELD EDGE
    // =========================================================

    const edges =
      new THREE.EdgesGeometry(
        geometry,
      )


    const edgeMaterial =
      new THREE.LineBasicMaterial({
        color: 0x73eee4,
        transparent: true,
        opacity: 0.65,
      })


    const edgeLines =
      new THREE.LineSegments(
        edges,
        edgeMaterial,
      )


    edgeLines.scale.copy(
      shield.scale,
    )


    scene.add(
      edgeLines,
    )


    // =========================================================
    // CHECK MARK
    // =========================================================

    const checkMaterial =
      new THREE.LineBasicMaterial({
        color: 0xffffff,
      })


    const checkPoints = [
      new THREE.Vector3(
        -0.38,
        -0.02,
        0.3,
      ),

      new THREE.Vector3(
        -0.08,
        -0.34,
        0.3,
      ),

      new THREE.Vector3(
        0.48,
        0.42,
        0.3,
      ),
    ]


    const checkGeometry =
      new THREE.BufferGeometry()
        .setFromPoints(
          checkPoints,
        )


    const check =
      new THREE.Line(
        checkGeometry,
        checkMaterial,
      )


    check.scale.set(
      0.72,
      0.72,
      0.72,
    )


    scene.add(
      check,
    )


    // =========================================================
    // LIGHTING
    // =========================================================

    const ambientLight =
      new THREE.AmbientLight(
        0xffffff,
        1.7,
      )


    scene.add(
      ambientLight,
    )


    const keyLight =
      new THREE.DirectionalLight(
        0xffffff,
        3,
      )


    keyLight.position.set(
      2,
      3,
      4,
    )


    scene.add(
      keyLight,
    )


    const tealLight =
      new THREE.PointLight(
        0x18d8ca,
        2.5,
        5,
    )


    tealLight.position.set(
      -2,
      1,
      2,
    )


    scene.add(
      tealLight,
    )


    // =========================================================
    // PARTICLES
    // =========================================================

    const particleGeometry =
      new THREE.BufferGeometry()


    const particleCount = 28


    const particlePositions =
      new Float32Array(
        particleCount * 3,
      )


    for (
      let index = 0;
      index < particleCount;
      index += 1
    ) {
      particlePositions[
        index * 3
      ] =
        (
          Math.random() - 0.5
        ) * 3

      particlePositions[
        index * 3 + 1
      ] =
        (
          Math.random() - 0.5
        ) * 3

      particlePositions[
        index * 3 + 2
      ] =
        (
          Math.random() - 0.5
        ) * 1.5
    }


    particleGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(
        particlePositions,
        3,
      ),
    )


    const particleMaterial =
      new THREE.PointsMaterial({
        color: 0x63ddd4,
        size: 0.035,
        transparent: true,
        opacity: 0.7,
      })


    const particles =
      new THREE.Points(
        particleGeometry,
        particleMaterial,
      )


    scene.add(
      particles,
    )


    // =========================================================
    // ANIMATION
    // =========================================================

    let animationFrame


    const clock =
      new THREE.Clock()


    function animate() {
      animationFrame =
        requestAnimationFrame(
          animate,
        )


      const elapsed =
        clock.getElapsedTime()


      shield.rotation.y =
        Math.sin(
          elapsed * 0.65,
        ) * 0.22


      edgeLines.rotation.y =
        shield.rotation.y


      check.rotation.y =
        shield.rotation.y


      shield.position.y =
        Math.sin(
          elapsed * 1.2,
        ) * 0.08


      edgeLines.position.y =
        shield.position.y


      check.position.y =
        shield.position.y


      particles.rotation.y =
        elapsed * 0.08


      particles.position.y =
        Math.sin(
          elapsed * 0.5,
        ) * 0.05


      renderer.render(
        scene,
        camera,
      )
    }


    animate()


    // =========================================================
    // CLEANUP
    // =========================================================

    return () => {
      cancelAnimationFrame(
        animationFrame,
      )


      geometry.dispose()
      material.dispose()

      edges.dispose()
      edgeMaterial.dispose()

      checkGeometry.dispose()
      checkMaterial.dispose()

      particleGeometry.dispose()
      particleMaterial.dispose()

      renderer.dispose()


      if (
        renderer.domElement.parentNode
      ) {
        renderer.domElement.parentNode.removeChild(
          renderer.domElement,
        )
      }
    }
  }, [])


  return (
    <div
      ref={containerRef}
      className="reset-security-3d"
      aria-hidden="true"
    />
  )
}


export function ResetPasswordPage() {
  const [searchParams] =
    useSearchParams()


  const token =
    searchParams.get('token') || ''


  const [password, setPassword] =
    useState('')


  const [confirmPassword, setConfirmPassword] =
    useState('')


  const [showPassword, setShowPassword] =
    useState(false)


  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false)


  const [loading, setLoading] =
    useState(false)


  const [error, setError] =
    useState('')


  const [success, setSuccess] =
    useState(false)


  async function handleSubmit(event) {
    event.preventDefault()

    setError('')


    if (!token) {
      setError(
        'This password reset link is invalid.',
      )

      return
    }


    if (password.length < 8) {
      setError(
        'Password must be at least 8 characters.',
      )

      return
    }


    if (
      password !==
      confirmPassword
    ) {
      setError(
        'Passwords do not match.',
      )

      return
    }


    setLoading(true)


    try {
      await resetPassword({
        token,
        password,
      })

      setSuccess(true)
    } catch (requestError) {
      setError(
        requestError?.message ||
          'Unable to reset your password.',
      )
    } finally {
      setLoading(false)
    }
  }


  return (
    <main className="reset-password-shell">

      <section className="reset-password-card">

        {/* =====================================================
            BRAND
        ===================================================== */}

        <div className="reset-password-brand">

          <div className="reset-password-logo">
            M
          </div>

          <div>

            <strong>
              Marketplace
            </strong>

            <span>
              Secure Account Recovery
            </span>

          </div>

        </div>


        {!success ? (

          <>

            {/* =================================================
                HEADING
            ================================================= */}

            <div className="reset-password-heading">

              <span className="reset-password-eyebrow">
                Account Recovery
              </span>

              <h1>
                Create a new password
              </h1>

              <p>
                Choose a strong password for
                your Marketplace account.
              </p>


              {/* =================================================
                  3D SECURITY
              ================================================= */}

              <div className="reset-password-security">

                <SecurityShield3D />

                <span>
                  Your new password is securely
                  protected.
                </span>

              </div>

            </div>


            {/* =================================================
                FORM
            ================================================= */}

            <form
              className="reset-password-form"
              onSubmit={handleSubmit}
            >

              {/* =================================================
                  NEW PASSWORD
              ================================================= */}

              <label className="reset-password-field">

                <span>
                  New password
                </span>


                <div className="reset-password-input-wrapper">

                  <input
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value,
                      )
                    }
                    required
                  />


                  <button
                    type="button"
                    className="reset-password-visibility"
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current,
                      )
                    }
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {showPassword
                      ? '🙈'
                      : '👁️'}
                  </button>

                </div>

              </label>


              {/* =================================================
                  CONFIRM PASSWORD
              ================================================= */}

              <label className="reset-password-field">

                <span>
                  Confirm password
                </span>


                <div className="reset-password-input-wrapper">

                  <input
                    type={
                      showConfirmPassword
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value,
                      )
                    }
                    required
                  />


                  <button
                    type="button"
                    className="reset-password-visibility"
                    onClick={() =>
                      setShowConfirmPassword(
                        (current) =>
                          !current,
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {showConfirmPassword
                      ? '🙈'
                      : '👁️'}
                  </button>

                </div>

              </label>


              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (
                <div
                  className="reset-password-error"
                  role="alert"
                >
                  {error}
                </div>
              )}


              {/* =================================================
                  SUBMIT
              ================================================= */}

              <button
                className="reset-password-submit"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? 'Updating password...'
                  : 'Reset Password'}
              </button>

            </form>

          </>

        ) : (

          /* =====================================================
             SUCCESS
          ===================================================== */

          <div className="reset-password-success">

            <div className="reset-success-icon">
              ✓
            </div>


            <span className="reset-password-eyebrow">
              Password Updated
            </span>


            <h1>
              Password reset successfully
            </h1>


            <p>
              Your Marketplace password has
              been updated. You can now log in
              with your new password.
            </p>


            <Link
              className="reset-password-login"
              to="/login"
            >
              Go to Login →
            </Link>

          </div>

        )}


        {/* =====================================================
            BACK TO LOGIN
        ===================================================== */}

        {!success && (
          <Link
            className="reset-password-back"
            to="/login"
          >
            ← Back to Login
          </Link>
        )}

      </section>

    </main>
  )
}


export default ResetPasswordPage