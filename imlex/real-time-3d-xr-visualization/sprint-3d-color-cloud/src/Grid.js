import * as THREE from "three";

export function createGrid() {
  // Group object
  const grid = new THREE.Object3D();
  grid.name = "3d-cube-grid";

  // Add grid
  const size = 1;
  const divisions = 10;
  const gridHelper = new THREE.GridHelper(size, divisions);
  grid.add(gridHelper);

  // Add transparent cube
  const cubeGeometry = new THREE.BoxGeometry(size, size, size);
  const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.position.y = size / 2;
  cube.material.transparent = true;
  cube.material.opacity = 0.1;
  grid.add(cube);

  // Add axis for RGB. Groups:
  const xAxis = new THREE.Object3D();
  xAxis.position.z = -size / 2;
  xAxis.rotation.z = Math.PI / 2;
  const yAxis = new THREE.Object3D();
  const zAxis = new THREE.Object3D();
  grid.add(xAxis);
  grid.add(yAxis);
  grid.add(zAxis);

  // Same geometry for all axis
  const lineGeometry = new THREE.CylinderGeometry(size / 100, size / 100, size, 32);
  const arrowGeometry = new THREE.ConeGeometry(size / 40, size / 10, 32);

  // X axis line
  const xMaterial = new THREE.MeshBasicMaterial();
  const xLine = new THREE.Mesh(lineGeometry, xMaterial);
  xLine.material.color.set("red");
  xAxis.add(xLine);

  // X axis arrow
  const xArrow = new THREE.Mesh(arrowGeometry, xMaterial);
  xArrow.position.y = -size / 2 - size / 20;
  xArrow.rotation.x = Math.PI;
  xAxis.add(xArrow);

  // Y axis line
  const yMaterial = new THREE.MeshBasicMaterial();
  const yLine = new THREE.Mesh(lineGeometry, yMaterial);
  yAxis.add(yLine);
  yLine.material.color.set("green");
  yAxis.position.set(-size / 2, 0, 0);
  yAxis.rotation.x = Math.PI / 2;

  // Y axis arrow
  const yArrow = new THREE.Mesh(arrowGeometry, yMaterial);
  yArrow.position.y = size / 2 + size / 20;
  yAxis.add(yArrow);

  // Z axis line
  const zMaterial = new THREE.MeshBasicMaterial();
  const zLine = new THREE.Mesh(lineGeometry, zMaterial);
  zLine.material.color.set("blue");
  zAxis.position.set(-size / 2, size / 2, -size / 2);
  zAxis.add(zLine);

  // Z axis arrow
  const zArrow = new THREE.Mesh(arrowGeometry, zMaterial);
  zArrow.position.y = size / 2 + size / 20;
  zAxis.add(zArrow);

  return grid;
}
