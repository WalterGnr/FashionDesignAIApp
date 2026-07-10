import { useMemo } from "react";
import * as THREE from "three";

type Point = [number, number, number];

type LimbProps = {
  from: Point;
  to: Point;
  radius: number;
};

export function CylinderBetween({ from, to, radius }: LimbProps) {
  const transform = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const direction = end.clone().sub(start);
    const midpoint = start.clone().add(end).multiplyScalar(0.5);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
    return { length: direction.length(), midpoint, quaternion };
  }, [from, to]);

  return (
    <mesh position={transform.midpoint} quaternion={transform.quaternion}>
      <cylinderGeometry args={[radius, radius, transform.length, 18]} />
      <meshStandardMaterial color="#cfc5ba" roughness={0.88} />
    </mesh>
  );
}

export function Mannequin() {
  return (
    <group name="neutral-mannequin">
      <mesh position={[0, 3.12, 0]} scale={[0.43, 0.52, 0.45]}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshStandardMaterial color="#cfc5ba" roughness={0.88} />
      </mesh>
      <mesh position={[0, 2.7, 0]}>
        <cylinderGeometry args={[0.17, 0.2, 0.42, 24]} />
        <meshStandardMaterial color="#cfc5ba" roughness={0.88} />
      </mesh>
      <mesh position={[0, 1.92, 0]} scale={[0.82, 1.2, 0.58]}>
        <capsuleGeometry args={[0.5, 0.85, 10, 28]} />
        <meshStandardMaterial color="#cfc5ba" roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.98, 0]} scale={[0.46, 0.64, 0.3]}>
        <sphereGeometry args={[1, 28, 20]} />
        <meshStandardMaterial color="#cfc5ba" roughness={0.88} />
      </mesh>

      <CylinderBetween from={[-0.58, 2.38, 0]} to={[-0.84, 1.58, 0]} radius={0.14} />
      <CylinderBetween from={[-0.84, 1.58, 0]} to={[-0.77, 0.66, 0]} radius={0.11} />
      <CylinderBetween from={[0.58, 2.38, 0]} to={[0.84, 1.58, 0]} radius={0.14} />
      <CylinderBetween from={[0.84, 1.58, 0]} to={[0.77, 0.66, 0]} radius={0.11} />

      <CylinderBetween from={[-0.24, 0.78, 0]} to={[-0.2, -1.52, 0]} radius={0.17} />
      <CylinderBetween from={[0.24, 0.78, 0]} to={[0.2, -1.52, 0]} radius={0.17} />
      <mesh position={[-0.2, -1.62, 0.11]} scale={[0.2, 0.1, 0.48]}>
        <sphereGeometry args={[1, 20, 14]} />
        <meshStandardMaterial color="#cfc5ba" roughness={0.88} />
      </mesh>
      <mesh position={[0.2, -1.62, 0.11]} scale={[0.2, 0.1, 0.48]}>
        <sphereGeometry args={[1, 20, 14]} />
        <meshStandardMaterial color="#cfc5ba" roughness={0.88} />
      </mesh>
    </group>
  );
}
