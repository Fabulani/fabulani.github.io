import * as THREE from "three";

export function createCloudFromVideo(texture) {
  const vtxShader = `
      uniform sampler2D tex;
      varying vec3 color;
  
      void main() {
          color = texture2D ( tex, position.xy ).rgb;
          gl_PointSize = 3.0;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(color-vec3(.5,.5,.5), 1.0);
      }
    `;
  const fragShader = `
      varying vec3 color;
  
      void main() {
          gl_FragColor.rgb = color;
          gl_FragColor.a = 1.0;
      }
    `;

  var colorSpaceMaterial = new THREE.ShaderMaterial({
    vertexShader: vtxShader,
    fragmentShader: fragShader,
    uniforms: {
      tex: { value: texture },
    },
  });

  var discret = 1;
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  let compteur = 0;

  const h = texture.image.videoHeight;
  const w = texture.image.videoWidth;

  for (let i = 0; i < h; i += discret)
    for (let j = 0; j < w; j += discret) {
      // positions

      const x = (i + 0.5) / h;
      const y = (j + 0.5) / w;
      const z = 0;

      positions.push(x, y, z);
      compteur++;
    }
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeBoundingSphere();

  const points = new THREE.Points(geometry, colorSpaceMaterial);
  return points;
}
