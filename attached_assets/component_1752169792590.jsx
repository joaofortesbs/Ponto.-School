import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const InteractiveParticleGlobe = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef(null);
  const waveRef = useRef([]);
  const brainPositionsRef = useRef(null);
  const transformationRef = useRef({ 
    globeToLamp: { progress: 0, started: false },
    lampToSaturn: { progress: 0, started: false },
    backToGlobe: { progress: 0, started: false }
  });

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Configuração da cena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Configuração da câmera
    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 15;

    // Configuração do renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    currentMount.appendChild(renderer.domElement);

    // Criação das partículas do globo (2073 partículas)
    const particleCount = 2073;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const originalPositions = new Float32Array(particleCount * 3);
    
    // Gerar posições da lâmpada e do planeta Saturno
    const brainPositions = new Float32Array(particleCount * 3);
    const saturnPositions = new Float32Array(particleCount * 3);
    
    // Função para gerar lâmpada incandescente CLÁSSICA com raios de luz
    const generateLightbulbPositions = () => {
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Dividir partículas: bulbo (65%), filamento (10%), base (15%), raios de luz (10%)
        const t = i / particleCount;
        
        let x, y, z;
        
        if (t < 0.65) {
          // 65% das partículas formam o bulbo em formato de pêra
          const bulbT = t / 0.65;
          
          // Altura do bulbo (ratio 1.5:1 - altura para largura)
          const h = bulbT; // 0 = topo arredondado, 1 = base do bulbo
          
          // Altura Z: de 5.5 (topo) até -2.0 (base) = 7.5 unidades (75% da altura total)
          const zPos = 5.5 - h * 7.5;
          
          // Formato de pêra clássico - topo arredondado, meio mais largo, base afinando
          let radius;
          
          if (h <= 0.45) {
            // TOPO + PESCOÇO COMPLETAMENTE ARREDONDADOS UNIDOS (45% do bulbo)
            const localH = h / 0.45;
            
            // Criar semicírculo perfeito unificado para topo e pescoço
            // Mapear de 0 a π/2 para criar um quarto de círculo perfeito
            const angle = localH * Math.PI * 0.5; // De 0 a 90 graus
            
            // Raio do semicírculo unificado
            const unifiedRadius = 3.5;
            
            // Função seno para criar curvatura perfeita e arredondada
            radius = unifiedRadius * Math.sin(angle);
          } else if (h <= 0.7) {
            // Corpo principal - mais largo (25% do bulbo)
            const localH = (h - 0.45) / 0.25;
            const bulbCurve = Math.sin(localH * Math.PI * 0.8);
            radius = 3.5 + bulbCurve * 0.3; // Máximo de 3.8
          } else {
            // Afinamento suave para base (30% do bulbo) - AINDA MAIS FINO
            const localH = (h - 0.7) / 0.3;
            radius = 3.6 - localH * 2.1; // De 3.6 até 1.5 (muito mais fino)
          }
          
          const phi = Math.random() * Math.PI * 2;
          
          x = radius * Math.cos(phi);
          y = radius * Math.sin(phi);
          z = zPos;
          
        } else if (t < 0.75) {
          // 10% das partículas formam o filamento central
          const filamentT = (t - 0.65) / 0.1;
          
          // Filamento em bobina central
          const zHeight = 4.8 - filamentT * 5.4; // Altura do filamento
          
          // Bobina em espiral com múltiplas voltas
          const coilTurns = filamentT * Math.PI * 8; // 4 voltas completas
          const coilRadius = 0.8 + Math.sin(filamentT * Math.PI * 2) * 0.3;
          const coilHeight = Math.sin(coilTurns) * 0.2;
          
          x = coilRadius * Math.cos(coilTurns);
          y = coilRadius * Math.sin(coilTurns);
          z = zHeight + coilHeight;
          
        } else if (t < 0.9) {
          // 15% das partículas formam a base Edison E27
          const baseT = (t - 0.75) / 0.15;
          
          // Base Edison: de -2.0 até -4.0 (25% da altura total)
          const zPos = -2.0 - baseT * 2.0;
          const phi = Math.random() * Math.PI * 2;
          
          // Raio da base com rosqueamento helical
          const baseRadius = 2.2;
          const threadSpiral = zPos * 12; // Rosca helicoidal
          const threadDepth = Math.sin(threadSpiral) * 0.08;
          
          const radius = baseRadius + threadDepth;
          
          x = radius * Math.cos(phi);
          y = radius * Math.sin(phi);
          z = zPos;
          
        } else {
          // 10% das partículas formam os RAIOS DE LUZ (8-12 raios)
          const rayT = (t - 0.9) / 0.1;
          
          // Número de raios (10 raios uniformemente distribuídos)
          const rayCount = 10;
          const rayIndex = Math.floor(rayT * rayCount);
          const rayLocalT = (rayT * rayCount) - rayIndex;
          
          // Ângulo do raio (distribuição uniforme em 360°)
          const rayAngle = (rayIndex / rayCount) * Math.PI * 2;
          
          // Posição do raio: 45° do eixo vertical, saindo da metade superior
          const rayLength = 1.5 + rayLocalT * 2.0; // Comprimento do raio proporcional
          const rayOriginZ = 3.0; // Origem na metade superior do bulbo
          
          // Coordenadas do raio em 45° do vertical
          const rayX = rayLength * Math.cos(rayAngle) * Math.cos(Math.PI * 0.25); // 45°
          const rayY = rayLength * Math.sin(rayAngle) * Math.cos(Math.PI * 0.25); // 45°
          const rayZ = rayOriginZ + rayLength * Math.sin(Math.PI * 0.25); // Componente vertical
          
          x = rayX;
          y = rayY;
          z = rayZ;
        }
        
        // Pequena variação para textura natural
        const noise = (Math.random() - 0.5) * 0.02;
        x += noise;
        y += noise;
        
        brainPositions[i3] = x;
        brainPositions[i3 + 1] = y;
        brainPositions[i3 + 2] = z;
      }
    };
    
    generateLightbulbPositions();
    
    // Função para gerar planeta Saturno - GLOBO MENOR + ANÉIS MODERADOS
    const generateSaturnPositions = () => {
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Dividir partículas: planeta central (70%), anéis (30%)
        const t = i / particleCount;
        
        let x, y, z;
        
        if (t < 0.7) {
          // 70% das partículas formam o planeta central - MENOR que o original
          
          // Usar distribuição Fibonacci igual ao globo original
          const planetIndex = Math.floor(t / 0.7 * particleCount);
          const goldenRatio = (1 + Math.sqrt(5)) / 2;
          const theta = 2 * Math.PI * planetIndex / goldenRatio;
          const phi = Math.acos(1 - 2 * planetIndex / particleCount);
          
          // Raio MENOR que o globo original
          const baseRadius = 4.5; // Menor que o original (6.0)
          const radiusVariation = 0.25; // Variação reduzida
          const radius = baseRadius + (Math.random() - 0.5) * radiusVariation;
          
          x = radius * Math.sin(phi) * Math.cos(theta);
          y = radius * Math.sin(phi) * Math.sin(theta);
          z = radius * Math.cos(phi);
          
        } else {
          // 30% das partículas formam os anéis de Saturno - MODERADOS
          const ringT = (t - 0.7) / 0.3;
          
          // Múltiplos anéis com tamanhos moderados
          const ringIndex = Math.floor(ringT * 3); // 3 anéis principais
          const localRingT = (ringT * 3) - ringIndex;
          
          // Raios dos anéis - MODERADOS (não muito grandes)
          let ringRadius;
          let ringThickness;
          
          if (ringIndex === 0) {
            // Anel interno
            ringRadius = 5.5 + localRingT * 0.6;
            ringThickness = 0.1;
          } else if (ringIndex === 1) {
            // Anel principal
            ringRadius = 6.5 + localRingT * 0.8;
            ringThickness = 0.15;
          } else {
            // Anel externo
            ringRadius = 7.8 + localRingT * 0.7;
            ringThickness = 0.12;
          }
          
          // Ângulo no anel
          const ringAngle = Math.random() * Math.PI * 2;
          
          // Posição no anel com pequena variação vertical
          x = ringRadius * Math.cos(ringAngle);
          y = ringRadius * Math.sin(ringAngle);
          z = (Math.random() - 0.5) * ringThickness; // Espessura do anel
          
          // Gaps nos anéis (divisão de Cassini)
          if (ringRadius > 6.1 && ringRadius < 6.5) {
            // Gap entre anel interno e principal
            if (Math.random() > 0.4) {
              ringRadius = 6.5; // Mover para anel principal
              x = ringRadius * Math.cos(ringAngle);
              y = ringRadius * Math.sin(ringAngle);
            }
          }
        }
        
        // Pequena variação para textura natural
        const noise = (Math.random() - 0.5) * 0.02;
        x += noise;
        y += noise;
        z += noise * 0.5;
        
        saturnPositions[i3] = x;
        saturnPositions[i3 + 1] = y;
        saturnPositions[i3 + 2] = z;
      }
    };
    
    generateSaturnPositions();
    brainPositionsRef.current = { lamp: brainPositions, saturn: saturnPositions };

    // Distribuição esférica MUITO mais uniforme e alinhada
    for (let i = 0; i < particleCount; i++) {
      // Usar distribuição Fibonacci para máxima uniformidade
      const goldenRatio = (1 + Math.sqrt(5)) / 2;
      const theta = 2 * Math.PI * i / goldenRatio;
      const phi = Math.acos(1 - 2 * i / particleCount);
      
      // Raio mais consistente para globo perfeito
      const baseRadius = 6.0;
      const radiusVariation = 0.3; // Variação muito menor
      const radius = baseRadius + (Math.random() - 0.5) * radiusVariation;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      // Cores variáveis (tons de laranja)
      const intensity = 0.4 + Math.random() * 0.6;
      colors[i * 3] = intensity;           // R (laranja forte)
      colors[i * 3 + 1] = intensity * 0.5; // G (laranja médio)
      colors[i * 3 + 2] = intensity * 0.1; // B (pouco azul para laranja puro)

      // Tamanhos variáveis (otimizado)
      sizes[i] = Math.random() * 2 + 0.5;
    }

    // Geometria e material das partículas
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Material otimizado para performance
    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    // Iluminação ambiente
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    // Event listeners para interação com mouse (posição exata da tela)
    const handleMouseMove = (event) => {
      const rect = currentMount.getBoundingClientRect();
      // Armazenar posição exata do mouse na tela (pixels)
      mouseRef.current.screenX = event.clientX - rect.left;
      mouseRef.current.screenY = event.clientY - rect.top;
      // Converter para coordenadas normalizadas
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handleResize = () => {
      if (!currentMount) return;
      
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };

    // Event listener para clique - criar ondas E verificar reset
    const handleClick = (event) => {
      const rect = currentMount.getBoundingClientRect();
      const clickX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const clickY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Raycaster para encontrar ponto de clique no espaço 3D
      const clickRaycaster = new THREE.Raycaster();
      const clickMouse = new THREE.Vector2(clickX, clickY);
      clickRaycaster.setFromCamera(clickMouse, camera);
      
      // Criar ponto de origem da onda no espaço 3D
      const waveCenter = clickRaycaster.ray.origin.clone().add(
        clickRaycaster.ray.direction.clone().multiplyScalar(15)
      );
      
      // VERIFICAR SE CLICOU NA LÂMPADA OU SATURNO PARA RESETAR
      const currentTime = time;
      const isLampActive = transformationRef.current.globeToLamp.progress >= 1.0 && transformationRef.current.lampToSaturn.progress === 0;
      const isSaturnActive = transformationRef.current.lampToSaturn.progress >= 1.0;
      
      // Se clicar na lâmpada ou Saturno, iniciar reset para globo
      if ((isLampActive || isSaturnActive) && !transformationRef.current.backToGlobe.started) {
        transformationRef.current.backToGlobe.started = true;
        transformationRef.current.backToGlobe.startTime = currentTime;
        transformationRef.current.backToGlobe.progress = 0;
        
        // Resetar outras transformações
        transformationRef.current.globeToLamp = { progress: 0, started: false };
        transformationRef.current.lampToSaturn = { progress: 0, started: false };
      }
      
      // Adicionar nova onda ao sistema (sempre)
      waveRef.current.push({
        center: waveCenter,
        radius: 0,
        speed: 8.0, // Velocidade de propagação
        amplitude: 2.5, // Amplitude do deslocamento
        startTime: currentTime,
        active: true
      });
    };

    currentMount.addEventListener('mousemove', handleMouseMove);
    currentMount.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);

    // Loop de animação com efeito de espalhamento e transformação
    let time = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      time += 0.01;
      
      // Lógica de transformações automáticas (apenas se não estiver resetando)
      if (!transformationRef.current.backToGlobe.started) {
        // Iniciar primeira transformação (globo → lâmpada) após 5 segundos
        if (time > 5.0 && !transformationRef.current.globeToLamp.started) {
          transformationRef.current.globeToLamp.started = true;
        }
        
        // Iniciar segunda transformação (lâmpada → Saturno) após 10 segundos
        if (time > 10.0 && !transformationRef.current.lampToSaturn.started) {
          transformationRef.current.lampToSaturn.started = true;
        }
      }
      
      // Atualizar progresso das transformações automáticas
      if (transformationRef.current.globeToLamp.started && transformationRef.current.globeToLamp.progress < 1.0 && !transformationRef.current.backToGlobe.started) {
        transformationRef.current.globeToLamp.progress = Math.min(1.0, transformationRef.current.globeToLamp.progress + 0.02);
      }
      
      if (transformationRef.current.lampToSaturn.started && transformationRef.current.lampToSaturn.progress < 1.0 && !transformationRef.current.backToGlobe.started) {
        transformationRef.current.lampToSaturn.progress = Math.min(1.0, transformationRef.current.lampToSaturn.progress + 0.02);
      }
      
      // Atualizar progresso do reset para globo
      if (transformationRef.current.backToGlobe.started && transformationRef.current.backToGlobe.progress < 1.0) {
        transformationRef.current.backToGlobe.progress = Math.min(1.0, transformationRef.current.backToGlobe.progress + 0.025); // Um pouco mais rápido
        
        // Quando terminar o reset, reiniciar o ciclo automático
        if (transformationRef.current.backToGlobe.progress >= 1.0) {
          // Resetar tudo para começar novo ciclo
          transformationRef.current.backToGlobe = { progress: 0, started: false };
          transformationRef.current.globeToLamp = { progress: 0, started: false };
          transformationRef.current.lampToSaturn = { progress: 0, started: false };
          
          // Reiniciar timer para novo ciclo
          time = 0;
        }
      }
      
      // Raycaster para detectar partículas exatamente sob o cursor
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2(mouseRef.current.x, mouseRef.current.y);
      raycaster.setFromCamera(mouse, camera);
      
      // Animação das partículas com efeito de repulsão baseado em screen space
      const positions = particles.geometry.attributes.position.array;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Calcular posições alvo baseadas nas transformações
        const globeToLampProgress = transformationRef.current.globeToLamp.progress;
        const lampToSaturnProgress = transformationRef.current.lampToSaturn.progress;
        const backToGlobeProgress = transformationRef.current.backToGlobe.progress;
        
        // Suavização cúbica para todas as transformações
        const smoothLampProgress = globeToLampProgress * globeToLampProgress * (3.0 - 2.0 * globeToLampProgress);
        const smoothSaturnProgress = lampToSaturnProgress * lampToSaturnProgress * (3.0 - 2.0 * lampToSaturnProgress);
        const smoothBackProgress = backToGlobeProgress * backToGlobeProgress * (3.0 - 2.0 * backToGlobeProgress);
        
        let targetX, targetY, targetZ;
        
        if (backToGlobeProgress > 0) {
          // Reset para globo - determinar forma atual e interpolar para globo
          let currentX, currentY, currentZ;
          
          if (lampToSaturnProgress >= 1.0) {
            // Estamos em Saturno, voltar para globo
            currentX = brainPositionsRef.current.saturn[i3];
            currentY = brainPositionsRef.current.saturn[i3 + 1];
            currentZ = brainPositionsRef.current.saturn[i3 + 2];
          } else if (globeToLampProgress >= 1.0) {
            // Estamos em lâmpada, voltar para globo
            currentX = brainPositionsRef.current.lamp[i3];
            currentY = brainPositionsRef.current.lamp[i3 + 1];
            currentZ = brainPositionsRef.current.lamp[i3 + 2];
          } else {
            // Fallback para globo
            currentX = originalPositions[i3];
            currentY = originalPositions[i3 + 1];
            currentZ = originalPositions[i3 + 2];
          }
          
          // Interpolar de volta para o globo original
          targetX = currentX * (1 - smoothBackProgress) + originalPositions[i3] * smoothBackProgress;
          targetY = currentY * (1 - smoothBackProgress) + originalPositions[i3 + 1] * smoothBackProgress;
          targetZ = currentZ * (1 - smoothBackProgress) + originalPositions[i3 + 2] * smoothBackProgress;
          
        } else if (lampToSaturnProgress > 0) {
          // Segunda transformação: Lâmpada → Saturno
          const lampX = originalPositions[i3] * (1 - 1.0) + brainPositionsRef.current.lamp[i3] * 1.0;
          const lampY = originalPositions[i3 + 1] * (1 - 1.0) + brainPositionsRef.current.lamp[i3 + 1] * 1.0;
          const lampZ = originalPositions[i3 + 2] * (1 - 1.0) + brainPositionsRef.current.lamp[i3 + 2] * 1.0;
          
          targetX = lampX * (1 - smoothSaturnProgress) + brainPositionsRef.current.saturn[i3] * smoothSaturnProgress;
          targetY = lampY * (1 - smoothSaturnProgress) + brainPositionsRef.current.saturn[i3 + 1] * smoothSaturnProgress;
          targetZ = lampZ * (1 - smoothSaturnProgress) + brainPositionsRef.current.saturn[i3 + 2] * smoothSaturnProgress;
          
        } else {
          // Primeira transformação: Globo → Lâmpada
          targetX = originalPositions[i3] * (1 - smoothLampProgress) + brainPositionsRef.current.lamp[i3] * smoothLampProgress;
          targetY = originalPositions[i3 + 1] * (1 - smoothLampProgress) + brainPositionsRef.current.lamp[i3 + 1] * smoothLampProgress;
          targetZ = originalPositions[i3 + 2] * (1 - smoothLampProgress) + brainPositionsRef.current.lamp[i3 + 2] * smoothLampProgress;
        }
        
        // Adicionar movimento orgânico reduzido durante transformações
        const totalTransformationProgress = Math.max(smoothLampProgress, smoothSaturnProgress, smoothBackProgress);
        const movementFactor = 1.0 - (totalTransformationProgress * 0.7); // Reduzir movimento durante transformações
        const baseX = targetX + Math.sin(time * 0.8 + i * 0.15) * 0.5 * movementFactor;
        const baseY = targetY + Math.cos(time * 0.6 + i * 0.2) * 0.5 * movementFactor;
        const baseZ = targetZ + Math.sin(time * 0.7 + i * 0.25) * 0.3 * movementFactor;
        
        // Criar posição 3D da partícula (considerando rotação do globo)
        const particleWorldPos = new THREE.Vector3(baseX, baseY, baseZ);
        particleWorldPos.applyMatrix4(particles.matrixWorld);
        
        // Projetar posição 3D da partícula para coordenadas da tela
        const particleScreenPos = particleWorldPos.clone();
        particleScreenPos.project(camera);
        
        // Converter para pixels da tela
        const screenX = (particleScreenPos.x * 0.5 + 0.5) * currentMount.clientWidth;
        const screenY = (1 - (particleScreenPos.y * 0.5 + 0.5)) * currentMount.clientHeight;
        
        // Calcular distância em pixels na tela
        const screenDistance = Math.sqrt(
          Math.pow(screenX - (mouseRef.current.screenX || 0), 2) + 
          Math.pow(screenY - (mouseRef.current.screenY || 0), 2)
        );
        
        const repelRadiusPixels = 120; // Raio MAIOR para efeito mais amplo
        
        let finalX = baseX;
        let finalY = baseY;
        let finalZ = baseZ;
        
        // Aplicar repulsão AMPLIADA apenas se estiver sob o cursor
        if (screenDistance < repelRadiusPixels && particleScreenPos.z > -1 && particleScreenPos.z < 1) {
          // Força de repulsão MAIOR baseada na distância em pixels
          const repelForce = (repelRadiusPixels - screenDistance) / repelRadiusPixels;
          const repelStrength = Math.pow(repelForce, 3) * 5.0; // Força MUITO maior
          
          // Direção de repulsão no espaço 3D
          const repelDirection = raycaster.ray.direction.clone().negate();
          
          // Aplicar força radial a partir do centro da partícula
          const centerToParticle = new THREE.Vector3(baseX, baseY, baseZ).normalize();
          
          // Combinar direção do ray com direção radial
          const finalDirection = centerToParticle.multiplyScalar(0.7).add(repelDirection.multiplyScalar(0.3));
          
          finalX += finalDirection.x * repelStrength;
          finalY += finalDirection.y * repelStrength;
          finalZ += finalDirection.z * repelStrength;
        }
        
        // SISTEMA DE ONDAS AVANÇADO - Efeito de propagação ao clicar
        let waveEffect = 0;
        const particleWorldPosition = new THREE.Vector3(baseX, baseY, baseZ);
        
        // Processar todas as ondas ativas
        waveRef.current.forEach((wave, waveIndex) => {
          if (wave.active) {
            // Calcular distância da partícula ao epicentro da onda
            const distanceToWave = particleWorldPosition.distanceTo(wave.center);
            
            // Calcular raio atual da onda (cresce com o tempo)
            const currentRadius = wave.radius + (time - wave.startTime) * wave.speed;
            
            // Espessura da onda
            const waveThickness = 2.0;
            
            // Verificar se a partícula está na frente da onda
            if (Math.abs(distanceToWave - currentRadius) < waveThickness && currentRadius > 0) {
              // Intensidade baseada na proximidade ao centro da onda
              const intensity = 1.0 - Math.abs(distanceToWave - currentRadius) / waveThickness;
              
              // Amplitude da onda com decay temporal
              const amplitude = wave.amplitude * Math.exp(-(time - wave.startTime) * 2.0);
              
              // Direção radial da onda
              const waveDirection = particleWorldPosition.clone().sub(wave.center).normalize();
              
              // Aplicar deslocamento da onda
              const waveDisplacement = amplitude * intensity;
              finalX += waveDirection.x * waveDisplacement;
              finalY += waveDirection.y * waveDisplacement;
              finalZ += waveDirection.z * waveDisplacement;
            }
            
            // Remover onda se ela se expandiu muito
            if (currentRadius > 15) {
              wave.active = false;
            }
          }
        });
        
        // Limpar ondas inativas
        waveRef.current = waveRef.current.filter(wave => wave.active);
        
        // Transição ajustada baseada nas transformações
        const anyTransformationActive = transformationRef.current.globeToLamp.started || transformationRef.current.lampToSaturn.started || transformationRef.current.backToGlobe.started;
        const smoothing = anyTransformationActive ? 0.08 : 0.15; // Mais suave durante transformações
        positions[i3] = positions[i3] * (1 - smoothing) + finalX * smoothing;
        positions[i3 + 1] = positions[i3 + 1] * (1 - smoothing) + finalY * smoothing;
        positions[i3 + 2] = positions[i3 + 2] * (1 - smoothing) + finalZ * smoothing;
      }
      
      particles.geometry.attributes.position.needsUpdate = true;
      
      // Rotação contínua durante globo e lâmpada (movimento perpétuo)
      particles.rotation.y += 0.004;
      particles.rotation.x += 0.0015;
      
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      currentMount.removeEventListener('mousemove', handleMouseMove);
      currentMount.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      
      // Dispose dos recursos
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden bg-black">
      {/* Container principal do globo */}
      <div
        ref={mountRef}
        className="w-full h-full"
        style={{ minHeight: '600px' }}
      />
    </div>
  );
};

export default InteractiveParticleGlobe;