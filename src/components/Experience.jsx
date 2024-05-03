import {
  ContactShadows,
  Environment,
  OrbitControls,
  Sky,
} from "@react-three/drei";
import { useControls } from "leva";
import { Avatar } from "./Avatar";

export const Experience = () => {
  const { animation } = useControls({
    animation: {
      value: "Typing",
      options: ["Typing", "Falling", "Standing"],
    },
  });
  return (
    <>
      <OrbitControls />
      <Sky />
      <Environment preset="park" />
      <group position-y={-1}>
        <ContactShadows
          opacity={0.42}
          scale={10}
          blur={1}
          far={10}
          resolution={256}
          color="black"
        />
        <Avatar rotation-x={-Math.PI * 0.4} animation={animation} />
        {animation === "Typing" && (
          <mesh scale={[0.8, 0.4, 0.8]} position-y={0.25}>
            <boxGeometry />
            <meshStandardMaterial color="#111111" />
          </mesh>
        )}

        <mesh scale={5} rotation-x={-Math.PI * 0.4} position-y={-0.001}>
          <planeGeometry />
          <meshStandardMaterial color="#111111" />
        </mesh>
      </group>
    </>
  );
};