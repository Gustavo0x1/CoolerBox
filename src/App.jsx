import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, useAnimations } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import { LoopOnce } from "three"; 
import ProductScroll3D from "./component";

export default function App() {
  return (
    <>
      {/* Conteúdo antes (hero, intro, etc.) */}
      <div style={introStyle}>
        <h1>Conheça o produto</h1>
        <p>Role para explorar em 3D</p>
      </div>

      {/* Produto 3D com scroll estilo Apple */}
      <ProductScroll3D />

      {/* Conteúdo depois */}
      <div style={outroStyle}>
        <h2>Pronto para a próxima geração</h2>
      </div>
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