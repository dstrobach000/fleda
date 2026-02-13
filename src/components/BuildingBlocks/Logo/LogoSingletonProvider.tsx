"use client";

import React, {
  Suspense,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

type LogoHostContextValue = {
  registerHost: (id: string, el: HTMLDivElement) => void;
  unregisterHost: (id: string) => void;
};

const LogoHostContext = createContext<LogoHostContextValue | null>(null);

type HostEntry = {
  id: string;
  el: HTMLDivElement;
};

type Frame = {
  active: boolean;
  left: number;
  top: number;
  width: number;
  height: number;
  zIndex: number;
};

const SVG_URL = "/logos/fleda.svg";
const FALLBACK_SVG_SOURCE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1366 341.56">
  <path d="M79.16,341.56H0V96.9h227.25v70.29H79.16v37.88h145.7v66.88H79.16v69.61Z"/>
  <path d="M258.93,96.9h85.3v167.88h137.51v76.77h-222.81V96.9Z"/>
  <path d="M512.74,341.56V96.9h236.12v63.81h-157.64v32.76h140.93v48.8h-140.93v33.1h162.76v66.2h-241.24ZM735.89,0l-76.09,76.09h-56.98L658.78,0h77.12Z"/>
  <path d="M909.85,96.9c94.18,0,147.75,39.24,147.75,122.5v1.03c0,27.3-5.8,49.82-17.4,68.24-23.89,35.83-67.56,52.89-128.3,52.89h-126.59V96.9h124.54ZM866.86,271.95h39.92c48.8,0,66.2-15.7,66.2-52.21v-.68c0-38.56-17.74-53.23-67.56-53.23h-38.56v106.12Z"/>
  <path d="M1154.79,299.59l-17.41,41.97h-86.32l110.9-244.66h93.83l110.21,244.66h-85.64l-17.74-41.97h-107.82ZM1178.67,241.58h59.72l-30.03-71.32-29.69,71.32Z"/>
</svg>`;

function OrthoFit({ box, padding = 1.08 }: { box: THREE.Box3 | null; padding?: number }) {
  const { camera, size } = useThree();
  const cam = camera as THREE.OrthographicCamera;

  useEffect(() => {
    if (!box || size.width === 0 || size.height === 0) return;

    const dims = new THREE.Vector3();
    box.getSize(dims);
    const w = Math.max(dims.x, 1e-6);
    const h = Math.max(dims.y, 1e-6);
    const zoom = Math.min(size.width / (w * padding), size.height / (h * padding));

    const center = new THREE.Vector3();
    box.getCenter(center);

    cam.zoom = zoom;
    cam.position.set(center.x, center.y, 400);
    cam.lookAt(center.x, center.y, 0);
    cam.updateProjectionMatrix();
  }, [box, size.width, size.height, cam, padding]);

  return null;
}

function ExtrudedFleda({ onBox }: { onBox: (box: THREE.Box3) => void }) {
  const group = useRef<THREE.Group>(null);
  const [svgSource, setSvgSource] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(SVG_URL)
      .then((res) => (res.ok ? res.text() : Promise.reject(res.status)))
      .then((text) => {
        if (active) setSvgSource(text);
      })
      .catch(() => {
        if (active) setSvgSource(FALLBACK_SVG_SOURCE);
      });
    return () => {
      active = false;
    };
  }, []);

  const { geometries, material } = useMemo(() => {
    const data = new SVGLoader().parse(svgSource ?? FALLBACK_SVG_SOURCE);
    const depth = 180;
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
      color: 0xd6d6d6,
      metalness: 1,
      roughness: 0.35,
      clearcoat: 0.85,
      clearcoatRoughness: 0.2,
      specularIntensity: 1.0,
      side: THREE.DoubleSide,
    });

    return { geometries: geoms, material: mat };
  }, [svgSource]);

  useEffect(() => {
    if (!group.current) return;
    onBox(new THREE.Box3().setFromObject(group.current));
  }, [onBox]);

  return (
    <group ref={group} scale={[1, -1, 1]}>
      {geometries.map((g, idx) => (
        <mesh key={idx} geometry={g} material={material} />
      ))}
    </group>
  );
}

function LogoScene() {
  const [box, setBox] = useState<THREE.Box3 | null>(null);
  const swingRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!swingRef.current) return;
    const t = clock.getElapsedTime();
    const rotationDeg = 15 * Math.sin((t / 8) * Math.PI * 2);
    swingRef.current.rotation.y = THREE.MathUtils.degToRad(rotationDeg);
  });

  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[200, 300, 400]} intensity={0.9} />
      <directionalLight position={[-300, -200, 200]} intensity={0.35} />
      <directionalLight position={[0, 0, 500]} intensity={0.5} />
      <Suspense fallback={null}>
        <group ref={swingRef}>
          <ExtrudedFleda onBox={setBox} />
        </group>
      </Suspense>
      <OrthoFit box={box} />
    </>
  );
}

function PersistentLogoCanvas() {
  return (
    <Canvas
      className="w-full h-full"
      style={{ background: "transparent", width: "100%", height: "100%", display: "block" }}
      dpr={[1, 1.5]}
      orthographic
      camera={{ position: [0, 0, 400], zoom: 1, near: -2000, far: 2000 }}
      gl={{ alpha: true, antialias: true }}
      frameloop="always"
      onCreated={({ gl, scene }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.setClearColor(0x000000, 0);
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

        const pmrem = new THREE.PMREMGenerator(gl);
        const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environment = envTex;
        pmrem.dispose();
      }}
    >
      <LogoScene />
    </Canvas>
  );
}

export function LogoSingletonProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [hosts, setHosts] = useState<HostEntry[]>([]);
  const [frame, setFrame] = useState<Frame>({
    active: false,
    left: -9999,
    top: -9999,
    width: 1,
    height: 1,
    zIndex: 40,
  });
  const activeHostRef = useRef<HTMLDivElement | null>(null);

  const registerHost = useCallback((id: string, el: HTMLDivElement) => {
    setHosts((prev) => [...prev.filter((h) => h.id !== id), { id, el }]);
  }, []);

  const unregisterHost = useCallback((id: string) => {
    setHosts((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const contextValue = useMemo(() => ({ registerHost, unregisterHost }), [registerHost, unregisterHost]);

  useEffect(() => {
    activeHostRef.current = hosts.length ? hosts[hosts.length - 1].el : null;
  }, [hosts]);

  useEffect(() => {
    const updateFrame = () => {
      const host = activeHostRef.current;
      if (!host) {
        setFrame((prev) => ({ ...prev, active: false, left: -9999, top: -9999, width: 1, height: 1 }));
        return;
      }

      const rect = host.getBoundingClientRect();
      const inModal = !!host.closest(".modal-content");
      setFrame({
        active: rect.width > 0 && rect.height > 0,
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        zIndex: inModal ? 9999 : 40,
      });
    };

    updateFrame();
    const raf = requestAnimationFrame(updateFrame);

    const ro = new ResizeObserver(updateFrame);
    if (activeHostRef.current) ro.observe(activeHostRef.current);

    window.addEventListener("resize", updateFrame);
    window.addEventListener("scroll", updateFrame, true);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", updateFrame);
      window.removeEventListener("scroll", updateFrame, true);
    };
  }, [hosts]);

  return (
    <LogoHostContext.Provider value={contextValue}>
      {children}
      <div
        className="fixed border border-black rounded-full overflow-hidden cursor-pointer"
        style={{
          left: `${Math.round(frame.left)}px`,
          top: `${Math.round(frame.top)}px`,
          width: `${Math.max(1, Math.round(frame.width))}px`,
          height: `${Math.max(1, Math.round(frame.height))}px`,
          zIndex: frame.zIndex,
          opacity: frame.active ? 1 : 0,
        }}
        onClick={() => router.push("/")}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            router.push("/");
          }
        }}
        role="link"
        aria-label="Fleda domů"
        tabIndex={frame.active ? 0 : -1}
      >
        <PersistentLogoCanvas />
      </div>
    </LogoHostContext.Provider>
  );
}

export function useLogoHost() {
  const ctx = useContext(LogoHostContext);
  if (!ctx) {
    throw new Error("useLogoHost must be used within LogoSingletonProvider");
  }
  return ctx;
}
