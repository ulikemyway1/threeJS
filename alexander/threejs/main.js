import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';


class SceneSetup {


  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, localClippingEnabled: true });
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.gui = new GUI();
    this.mixer = undefined;
    this.clock = new THREE.Clock();
    this.loadCubeModel();
    this.init();
    this.addPrimitives();
    this.cubeE2 = null;
    this.addText(this.scene, this.camera, this.renderer);
    window.addEventListener('resize', this.onWindowResize.bind(this));
    this.addPlaneWave();
    this.controls.enableRotate = true;
    this.controls.enableDamping = true;
    this.controls.rotateSpeed = 0.5;
    this.localPlane = new THREE.Plane(new THREE.Vector3(5.5, 0, 0), 0.8);

  }

  init() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    this.scene.add(directionalLight);

    this.camera.position.z = 5;
  }


  async loadCubeModel() {
    const loader = new GLTFLoader();
    await loader.load('/models/EgorovAgencyCube.gltf', (e2cube) => {
      const cube = e2cube.scene;
      this.scene.add(cube);
      cube.position.set(-5, 0, 0);
      cube.clippingPlanes = [this.localPlane],
        cube.clipShadows = true,
        cube.alphaToCoverage = true;

      let cubeMouseRotation = false;
      this.renderer.domElement.addEventListener('mousemove', (event) => {
        if (cubeMouseRotation) {
          this.controls.enablePan = false;
          this.controls.enableZoom = false;
          cube.rotation.y += event.movementX * 0.005;
          cube.rotation.x += event.movementY * 0.005;
        } else {

          this.controls.enablePan = true;
          this.controls.enableZoom = true;
        }
      });
      this.renderer.localClippingEnabled = true;
   ;
      let cut = false;

      this.gui.add({
        cutCube: () => {
          cut = !cut;
          if (cut) {
            this.renderer.clippingPlanes = [this.localPlane];

          } else {
            this.renderer.clippingPlanes = [];
          }
        }
      }, 'cutCube').name('Cut cube');

      this.gui.add({ stopCubeMouseRotation: () => (cubeMouseRotation = !cubeMouseRotation) }, 'stopCubeMouseRotation').name('E2 Cube Mouse Rotation');



      this.mixer = new THREE.AnimationMixer(e2cube.scene);
      const clips = e2cube.animations;


      let buttonAmination = false;
      this.gui.add({
        stopButtonAmination: () => {
          buttonAmination = !buttonAmination;
          clips.forEach((clip) => {
            if (buttonAmination) {
              this.mixer.clipAction(clip).play();
            } else {
              this.mixer.clipAction(clip).stop();
            }

          })
        }
      }, 'stopButtonAmination').name('Buttons Animation');

      const rotationSpeed = 0.01;
      let rotate = false;

      const rotateCube = () => {
        if (rotate) {
          cube.rotation.y += rotationSpeed;
        }
        requestAnimationFrame(rotateCube);
      };
      rotateCube();

      // Add GUI control to stop rotation
      this.gui.add({ stopRotation: () => (rotate = !rotate) }, 'stopRotation').name('E2 Cube Rotation');
      this.gui.add({ toggleOrbitsControl: () => (this.controls.enabled = !this.controls.enabled) }, 'toggleOrbitsControl').name('OrtbitsControl');
      this.animate();
    });
  }

  updateControls() {
    this.controls.update();
  }

  animate() {
    this.mixer.update(this.clock.getDelta());
    this.renderer.render(this.scene, this.camera);
    this.updateControls();
    requestAnimationFrame(() => this.animate());
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
    sphereMesh.position.set(10, 1, 0);
    pyramidMesh.position.set(17, 3, 0);
    cubeMesh.position.set(19, 4, 0);
    const clippingPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    sphereMesh.material.clippingPlanes = [clippingPlane];
    sphereMesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.computeVertexNormals();
      }
    });

    this.scene.add(sphereMesh);
    this.scene.add(pyramidMesh);
    this.scene.add(cubeMesh);
  }

  addText(scene, camera, renderer) {
    const loader = new FontLoader();

    loader.load('fonts/playwrite.json', (font) => {

      function addName(scene) {
        const arr = 'Alexander'.split('');
        arr.forEach((letter, index) => {
          const geometry = new TextGeometry(letter, {
            font: font,
            size: 1,
            depth: 0.2,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.01,
            bevelSize: 0.01,
            bevelSegments: 20
          });

          const greenMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
          const textMesh = new THREE.Mesh(geometry, greenMaterial);
          textMesh.position.x = index;
          scene.add(textMesh);

        })
      }

      addName(scene)

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();

      let red = 0;
      let green = 0;
      let blue = 0;
      const colors = [[0, 0, 255], [255, 0, 0], [0, 255, 0], [100, 100, 55]]
      function onPointerMove(event) {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
        const index = Math.floor(Math.random() * 4)
        red = Math.random();
        green = Math.random();
        blue = Math.random();
        requestAnimationFrame(() => render(scene, camera, renderer))
      }

      document.addEventListener('click', onPointerMove);

      // Animation loop
      function render(scene, camera, renderer) {
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(scene.children);

        if (intersects.length > 0) {
          const intersectedObject = intersects[0].object;
          if (intersectedObject instanceof THREE.Mesh) {
            if (intersectedObject.geometry.type === "TextGeometry") {
              intersectedObject.material.color.r = red;
              intersectedObject.material.color.g = green;
              intersectedObject.material.color.b = blue;
            }
          }
        }
        renderer.render(scene, camera);
      }
    });
  }

  addPlaneWave() {
    const geometry = new THREE.PlaneGeometry(5, 5, 36, 36);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(geometry, material);
    plane.position.set(0, 10, 0)
    this.scene.add(plane);
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
