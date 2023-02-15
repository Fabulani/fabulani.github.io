import * as THREE from "three";

export function createGrid() {
  // Group object
  const grid = new THREE.Object3D();

  // Add grid
  const size = 255;
  const divisions = 17;
  const gridHelper = new THREE.GridHelper(size, divisions);
  grid.add(gridHelper);

  // Add transparent cube
  const cubeGeometry = new THREE.BoxGeometry(255, 255, 255);
  const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.position.y = 127.5;
  cube.material.transparent = true;
  cube.material.opacity = 0.1;
  grid.add(cube);

  // Add axis for RGB. Groups:
  const xAxis = new THREE.Object3D();
  xAxis.position.z = -127.5;
  xAxis.rotation.z = Math.PI / 2;
  const yAxis = new THREE.Object3D();
  const zAxis = new THREE.Object3D();
  grid.add(xAxis);
  grid.add(yAxis);
  grid.add(zAxis);

  // Same geometry for all axis
  const lineGeometry = new THREE.CylinderGeometry(1, 1, 255, 32);
  const arrowGeometry = new THREE.ConeGeometry(2.5, 10, 32);

  // X axis line
  const xMaterial = new THREE.MeshBasicMaterial();
  const xLine = new THREE.Mesh(lineGeometry, xMaterial);
  xLine.material.color.set("red");
  xAxis.add(xLine);

  // X axis arrow
  const xArrow = new THREE.Mesh(arrowGeometry, xMaterial);
  xArrow.position.y = -127.5;
  xArrow.rotation.x = Math.PI;
  xAxis.add(xArrow);

  // Y axis line
  const yMaterial = new THREE.MeshBasicMaterial();
  const yLine = new THREE.Mesh(lineGeometry, yMaterial);
  yAxis.add(yLine);
  yLine.material.color.set("green");
  yAxis.position.set(-127.5, 0, 0);
  yAxis.rotation.x = Math.PI / 2;

  // Y axis arrow
  const yArrow = new THREE.Mesh(arrowGeometry, yMaterial);
  yArrow.position.y = 127.5;
  yAxis.add(yArrow);

  // Z axis line
  const zMaterial = new THREE.MeshBasicMaterial();
  const zLine = new THREE.Mesh(lineGeometry, zMaterial);
  zLine.material.color.set("blue");
  zAxis.position.set(-127.5, 127.5, -127.5);
  zAxis.add(zLine);

  // Z axis arrow
  const zArrow = new THREE.Mesh(arrowGeometry, zMaterial);
  zArrow.position.y = 127.5;
  zAxis.add(zArrow);

  return grid;
}
