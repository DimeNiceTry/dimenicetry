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
    window.setTimeout(() => {
      gsap.to(overlayMaterial.uniforms.uAlpha, {
        duration: 3,
        value: 0,
        delay: 0
      });
    }, 500);
  },
  (itemUrl, itemsLoaded, itemsTotal) => {
    const progressRatio = itemsLoaded / itemsTotal;
    console.log(`Loading progress: ${Math.round(progressRatio * 100)}%`);
  },
  () => {
    console.error('Error loading assets');
  }
);

let donut = null;
const gltfLoader = new THREE.GLTFLoader(loadingManager);
gltfLoader.load('./assets/holy/scene.gltf', (gltf) => {
  donut = gltf.scene;

  const screenWidth = window.innerWidth;

  if (screenWidth < 768) {
    console.log("Small screen detected");
    console.log(window.innerWidth)
    donut.position.set(20, -40, 0);
    donut.rotation.set(Math.PI * 0.05, Math.PI * 0.3, Math.PI * 0.2);
    donut.scale.set(6.0, 6.0, 6.0);
  } else if (screenWidth >= 768 && screenWidth < 1200) {
    console.log(window.innerWidth)
    console.log("Medium screen detected");
    donut.position.set(60, -20, 0);
    donut.rotation.set(Math.PI * 0.1, Math.PI * 0.4, Math.PI * 0.3);
    donut.scale.set(7.5, 7.5, 7.5);
  } else {
    console.log(window.innerWidth)
    console.log("Large screen detected");
    donut.position.set(120, 5, 0);
    donut.rotation.set(Math.PI * 0.1, Math.PI * 2.4, Math.PI * 0.2);
    donut.scale.set(9.0, 9.0, 9.0);
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

const transformDonutMedium = [
  {
    rotationZ: 0.8,
    positionX: 60,
    positionY: -20,
    rotationX: Math.PI * 0.1,
    rotationY: Math.PI * 0.4,
    lightX: 2,
    lightY: 12,
    lightZ: 4,
  },
  {
    rotationZ: 1.1,
    rotationX: 0.1,
    rotationY: Math.PI * 0.6,
    positionX: -50,
    lightX: 3,
    lightY: 10,
    lightZ: 4,
  },
  {
    rotationZ: 1.5,
    rotationY: 1.5,
    rotationX: 0,
    positionX: 0,
    lightX: 1,
    lightY: 5,
    lightZ: 4,
  }
];

const transformDonutSmall = [
  {
    rotationZ: Math.PI * 0.2,
    positionX: 20,
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
  
  const screenWidth = window.innerWidth;
  let transforms;
  
  if (screenWidth < 768) {
    transforms = transformDonutSmall;
  } else if (screenWidth >= 768 && screenWidth < 1200) {
    transforms = transformDonutMedium;
  } else {
    transforms = transformDonut;
  }

  if (newSection !== currentSection) {
    currentSection = newSection;

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
  const screenWidth = window.innerWidth;

  if (screenWidth < 768) {
    camera.position.z = 500; // Для маленького экрана
  } else if (screenWidth >= 768 && screenWidth < 1200) {
    camera.position.z = 600; // Для среднего экрана
  } else {
    camera.position.z = 500; // Для большого экрана
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

  if (donut) {
    if (window.innerWidth >= 768) {
      donut.position.y = Math.sin(elapsedTime * 0.6);
    }
  }

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};
tick();
