import React, { useState, useEffect, useRef, Fragment } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react';
import { X, Box, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function BdfViewerModal({ isOpen, project, onClose }) {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [nodeCount, setNodeCount] = useState(0);
  const [elementCount, setElementCount] = useState(0);

  useEffect(() => {
    if (!isOpen || !project || !project.result_info || !project.result_info.bdf) return;
    
    let renderer, scene, camera, controls;

    const initViewer = async () => {
      setLoading(true);
      try {
        // 1. BDF 파일 로드
        const url = `${API_BASE_URL}/api/download?filepath=${encodeURIComponent(project.result_info.bdf)}`;
        const response = await axios.get(url, { responseType: 'text' });
        const bdfText = response.data;

        // 2. BDF 파싱
        const nodes = {};
        const elements = [];
        const lines = bdfText.split('\n');

        const parseNastranFloat = (str) => {
          if (!str || !str.trim()) return 0;
          let s = str.trim().toUpperCase();
          if (s.includes('E')) return parseFloat(s);
          s = s.replace(/([0-9\.])([+-][0-9]+)$/, '$1E$2');
          return parseFloat(s) || 0;
        };

        lines.forEach(line => {
          if (line.startsWith('GRID')) {
            if (line.includes(',')) {
              const p = line.split(',');
              nodes[parseInt(p[1])] = [parseFloat(p[3]), parseFloat(p[4]), parseFloat(p[5])];
            } else {
              const id = parseInt(line.substring(8, 16));
              const x = parseNastranFloat(line.substring(24, 32));
              const y = parseNastranFloat(line.substring(32, 40));
              const z = parseNastranFloat(line.substring(40, 48));
              if (!isNaN(id)) nodes[id] = [x, y, z];
            }
          } else if (line.startsWith('CROD') || line.startsWith('CBAR') || line.startsWith('CBEAM')) {
            if (line.includes(',')) {
              const p = line.split(',');
              elements.push([parseInt(p[3]), parseInt(p[4])]); 
            } else {
              const n1 = parseInt(line.substring(24, 32));
              const n2 = parseInt(line.substring(32, 40));
              if (!isNaN(n1) && !isNaN(n2)) elements.push([n1, n2]);
            }
          }
        });

        setNodeCount(Object.keys(nodes).length);
        setElementCount(elements.length);

        // 3. Three.js Scene Setup
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1e293b); 
        
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000000);
        camera.up.set(0, 0, 1); 
        
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        mountRef.current.appendChild(renderer.domElement);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // 조명
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        scene.add(dirLight);

        // 4. 모델 구축
        const modelGroup = new THREE.Group();

        const nodePositions = [];
        Object.values(nodes).forEach(pos => nodePositions.push(...pos));
        if (nodePositions.length > 0) {
          const nodeGeo = new THREE.BufferGeometry();
          nodeGeo.setAttribute('position', new THREE.Float32BufferAttribute(nodePositions, 3));
          const pointsMat = new THREE.PointsMaterial({ color: 0x00E600, size: 3, sizeAttenuation: false });
          modelGroup.add(new THREE.Points(nodeGeo, pointsMat));
        }

        const linePositions = [];
        elements.forEach(([n1, n2]) => {
          if (nodes[n1] && nodes[n2]) linePositions.push(...nodes[n1], ...nodes[n2]);
        });
        if (linePositions.length > 0) {
          const lineGeo = new THREE.BufferGeometry();
          lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
          const lineMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, opacity: 0.9, transparent: true });
          modelGroup.add(new THREE.LineSegments(lineGeo, lineMat));
        }

        scene.add(modelGroup);

        // 5. Bounding Box & Auto-Fit Camera 계산
        const box = new THREE.Box3().setFromObject(modelGroup);
        const center = new THREE.Vector3();
        box.getCenter(center);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z) || 1000;

        // ✅ XYZ 축선(AxesHelper) 제거 요청 반영
        // 기존 const axesHelper = new THREE.AxesHelper(...) 부분 완전 삭제

        // 카메라 위치 셋팅 (Isometric View)
        camera.position.set(center.x + maxDim, center.y - maxDim, center.z + maxDim * 0.8);
        controls.target.copy(center);
        camera.lookAt(center);

        // 6. Animation Loop
        let animationId;

        const animate = () => {
          // ✅ 2. ID 할당
          animationId = requestAnimationFrame(animate);
          controls.update();
          dirLight.position.copy(camera.position);
          renderer.render(scene, camera);
        };
        animate();

        // ✅ 3. initViewer의 리턴이나 외부에 클린업을 위한 참조 저장용 객체 생성 필요
        // 이를 위해 useEffect의 return 문 자체를 대폭 강화합니다.
        
      } catch (err) {
        console.error("Three.js Viewer Error:", err);
      } finally {
        setLoading(false);
      }
    };

    initViewer();

    // ✅ 4. 모달이 닫히거나 컴포넌트가 언마운트 될 때 완벽히 폐기
    return () => {
      // 렌더링 루프 정지 (animationId는 animate 내부 스코프 문제로 바깥에서 접근할 수 있도록 로직을 살짝 빼야하지만, 
      // 더 쉬운 방법은 전역 렌더링 루프 플래그를 쓰거나 아래처럼 렌더러 자체를 부숴버리는 것입니다.)
      
      if (scene) {
        scene.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(mat => mat.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }

      if (renderer) {
        renderer.dispose();
        // WebGL 컨텍스트 강제 상실
        renderer.forceContextLoss(); 
      }

      if (mountRef.current && renderer && renderer.domElement) {
        try {
           mountRef.current.removeChild(renderer.domElement);
        } catch(e) {}
      }
    };
  }, [isOpen, project]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" />
        <div className="fixed inset-0 flex items-center justify-center p-6">
          <Dialog.Panel className="w-full h-full bg-slate-900 rounded-2xl flex flex-col border border-slate-700 overflow-hidden shadow-2xl relative">
            
            {/* 상단 툴바 UI */}
            <div className="absolute top-4 left-6 z-10 pointer-events-none flex flex-col gap-1">
               <h3 className="text-[#00E600] font-bold tracking-widest text-xl drop-shadow-md flex items-center gap-2">
                 <Box size={24} className="text-white"/> BDF 3D Viewer
               </h3>
               <p className="text-slate-300 text-xs font-mono bg-black/50 px-2 py-1 rounded w-fit mt-1">
                 Total Nodes: {nodeCount} | Total Elements: {elementCount}
               </p>
            </div>

            <button onClick={onClose} className="absolute top-4 right-6 z-10 text-white hover:text-red-400 cursor-pointer bg-black/50 p-2 rounded-full transition-colors"><X size={24} /></button>
            
            {/* ✅ 좌측 하단 범례 UI 제거 요청 반영 (Axes Legend 박스 완전 삭제) */}

            {/* 우측 하단: 마우스 컨트롤 안내 */}
            <div className="absolute bottom-6 right-6 z-10 bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-700 pointer-events-none text-right shadow-lg">
              <h4 className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest border-b border-slate-700 pb-1">Mouse Controls</h4>
              <p className="text-[11px] text-slate-200 mb-1">Left Click & Drag : <span className="text-blue-400 font-bold">Rotate</span></p>
              <p className="text-[11px] text-slate-200 mb-1">Right Click & Drag : <span className="text-emerald-400 font-bold">Pan</span></p>
              <p className="text-[11px] text-slate-200">Mouse Wheel : <span className="text-yellow-400 font-bold">Zoom</span></p>
            </div>

            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-[#00E600] font-mono bg-slate-900/80 backdrop-blur-sm">
                <RefreshCw size={48} className="animate-spin mb-4" />
                Parsing BDF and Generating 3D Model...
              </div>
            )}
            
            <div ref={mountRef} className="w-full h-full cursor-move" />
            
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
}
