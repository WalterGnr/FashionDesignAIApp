import { ContactShadows, OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three/examples/jsm/controls/OrbitControls.js";
import { Garment } from "./Garment.js";
import { Mannequin } from "./Mannequin.js";
import type { PreviewParameters } from "./preview-parameters.js";

export type PreviewView = "front" | "three_quarter" | "side" | "back";

const VIEW_POSITIONS: Record<PreviewView, [number, number, number]> = {
  front: [0, 1.1, 8.8],
  three_quarter: [5.45, 1.9, 7.2],
  side: [8.8, 1.15, 0],
  back: [0, 1.1, -8.8]
};

function CameraController({ view, viewRevision }: { view: PreviewView; viewRevision: number }) {
  const controls = useRef<OrbitControlsImpl | null>(null);
  const { camera, invalidate } = useThree();

  useEffect(() => {
    camera.position.set(...VIEW_POSITIONS[view]);
    controls.current?.target.set(0, 0.75, 0);
    controls.current?.update();
    invalidate();
  }, [camera, invalidate, view, viewRevision]);

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      minDistance={4.8}
      maxDistance={9}
      minPolarAngle={Math.PI * 0.25}
      maxPolarAngle={Math.PI * 0.67}
      target={[0, 0.75, 0]}
      onChange={invalidate}
    />
  );
}

export function DressScene({
  parameters,
  view,
  viewRevision
}: {
  parameters: PreviewParameters;
  view: PreviewView;
  viewRevision: number;
}) {
  return (
    <>
      <color attach="background" args={["#eef1ee"]} />
      <fog attach="fog" args={["#eef1ee", 8, 16]} />
      <hemisphereLight args={["#fff8ef", "#7f8c85", 2.2]} />
      <directionalLight position={[4, 7, 5]} intensity={3.2} color="#fff6e8" />
      <directionalLight position={[-5, 3, -2]} intensity={1.2} color="#c9d9df" />
      <spotLight position={[0, 5, 6]} intensity={1.2} angle={0.5} penumbra={0.8} />

      <group position={[0, 0.02, 0]}>
        <Mannequin />
        <Garment parameters={parameters} />
      </group>

      <ContactShadows position={[0, -1.68, 0]} opacity={0.34} scale={7} blur={2.8} far={3.5} resolution={512} frames={1} />
      <mesh position={[0, -1.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4.2, 64]} />
        <meshStandardMaterial color="#e3e7e3" roughness={1} />
      </mesh>

      <CameraController view={view} viewRevision={viewRevision} />
    </>
  );
}
