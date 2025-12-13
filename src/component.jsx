import React, { useState, useEffect, useRef, Suspense } from "react";
import { Canvas, useFrame,useThree } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  useAnimations,
  Environment,
  PerspectiveCamera,
} from "@react-three/drei";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Maximize2,
  RotateCw,
  X,
  ThermometerSnowflake,
  Zap,
  Cpu,
  Wind,
  Settings,
  Box,
} from "lucide-react";
import * as THREE from "three";
import "./App.css";
function CameraControls({ enabled }) {
  const { camera, gl } = useThree();

  return (
    <OrbitControls
      args={[camera, gl.domElement]}
      enablePan={false}
      enableZoom
      enabled={enabled}
      minDistance={2}
      maxDistance={8}
    />
  );
}

function ProductModel({
  modelPath,
  animationName,
  scale = 1,
  position = [0, 0, 0],
  isMobile,
}) {
  const group = useRef();
  const { scene, animations } = useGLTF(modelPath);
  const { actions, mixer } = useAnimations(animations, group);

  useEffect(() => {
    if (!animations.length) return;
    Object.values(actions).forEach((action) => {
      action.reset();
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      action.play();
    });
  }, [actions, animations]);

  useFrame((state, delta) => {
    if (mixer) mixer.update(delta);
    if (group.current && isMobile) group.current.rotation.y += delta * 0.2;
  });

  return (
    <group ref={group}>
      <primitive object={scene} scale={scale} position={position} />
    </group>
  );
}

// DADOS DO PROJETO PELTIER
const views = [
  {
    id: "overview",
    title: "Design Térmico",
    description: "Estrutura otimizada para máximo isolamento",
    modelPath: "./models/produto.glb", 
    animation: "Tampa_soloAction",
  'camera': {
      desktop: [3, 3, 4],
      mobile: [0, 1.5, 6]
    },
     scale: {
      desktop: 1,
      mobile: 0.9
    }
  },
  {
    id: "internal",
    title: "Câmara Fria",
    description: "Espaço interno de 15L com revestimento em alumínio",
    modelPath: "./models/produto.glb",
    animation: "Abrir",
    camera: {
      desktop: [0, 1, 3],
      mobile: [0, 1.2, 5]
    },

    scale: {
      desktop: 1.2,
      mobile: 1
    }
  },
  {
    id: "system",
    title: "Núcleo Peltier",
    description: "Sistema dual-core de pastilhas TEC1-12706",
    modelPath: "./models/ifrost_explodedview.glb",
    animation: "Abrir",
       camera: {
      desktop: [0, 2, 6],
      mobile: [0, 1.8, 7]
    },

    scale: {
      desktop: 1,
      mobile: 0.8
    }
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
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
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
      if (scrollStart > 0) progress = 0;
      else if (scrollStart < -scrollEnd) progress = 1;
      else progress = Math.abs(scrollStart) / scrollEnd;

      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const nextView = () => setCurrentView((prev) => (prev + 1) % views.length);
  const prevView = () => setCurrentView((prev) => (prev - 1 + views.length) % views.length);
  const resetCamera = () => controlsRef.current?.reset();

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
  const cameraPosition = isMobile
  ? currentViewData.camera.mobile
  : currentViewData.camera.desktop;
  return (
    <div className="app-container">

      <section className="hero-section">
        <div className="hero-bg-glow" />
        <span className="hero-tagline">Projeto: FrostBox</span>
        <h1 className="hero-title">REFRIGERAÇÃO<br/>PORTÁTIL</h1>
        <p className="hero-subtitle">
          Coolerbox termoelétrica construída com tecnologia Peltier.
        </p>

      </section>
      
  <div className="scroll-indicator">
          <span className="scroll-text">Deslize para ver</span>
          <ChevronDown style={{ width: 40, height: 40 }} />
        </div>

      <div ref={scrollContainerRef} className="scroll-container">
        <div className="sticky-canvas-wrapper">
          <div className="canvas-container">

             <Canvas shadows>
 <PerspectiveCamera
    key={currentViewData.id}
    makeDefault
    position={cameraPosition}
    fov={isMobile ? 60 : 50}
    near={0.1}
    far={100}
  />

                <ambientLight intensity={0.3} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#cffafe" />
                <spotLight position={[-10, 5, 10]} angle={0.3} penumbra={1} intensity={1} castShadow color="#06b6d4" />
                
                <Suspense fallback={null}>
          <ProductModel
  modelPath={currentViewData.modelPath}
  scale={
    isMobile
      ? currentViewData.scale.mobile
      : currentViewData.scale.desktop
  }
  isMobile={isMobile}
/>
                    <Environment preset="night" />
                </Suspense>

<OrbitControls
    ref={controlsRef}
    enablePan={false}
    enableZoom={true}
    autoRotate={autoRotate}
    minDistance={2}
    maxDistance={8}
    enabled={true}
/>
            </Canvas>

           
            <div className={`info-overlay ${scrollProgress > 0.1 && scrollProgress < 0.9 ? "visible" : ""}`}>
                <h2>{currentViewData.title}</h2>
                <p>{currentViewData.description}</p>
            </div>
            
            {!isMobile && (
                <div className="controls-wrapper">
                    <button onClick={() => setAutoRotate(!autoRotate)} className={`control-btn ${autoRotate ? 'active' : ''}`}>
                        <RotateCw />
                    </button>
                    <button onClick={resetCamera} className="control-btn">
                        <Maximize2 />
                    </button>
                </div>
            )}

         
            <button onClick={prevView} className="nav-btn left"><ChevronLeft /></button>
            <button onClick={nextView} className="nav-btn right"><ChevronRight /></button>
            
     
             {isMobile && !isInteractive && (
                <div className="mobile-tap-overlay" onClick={handleCanvasClick}>
                    <span>👆 Explorar 3D</span>
                </div>
             )}
          </div>
        </div>
      </div>


      <section className="tech-section">
        <div className="section-header">
            <h2 className="section-title">Engenharia <span>Térmica</span></h2>
            <p className="hero-subtitle" style={{margin:'0 auto'}}>Como transformamos eletricidade em frio extremo.</p>
        </div>
        
        <div className="tech-grid">
            <div className="tech-card">
                <ThermometerSnowflake className="tech-icon" />
                <h3>Efeito Peltier</h3>
                <p>Utiliza pastilhas <strong>TEC1-12706</strong> que transferem calor de um lado para o outro ao receber corrente elétrica, criando uma face gelada e outra quente.</p>
            </div>
            <div className="tech-card">
                <Wind className="tech-icon" />
                <h3>Dissipação Ativa</h3>
                <p>Dois coolers de alta rotação (2500 RPM) acoplados a dissipadores de alumínio garantem que o lado quente não sature, maximizando o Delta T.</p>
            </div>
            <div className="tech-card">
                <Cpu className="tech-icon" />
                <h3>Controle Digital</h3>
                <p>Microcontrolador <strong>ESP32</strong> monitora temperaturas internas e externas, ajustando a potência das ventoinhas via PWM para economizar bateria.</p>
            </div>
            <div className="tech-card">
                <Box className="tech-icon" />
                <h3>Isolamento XPS</h3>
                <p>Paredes triplas com espuma de poliestireno extrudado (XPS) de 30mm garantem retenção térmica por até 8 horas desligado.</p>
            </div>
        </div>
      </section>


      <section className="build-section">
        <div className="section-header">
            <h2 className="section-title">Processo de <span>Construção</span></h2>
        </div>

        <div className="build-timeline">
            <div className="build-step">
                <div className="step-number">01</div>
                <div className="step-content">
                    <div className="step-tags">
                        <span className="tag">CAD 3D</span>
                        <span className="tag">Planejamento</span>
                    </div>
                    <h3>Prototipagem Digital</h3>
                    <p>Desenho da carcaça e simulação de fluxo de ar para garantir que os dissipadores tenham ventilação adequada sem trocar calor com a câmara fria.</p>
                </div>
            </div>

            <div className="build-step">
                <div className="step-number">02</div>
                <div className="step-content">
                    <div className="step-tags">
                        <span className="tag">Corte</span>
                        <span className="tag">Montagem</span>
                    </div>
                    <h3>Estrutura e Isolamento</h3>
                    <p>Corte das placas de XPS e revestimento interno com fita de alumínio para reflexão térmica. A carcaça externa foi impressa em PETG para resistência mecânica.</p>
                </div>
            </div>

            <div className="build-step">
                <div className="step-number">03</div>
                <div className="step-content">
                    <div className="step-tags">
                        <span className="tag">Eletrônica</span>
                        <span className="tag">Soldagem</span>
                    </div>
                    <h3>Integração do Sistema</h3>
                    <p>Instalação das pastilhas Peltier com pasta térmica de prata. Conexão do módulo relé e sensores DS18B20 ao Arduino/ESP32.</p>
                </div>
            </div>
        </div>
      </section>

      <section className="specs-detail-section">
        <div className="section-header">
            <h2 className="section-title">Especificações <span>Técnicas</span></h2>
        </div>
        
        <div className="specs-container">
            <div className="spec-row">
                <span className="spec-label">Capacidade de Resfriamento (Delta T)</span>
                <span className="spec-value">-22°C vs Ambiente</span>
            </div>
            <div className="spec-row">
                <span className="spec-label">Consumo de Energia (Pico)</span>
                <span className="spec-value">120 Watts (12V @ 10A)</span>
            </div>
            <div className="spec-row">
                <span className="spec-label">Volume Interno</span>
                <span className="spec-value">15 Litros</span>
            </div>
            <div className="spec-row">
                <span className="spec-label">Autonomia (Bateria 60Ah)</span>
                <span className="spec-value">~5 Horas</span>
            </div>
            <div className="spec-row">
                <span className="spec-label">Peso Total</span>
                <span className="spec-value">4.2 kg</span>
            </div>
            <div className="spec-row">
                <span className="spec-label">Material Isolante</span>
                <span className="spec-value">XPS 30mm + Alumínio</span>
            </div>
        </div>
      </section>


      <section className="cta-section" style={{background: '#0b1120'}}>
        <h2 className="cta-title">Projeto Open Source</h2>
        <p className="cta-subtitle">
          Os arquivos STL e o código fonte do controlador estão disponíveis no GitHub.
        </p>
        <button className="cta-button">
          <span>Ver Repositório</span>
        </button>
      </section>
    </div>
  );
}