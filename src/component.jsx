import React, { useState, useEffect, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  useAnimations,
  Environment,
  PerspectiveCamera,
} from "@react-three/drei";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  RotateCw,
  X,
} from "lucide-react";
import * as THREE from "three";
import "./App.css";

function ProductModel({
  modelPath,
  animationName,
  scale = 1,
  position = [0, 0, 0],
  scrollProgress,
  isMobile,
}) {
  const group = useRef();
  const { scene, animations } = useGLTF(modelPath);
  console.log("Animations:", animations);
  const { actions, mixer } = useAnimations(animations, group);
  const actionRef = useRef(null);

  useEffect(() => {
    if (!animations.length) return;

    // Tocar TODAS as animações uma vez
    Object.values(actions).forEach((action) => {
      action.reset();
      action.setLoop(THREE.LoopOnce, 1); // Toca só 1 vez
      action.clampWhenFinished = true; // Para congelado no último frame
      action.play(); // Inicia
    });
  }, [actions, animations]);

  useFrame((state, delta) => {
    // LÓGICA DE ANIMAÇÃO (Bones/Rig)
    if (actionRef.current && mixer && !isMobile) {
      // Desktop: Controla o tempo da animação pelo scroll
      const duration = actionRef.current.getClip().duration;
      actionRef.current.time = scrollProgress * duration;
      mixer.update(0);
    } else if (mixer && isMobile) {
      // Mobile: Deixa a animação fluir normalmente
      mixer.update(delta);
    }

    // LÓGICA DE ROTAÇÃO E POSIÇÃO DO MODELO
    if (group.current) {
      if (isMobile) {
        // --- COMPORTAMENTO MOBILE ---
        // Gira suavemente sozinho (auto-rotation)
        group.current.rotation.y += delta * 0.2;

        // Mantém posição fixa (sem ir para trás no eixo Z)
        group.current.position.z = 0;
      } else {
        // --- COMPORTAMENTO DESKTOP (Mantido) ---
        group.current.rotation.y = scrollProgress * Math.PI * 2;
        group.current.position.z = -scrollProgress * 2;
      }
    }
  });

  return (
    <group ref={group}>
      <primitive object={scene} scale={scale} position={position} />
    </group>
  );
}

const views = [
  {
    id: "overview",
    title: "Visão Geral",
    description: "Explore o produto completo",
    modelPath: "./models/produto.glb",
    animation: "Tampa_soloAction",
    cameraPosition: [3, 3, 4],
    scale: 1,
  },
  {
    id: "internal",
    title: "Visão Interna",
    description: "Veja os detalhes internos",
    modelPath: "./models/produto.glb",
    animation: "Abrir",
    cameraPosition: [0, 0, 4],
    scale: 1.2,
  },
  {
    id: "exploded",
    title: "Vista Explodida",
    description: "Componentes separados",
    modelPath: "./models/ifrost_explodedview.glb",
    animation: "Abrir",
    cameraPosition: [0, 0, 6],
    scale: 1,
  },
];

export default function ProductShowcase() {
  const [currentView, setCurrentView] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isInteractive, setIsInteractive] = useState(false);
  const controlsRef = useRef();
  const scrollContainerRef = useRef();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;

      const rect = scrollContainerRef.current.getBoundingClientRect();
      const containerHeight = scrollContainerRef.current.offsetHeight;
      const windowHeight = window.innerHeight;

      const scrollStart = rect.top;
      const scrollEnd = scrollStart + containerHeight - windowHeight;

      let progress = 0;
      if (scrollStart > 0) {
        progress = 0;
      } else if (scrollStart < -scrollEnd) {
        progress = 1;
      } else {
        progress = Math.abs(scrollStart) / scrollEnd;
      }

      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const nextView = () => {
    setCurrentView((prev) => (prev + 1) % views.length);
  };

  const prevView = () => {
    setCurrentView((prev) => (prev - 1 + views.length) % views.length);
  };

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const handleCanvasClick = () => {
    if (isMobile && !isInteractive) {
      setIsInteractive(true);
      document.body.style.overflow = "hidden";
    }
  };

  const handleCloseInteractive = () => {
    setIsInteractive(false);
    document.body.style.overflow = "auto";
  };

  const currentViewData = views[currentView];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">Inovação em 3D</h1>
        <p className="hero-subtitle">
          Explore cada detalhe do nosso produto de forma interativa
        </p>
        <div className="scroll-indicator">
          <ChevronRight
            style={{ transform: "rotate(90deg)", width: 32, height: 32 }}
          />
        </div>
      </section>

      {/* Scroll Container com Canvas Sticky */}
      <div ref={scrollContainerRef} className="scroll-container">
        <div className="sticky-canvas-wrapper">
          <div className="canvas-container">
            {/* Canvas visível no mobile (não interativo) */}
            {isMobile && !isInteractive && (
              <>
                <Canvas shadows>
                  <PerspectiveCamera
                    makeDefault
                    position={currentViewData.cameraPosition}
                    fov={50}
                  />

                  <ambientLight intensity={0.5} />
                  <directionalLight
                    position={[10, 10, 5]}
                    intensity={1}
                    castShadow
                  />
                  <directionalLight position={[-10, -10, -5]} intensity={0.5} />

                  <Suspense fallback={null}>
                    <ProductModel
                      key={currentViewData.id}
                      modelPath={currentViewData.modelPath}
                      animationName={currentViewData.animation}
                      scale={currentViewData.scale}
                      scrollProgress={scrollProgress}
                      isMobile={isMobile}
                    />
                    <Environment preset="studio" />
                  </Suspense>
                </Canvas>

                {/* Overlay clicável transparente */}
                <div
                  onClick={handleCanvasClick}
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 5,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "transparent",
                    pointerEvents: "auto",
                  }}
                >
                  <div
                    style={{
                      padding: "1rem 2rem",
                      background: "rgba(59, 130, 246, 0.9)",
                      borderRadius: "50px",
                      color: "#fff",
                      fontSize: "1rem",
                      fontWeight: 600,
                      boxShadow: "0 10px 40px rgba(59, 130, 246, 0.5)",
                      pointerEvents: "none",
                    }}
                  >
                    👆 Toque para Interagir
                  </div>
                </div>

                <div
                  // Se for mobile, fica sempre visível ('visible'). Se for desktop, depende do scroll.
                  className={`info-overlay ${isMobile ? "" : scrollProgress > 0.1 && scrollProgress < 0.9 ? "visible" : ""}`}
                  style={{ pointerEvents: "none" }}
                >
                  <h2>{currentViewData.title}</h2>
                  <p>{currentViewData.description}</p>
                </div>
              </>
            )}

            {/* Modal de interação no mobile */}
            {isMobile && isInteractive && (
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 100,
                  background: "#000",
                }}
              >
                {/* Botão X para fechar */}
                <button
                  onClick={handleCloseInteractive}
                  style={{
                    position: "absolute",
                    top: "1.5rem",
                    right: "1.5rem",
                    zIndex: 101,
                    width: "56px",
                    height: "56px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(0, 0, 0, 0.8)",
                    backdropFilter: "blur(20px)",
                    borderRadius: "50%",
                    border: "2px solid rgba(255, 255, 255, 0.2)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.borderColor =
                      "rgba(59, 130, 246, 0.6)";
                    e.currentTarget.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(0, 0, 0, 0.8)";
                    e.currentTarget.style.borderColor =
                      "rgba(255, 255, 255, 0.2)";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <X style={{ width: 28, height: 28, color: "#fff" }} />
                </button>

                <Canvas shadows>
                  <PerspectiveCamera
                    makeDefault
                    position={currentViewData.cameraPosition}
                    fov={50}
                  />

                  <ambientLight intensity={0.5} />
                  <directionalLight
                    position={[10, 10, 5]}
                    intensity={1}
                    castShadow
                  />
                  <directionalLight position={[-10, -10, -5]} intensity={0.5} />

                  <Suspense fallback={null}>
                    <ProductModel
                      key={currentViewData.id}
                      modelPath={currentViewData.modelPath}
                      animationName={currentViewData.animation}
                      scale={currentViewData.scale}
                      scrollProgress={scrollProgress}
                    />
                    <Environment preset="studio" />
                  </Suspense>

                  <OrbitControls
                    ref={controlsRef}
                    enablePan={true}
                    enableZoom={true}
                    autoRotate={autoRotate}
                    autoRotateSpeed={1.5}
                    minDistance={2}
                    maxDistance={10}
                  />
                </Canvas>

                {/* Controles para o modal */}
                <div className="controls-wrapper">
                  <button
                    onClick={() => setAutoRotate(!autoRotate)}
                    className={`control-btn ${autoRotate ? "active" : ""}`}
                    title={autoRotate ? "Pausar rotação" : "Auto-rotação"}
                  >
                    <RotateCw />
                  </button>

                  <button
                    onClick={resetCamera}
                    className="control-btn"
                    title="Resetar câmera"
                  >
                    <Maximize2 />
                  </button>

                  {/* NOVO BOTÃO DE SAIR AQUI */}
                  <button
                    onClick={handleCloseInteractive}
                    className="control-btn" // Usa a mesma classe para manter o estilo igual
                    title="Sair da interação"
                    style={{ color: "#ff4444" }} // Opcional: cor vermelha para destacar que é sair
                  >
                    <X />
                  </button>
                </div>
                {/* Navigation no modal */}
                <button onClick={prevView} className="nav-btn left">
                  <ChevronLeft />
                </button>

                <button onClick={nextView} className="nav-btn right">
                  <ChevronRight />
                </button>

                {/* View indicators no modal */}
                <div className="view-indicators">
                  {views.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentView(index)}
                      className={`view-dot ${index === currentView ? "active" : ""}`}
                    />
                  ))}
                </div>

                {/* Info no modal */}
                <div className="info-overlay visible">
                  <h2>{currentViewData.title}</h2>
                  <p>{currentViewData.description}</p>
                </div>
              </div>
            )}

            {/* Canvas normal para desktop */}
            {!isMobile && (
              <>
                <Canvas shadows>
                  <PerspectiveCamera
                    makeDefault
                    position={currentViewData.cameraPosition}
                    fov={50}
                  />

                  <ambientLight intensity={0.5} />
                  <directionalLight
                    position={[10, 10, 5]}
                    intensity={1}
                    castShadow
                  />
                  <directionalLight position={[-10, -10, -5]} intensity={0.5} />

                  <Suspense fallback={null}>
                    <ProductModel
                      key={currentViewData.id}
                      modelPath={currentViewData.modelPath}
                      animationName={currentViewData.animation}
                      scale={currentViewData.scale}
                      scrollProgress={scrollProgress}
                    />
                    <Environment preset="studio" />
                  </Suspense>

                  <OrbitControls
                    ref={controlsRef}
                    enablePan={true}
                    enableZoom={true}
                    autoRotate={autoRotate}
                    autoRotateSpeed={1.5}
                    minDistance={2}
                    maxDistance={10}
                  />
                </Canvas>

                <div
                  className={`info-overlay ${scrollProgress > 0.1 && scrollProgress < 0.9 ? "visible" : ""}`}
                >
                  <h2>{currentViewData.title}</h2>
                  <p>{currentViewData.description}</p>
                </div>

                <div className="view-indicators">
                  {views.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentView(index)}
                      className={`view-dot ${index === currentView ? "active" : ""}`}
                    />
                  ))}
                </div>

                <button onClick={prevView} className="nav-btn left">
                  <ChevronLeft />
                </button>

                <button onClick={nextView} className="nav-btn right">
                  <ChevronRight />
                </button>

                <div className="controls-wrapper">
                  <button
                    onClick={() => setAutoRotate(!autoRotate)}
                    className={`control-btn ${autoRotate ? "active" : ""}`}
                    title={autoRotate ? "Pausar rotação" : "Auto-rotação"}
                  >
                    <RotateCw />
                  </button>

                  <button
                    onClick={resetCamera}
                    className="control-btn"
                    title="Resetar câmera"
                  >
                    <Maximize2 />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="thumbnails-wrapper">
        <div className="thumbnails-grid">
          {views.map((view, index) => (
            <button
              key={view.id}
              onClick={() => setCurrentView(index)}
              className={`thumbnail-card ${index === currentView ? "active" : ""}`}
            >
              <h3>{view.title}</h3>
              <p>{view.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Specs Section */}
      <section className="specs-section">
        <div className="specs-content">
          <h2 className="specs-title">Design de Próxima Geração</h2>
          <div className="specs-grid">
            <div className="spec-card blue">
              <h3>Inovador</h3>
              <p>Tecnologia de ponta em cada detalhe do produto</p>
            </div>
            <div className="spec-card purple">
              <h3>Preciso</h3>
              <p>Engenharia de precisão milimétrica</p>
            </div>
            <div className="spec-card pink">
              <h3>Elegante</h3>
              <p>Estética que inspira e impressiona</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2 className="cta-title">Pronto para Experimentar?</h2>
        <p className="cta-subtitle">
          Descubra como nosso produto pode transformar sua experiência
        </p>
        <button className="cta-button">
          <span>Saiba Mais</span>
        </button>
      </section>
    </div>
  );
}
