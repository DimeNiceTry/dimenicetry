  const canvas = document.querySelector('canvas.webgl');
  const scene = new THREE.Scene();

  const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
  const overlayMaterial = new THREE.ShaderMaterial({
    vertexShader: `
    void main() {
      gl_Position = vec4(position, 1.0);
    }
    `,
    fragmentShader: `
      uniform float uAlpha;
      void main() {
        gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
      }
    `,
    uniforms: {
      uAlpha: {
        value: 1.0
      }
    },
    transparent: true
  });

  const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
  scene.add(overlay);

  const loadingManager = new THREE.LoadingManager(
    () => {
      // Callback when all resources are loaded
      window.setTimeout(() => {
        gsap.to(overlayMaterial.uniforms.uAlpha, {
          duration: 3,
          value: 0,
          delay: 0
        });
      }, 500);
    },
    (itemUrl, itemsLoaded, itemsTotal) => {
      // Callback for progress (optional)
      const progressRatio = itemsLoaded / itemsTotal;
      console.log(`Loading progress: ${Math.round(progressRatio * 100)}%`);
    },
    () => {
      // Callback for error
      console.error('Error loading assets');
    }
  );
  
  let donut = null;
  const gltfLoader = new THREE.GLTFLoader(loadingManager);
  gltfLoader.load('./assets/holy/scene.gltf', (gltf) => {
    donut = gltf.scene;

    // Определим начальные параметры для большого и маленького экранов
    const isSmallScreen = window.innerWidth < 768;
    
    if (isSmallScreen) {
      console.log("Small screen detected");
      donut.position.x = 25; // Новое начальное положение для маленького экрана
      donut.position.y = -40;
      donut.rotation.x = Math.PI * 0.05;
      donut.rotation.z = Math.PI * 0.2;
      donut.rotation.y = Math.PI * 0.3;
      const radius = 6.0; // Меньший масштаб для маленьких экранов
      donut.scale.set(radius, radius, radius);
    } else {
      donut.position.x = 120; // Стандартное начальное положение
      donut.position.y = 5;
      donut.rotation.x = Math.PI * 0.1;
      donut.rotation.z = Math.PI * 0.2;
      donut.rotation.y = Math.PI * 2.4;
      const radius = 9.0;
      donut.scale.set(radius, radius, radius);
    }

    scene.add(donut);
  });

  const transformDonut = [
    {
      rotationZ: 0.45,
      positionX: 120,
      positionY: 5,
      rotationX: Math.PI * 0.1,
      rotationY: Math.PI * 2.4,
      lightX: 1,
      lightY: 20,
      lightZ: 5,
    },
    {
      rotationZ: 1.1,
      rotationX: 0.1,
      rotationY: Math.PI * 0.6,
      positionX: -120,
      lightX: 5,
      lightY: 15,
      lightZ: 5,
    },
    {
      rotationZ: 1.5,
      rotationY: 1.5,
      rotationX: 0,
      positionX: 0,
      lightX: 0,
      lightY: 2,
      lightZ: 5,
    }
  ];

  const transformDonutSmall = [
    {
      rotationZ: Math.PI * 0.2,
      positionX: 25,
      positionY: -40,
      rotationX: Math.PI * 0.05,
      rotationY: Math.PI * 0.3,
      lightX: 0.5,
      lightY: 10,
      lightZ: 3,
    },
    {
      rotationZ: 0.8,
      rotationX: 0.05,
      rotationY: Math.PI * 0.7,
      positionX: -25,
      positionY: -70,
      lightX: 2,
      lightY: 7,
      lightZ: 3,
    },
    {
      rotationZ: 1.5,
      rotationY: 1.5,
      rotationX: 0,
      positionX: 0,
      positionY: 0,
      lightX: 0,
      lightY: 1,
      lightZ: 3,
    }
  ];

  let scrollY = window.scrollY;
  let currentSection = 0;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    const newSection = Math.round(scrollY / sizes.height);
    
    const isSmallScreen = window.innerWidth < 768;
    
    if (newSection !== currentSection) {
      currentSection = newSection;

      const transforms = isSmallScreen ? transformDonutSmall : transformDonut;

      if (donut) {
        gsap.to(donut.rotation, {
          duration: 1.5,
          ease: 'power2.inOut',
          x: transforms[currentSection].rotationX,
          y: transforms[currentSection].rotationY,
          z: transforms[currentSection].rotationZ
        });
        gsap.to(donut.position, {
          duration: 1.5,
          ease: 'power2.inOut',
          x: transforms[currentSection].positionX,
          y: transforms[currentSection].positionY
        });
        
        gsap.to(directionalLight.position, {
          duration: 1.5,
          ease: 'power2.inOut',
          x: transforms[currentSection].lightX,
          y: transforms[currentSection].lightY,
          z: transforms[currentSection].lightZ
        });
      }
    }
  });

  window.onbeforeunload = function() {
    window.scrollTo(0, 0);
  };

  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const camera = new THREE.PerspectiveCamera(34, sizes.width / sizes.height, 0.1, 1000);

  const updateCameraPosition = () => {
    if (window.innerWidth < 768) {
      camera.position.z = 500;  // Для маленького экрана камера ближе
    } else {
      camera.position.z = 500;  // Стандартная позиция для больших экранов
    }
  };
  updateCameraPosition();
  scene.add(camera);

  window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    updateCameraPosition();
  });

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 20, 5);
  scene.add(directionalLight);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
  });

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const clock = new THREE.Clock();
  let lastElapsedtime = 0;

  const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - lastElapsedtime;
    lastElapsedtime = elapsedTime;

    
    if (window.innerWidth >= 768) {
      donut.position.y = Math.sin(elapsedTime * 0.6);
    }

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
  };
  tick();
