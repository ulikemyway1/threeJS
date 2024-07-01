import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';

class SceneSetup {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.gui = new GUI();
        this.init();
        this.loadCubeModel();
        this.addPrimitives();

        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
        this.scene.add(directionalLight);

        this.camera.position.z = 5;
        this.animate();
    }

    animate() {
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.animate());
    }

    loadCubeModel() {
      const loader = new GLTFLoader();
      loader.load('/models/EgorovAgencyCube.gltf', (e2cube) => {
          const cube = e2cube.scene;
          this.scene.add(cube);

          const rotationSpeed = 0.01;
          let rotate = true; // Flag to control rotation

          const rotateCube = () => {
              if (rotate) {
                  cube.rotation.y += rotationSpeed;
              }
              requestAnimationFrame(rotateCube);
          };
          rotateCube();

          // Add GUI control to stop rotation
          this.gui.add({ stopRotation: () => (rotate = !rotate) }, 'stopRotation').name('Stop E2 Rotation');
      });
  }

    addPrimitives() {
      const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
      const pyramidGeometry = new THREE.ConeGeometry(1, 2, 4);
      const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);

      const redMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const yellowMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      const greenMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

      const sphereMesh = new THREE.Mesh(sphereGeometry, redMaterial);
      const pyramidMesh = new THREE.Mesh(pyramidGeometry, yellowMaterial);
      const cubeMesh = new THREE.Mesh(cubeGeometry, greenMaterial);

      sphereMesh.position.set(5, 1, 0);
      pyramidMesh.position.set(7, 3, 0);
      cubeMesh.position.set(9, 4, 0);

      sphereMesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.geometry.computeVertexNormals();
        }
    });

      this.scene.add(sphereMesh);
      this.scene.add(pyramidMesh);
      this.scene.add(cubeMesh);
  }

  addGUIPanel() {
    const gutInit = {
      rotateE2Cube: true,
    }
    this.gui.add(document, 'stopCubeRotation').name('Stop E2Cube Rotation');

  }


  onWindowResize() {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    this.camera.aspect = newWidth / newHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(newWidth, newHeight);
}
}



const scene = new SceneSetup();
