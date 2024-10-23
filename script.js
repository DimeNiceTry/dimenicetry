const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene()

const overlayGeometry = new THREE.PlaneGeometry(2,2,1,1)
const overlayMaterial = new THREE.ShaderMaterial({
  vertexShader: `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
  `,
  fragmentShader:`
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
  transparent:true
})



const overlay = new THREE.Mesh(overlayGeometry,overlayMaterial)
scene.add(overlay)
const loadingManager = new THREE.LoadingManager(
  () =>{
    window.setTimeout(()=>{
      gsap.to(overlayMaterial.uniforms.uAlpha, {
        duration: 3,
        value: 0,
        delay: 0
      })
    }, 500),
    () => {
      console.log('progress')
    }
  },
  () => {
    console.error('error')
  }
)
let donut = null
const gltfLoader = new THREE.GLTFLoader(loadingManager)
gltfLoader.load('./assets/holy/scene.gltf',
(gltf) => {
  donut = gltf.scene
  donut.position.x = 120
  donut.position.y = 5
  donut.rotation.x = Math.PI* 0.1
  donut.rotation.z = Math.PI * 0.2
  donut.rotation.y = Math.PI * 2.4
  const radius = 9.0
  donut.scale.set(radius,radius,radius)
  scene.add(donut)
}


)

const transformDonut = [
  {
    rotationZ: 0.45, 
    positionX: 120,
    positionY: 5,
    rotationX: Math.PI* 0.1,    
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
    rotationZ:  1.5,
    rotationY:  1.5,
    rotationX:  0,
    positionX: -0,
    lightX: 0,
    lightY: 2,
    lightZ: 5,
  }
]


let scrollY = window.scrollY
let currentSection = 0
window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
  const newSection = Math.round(scrollY / sizes.height);

  if (newSection !== currentSection) {
    currentSection = newSection;

    if (donut) {
      gsap.to(donut.rotation, {
        duration: 1.5,
        ease: 'power2.inOut',
        x: transformDonut[currentSection].rotationX,
        y: transformDonut[currentSection].rotationY,
        z: transformDonut[currentSection].rotationZ
      });
      gsap.to(donut.position, {
        duration: 1.5,
        ease: 'power2.inOut',
        x: transformDonut[currentSection].positionX
      });
      
      // Плавный переход для позиции света
      gsap.to(directionalLight.position, {
        duration: 1.5,
        ease: 'power2.inOut',
        x: transformDonut[currentSection].lightX,
        y: transformDonut[currentSection].lightY,
        z: transformDonut[currentSection].lightZ
      });
    }
  }
});


window.onbeforeunload = function() {
  window.scrollTo(0,0)
}

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  
}

const camera = new THREE.PerspectiveCamera(34, sizes.width / sizes.height, 0.1, 1000)
camera.position.z = 500
scene.add(camera)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)
const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(1,20,5)
scene.add(directionalLight)

const renderer = new THREE.WebGLRenderer({
  canvas:canvas,
  antialias: true,
  alpha: true
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))



const clock = new THREE.Clock()
let lastElapsedtime = 0;
const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - lastElapsedtime
  lastElapsedtime = elapsedTime

  if (!!donut) {
    donut.position.y = Math.sin(elapsedTime* 0.5) * 0.1 - 0.1
  }

  renderer.render(scene, camera)

  window.requestAnimationFrame(tick)
}
tick()