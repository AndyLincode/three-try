import * as THREE from "https://cdn.skypack.dev/three@0.133.1";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/controls/OrbitControls.js";
import * as TWEEN from '@tweenjs/tween.js';


let meshes = [];
let originPosition = [];
let originalMaterials = [];
let isExploded = false; // 標記爆炸狀態
let explodedLines = [];
const explodedBtn = document.querySelector('.exploded-btn')

// 按鈕監聽點擊爆炸 explodeMeshes
explodedBtn.addEventListener('click', () => {
  if (!isExploded) {
    explodeMeshes(); // 爆炸效果
    isExploded = true;
  } else {
    console.log('click')
    resetMeshesPosition(); // 恢復原始位置
    isExploded = false;
  }
});
// 爆炸 function
const explodeMeshes = () => {
  // console.log(camera)
  const tweenDuration = 1000;

  // 計算產品中心點
  const center = calculateCenter();

  meshes.forEach((mesh, index) => {
    // 計算相對於中心點的位移
    const offsetX = mesh.position.x - center.x;
    const targetPosition = new THREE.Vector3(mesh.position.x + offsetX * 5, mesh.position.y, mesh.position.z);
    // const targetPosition = new THREE.Vector3(index * 0.08, 0, 0);
    new TWEEN.Tween(mesh.position)
      .to(targetPosition, tweenDuration)
      .start();
  });
}
// reset function
const resetMeshesPosition = () => {
  const tweenDuration = 1000;
  // console.log(originPosition)
  meshes.forEach((mesh, index) => {
    const originPos = originPosition[index];
    new TWEEN.Tween(mesh.position)
      .to(originPos, tweenDuration)
      .start();
  });
}

// 計算產品中心點 function
const calculateCenter = () => {
  // 計算所有 meshes 的平均位置以獲得產品中心點
  const center = new THREE.Vector3();
  meshes.forEach((mesh) => {
    center.add(mesh.position);
  });
  center.divideScalar(meshes.length);

  return center;
}


// 點擊前往超連結
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
// hover function 改鼠標樣式
const onPointerHover = () => {
  raycaster.setFromCamera(pointer, camera);
  let isIntersected = false;

  meshes.forEach((mesh) => {
    const intersects = raycaster.intersectObject(mesh);
    if (intersects.length > 0) {
      isIntersected = true;
      document.body.style.cursor = 'pointer'; // 更改游標樣式
    }
  });

  if (!isIntersected) {
    document.body.style.cursor = 'auto'; // 如果未與任何 mesh 碰撞，恢復為預設樣式
  }
};
// 建立場景
const scene = new THREE.Scene();
// 建立camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// render
const renderer = new THREE.WebGLRenderer();
// 畫質
renderer.setPixelRatio(window.devicePixelRatio);
// 大小
renderer.setSize(window.innerWidth, window.innerHeight);
// 背景色
renderer.setClearColor(0xffffff);
// 新增到畫面上
document.querySelector('.container').appendChild(renderer.domElement);

// 雷射(偵測滑鼠是否與物件碰撞)
const raycaster = new THREE.Raycaster();
// 滑鼠座標物件
const pointer = new THREE.Vector2();
// 滑鼠移動座標
const onPointerMove = (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
  // console.log(pointer)
}
// 監聽滑鼠移動座標
window.addEventListener('mousemove', onPointerMove);
// 監聽滑鼠移動是否hover物件
window.addEventListener('mousemove', onPointerHover);
// 監聽滑鼠點擊(超連結)
window.addEventListener('click', onMouseClick, false)

// 可控制視角(放大縮小、轉動)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableRotate = false;

// 環境光線
const light = new THREE.AmbientLight(0xffffff, 1.8);
scene.add(light);

// 載入3D模組
const loader = new GLTFLoader();
loader.load('drill-corrected.glb', (gltf) => {
  const model = gltf.scene;
  // console.log(model)
  model.children.forEach((child, index) => {
    if (child.isMesh) {
      // console.log(child)
      child.userData = {
        ...child.userDate,
        url: `http://localhost:5173/components?id=${child.name}`
      };
      meshes.push(child);
      originPosition.push(child.position.clone());
      originalMaterials.push(child.material.clone());
    }
    if (meshes.length >= 13) {
      meshes.forEach((mesh, index) => {
        // console.log(mesh)
        // mesh.position.set(index * 0.08, 0, 0)
        scene.add(mesh);
      })
    }
  })
})

// camera 視角調整
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
  TWEEN.update();
  render();
}

animate();