import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { PreviewMaterial, PreviewNeckline, PreviewParameters, PreviewSleeveStyle } from "./preview-parameters.js";

type Point = [number, number, number];

function GarmentMaterial({ material }: { material: PreviewMaterial }) {
  return (
    <meshPhysicalMaterial
      color={material.color}
      roughness={material.roughness}
      metalness={material.metalness}
      clearcoat={material.clearcoat}
      clearcoatRoughness={0.3}
      opacity={material.opacity}
      transparent={material.opacity < 1}
      depthWrite={material.opacity > 0.9}
      side={THREE.DoubleSide}
    />
  );
}

function GarmentCylinder({
  from,
  to,
  radiusTop,
  radiusBottom,
  material
}: {
  from: Point;
  to: Point;
  radiusTop: number;
  radiusBottom: number;
  material: PreviewMaterial;
}) {
  const transform = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const direction = end.clone().sub(start);
    const midpoint = start.clone().add(end).multiplyScalar(0.5);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
    return { length: direction.length(), midpoint, quaternion };
  }, [from, to]);

  return (
    <mesh position={transform.midpoint} quaternion={transform.quaternion} scale={[1, 1, 0.82]}>
      <cylinderGeometry args={[radiusTop, radiusBottom, transform.length, 28, 1, true]} />
      <GarmentMaterial material={material} />
    </mesh>
  );
}

function necklineTop(neckline: PreviewNeckline): number {
  if (neckline === "high_neck") return 2.66;
  if (neckline === "off_shoulder") return 2.18;
  if (neckline === "strapless" || neckline === "sweetheart") return 2.28;
  return 2.5;
}

function NecklineInset({ neckline, top }: { neckline: PreviewNeckline; top: number }) {
  const shape = useMemo(() => {
    const next = new THREE.Shape();
    if (neckline === "v_neck") {
      next.moveTo(-0.25, 0.12);
      next.lineTo(0.25, 0.12);
      next.lineTo(0, -0.28);
      next.closePath();
    } else if (neckline === "square") {
      next.moveTo(-0.23, 0.12);
      next.lineTo(0.23, 0.12);
      next.lineTo(0.23, -0.2);
      next.lineTo(-0.23, -0.2);
      next.closePath();
    } else if (neckline === "sweetheart") {
      next.moveTo(-0.31, 0.08);
      next.bezierCurveTo(-0.24, -0.12, -0.1, -0.08, 0, -0.28);
      next.bezierCurveTo(0.1, -0.08, 0.24, -0.12, 0.31, 0.08);
      next.closePath();
    } else if (neckline === "boat") {
      next.moveTo(-0.36, 0.08);
      next.quadraticCurveTo(0, -0.03, 0.36, 0.08);
      next.lineTo(0.3, -0.07);
      next.quadraticCurveTo(0, -0.15, -0.3, -0.07);
      next.closePath();
    } else {
      const width = neckline === "scoop" || neckline === "cowl" ? 0.3 : 0.22;
      const depth = neckline === "scoop" || neckline === "cowl" ? 0.3 : 0.16;
      next.absellipse(0, 0, width, depth, Math.PI, Math.PI * 2, false, 0);
      next.lineTo(-width, 0);
      next.closePath();
    }
    return next;
  }, [neckline]);

  if (["strapless", "off_shoulder", "one_shoulder", "halter", "high_neck"].includes(neckline)) {
    return null;
  }

  return (
    <mesh position={[0, top - 0.08, 0.438]}>
      <shapeGeometry args={[shape, 20]} />
      <meshStandardMaterial color="#cfc5ba" roughness={0.88} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Straps({ neckline, top, material }: { neckline: PreviewNeckline; top: number; material: PreviewMaterial }) {
  if (["strapless", "off_shoulder", "round", "boat", "high_neck", "cowl"].includes(neckline)) return null;

  if (neckline === "one_shoulder") {
    return <GarmentCylinder from={[-0.29, top - 0.03, 0]} to={[-0.2, 2.68, 0]} radiusTop={0.08} radiusBottom={0.08} material={material} />;
  }

  const inner = neckline === "halter" ? 0.18 : 0.31;
  const radius = neckline === "halter" ? 0.075 : 0.055;
  return (
    <>
      <GarmentCylinder from={[-0.32, top - 0.03, 0]} to={[-inner, 2.67, 0]} radiusTop={radius} radiusBottom={radius} material={material} />
      <GarmentCylinder from={[0.32, top - 0.03, 0]} to={[inner, 2.67, 0]} radiusTop={radius} radiusBottom={radius} material={material} />
    </>
  );
}

function Sleeve({ side, parameters }: { side: -1 | 1; parameters: PreviewParameters }) {
  const { sleeveStyle, sleeveLength, sleeveVolume, material } = parameters;
  if (sleeveStyle === "none" || (sleeveStyle === "one_sleeve" && side === 1)) return null;

  const start: Point = [side * 0.6, sleeveStyle === "off_shoulder" ? 2.18 : 2.38, 0];
  const wrist: Point = [side * 0.77, 0.66, 0];
  const normalizedLength = Math.min(1, sleeveLength / 1.72);
  const end: Point = [
    start[0] + (wrist[0] - start[0]) * normalizedLength,
    start[1] + (wrist[1] - start[1]) * normalizedLength,
    0
  ];

  if (sleeveStyle === "puff") {
    return (
      <group>
        <mesh position={[side * 0.65, 2.18, 0]} scale={[0.34, 0.38, 0.28]}>
          <sphereGeometry args={[1, 28, 20]} />
          <GarmentMaterial material={material} />
        </mesh>
        {normalizedLength > 0.35 ? (
          <GarmentCylinder from={[side * 0.69, 1.95, 0]} to={end} radiusTop={0.16} radiusBottom={0.13} material={material} />
        ) : null}
      </group>
    );
  }

  if (sleeveStyle === "flutter") {
    return (
      <mesh position={[side * 0.68, 2.12, 0]} rotation={[0, 0, side * -0.16]} scale={[1, 1, 0.78]}>
        <coneGeometry args={[0.42, 0.68, 32, 1, true]} />
        <GarmentMaterial material={material} />
      </mesh>
    );
  }

  const topRadius = 0.16 * sleeveVolume;
  const bottomRadius = sleeveStyle === "bishop" || sleeveStyle === "bell" ? 0.27 * sleeveVolume : 0.13 * sleeveVolume;
  return <GarmentCylinder from={start} to={end} radiusTop={topRadius} radiusBottom={bottomRadius} material={material} />;
}

function buildSkirtProfile(parameters: PreviewParameters): THREE.Vector2[] {
  const length = parameters.skirtLength;
  const waist = parameters.silhouette === "shift" ? 0.54 : 0.46;
  const profiles: Record<PreviewParameters["skirtShape"], Array<[number, number]>> = {
    column: [
      [waist, 0],
      [0.51, -length * 0.35],
      [0.53, -length * 0.78],
      [0.57, -length]
    ],
    a_line: [
      [waist, 0],
      [0.56, -length * 0.22],
      [0.82, -length * 0.7],
      [1.02, -length]
    ],
    full: [
      [waist, 0],
      [0.72, -length * 0.18],
      [1.14, -length * 0.58],
      [1.4, -length]
    ],
    bias: [
      [waist, 0],
      [0.55, -length * 0.35],
      [0.69, -length * 0.72],
      [0.83, -length]
    ],
    mermaid: [
      [waist, 0],
      [0.54, -length * 0.36],
      [0.49, -length * 0.68],
      [0.78, -length * 0.84],
      [1.12, -length]
    ]
  };

  const profile = profiles[parameters.skirtShape].map(([radius, y]) => new THREE.Vector2(radius, y));
  if (parameters.silhouette === "fit_and_flare" && parameters.skirtShape === "a_line") {
    profile[2]?.setX(0.94);
    profile[3]?.setX(1.18);
  }
  return profile;
}

export function Garment({ parameters }: { parameters: PreviewParameters }) {
  const top = necklineTop(parameters.neckline);
  const bodiceHeight = top - parameters.waistHeight;
  const skirtGeometry = useMemo(
    () => new THREE.LatheGeometry(buildSkirtProfile(parameters), 72),
    [parameters.silhouette, parameters.skirtShape, parameters.skirtLength]
  );

  useEffect(() => () => skirtGeometry.dispose(), [skirtGeometry]);

  return (
    <group name="spec-driven-dress">
      <mesh position={[0, parameters.waistHeight + bodiceHeight / 2, 0]} scale={[1, 1, 0.72]}>
        <cylinderGeometry args={[0.59, 0.45, bodiceHeight, 56, 2, true]} />
        <GarmentMaterial material={parameters.material} />
      </mesh>
      <NecklineInset neckline={parameters.neckline} top={top} />
      <Straps neckline={parameters.neckline} top={top} material={parameters.material} />

      <mesh geometry={skirtGeometry} position={[0, parameters.waistHeight, 0]} scale={[1, 1, 0.94]}>
        <GarmentMaterial material={parameters.material} />
      </mesh>
      <mesh position={[0, parameters.waistHeight, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.92]}>
        <torusGeometry args={[0.455, 0.032, 16, 64]} />
        <meshPhysicalMaterial color={parameters.material.color} roughness={0.42} clearcoat={0.25} />
      </mesh>

      <Sleeve side={-1} parameters={parameters} />
      <Sleeve side={1} parameters={parameters} />
    </group>
  );
}
