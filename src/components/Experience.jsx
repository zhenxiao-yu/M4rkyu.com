import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Avatar } from "./Avatar";

export const Experience = () => {
  return (
    <Canvas
      style={{ background: "#D2B48C" }} // Tan color background
      camera={{ position: [0, 0, 5] }} // Set camera position
    >
      <OrbitControls />
      <group position-y={-1}>
         <Avatar />
      </group>
      <ambientLight intensity={0.85}/>
    </Canvas>
  );
};
