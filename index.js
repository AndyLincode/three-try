import * as THREE from "https://cdn.skypack.dev/three@0.133.1";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/controls/OrbitControls.js";

// 創建場景
const scene = new THREE.Scene()
// 創建camera (fov,aspect ratio,near,far)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// orbit control (控制視角、放大縮小)
const controls = new OrbitControls(camera, renderer.domElement);

// 建立物件(SphereGeometry球體)
const geometry = new THREE.SphereGeometry(1, 32, 16);
// 建立材質(純顏色)
// const material = new THREE.MeshBasicMaterial({ color: 0x015981 });
// 建立材質(圖片)
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('textures2.jpeg')
const material = new THREE.MeshBasicMaterial({ map: texture });

const sphere = new THREE.Mesh(geometry, material);
// 場景加入球體
scene.add(sphere)

camera.position.z = 5;

const animate = () => {
  sphere.rotation.x += 0.01;
  sphere.rotation.y += 0.01;
  requestAnimationFrame(animate);
  // 增加控制要加每秒update
  controls.update();
  renderer.render(scene, camera);
}

animate();
