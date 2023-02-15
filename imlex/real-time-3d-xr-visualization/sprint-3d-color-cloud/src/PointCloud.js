import * as THREE from "three";

export function createPointCloud(texture) {
  const vtxShader = `
    uniform sampler2D tex;
    varying vec3 color;

    void main() {
        color = texture2D ( tex, position.xy ).rgb;
        gl_PointSize = 1.0;
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

  var discret = 1;

  var colorSpaceMaterial = new THREE.ShaderMaterial({
    vertexShader: vtxShader,
    fragmentShader: fragShader,
    uniforms: {
      tex: { value: texture },
    },
  });

  const geometry = new THREE.BufferGeometry();
  const positions = [];
  let compteur = 0;
  for (let i = 0; i < texture.image.height; i += discret)
    for (let j = 0; j < texture.image.width; j += discret) {
      // positions

      const x = (i + 0.5) / texture.image.height;
      const y = (j + 0.5) / texture.image.width;
      const z = 0;

      positions.push(x, y, z);
      compteur++;
    }
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeBoundingSphere();

  const points = new THREE.Points(geometry, colorSpaceMaterial);
  return points;
}
