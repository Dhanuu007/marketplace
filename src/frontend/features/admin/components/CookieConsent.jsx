import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./CookieConsent.css";

const COOKIE_CONSENT_KEY = "marketplace_cookie_consent";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);

    return !consent;
  });

  const canvasRef = useRef(null);

  useEffect(() => {
    if (!showBanner || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      35,
      1,
      0.1,
      100
    );

    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(180, 180, false);

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const ambientLight = new THREE.AmbientLight(
      0xffffff,
      2
    );

    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(
      0xa5b4fc,
      4
    );

    keyLight.position.set(2, 3, 4);

    scene.add(keyLight);

    const purpleLight = new THREE.PointLight(
      0xc084fc,
      5,
      8
    );

    purpleLight.position.set(
      -2,
      1,
      3
    );

    scene.add(purpleLight);

    const cookieGroup = new THREE.Group();

    scene.add(cookieGroup);

    const cookieGeometry =
      new THREE.CylinderGeometry(
        1.25,
        1.25,
        0.32,
        64
      );

    const cookieMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xb87542,
        roughness: 0.8,
        metalness: 0.05,
      });

    const cookie = new THREE.Mesh(
      cookieGeometry,
      cookieMaterial
    );

    cookieGroup.add(cookie);

    const edgeGeometry =
      new THREE.TorusGeometry(
        1.12,
        0.08,
        16,
        64
      );

    const edgeMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x8d4f2d,
        roughness: 0.9,
      });

    const edge = new THREE.Mesh(
      edgeGeometry,
      edgeMaterial
    );

    edge.rotation.x = Math.PI / 2;

    edge.position.y = 0.17;

    cookieGroup.add(edge);

    const chipGeometry =
      new THREE.SphereGeometry(
        0.11,
        16,
        16
      );

    const chipMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x24150f,
        roughness: 0.9,
      });

    const chipPositions = [
      [-0.55, 0.2, 0.45],
      [0.05, 0.2, 0.7],
      [0.62, 0.2, 0.25],
      [-0.72, 0.2, -0.25],
      [-0.18, 0.2, -0.55],
      [0.48, 0.2, -0.5],
      [0.72, 0.2, -0.05],
    ];

    chipPositions.forEach((position) => {
      const chip = new THREE.Mesh(
        chipGeometry,
        chipMaterial
      );

      chip.position.set(
        position[0],
        position[1],
        position[2]
      );

      cookieGroup.add(chip);
    });

    cookieGroup.rotation.x = 0.35;

    let animationFrame;

    let mouseX = 0;
    let mouseY = 0;

    function handleMouseMove(event) {
      mouseX =
        (event.clientX / window.innerWidth - 0.5) *
        0.5;

      mouseY =
        (event.clientY / window.innerHeight - 0.5) *
        0.5;
    }

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    const clock = new THREE.Clock();

    function animate() {
      const elapsed = clock.getElapsedTime();

      cookieGroup.rotation.z =
        Math.sin(elapsed * 0.7) * 0.08;

      cookieGroup.rotation.y =
        elapsed * 0.35;

      cookieGroup.position.y =
        Math.sin(elapsed * 1.2) * 0.08;

      cookieGroup.rotation.x =
        0.35 + mouseY * 0.4;

      cookieGroup.rotation.z +=
        mouseX * 0.15;

      renderer.render(
        scene,
        camera
      );

      animationFrame =
        requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      cookieGeometry.dispose();
      cookieMaterial.dispose();

      edgeGeometry.dispose();
      edgeMaterial.dispose();

      chipGeometry.dispose();
      chipMaterial.dispose();

      renderer.dispose();
    };
  }, [showBanner]);

  function handleConsent(value) {
    localStorage.setItem(
      COOKIE_CONSENT_KEY,
      value
    );

    setShowBanner(false);
  }

  if (!showBanner) {
    return null;
  }

  return (
    <div className="cookie-consent">
      <div className="cookie-consent-glow"></div>

      <div className="cookie-consent-card">

        <div className="cookie-consent-visual">
          <canvas
            ref={canvasRef}
            className="cookie-3d-canvas"
          />
        </div>

        <div className="cookie-consent-info">

          <div className="cookie-consent-label">
            PRIVACY
          </div>

          <h3>
            We use cookies
          </h3>

          <p>
            Cookies help us improve your
            Marketplace experience and
            understand how visitors use
            our website.
          </p>

          <button
            type="button"
            className="cookie-policy-link"
          >
            Privacy Policy
          </button>

          <div className="cookie-consent-actions">

            <button
              type="button"
              className="cookie-decline"
              onClick={() =>
                handleConsent("declined")
              }
            >
              Decline
            </button>

            <button
              type="button"
              className="cookie-accept"
              onClick={() =>
                handleConsent("accepted")
              }
            >
              Accept Cookies
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}