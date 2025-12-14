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
  Users,
  Github,
  Linkedin,
  ShoppingCart,
  Image as ImageIcon,
  Hammer,
  Mail,
  Box,
  Tent,
  CarFront,
  BriefcaseMedical,
} from "lucide-react";
import * as THREE from "three";
import "./App.css";
import { color } from "three/tsl";
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
  const { actions, mixer, names} = useAnimations(animations, group);

useEffect(() => {
    if (!animations.length || !actions) return;
    console.log("Animações disponíveis neste modelo:", names);
    // Para todas as animações primeiro
    Object.values(actions).forEach((action) => {
      if (action) action.stop();
    });
    
    // Pequeno delay para garantir reset
    const timer = setTimeout(() => {
      Object.values(actions).forEach((action) => {
        if (action) {
          console.log("Executando: ",actions)
          action.reset();
          action.setLoop(THREE.LoopOnce, 1);
          action.clampWhenFinished = true;
          action.play();
        }
      });
    }, 50);
    
    return () => clearTimeout(timer);
  }, [actions, animations.length, modelPath]); // Muda apenas quando o modelo muda

  useFrame((state, delta) => {
    if (mixer) mixer.update(delta);
    if (group.current && isMobile) group.current.rotation.y += delta * 0.2;
  });
console.log(actions);
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
    modelPath: "./models/CaixaFinalizada.glb", 
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
    modelPath: "./models/CaixaFinalizada_Open.glb",
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
    modelPath: "./models/CaixaFinalizada_ExplodedView.glb",
    animation: "Tampa_soloAction",
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
  const [selectedImage, setSelectedImage] = useState(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isInteractive, setIsInteractive] = useState(false);
  const controlsRef = useRef();
  const scrollContainerRef = useRef();
const teamMembers = [
    {
      name: "Gustavo Soares Rodrigues",
      email: "gsr21@aluno.ifnmg.edu.br",
      
    }
    ,
    {
      name: "Eduardo Alves de Oliveira",
      email: "eao7@aluno.ifnmg.edu.br",
     
    }
    ,
    {
      name: "Gustavo Alves de Oliveira",
      email: "gao7@aluno.ifnmg.edu.br",
     
    }
    ,
    {
      name: "Milena Soares Silva",
      email: "mss49@aluno.ifnmg.edu.br",
     
    }    ,
     {
      name: "Matheus de Alencar Veloso ",
      email: "mav6@aluno.ifnmg.edu.br",
      
    }
    
  ];
  const materials = [
    { item: "Pastilhas Peltier TEC1-12706", qtd: "2 un" },
    { item: "ESP32 DevKit V1", qtd: "1 un" },
    { item: "Sensor de Temperatura DS18B20", qtd: "2 un" },
    { item: "Ventoinhas 120mm Alta Pressão", qtd: "2 un" },
    { item: "Fonte Chaveada 12V 10A", qtd: "1 un" },
    { item: "Placas de Isolamento XPS 30mm", qtd: "1 m²" },
  ];
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
const carouselRef = useRef(null);

  const handleScroll = (direction) => {
    if (carouselRef.current) {
      const { current } = carouselRef;
      // Define quanto rolar por clique (aprox o tamanho de uma imagem + gap)
      const scrollAmount = 320; 
      
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
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
        <span className="hero-tagline">Projeto: HealthBox</span>
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
          <div className="canvas-container" onMouseDown={() => setIsInteractive(true)}
  onMouseLeave={() => setIsInteractive(false)} >

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
    enablePan={true}
    enableZoom={isInteractive} 
    autoRotate={autoRotate && !isInteractive}
    minDistance={2}
    maxDistance={8}
    enabled={true}
/>
            </Canvas>

           
  
            
            {!isMobile && (
                <div className="controls-wrapper">
                
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

<section className="galeria-section" style={{ padding: '4rem 0', position: 'relative' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Nossa <span style={{color:"#06b6d4"}}>Galeria</span></h2>
        
        {/* Wrapper com position relative para prender os botões absolutos aqui dentro */}
        <div className="galeria-wrapper" style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Botão Esquerda (Renomeado e Estilizado) */}
          <button 
            onClick={() => handleScroll('left')}
            aria-label="Anterior"
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}
          >
            &#10094;
          </button>
  
          {/* Container de Scroll */}
          <div 
            ref={carouselRef}
            className="galeria-container" 
            style={{
              display: 'flex',
              gap: '1rem',
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              padding: '1rem',
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none'  // IE/Edge
            }}
          >
            {/* Esconde a barra de rolagem no Chrome/Safari */}
            <style>
              {`
                .galeria-container::-webkit-scrollbar {
                  display: none;
                }
              `}
            </style>

       {[
  "/img/1.jpeg",
  "/img/2.jpeg",
  "/img/3.jpeg",
  "/img/4.jpeg",
  "/img/5.jpeg",
  "/img/6.jpeg",
  "/img/7.jpeg",
  "/img/8.jpeg",

  "/img/10.jpeg",
].map((src, index) => (
  <div 
    key={index} 
    className="galeria-item"
    // Adicione o onClick aqui:
    onClick={() => setSelectedImage(src)}
    style={{
      flex: '0 0 auto',
      width: '300px',
      height: '200px',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      cursor: 'pointer' // <--- Adicione cursor pointer para indicar clique
    }}
  >
    <img 
      src={src} 
      alt={`Foto ${index + 1}`} 
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.3s',
        pointerEvents: 'none' // Evita conflito de arraste vs clique
      }}
      onMouseOver={(e) => e.target.parentElement.style.transform = 'scale(1.02)'} // Efeito sutil no container
      onMouseOut={(e) => e.target.parentElement.style.transform = 'scale(1)'}
    />
  </div>
))}
          </div>
  
          {/* Botão Direita (Renomeado e Estilizado) */}
          <button 
            onClick={() => handleScroll('right')}
            aria-label="Próximo"
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}
          >
            &#10095;
          </button>
        </div>
      </section>
      <section className="tech-section">
        <div className="section-header">
            <h2 className="section-title">Engenharia <span>Térmica</span></h2>
            <p className="hero-subtitle" style={{margin:'0 auto'}}>Como transformamos eletricidade em redução de temperatura.</p>
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
                <p>Dois coolers acoplados a dissipadores de alumínio garantem que o lado quente não superaqueça e gera uma convecção forçada no interiro da caixa.</p>
            </div>
            <div className="tech-card">
                <Cpu className="tech-icon" />
                <h3>Controle Digital</h3>
                <p>Microcontrolador <strong>ESP32</strong> monitora temperaturas internas e externas, ajustando a potência das placas via PWM para economizar bateria.</p>
            </div>
            <div className="tech-card">
                <Box className="tech-icon" />
                <h3>Isolamento triplo</h3>
                <p>O isolamento térmico da caixa consiste na união de cortiça, fibra de alumínio e  espuma de poliuretano.</p>
            </div>
        </div>
      </section>

<section className="build-section">
        <div className="section-header">
            <h2 className="section-title">Roadmap do <span>Projeto</span></h2>
            <p className="hero-subtitle" style={{margin:'0 auto'}}>O futuro e a evolução do HealthBox.</p>
        </div>

        <div className="build-timeline">
            {/* --- CURTO PRAZO --- */}
            <div className="build-step">
                {/* Badge substitui o círculo numérico */}
                <div style={{
                    background: 'rgba(6, 182, 212, 0.1)', 
                    color: '#06b6d4',                      
                    border: '1px solid #06b6d4',
                    padding: '8px 16px',                   
                    borderRadius: '50px',                  
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',                  
                    textAlign: 'center',
                    minWidth: '110px',                     
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 10px rgba(6,182,212,0.2)'
                }}>
                    Curto Prazo
                </div>

                <div className="step-content">
                    <div className="step-tags">
                        <span className="tag">CAD</span>
                        <span className="tag">Mecânica</span>
                    </div>
                    <h3>Modelo base</h3>
        <p>Desenvolvimento da estrutura física e isolamento térmico inicial. Validação das dimensões para acomodar as pastilhas e dissipadores além do espaço adequado para o fluxo de ar e para o conteúdo efetivo.</p>
                </div>
            </div>

     
            <div className="build-step">
                <div style={{
                    background: 'rgba(6, 182, 212, 0.1)',
                    color: '#06b6d4',
                    border: '1px solid #06b6d4',
                    padding: '8px 16px',
                    borderRadius: '50px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                    minWidth: '110px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 10px rgba(6,182,212,0.2)'
                }}>
                    Médio Prazo
                </div>

                <div className="step-content">
                    <div className="step-tags">
                        <span className="tag">Hardware</span>
                        <span className="tag">Software</span>
                    </div>
                    <h3>Controle PWM</h3>
                    <p>Desenvolver um módulo de controle PWM para controlar o consumo das pastilhas com base na temperatura</p>
                </div>
            </div>

            <div className="build-step">
                <div style={{
                    background: 'rgba(6, 182, 212, 0.1)',
                    color: '#06b6d4',
                    border: '1px solid #06b6d4',
                    padding: '8px 16px',
                    borderRadius: '50px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                    minWidth: '110px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 10px rgba(6,182,212,0.2)'
                }}>
                    Longo Prazo
                </div>

                <div className="step-content">
                    <div className="step-tags">
                        <span className="tag">Autonomia</span>
                        <span className="tag">Gerenciamento de energia</span>
                    </div>
                    <h3>Portabilidade</h3>
                    <p>Permitir que o produto seja portatil através da adição de baterias. Melhorias estruturais para comportar baterias.  Redução do consumo para aumentar a autonomia.</p>
                </div>
            </div>
        </div>
      </section>



<section className="team-section" style={{ padding: '4rem 2rem' }}>
        <div className="section-header">
            {/* Sugestão de nome: "Desenvolvedores" ou "Ficha Técnica" */}
            <h2 className="section-title"><span>Equipe</span></h2>
        </div>

        <div className="tech-grid" style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'center', 
            gap: '1.5rem' 
        }}>
            {teamMembers.map((member, idx) => (
                <div key={idx} className="tech-card" style={{ 
                    textAlign: 'left', // Alinhamento à esquerda fica mais elegante para listas
                    minWidth: '280px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '2rem',
                    borderLeft: '4px solid #06b6d4' // Detalhe lateral colorido para dar estilo sem foto
                }}>
                    
                    <h3 style={{ 
                        fontSize: '1.4rem', 
                        marginBottom: '0.5rem',
                        color: '#f8fafc' 
                    }}>
                        {member.name}
                    </h3>
                    
                    <p href={`${member.email}`} style={{ 
                        color: '#94a3b8', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        textDecoration: 'none',
                        fontSize: '0.95rem',
                        transition: 'color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#06b6d4'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
                    >
                        <Mail size={16} />
                        {member.email}
                    </p>

                </div>
            ))}
        </div>
      </section>
{selectedImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.9)', // Fundo escuro
            zIndex: 9999, // Bem alto para ficar acima de tudo
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out'
          }}
          onClick={() => setSelectedImage(null)} // Clicar no fundo fecha
        >
          {/* Botão Fechar */}
          <button
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            <X size={40} />
          </button>

          {/* Imagem Ampliada */}
          <img 
            src={selectedImage} 
            alt="Ampliada"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain', // Garante que a imagem caiba na tela sem distorcer
              borderRadius: '8px',
              boxShadow: '0 0 20px rgba(0,0,0,0.5)',
              cursor: 'default' // Clicar na imagem não deve fechar (opcional)
            }}
            onClick={(e) => e.stopPropagation()} // Impede que o clique na imagem feche o modal
          />
        </div>
      )}
<footer style={{
        backgroundColor: '#0f172a', // Fundo escuro (Slate 900)
        color: '#94a3b8',           // Texto cinza suave
        padding: '4rem 2rem 2rem',
        borderTop: '1px solid #1e293b',
        marginTop: 'auto'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '3rem',
          marginBottom: '3rem'
        }}>
          {/* Coluna 1: Identidade */}
          <div>
            <h3 style={{ 
              color: '#f8fafc', 
              fontSize: '1.5rem', 
              marginBottom: '1rem', 
              display:'flex', 
              alignItems:'center', 
              gap:'10px' 
            }}>
              <Zap color="#06b6d4" fill="#06b6d4" /> HealthBox
            </h3>
            <p style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>
              Soluções em refrigeração portátil de alta eficiência. 
              Unindo engenharia térmica e eletrônica embarcada.
            </p>
          </div>

          {/* Coluna 2: Links Rápidos */}
          <div></div>
          <div>
            <h4 style={{ color: '#f8fafc', marginBottom: '1.2rem', fontSize: '1.1rem' }}>Projeto</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {['Visão Geral', 'Especificações', 'Galeria', 'Equipe'].map((item) => (
                <li key={item}>
                  <a href="#" style={{ 
                    color: 'inherit', 
                    textDecoration: 'none', 
                    transition: 'color 0.2s',
                    fontSize: '0.95rem' 
                  }}
                  onMouseOver={(e) => e.target.style.color = '#06b6d4'}
                  onMouseOut={(e) => e.target.style.color = 'inherit'}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>


        </div>

        {/* Barra de Direitos Autorais */}
        <div style={{
          borderTop: '1px solid #1e293b',
          paddingTop: '2rem',
          textAlign: 'center',
          fontSize: '0.9rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <p>&copy; {new Date().getFullYear()} HealthBox Project. Todos os direitos reservados.</p>
          
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span style={{ cursor: 'pointer' }}>Termos</span>
            <span style={{ cursor: 'pointer' }}>Privacidade</span>
          </div>
        </div>
      </footer>
    </div>
  );
}