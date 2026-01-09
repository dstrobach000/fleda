"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

const SVG_SOURCE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1366 341.56">
  <path d="M79.16,341.56H0V96.9h227.25v70.29H79.16v37.88h145.7v66.88H79.16v69.61Z"/>
  <path d="M258.93,96.9h85.3v167.88h137.51v76.77h-222.81V96.9Z"/>
  <path d="M512.74,341.56V96.9h236.12v63.81h-157.64v32.76h140.93v48.8h-140.93v33.1h162.76v66.2h-241.24ZM735.89,0l-76.09,76.09h-56.98L658.78,0h77.12Z"/>
  <path d="M909.85,96.9c94.18,0,147.75,39.24,147.75,122.5v1.03c0,27.3-5.8,49.82-17.4,68.24-23.89,35.83-67.56,52.89-128.3,52.89h-126.59V96.9h124.54ZM866.86,271.95h39.92c48.8,0,66.2-15.7,66.2-52.21v-.68c0-38.56-17.74-53.23-67.56-53.23h-38.56v106.12Z"/>
  <path d="M1154.79,299.59l-17.41,41.97h-86.32l110.9-244.66h93.83l110.21,244.66h-85.64l-17.74-41.97h-107.82ZM1178.67,241.58h59.72l-30.03-71.32-29.69,71.32Z"/>
</svg>`;

function OrthoFit({ box, padding = 1.0 }: { box: THREE.Box3 | null; padding?: number }) {
  const { camera, size, invalidate } = useThree();
  const cam = camera as THREE.OrthographicCamera;

  useEffect(() => {
    if (!box || size.width === 0 || size.height === 0) return;

    const dims = new THREE.Vector3();
    box.getSize(dims);

    const w = Math.max(dims.x, 1e-6);
    const h = Math.max(dims.y, 1e-6);
    const zoom = Math.min(size.width / (w * padding), size.height / (h * padding));

    cam.zoom = zoom;
    // Keep the same scale, but top-align the logo inside the canvas to remove empty space above.
    const viewH = (cam.top - cam.bottom) / cam.zoom;
    const marginPx = 6;
    const marginWorld = (marginPx / size.height) * viewH;
    const targetY = box.max.y - viewH / 2 + marginWorld;

    cam.position.set(0, targetY, 400);
    cam.lookAt(0, targetY, 0);
    cam.updateProjectionMatrix();
    invalidate();
  }, [box, size.width, size.height, cam, padding, invalidate]);

  return null;
}

function ExtrudedFleda({ onBox }: { onBox: (box: THREE.Box3) => void }) {
  const group = useRef<THREE.Group>(null);

  const { geometries, material } = useMemo(() => {
    const data = new SVGLoader().parse(SVG_SOURCE);
    const depth = 180; // extrusion depth (in SVG units)
    // NOTE: The SVG is in very large units (~1366 wide), so bevel values need to be
    // noticeable in that space. More segments makes it look "rounded/bouncy".
    const bevelThickness = 50;
    const bevelSize = 10;

    const geoms: THREE.ExtrudeGeometry[] = [];
    for (const p of data.paths) {
      const shapes = SVGLoader.createShapes(p);
      for (const s of shapes) {
        geoms.push(
          new THREE.ExtrudeGeometry(s, {
            depth,
            bevelEnabled: true,
            bevelThickness,
            bevelSize,
            bevelOffset: 0,
            bevelSegments: 10,
            curveSegments: 24,
            steps: 1,
          })
        );
      }
    }

    // Center everything at origin (and flip Y later via group scale).
    const tmp = new THREE.Box3();
    const center = new THREE.Vector3();
    for (const g of geoms) {
      g.computeBoundingBox();
      tmp.expandByObject(new THREE.Mesh(g));
    }
    tmp.getCenter(center);
    for (const g of geoms) {
      g.translate(-center.x, -center.y, -depth / 2);
      g.computeVertexNormals();
    }

    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xd6d6d6, // simple light gray
      metalness: 1,
      roughness: 0.35,
      clearcoat: 0.85,
      clearcoatRoughness: 0.2,
      specularIntensity: 1.0,
      side: THREE.DoubleSide,
    });

    return { geometries: geoms, material: mat };
  }, []);

  useEffect(() => {
    if (!group.current) return;
    onBox(new THREE.Box3().setFromObject(group.current));
  }, [onBox]);

  return (
    // Flip Y so it matches the old SVG orientation (SVG Y axis points down).
    <group ref={group} scale={[1, -1, 1]}>
      {geometries.map((g, idx) => (
        <mesh key={idx} geometry={g} material={material} />
      ))}
    </group>
  );
}

function LogoScene({ rotationY }: { rotationY: number }) {
  const [box, setBox] = useState<THREE.Box3 | null>(null);
  const { invalidate } = useThree();

  useEffect(() => {
    // In demand mode, ask for a rerender when the rotation updates.
    invalidate();
  }, [rotationY, invalidate]);

  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[200, 300, 400]} intensity={0.9} />
      <directionalLight position={[-300, -200, 200]} intensity={0.35} />
      <directionalLight position={[0, 0, 500]} intensity={0.5} />
      <Suspense fallback={null}>
        {/* Rotate the actual 3D mesh (not the canvas element) so you see extrusion depth. */}
        <group rotation={[0, rotationY, 0]}>
          <ExtrudedFleda onBox={setBox} />
        </group>
      </Suspense>
      <OrthoFit box={box} />
    </>
  );
}

function Logo3D({ rotationY }: { rotationY: number }) {
  return (
    <Canvas
      className="w-full h-full"
      style={{ background: "transparent", width: "100%", height: "100%", display: "block" }}
      dpr={[1, 1.5]}
      orthographic
      camera={{ position: [0, 0, 400], zoom: 1, near: -2000, far: 2000 }}
      gl={{ alpha: true, antialias: true }}
      frameloop="demand"
      onCreated={({ gl, scene }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.setClearColor(0x000000, 0);
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

        // Give the bevel/specular something to reflect so the rounding is visible.
        const pmrem = new THREE.PMREMGenerator(gl);
        const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environment = envTex;
      }}
    >
      <LogoScene rotationY={rotationY} />
    </Canvas>
  );
}

export default function LogoSlot() {
  const rotatorRef = useRef<HTMLDivElement>(null);
  const [rotationY, setRotationY] = useState(0);

  useEffect(() => {
    const el = rotatorRef.current;
    if (!el) return;

    const startTime = performance.now();
    const durationMs = 8000;
    let rafId = 0;

    const tick = (now: number) => {
      const t = ((now - startTime) % durationMs) / durationMs; // 0..1

      // True symmetric oscillation: 0 -> +A -> 0 -> -A -> 0 (both sides, every cycle)
      const rotationDeg = 15 * Math.sin(t * Math.PI * 2);
      setRotationY(THREE.MathUtils.degToRad(rotationDeg));

      // Apply perspective inline for consistency (Safari especially).
      // This wrapper is intentionally unchanged so size/movement/animation remain identical.
      // The actual 3D rotation happens inside the WebGL scene so you can see extrusion thickness.
      el.style.transform = `perspective(1000px)`;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="aspect-3/1 w-full h-[150px] md:h-auto flex items-start justify-center">
      <div
        ref={rotatorRef}
        className="w-full h-full flex items-start justify-center"
        style={{
          transformOrigin: "center center",
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
          willChange: "transform",
        }}
      >
        <Logo3D rotationY={rotationY} />
      </div>
    </div>
  );
}
