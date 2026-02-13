"use client";

import React, { Suspense, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import BlueprintModelComponent from "./BlueprintModel";

type BlueprintHostContextValue = {
  registerHost: (id: string, el: HTMLDivElement) => void;
  unregisterHost: (id: string) => void;
};

const BlueprintHostContext = createContext<BlueprintHostContextValue | null>(null);

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

const BRICK_HDR_PATH = "/hdri/brick.hdr";
const HDRI_REPEAT_X = 2.5;

function createTinyHdriLikeEnvMap(gl: THREE.WebGLRenderer) {
  const w = 256;
  const h = 128;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return null;

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0.0, "#6f86a6");
  grad.addColorStop(0.55, "#b7c2d2");
  grad.addColorStop(1.0, "#8f8f8f");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const hlX = Math.floor(w * 0.68);
  const hlY = Math.floor(h * 0.28);
  const rg = ctx.createRadialGradient(hlX, hlY, 2, hlX, hlY, 42);
  rg.addColorStop(0, "rgba(255,255,255,0.18)");
  rg.addColorStop(0.5, "rgba(255,255,255,0.06)");
  rg.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(0,0,0,0.06)";
  ctx.fillRect(0, 0, w, 8);
  ctx.fillRect(0, h - 10, w, 10);

  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;

  const pmrem = new THREE.PMREMGenerator(gl);
  const envTex = pmrem.fromEquirectangular(tex).texture;
  tex.dispose();
  pmrem.dispose();
  return envTex;
}

function BrickEnvironment() {
  const { gl, scene } = useThree();

  useEffect(() => {
    let disposed = false;
    let envTex: THREE.Texture | null = null;

    const applyEnv = (tex: THREE.Texture) => {
      if (disposed) return;
      envTex = tex;
      scene.environment = tex;
    };

    new RGBELoader().load(
      BRICK_HDR_PATH,
      (hdrTex) => {
        if (disposed) return;
        hdrTex.mapping = THREE.EquirectangularReflectionMapping;
        hdrTex.wrapS = THREE.RepeatWrapping;
        hdrTex.wrapT = THREE.ClampToEdgeWrapping;
        hdrTex.repeat.set(HDRI_REPEAT_X, 1);
        hdrTex.offset.set((1 - HDRI_REPEAT_X) / 2, 0);
        hdrTex.needsUpdate = true;

        const pmrem = new THREE.PMREMGenerator(gl);
        const pmremTex = pmrem.fromEquirectangular(hdrTex).texture;
        hdrTex.dispose();
        pmrem.dispose();
        applyEnv(pmremTex);
      },
      undefined,
      () => {
        const fallback = createTinyHdriLikeEnvMap(gl);
        if (fallback) applyEnv(fallback);
      }
    );

    return () => {
      disposed = true;
      if (envTex) envTex.dispose();
    };
  }, [gl, scene]);

  return null;
}

function PersistentBlueprintCanvas() {
  return (
    <Canvas
      className="w-full h-full"
      style={{ background: "transparent", width: "100%", height: "100%", display: "block" }}
      dpr={[1, 1.5]}
      orthographic
      camera={{ position: [-200, 200, 200], zoom: 60, near: -1000, far: 1000 }}
      gl={{ alpha: true, antialias: true }}
      frameloop="always"
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.35;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.setClearColor(0x000000, 0);
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        scene.environment = null;
      }}
    >
      <BrickEnvironment />
      <ambientLight intensity={0.03} />
      <directionalLight position={[200, 300, 400]} intensity={0.08} />
      <directionalLight position={[-250, -150, 200]} intensity={0.03} />
      <Suspense fallback={null}>
        <BlueprintModelComponent />
      </Suspense>
    </Canvas>
  );
}

export function BlueprintSingletonProvider({ children }: { children: React.ReactNode }) {
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
    <BlueprintHostContext.Provider value={contextValue}>
      {children}
      <div
        className="pointer-events-none fixed border border-black rounded-full overflow-hidden"
        style={{
          left: `${Math.round(frame.left)}px`,
          top: `${Math.round(frame.top)}px`,
          width: `${Math.max(1, Math.round(frame.width))}px`,
          height: `${Math.max(1, Math.round(frame.height))}px`,
          zIndex: frame.zIndex,
          opacity: frame.active ? 1 : 0,
        }}
      >
        <PersistentBlueprintCanvas />
      </div>
    </BlueprintHostContext.Provider>
  );
}

export function useBlueprintHost() {
  const ctx = useContext(BlueprintHostContext);
  if (!ctx) {
    throw new Error("useBlueprintHost must be used within BlueprintSingletonProvider");
  }
  return ctx;
}
