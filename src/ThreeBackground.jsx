/**
 * StudoX 3D WebGL Background — Dark Atmospheric Edition
 * ─────────────────────────────────────────────────────────────────────────────
 * Subtle deep-space atmosphere: barely-there orbital atom + starfield galaxy
 * Everything is tuned for READABILITY — the background stays in the background.
 * Bloom is whisper-quiet. The scene breathes, not blinds.
 */
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass }      from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

export default function ThreeBackground({ phase = 5, warp = false }) {
  const mountRef = useRef(null);
  const phaseRef = useRef(phase);
  const warpRef  = useRef(warp);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { warpRef.current  = warp;  }, [warp]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    /* ── Renderer ─────────────────────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.55; // dark, dark, dark

    mount.appendChild(renderer.domElement);

    /* ── Scene + Camera ───────────────────────────────────────────── */
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 500);
    camera.position.set(0, 1.5, 10);
    camera.lookAt(0, 0, 0);

    /* ── Bloom — whisper quiet ────────────────────────────────────── */
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.28,   // strength — was 1.6, now barely visible
      0.5,    // radius
      0.72    // threshold — only truly bright things glow
    );
    composer.addPass(bloomPass);

    /* ── Helpers ──────────────────────────────────────────────────── */
    const ADD   = THREE.AdditiveBlending;
    const BSide = THREE.BackSide;

    function glowSphere(radius, color, opacity, side = BSide) {
      return new THREE.Mesh(
        new THREE.SphereGeometry(radius, 12, 12),
        new THREE.MeshBasicMaterial({
          color, transparent: true, opacity,
          blending: ADD, side, depthWrite: false,
        })
      );
    }

    /* ── Lights — dim & moody ─────────────────────────────────────── */
    scene.add(new THREE.AmbientLight(0x05020f, 2));

    const nucleusLight = new THREE.PointLight(0x7c3aed, 1.2, 10);
    scene.add(nucleusLight);

    const cyanLight = new THREE.PointLight(0x0e7490, 0.6, 18);
    cyanLight.position.set(7, 2, -1);
    scene.add(cyanLight);

    const warmLight = new THREE.PointLight(0x4c1d95, 0.4, 16);
    warmLight.position.set(-6, -3, 4);
    scene.add(warmLight);

    /* ── Nebula — very faint depth clouds ────────────────────────── */
    const nebulaDefs = [
      { p: [-9,  6, -22], r: 20, c: 0x2e1065, o: 0.025 },
      { p: [11, -5, -28], r: 24, c: 0x0c4a6e, o: 0.020 },
      { p: [-1,  0, -35], r: 30, c: 0x1e1040, o: 0.022 },
      { p: [ 5,  9, -16], r: 13, c: 0x581c87, o: 0.015 },
      { p: [-7, -6, -20], r: 16, c: 0x0f4c5c, o: 0.018 },
      { p: [ 2, -8, -12], r: 9,  c: 0x3b0764, o: 0.015 },
    ];
    nebulaDefs.forEach(({ p, r, c, o }) => {
      const m = glowSphere(r, c, o);
      m.position.set(...p);
      scene.add(m);
    });

    /* ── Particle Galaxy — sparse, dim stars ─────────────────────── */
    const N = 5500;
    const pPos = new Float32Array(N * 3);
    const pCol = new Float32Array(N * 3);
    // Cooler, more muted palette — these stars should barely be there
    const palette = [
      [0.38, 0.16, 0.60],  // muted purple
      [0.01, 0.36, 0.42],  // deep cyan
      [0.26, 0.10, 0.55],  // dark violet
      [0.40, 0.37, 0.55],  // grey lavender
      [0.15, 0.40, 0.44],  // muted teal
      [0.55, 0.55, 0.65],  // near-white (very rare)
    ];
    for (let i = 0; i < N; i++) {
      let x, y, z;
      const roll = Math.random();
      if (roll < 0.65) {
        const arm      = Math.floor(Math.random() * 3);
        const armAngle = (arm / 3) * Math.PI * 2;
        const r = 12 + Math.random() * 50;
        const θ = armAngle + r * 0.04 + (Math.random() - 0.5) * 0.9;
        const h = (Math.random() - 0.5) * (3 + r * 0.06);
        x = r * Math.cos(θ); y = h; z = r * Math.sin(θ);
      } else if (roll < 0.9) {
        const r = 30 + Math.random() * 40;
        const θ = Math.random() * Math.PI * 2;
        const φ = Math.acos(2 * Math.random() - 1);
        x = r * Math.sin(φ) * Math.cos(θ);
        y = r * Math.sin(φ) * Math.sin(θ);
        z = r * Math.cos(φ);
      } else {
        const r = 8 + Math.random() * 14;
        const θ = Math.random() * Math.PI * 2;
        const φ = Math.acos(2 * Math.random() - 1);
        x = r * Math.sin(φ) * Math.cos(θ);
        y = r * Math.sin(φ) * Math.sin(θ);
        z = r * Math.cos(φ);
      }
      pPos[i * 3] = x; pPos[i * 3 + 1] = y; pPos[i * 3 + 2] = z;
      const pidx = roll > 0.97 ? 5 : Math.floor(Math.random() * 5);
      const pal  = palette[pidx];
      const b    = 0.25 + Math.random() * 0.45; // dim — max ~0.7 of already-dim colors
      pCol[i * 3] = pal[0] * b; pCol[i * 3 + 1] = pal[1] * b; pCol[i * 3 + 2] = pal[2] * b;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute("color",    new THREE.BufferAttribute(pCol, 3));
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      size: 0.045, vertexColors: true,
      transparent: true, opacity: 0.38,
      blending: ADD, depthWrite: false, sizeAttenuation: true,
    }));
    scene.add(particles);

    /* ── Nucleus — subtle, almost invisible in background ────────── */
    // Very faint outer atmosphere
    [[7, 0x1a0840, 0.008], [5, 0x2e1065, 0.012], [3.5, 0x4c1d95, 0.018], [2.2, 0x6d28d9, 0.022]].forEach(([r, c, o]) => {
      scene.add(glowSphere(r, c, o));
    });

    const nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(0.78, 48, 48),
      new THREE.MeshPhongMaterial({
        color: 0x5b21b6, emissive: 0x4c1d95, emissiveIntensity: 0.6,
        transparent: true, opacity: 0.60,
        shininess: 60, specular: 0x9f7aea,
      })
    );
    scene.add(nucleus);

    // Tiny inner bright core — this is what glows, but barely
    const innerCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xddd6fe, blending: ADD })
    );
    scene.add(innerCore);

    // Very faint immediate glow layers
    scene.add(glowSphere(0.50, 0xc4b5fd, 0.10, THREE.FrontSide));
    scene.add(glowSphere(0.95, 0x8b5cf6, 0.05, THREE.FrontSide));
    scene.add(glowSphere(1.40, 0x6d28d9, 0.03, THREE.FrontSide));

    /* ── Orbital System — ghost-like rings ───────────────────────── */
    const ORBIT_R = 3.4;
    const orbitDefs = [
      { rotX: Math.PI * 0.12, rotZ: 0,                  col: 0x7c3aed, speed:  0.38, satPhase: 0 },
      { rotX: Math.PI * 0.12, rotZ: (Math.PI * 2) / 3,  col: 0x0e7490, speed: -0.28, satPhase: (Math.PI * 2) / 3 },
      { rotX: Math.PI * 0.12, rotZ: -(Math.PI * 2) / 3, col: 0x4338ca, speed:  0.22, satPhase: (Math.PI * 4) / 3 },
    ];

    const ringPts = [];
    for (let j = 0; j <= 256; j++) {
      const a = (j / 256) * Math.PI * 2;
      ringPts.push(new THREE.Vector3(ORBIT_R * Math.cos(a), 0, ORBIT_R * Math.sin(a)));
    }
    const ringBaseGeo = new THREE.BufferGeometry().setFromPoints(ringPts);

    const orbitGroups = [];
    const satPivots   = [];
    const satellites  = [];

    orbitDefs.forEach((def) => {
      const ringMat = new THREE.LineBasicMaterial({
        color: def.col, transparent: true, opacity: 0.12, // very faint rings
        blending: ADD, depthWrite: false,
      });
      const ring = new THREE.LineLoop(ringBaseGeo.clone(), ringMat);

      const grp = new THREE.Object3D();
      grp.rotation.x = def.rotX;
      grp.rotation.z = def.rotZ;
      grp.add(ring);
      scene.add(grp);
      orbitGroups.push(grp);

      const pivot = new THREE.Object3D();
      grp.add(pivot);
      satPivots.push(pivot);
      pivot.rotation.y = def.satPhase;

      const sat = new THREE.Mesh(
        new THREE.SphereGeometry(0.10, 16, 16),
        new THREE.MeshBasicMaterial({ color: def.col, blending: ADD })
      );
      sat.position.set(ORBIT_R, 0, 0);
      pivot.add(sat);

      // Subtle satellite glow — 3 layers, very dim
      [0.22, 0.38, 0.62].forEach((r, gi) => {
        const ops = [0.18, 0.07, 0.02];
        sat.add(glowSphere(r, def.col, ops[gi], THREE.BackSide));
      });
      satellites.push(sat);
    });

    /* Energy connector lines — nearly invisible pulse */
    const connectorMats = orbitDefs.map((d) => new THREE.LineBasicMaterial({
      color: d.col, transparent: true, opacity: 0.06, blending: ADD, depthWrite: false,
    }));
    const connectorGeos = orbitDefs.map(() => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
      return geo;
    });
    const connectors = connectorGeos.map((geo, i) => new THREE.Line(geo, connectorMats[i]));
    connectors.forEach((c) => scene.add(c));

    /* ── Mouse Parallax ──────────────────────────────────────────── */
    let mx = 0, my = 0;
    const onMove  = (e) => { mx = (e.clientX / window.innerWidth  - 0.5) * 2; my = (e.clientY / window.innerHeight - 0.5) * 2; };
    const onTouch = (e) => { if (e.touches[0]) { mx = (e.touches[0].clientX / window.innerWidth - 0.5) * 2; my = (e.touches[0].clientY / window.innerHeight - 0.5) * 2; } };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove",  onTouch, { passive: true });

    /* ── Resize ───────────────────────────────────────────────────── */
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    /* ── Animation Loop ───────────────────────────────────────────── */
    let raf;
    let t    = 0;
    let camX = 0, camY = 0;
    let warpT = 0;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      t  += 0.016;

      const isWarp = warpRef.current;
      warpT += isWarp ? 0.04 : -0.04;
      warpT  = Math.max(0, Math.min(1, warpT));

      /* Nucleus — slow subtle pulse */
      const pulse = 1 + Math.sin(t * 1.2) * 0.018;
      nucleus.scale.setScalar(pulse);
      innerCore.scale.setScalar(1 + Math.sin(t * 2.4) * 0.08);
      nucleusLight.intensity = 1.0 + Math.sin(t * 1.2) * 0.35; // was 8-11, now 0.65-1.35

      /* Orbital satellites */
      orbitDefs.forEach((def, i) => {
        const warpMul = 1 + warpT * 5;
        satPivots[i].rotation.y += def.speed * 0.016 * warpMul;
      });

      /* Connector lines */
      satellites.forEach((sat, i) => {
        const wp = new THREE.Vector3();
        sat.getWorldPosition(wp);
        const arr = connectorGeos[i].attributes.position.array;
        arr[0] = 0; arr[1] = 0; arr[2] = 0;
        arr[3] = wp.x; arr[4] = wp.y; arr[5] = wp.z;
        connectorGeos[i].attributes.position.needsUpdate = true;
        connectorMats[i].opacity = 0.03 + 0.05 * (0.5 + 0.5 * Math.sin(t * 1.1 + i * 2.1));
      });

      /* Galaxy drift — slow */
      const warpParticleMul = 1 + warpT * 20;
      particles.rotation.y += 0.00018 * warpParticleMul;
      particles.rotation.x += 0.00005;

      /* Camera parallax — gentle */
      camX += (mx * 1.2 - camX) * 0.025;
      camY += (-my * 0.7 - camY) * 0.025;
      camera.position.x = camX;
      camera.position.y = 1.5 + camY;
      camera.position.z = 10 - warpT * 5;
      camera.lookAt(0, 0, 0);

      /* Bloom — barely there, tiny warp boost */
      bloomPass.strength = 0.28 + warpT * 0.45;

      composer.render();
    };
    raf = requestAnimationFrame(animate);

    /* ── Cleanup ──────────────────────────────────────────────────── */
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove",  onTouch);
      window.removeEventListener("resize",     onResize);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
      composer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: "fixed", inset: 0, zIndex: 0,
        opacity: phase >= 2 ? 1 : 0,
        transition: "opacity 1.8s ease",
      }}
    />
  );
}
