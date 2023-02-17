import * as THREE from "three";

const vtxShader = `
  uniform sampler2D tex;
  varying vec3 color;
  uniform bool isShadow;
  uniform float glPointSize;

  void main() {
      color = texture2D ( tex, position.xy ).rgb;
      vec3 finalPosition = vec3(0.0, 0.0, 0.0);

      // If rendering the shadow, set y=0
      if (isShadow == true) {
        finalPosition = vec3(color.x, 0.0, color.z);
      } else {
        finalPosition = color;
      }
      gl_PointSize = glPointSize;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPosition-vec3(.5,.5,.5), 1.0);
  }
`;

const fragShader = `
  varying vec3 color;
  uniform bool isShadow;

  void main() {
      vec3 finalColor = vec3(0.0, 0.0, 0.0);

      // If rendering the shadow, render cloud in grayscale
      if (isShadow == true){
        float u_colorFactor = 0.1;  // 0.0 = grayscale, 1.0 = original
        float grey = 0.21 * color.x + 0.71 * color.y + 0.07 * color.z;

        float red = color.r * u_colorFactor + grey * (1.0 - u_colorFactor);
        float green = color.g * u_colorFactor + grey * (1.0 - u_colorFactor);
        float blue = color.b * u_colorFactor + grey * (1.0 - u_colorFactor);

        finalColor = vec3(red, green, blue);
      } else {
        finalColor = color;
      }
      
      gl_FragColor.rgb = finalColor;
      gl_FragColor.a = 1.0;
  }
`;

export class ColorCloud {
  #points = null;
  #shadowPoints = null;

  constructor(texture, colorSystem, name = "colorCloud", glPointSize = 2.0) {
    this.texture = texture;
    this.colorSystem = colorSystem;
    this.name = name;
    this.glPointSize = 2.0;

    this.#init();
  }

  get points() {
    return this.#points;
  }

  get shadow() {
    return this.#shadowPoints;
  }

  #init() {
    this.#points = this.createPoints();
    this.#shadowPoints = this.createPoints({ isShadow: true });
  }

  createPoints({ isShadow } = { isShadow: false }) {
    const colorSpaceMaterial = new THREE.ShaderMaterial({
      vertexShader: vtxShader,
      fragmentShader: fragShader,
      uniforms: {
        tex: { value: this.texture },
        glPointSize: { value: this.glPointSize },
        isShadow: { value: isShadow },
      },
    });

    var discret = 1;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    let compteur = 0;

    const h = this.texture.image.videoHeight;
    const w = this.texture.image.videoWidth;

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
    points.position.y = 0.5; // center on the cube
    points.name = isShadow ? this.name + "-shadow" : this.name;
    return points;
  }
}
