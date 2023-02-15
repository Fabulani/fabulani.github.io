// Fix window resize
export function onWindowResize(evt) {
  const camera = evt.currentTarget.camera;
  const renderer = evt.currentTarget.renderer;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
