import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { 
  Settings, Play, RefreshCw, Box, Layers, 
  Maximize, Ruler, Activity, Info, PenTool
} from 'lucide-react';

export default function ComponentWizard() {
  const mountRef = useRef(null);
  const meshRef = useRef(null);
  
  // 1. 상태 관리 (I-Beam용 두께 파라미터 추가)
  const [modelType, setModelType] = useState('i-beam'); 
  const [params, setParams] = useState({
    length: 600,
    width: 150,  // Flange Width
    height: 200, // Total Height
    webThk: 12,  // Web Thickness
    flangeThk: 15, // Flange Thickness
    material: 'Neon Green (High Visibility)', 
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const materialPresets = {
    'Neon Green (High Visibility)': { color: 0x00ff00, emissive: 0x003300 },
    'Bright Sky Blue': { color: 0x00d2ff, emissive: 0x002244 },
    'Safety Orange': { color: 0xff6600, emissive: 0x331100 },
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); 
    
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 3000);
    camera.position.set(500, 400, 500);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // 조명 설정
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunLight.position.set(500, 500, 500);
    scene.add(sunLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    const grid = new THREE.GridHelper(1500, 40, 0x334155, 0x1e293b);
    scene.add(grid);

    const createModel = () => {
      if (meshRef.current) scene.remove(meshRef.current);

      let geometry;

      if (modelType === 'i-beam') {
        // [핵심] I-Beam 단면 그리기
        const shape = new THREE.Shape();
        const w = params.width;
        const h = params.height;
        const tw = params.webThk;
        const tf = params.flangeThk;

        // 원점을 중심으로 I자형 그리기
        shape.moveTo(-w/2, -h/2);
        shape.lineTo(w/2, -h/2);
        shape.lineTo(w/2, -h/2 + tf);
        shape.lineTo(tw/2, -h/2 + tf);
        shape.lineTo(tw/2, h/2 - tf);
        shape.lineTo(w/2, h/2 - tf);
        shape.lineTo(w/2, h/2);
        shape.lineTo(-w/2, h/2);
        shape.lineTo(-w/2, h/2 - tf);
        shape.lineTo(-tw/2, h/2 - tf);
        shape.lineTo(-tw/2, -h/2 + tf);
        shape.lineTo(-w/2, -h/2 + tf);
        shape.lineTo(-w/2, -h/2);

        // 뽑아내기 설정 (depth가 길이)
        const extrudeSettings = {
          depth: params.length,
          bevelEnabled: false,
          steps: 50 // 휘어짐 표현을 위해 세그먼트 분할
        };
        geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.center(); // 중심 맞춤
        geometry.rotateY(Math.PI / 2); // X축 방향으로 회전
      } else if (modelType === 'beam') {
        geometry = new THREE.BoxGeometry(params.length, params.height, params.width, 50, 1, 1);
      } else {
        geometry = new THREE.BoxGeometry(params.length, 10, params.length, 30, 1, 30);
      }

      const preset = materialPresets[params.material] || materialPresets['Neon Green (High Visibility)'];
      const material = new THREE.MeshPhongMaterial({
        color: showResult ? 0xffffff : preset.color,
        emissive: showResult ? 0x000000 : preset.emissive,
        specular: 0x555555,
        shininess: 100,
        vertexColors: showResult,
        side: THREE.DoubleSide
      });

      const mesh = new THREE.Mesh(geometry, material);
      const edges = new THREE.EdgesGeometry(geometry);
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.4, transparent: true }));
      mesh.add(line);

      // 해석 시 처짐 효과 (I-Beam도 동일하게 적용)
      if (showResult && (modelType === 'beam' || modelType === 'i-beam')) {
        const positions = geometry.attributes.position;
        const colors = [];
        const colorObj = new THREE.Color();

        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          const normalizedX = (x + params.length / 2) / params.length;
          const displacement = Math.pow(normalizedX, 2) * 60; 
          positions.setY(i, positions.getY(i) - displacement);
          colorObj.setHSL(0.6 * (1 - normalizedX), 1.0, 0.5);
          colors.push(colorObj.r, colorObj.g, colorObj.b);
        }
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        positions.needsUpdate = true;
      }

      meshRef.current = mesh;
      scene.add(mesh);
    };

    createModel();

    let animationId;

    const animate = () => {
      // ✅ 2. requestAnimationFrame의 ID를 받아옴
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // ✅ 3. 완벽한 메모리 정리 (Cleanup) 로직 적용
    return () => {
      window.removeEventListener('resize', handleResize);
      
      // (1) 백그라운드 렌더링 루프 강제 정지
      cancelAnimationFrame(animationId);
      
      // (2) 씬(Scene) 내부의 모든 3D 객체 메모리 강제 해제
      scene.traverse((object) => {
        if (!object.isMesh) return;
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      // (3) DOM에서 캔버스 제거 및 렌더러 폐기
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [params, modelType, showResult]);

  return (
    <div className="flex h-full bg-slate-900 p-4 gap-4">
      
      {/* 1. 좌측 설정 패널 */}
      <div className="w-80 flex flex-col gap-4">
        <div className="bg-slate-800 rounded-2xl p-4 shadow-xl border border-slate-700">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">Section Type</label>
          <div className="grid grid-cols-3 bg-slate-900 p-1 rounded-xl gap-1">
            <TabBtn active={modelType === 'beam'} label="Box" onClick={() => {setModelType('beam'); setShowResult(false);}} />
            <TabBtn active={modelType === 'i-beam'} label="I-Beam" onClick={() => {setModelType('i-beam'); setShowResult(false);}} />
            <TabBtn active={modelType === 'plate'} label="Plate" onClick={() => {setModelType('plate'); setShowResult(false);}} />
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700 flex-1 overflow-y-auto">
          <h3 className="text-sm font-bold text-slate-200 mb-6 flex items-center gap-2">
            <Settings size={16} className="text-[#00E600]" /> Dimensions
          </h3>
          
          <div className="space-y-5">
            <InputBox label="Length (L)" value={params.length} onChange={(e) => setParams({...params, length: Number(e.target.value)})} unit="mm" />
            <InputBox label="Total Height (H)" value={params.height} onChange={(e) => setParams({...params, height: Number(e.target.value)})} unit="mm" />
            <InputBox label={modelType === 'i-beam' ? "Flange Width (W)" : "Width (W)"} value={params.width} onChange={(e) => setParams({...params, width: Number(e.target.value)})} unit="mm" />
            
            {/* I-Beam 전용 입력란 */}
            {modelType === 'i-beam' && (
              <>
                <InputBox label="Web Thk (tw)" value={params.webThk} onChange={(e) => setParams({...params, webThk: Number(e.target.value)})} unit="mm" />
                <InputBox label="Flange Thk (tf)" value={params.flangeThk} onChange={(e) => setParams({...params, flangeThk: Number(e.target.value)})} unit="mm" />
              </>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700">
             <button 
              onClick={() => {
                setIsAnalyzing(true);
                setTimeout(() => {
                  setIsAnalyzing(false);
                  setShowResult(true);
                }, 1000);
              }}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                showResult ? 'bg-emerald-600 text-white' : 'bg-[#00E600] text-[#002554]'
              }`}
             >
               {isAnalyzing ? <RefreshCw className="animate-spin" size={18} /> : (showResult ? <Activity size={18} /> : <Play size={18} fill="currentColor" />)}
               {showResult ? 'Recalculate' : 'Run Quick Analysis'}
             </button>
             {showResult && (
                 <button onClick={() => setShowResult(false)} className="w-full mt-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-300">
                   Reset View
                 </button>
             )}
          </div>
        </div>
      </div>

      {/* 2. 우측 3D 캔버스 영역 */}
      <div className="flex-1 bg-black rounded-2xl shadow-2xl border border-slate-800 overflow-hidden relative">
        <div ref={mountRef} className="w-full h-full" />
        
        {/* I-Beam 단면 정보를 시각적으로 보여주는 도움말 (옵션) */}
        {!showResult && modelType === 'i-beam' && (
          <div className="absolute top-6 left-6 pointer-events-none">
             <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-700">
                <p className="text-[10px] font-bold text-[#00E600] mb-2 uppercase tracking-widest">Section Preview</p>
                <div className="w-20 h-24 border-2 border-[#00E600]/30 flex flex-col justify-between items-center p-1">
                   <div className="w-full h-2 bg-[#00E600]/50"></div>
                   <div className="w-2 h-full bg-[#00E600]/50"></div>
                   <div className="w-full h-2 bg-[#00E600]/50"></div>
                </div>
                <p className="text-[9px] text-slate-400 mt-2 text-center">I-Shape Extruded</p>
             </div>
          </div>
        )}

        {showResult && (
          <div className="absolute top-6 right-6 bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-700">
             <p className="text-[10px] font-bold text-[#00E600] mb-2 uppercase tracking-widest text-center">Stress (MPa)</p>
             <div className="h-32 w-2.5 bg-gradient-to-t from-blue-500 via-yellow-400 to-red-500 rounded-full mx-auto" />
             <div className="flex justify-between text-[9px] text-slate-400 mt-1 px-1 font-mono">
                 <span>0</span>
                 <span>{Math.floor(params.length / 2)}</span>
             </div>
          </div>
        )}
      </div>

    </div>
  );
}

// 탭 버튼 컴포넌트
function TabBtn({ active, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${active ? 'bg-slate-700 text-[#00E600]' : 'text-slate-500 hover:text-slate-300'}`}
    >
      {label}
    </button>
  );
}

function InputBox({ label, value, onChange, unit }) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <label className="text-[11px] font-bold text-slate-400 uppercase">{label}</label>
        <span className="text-[10px] text-slate-500 font-mono">{unit}</span>
      </div>
      <input 
        type="number"
        value={value}
        onChange={onChange}
        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-[#00E600] outline-none focus:ring-1 focus:ring-[#00E600] font-mono transition-all"
      />
    </div>
  );
}
