/**
 * StudoX 3D WebGL Background — Deep Space Atmosphere
 * ─────────────────────────────────────────────────────────────────────────────
 * Concept: You're floating in deep space, far from any star.
 * - Vast, dark, silent. A few nebula clouds glow faintly in the distance.
 * - Thousands of dim stars scattered across the galaxy plane.
 * - A single tiny orbital atom, barely visible, deep in the background.
 * - Bloom is surgical — only the absolute brightest pixels get any glow.
 * - The scene never competes with the UI. It only breathes behind it.
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
    const renderer = new THREE.WebGLRenderer({
      antialias: true, alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    // LinearToneMapping keeps things predictably dark — no ACES brightening
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = 0.4;
    mount.appendChild(renderer.domElement);

    /* ── Scene + Camera ───────────────────────────────────────────── */
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 600);
    camera.position.set(0, 0, 12);
    camera.lookAt(0, 0, 0);

    /* ── Bloom — absolute minimum, surgical precision ─────────────── */
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.18,   // strength — almost nothing
      0.6,    // radius
      0.85    // threshold — only the top 15% brightest pixels glow AT ALL
    );
    composer.addPass(bloomPass);

    const ADD = THREE.AdditiveBlending;

    /* ── Deep nebula — very far back, barely there ────────────────── */
    // These are the soft color blobs you see in real telescope images
    const nebulas = [
      { p: [-14,  8, -55], r: 32, c: 0x1a0a3a, o: 0.018 },
      { p: [ 18, -6, -70], r: 40, c: 0x08203a, o: 0.015 },
      { p: [  0,  2, -80], r: 50, c: 0x110828, o: 0.020 },
      { p: [-20,-12, -45], r: 28, c: 0x0a1428, o: 0.012 },
      { p: [ 10, 14, -40], r: 22, c: 0x1e0a50, o: 0.010 },
    ];
    nebulas.forEach(({ p, r, c, o }) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(r, 8, 8),
        new THREE.MeshBasicMaterial({
          color: c, transparent: true, opacity: o,
          blending: ADD, side: THREE.BackSide, depthWrite: false,
        })
      );
      mesh.position.set(...p);
      scene.add(mesh);
    });

    /* ── Starfield ────────────────────────────────────────────────── */
    // Two layers: far galaxy + near halo
    function makeStars(count, minR, maxR, opacityScale, sizeBase) {
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      // Star color palette: mostly blue-white, occasional warm, very rare bright
      const palette = [
        [0.25, 0.30, 0.55], // blue-grey
        [0.20, 0.40, 0.50], // teal-grey
        [0.35, 0.30, 0.50], // purple-grey
        [0.45, 0.45, 0.55], // near-white grey
        [0.55, 0.52, 0.42], // warm (rare)
      ];
      for (let i = 0; i < count; i++) {
        const r = minR + Math.random() * (maxR - minR);
        const θ = Math.random() * Math.PI * 2;
        const φ = Math.acos(2 * Math.random() - 1);
        pos[i*3]   = r * Math.sin(φ) * Math.cos(θ);
        pos[i*3+1] = r * Math.sin(φ) * Math.sin(θ) * 0.35; // flattened like a galaxy disk
        pos[i*3+2] = r * Math.cos(φ);
        const pidx = Math.random() > 0.93 ? 4 : Math.floor(Math.random() * 4);
        const pal  = palette[pidx];
        const b    = opacityScale * (0.3 + Math.random() * 0.7);
        col[i*3] = pal[0]*b; col[i*3+1] = pal[1]*b; col[i*3+2] = pal[2]*b;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color",    new THREE.BufferAttribute(col, 3));
      return new THREE.Points(geo, new THREE.PointsMaterial({
        size: sizeBase, vertexColors: true,
        transparent: true, opacity: 0.7,
        blending: ADD, depthWrite: false, sizeAttenuation: true,
      }));
    }

    const farStars  = makeStars(4000, 40, 180, 0.35, 0.08);  // distant galaxy
    const nearStars = makeStars(800,  15,  40, 0.20, 0.05);   // nearby space
    scene.add(farStars);
    scene.add(nearStars);

    /* ── Orbital atom — tiny, far back, barely visible ───────────── */
    // Nucleus — very small, very dim
    const nucleus = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x3b1080, transparent: true, opacity: 0.35, blending: ADD,
      })
    );
    nucleus.position.set(0, 0, 0);
    scene.add(nucleus);

    // Tiny bright center point — this is the only thing that actually "glows"
    const corePoint = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xddd6fe, blending: ADD })
    );
    scene.add(corePoint);

    // Ambient glow shell — very dim
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 12, 12),
      new THREE.MeshBasicMaterial({
        color: 0x4c1d95, transparent: true, opacity: 0.04,
        blending: ADD, side: THREE.BackSide, depthWrite: false,
      })
    ));

    /* ── Orbital rings ────────────────────────────────────────────── */
    const ORBIT_R = 2.4;
    const orbitDefs = [
      { rotX: Math.PI * 0.10, rotZ: 0,                  col: 0x4c1d95, speed:  0.30 },
      { rotX: Math.PI * 0.10, rotZ: (Math.PI * 2) / 3,  col: 0x0e4f6a, speed: -0.22 },
      { rotX: Math.PI * 0.10, rotZ: -(Math.PI * 2) / 3, col: 0x312e81, speed:  0.18 },
    ];

    const ringPts = [];
    for (let j = 0; j <= 128; j++) {
      const a = (j / 128) * Math.PI * 2;
      ringPts.push(new THREE.Vector3(ORBIT_R * Math.cos(a), 0, ORBIT_R * Math.sin(a)));
    }
    const ringBaseGeo = new THREE.BufferGeometry().setFromPoints(ringPts);

    const satPivots  = [];
    const satellites = [];

    orbitDefs.forEach((def) => {
      // Ring — ghostly line
      const ring = new THREE.LineLoop(
        ringBaseGeo.clone(),
        new THREE.LineBasicMaterial({
          color: def.col, transparent: true, opacity: 0.08,
          blending: ADD, depthWrite: false,
        })
      );
      const grp = new THREE.Object3D();
      grp.rotation.x = def.rotX;
      grp.rotation.z = def.rotZ;
      grp.add(ring);
      scene.add(grp);

      // Satellite — tiny bright dot (the only thing that catches bloom)
      const pivot = new THREE.Object3D();
      grp.add(pivot);
      satPivots.push(pivot);

      const sat = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 8, 8),
        new THREE.MeshBasicMaterial({ color: def.col, blending: ADD })
      );
      sat.position.set(ORBIT_R, 0, 0);
      pivot.add(sat);
      satellites.push(sat);

      // One tiny glow halo — very subtle
      sat.add(new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 8, 8),
        new THREE.MeshBasicMaterial({
          color: def.col, transparent: true, opacity: 0.06,
          blending: ADD, side: THREE.BackSide, depthWrite: false,
        })
      ));
    });

    /* ── Mouse Parallax ──────────────────────────────────────────── */
    let mx = 0, my = 0;
    const onMove  = (e) => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onTouch = (e) => {
      if (e.touches[0]) {
        mx = (e.touches[0].clientX / window.innerWidth  - 0.5) * 2;
        my = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
      }
    };
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
    let raf, t = 0, camX = 0, camY = 0, warpT = 0;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      t  += 0.016;

      const isWarp = warpRef.current;
      warpT += isWarp ? 0.05 : -0.05;
      warpT  = Math.max(0, Math.min(1, warpT));

      // Nucleus barely pulses — almost imperceptible
      nucleus.scale.setScalar(1 + Math.sin(t * 0.9) * 0.012);
      corePoint.scale.setScalar(1 + Math.sin(t * 1.8) * 0.06);

      // Orbital satellites
      orbitDefs.forEach((def, i) => {
        const warpMul = 1 + warpT * 6;
        satPivots[i].rotation.y += def.speed * 0.016 * warpMul;
      });

      // Galaxy slow rotation
      const warpStarMul = 1 + warpT * 25;
      farStars.rotation.y  += 0.00012 * warpStarMul;
      farStars.rotation.x  += 0.000035;
      nearStars.rotation.y += 0.00018 * warpStarMul;

      // Camera parallax — very gentle
      camX += (mx * 0.8 - camX) * 0.022;
      camY += (-my * 0.5 - camY) * 0.022;
      camera.position.x = camX;
      camera.position.y = camY;
      camera.position.z = 12 - warpT * 6;
      camera.lookAt(0, 0, 0);

      // Bloom barely changes on warp
      bloomPass.strength = 0.18 + warpT * 0.35;

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
        transition: "opacity 2s ease",
      }}
    />
  );
}
