import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, useAnimations } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import { LoopOnce } from "three"; 
import ProductScroll3D from "./component";

export default function App() {
  return (
    <>



      <ProductScroll3D />


      
    </>
  );
}

const introStyle = {
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  background: "#fff",
  color: "#000"
};

const outroStyle = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#000",
  color: "#fff"
};