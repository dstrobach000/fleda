"use client";

import React, { Suspense, useState, useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import BlueprintModelComponent from "./BlueprintModel";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

type BlueprintSlotProps = {
  /**
   * Optional override for the outer container sizing.
   * Defaults to `aspect-[3/1] w-full h-[150px] md:h-auto`.
   */
  containerClassName?: string;
};

function createTinyHdriLikeEnvMap(gl: THREE.WebGLRenderer) {
  // Super small procedural equirect "HDRI-like" map:
  // gradient sky (darker/softer). Cheap but gives glass something to reflect/refract.
  const w = 256;
  const h = 128;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return null;

  // Sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0.0, "#6f86a6"); // cool/darker top
  grad.addColorStop(0.55, "#b7c2d2"); // soft horizon
  grad.addColorStop(1.0, "#8f8f8f"); // ground-ish
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Very subtle highlight (avoid blowout)
  const hlX = Math.floor(w * 0.68);
  const hlY = Math.floor(h * 0.28);
  const rg = ctx.createRadialGradient(hlX, hlY, 2, hlX, hlY, 42);
  rg.addColorStop(0, "rgba(255,255,255,0.18)");
  rg.addColorStop(0.5, "rgba(255,255,255,0.06)");
  rg.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, w, h);

  // Gentle vignette
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

// Put your HDR here: `fleda/public/hdri/brick.hdr`
const BRICK_HDR_PATH = "/hdri/brick.hdr";
// "Scale down" the HDRI in reflections by tiling the equirect map horizontally.
// Higher = smaller features / more "space" visible in reflections.
const HDRI_REPEAT_X = 2.5;

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
        // Keep the tiling centered to reduce seam weirdness.
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
        // Fallback so missing HDR doesn't crash the scene.
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


export default function BlueprintSlot({ containerClassName }: BlueprintSlotProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={containerClassName ?? "aspect-[3/1] w-full h-[150px] md:h-auto"}
    >
      {isVisible ? (
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
          // Transparent clear so the parent container's gray shows through.
          gl.setClearColor(0x000000, 0);
          
          // Optimize WebGL context for performance
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

          // Environment is applied by <BrickEnvironment /> (HDR w/ fallback).
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
      ) : (
        <div className="w-full h-full bg-transparent" />
      )}
    </div>
  );
}
