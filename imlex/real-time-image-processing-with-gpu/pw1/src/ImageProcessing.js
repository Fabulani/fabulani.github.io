import * as THREE from "three";

const vtxShader = `
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    precision highp float;

    in vec3 position;

    void main() {
        gl_Position = projectionMatrix *
                    modelViewMatrix * 
                    vec4(position, 1.0);
    }
`;

const avgFragShader = `
  precision highp float;
  uniform sampler2D image;
  uniform int kernelSize;
  

  out vec4 out_FragColor;

  void main(void) {
    float colorScaleR = 1.0;
    float colorScaleG = 1.0;
    float colorScaleB = 1.0;

    vec4 textureValue = vec4 ( 0,0,0,0 );
    for (int i=-kernelSize;i<=kernelSize;i++)
      for (int j=-kernelSize;j<=kernelSize;j++)
      {
        textureValue += texelFetch( image, ivec2(i+int(gl_FragCoord.x), j+int(gl_FragCoord.y)), 0 );
      }
    textureValue /= float ((kernelSize*2+1)*(kernelSize*2+1));
    out_FragColor = vec4(vec3(colorScaleR,colorScaleG,colorScaleB),1.0)*textureValue;
  }
`;

const fragShader = `
  precision highp float;

  uniform sampler2D image;  // video texture
  uniform vec2 imageSize;   // x for width, y for height
  uniform float kernelSize;   // size of the kernel
  uniform float sigma;      // standard deviation
  uniform bool applyGaussian;        // Apply gaussian filter

  out vec4 out_FragColor;     // output color

  #define PI 3.14159265359

  float gaussian(float x, float y, float sigma) {
    // 2D Gaussian filter. Given pixel positions x,y and a sigma, return the weight
    // Source: https://homepages.inf.ed.ac.uk/rbf/HIPR2/gsmooth.htm
    float a = 1.0 / (2.0 * PI * sigma * sigma);
    float b = exp(-(x*x + y*y) / (2.0 * sigma * sigma));
    return a * b;
  }

  void main() {
    float imageWidth = imageSize.x;
    float imageHeight = imageSize.y;

    vec4 tmpColor = vec4(0.0);
    float weight = 1.0;
    float sumWeights = 0.0;
    float kd2 = floor(kernelSize/2.0);

    float posX = gl_FragCoord.x;
    float posY = gl_FragCoord.y;

    // Check if at the image boundary of x
    if (posX < kd2) {
      posX = kd2;
    } else if (posX > imageWidth - kd2) {
      posX = imageWidth - kd2 - 1.0;  // -1.0 fixes boundary error
    }

    // Check if at the image boundary of y
    if (posY < kd2) {
      posY = kd2;
    } else if (posY > imageHeight - kd2) {
      posY = imageHeight - kd2 - 1.0;  // -1.0 fixes boundary error
    }

    // compute Gaussian kernel weights
    for (float i = -kd2; i <= kd2; i++) {
      for (float j = -kd2; j <= kd2; j++) {
        // TODO: if statements for different methods, e.g. laplacian
        if (applyGaussian == true) {
          weight = gaussian(i, j, sigma);  // Calculate weight using Gaussian
        } else {
          weight = 0.0;
        }
        sumWeights += weight;

        tmpColor += texelFetch(image, ivec2(posX + i, posY + j), 0) * weight;  // Get value of the pixel and multiply by the weight
      }
    }

    // Output the normalized color value
    out_FragColor = tmpColor/sumWeights;
  }
`;

export class ImageProcessor {
  constructor(video, canvas) {
    this.image = this.processVideo(video);
    this.kernelSize = 11;
    this.sigma = 4.0;
    this.applyGaussian = true;

    this.ipMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        image: { type: "t", value: this.image },
        imageSize: { type: "vec2", value: [this.image.image.videoWidth, this.image.image.videoHeight] },
        kernelSize: { type: "i", value: this.kernelSize },
        sigma: { type: "f", value: this.sigma },
        applyGaussian: { type: "bool", value: this.applyGaussian },
      },
      vertexShader: vtxShader,
      fragmentShader: fragShader,
      glslVersion: THREE.GLSL3,
    });

    this.canvas = canvas;
    this.context = canvas.getContext("webgl2");

    this.IVimageProcessing();
  }

  processVideo(video) {
    var videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.NearestFilter;
    videoTexture.magFilter = THREE.NearestFilter;
    videoTexture.generateMipmaps = false;
    videoTexture.format = THREE.RGBAFormat;
    return videoTexture;
  }

  IVimageProcessing() {
    //3 rtt setup
    this.scene = new THREE.Scene();
    this.orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1);

    //4 create a target texture
    var options = {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      //            type:THREE.UnsignedByteType,
      canvas: this.canvas,
      context: this.context,
    };
    this.rtt = new THREE.WebGLRenderTarget(this.image.image.videoWidth, this.image.image.videoHeight, options);

    var geom = new THREE.BufferGeometry();
    geom.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0]), 3)
    );
    this.scene.add(new THREE.Mesh(geom, this.ipMaterial));
  }

  IVprocess(renderer) {
    // Off-screen rendering
    renderer.setRenderTarget(this.rtt);
    renderer.render(this.scene, this.orthoCamera);
    renderer.setRenderTarget(null);
  }
}
