import * as THREE from "https://cdn.skypack.dev/three@0.133.1";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/controls/OrbitControls.js";

let meshes = [];
let originPosition = [];
let originalMaterials = [];
let isExploded = false; // 標記爆炸狀態
let explodedLines = [];
const explodedBtn = document.querySelector('.exploded-btn')

explodedBtn.addEventListener('click', () => {
  if (!isExploded) {
    explodeMeshes(); // 爆炸效果
    addExplodedLines();
    isExploded = true;
  } else {
    console.log('click')
    resetMeshesPosition(); // 恢復原始位置
    removeExplodedLines();
    isExploded = false;
  }
});
function explodeMeshes() {
  meshes.forEach((mesh, index) => {
    mesh.position.set(index * 0.08, 0, 0);
  });
}

function resetMeshesPosition() {
  // console.log(originPosition)
  meshes.forEach((mesh, index) => {
    mesh.position.copy(originPosition[index]);
  });
}

function addExplodedLines() {
  explodedLines = meshes.map((mesh) => {
    const edges = new THREE.EdgesGeometry(mesh.geometry);
    const outline = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x0000ff }));
    outline.scale.copy(mesh.scale);
    outline.position.copy(mesh.position);
    outline.rotation.copy(mesh.rotation);
    outline.updateMatrix();
    scene.add(outline);
    return outline;
  });
}

function removeExplodedLines() {
  explodedLines.forEach((line) => {
    scene.remove(line);
  });
  explodedLines = [];
}

const onMouseClick = () => {
  raycaster.setFromCamera(pointer, camera);
  meshes.forEach((mesh) => {
    const intersects = raycaster.intersectObject(mesh);
    if (intersects.length > 0) {
      const { url } = intersects[0].object.userData;
      window.open(url, '_blank');
      console.log(intersects[0].object)
    }
  })
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff);
document.body.appendChild(renderer.domElement);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
function onPointerMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
  // console.log(pointer)
}

window.addEventListener('mousemove', onPointerMove);
window.addEventListener('click', onMouseClick, false)

const controls = new OrbitControls(camera, renderer.domElement);

const light = new THREE.AmbientLight(0xffffff, 1.8);
scene.add(light);

const loader = new GLTFLoader();
loader.load('drill-corrected.glb', (gltf) => {
  const model = gltf.scene;
  // console.log(model)
  model.children.forEach((child, index) => {
    if (child.isMesh) {
      child.userData = {
        ...child.userDate,
        url: `http://example.com/${index}`
      };
      meshes.push(child);
      originPosition.push(child.position.clone());
      originalMaterials.push(child.material.clone());
    }
    // console.log(meshes);
    if (meshes.length >= 13) {
      meshes.forEach((mesh, index) => {
        // console.log(mesh)
        // mesh.position.set(index * 0.08, 0, 0)
        scene.add(mesh);
      })
    }
  })
})

camera.position.z = 1;

const render = () => {
  raycaster.setFromCamera(pointer, camera)
  if (isExploded) {
    // 對每個 mesh 進行偵測
    meshes.forEach((mesh) => {
      const intersects = raycaster.intersectObject(mesh);
      if (intersects.length > 0) {
        // 處理與 mesh 發生碰撞的情況
        // console.log('Intersected with mesh:', mesh);
        mesh.material.color.set(0xff0000); // 此處設置新的顏色
      } else {
        // 如果未發生碰撞，恢復原始材質
        const index = meshes.indexOf(mesh);
        if (index !== -1) {
          mesh.material = originalMaterials[index].clone();
        }
      }
    });
  }
  renderer.render(scene, camera)
}

const animate = () => {
  requestAnimationFrame(animate);
  controls.update();
  render();
}

animate();