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

const fragShader = `
    precision highp float;
    uniform sampler2D image;
    uniform int kernelSize;
    uniform float colorScaleR;
    uniform float colorScaleG;
    uniform float colorScaleB;
    uniform bool invert;

    out vec4 out_FragColor;

    void main(void) {
        vec4 textureValue = vec4 ( 0,0,0,0 );
        for (int i=-kernelSize;i<=kernelSize;i++)
            for (int j=-kernelSize;j<=kernelSize;j++)
            {
                textureValue += texelFetch( image, ivec2(i+int(gl_FragCoord.x), j+int(gl_FragCoord.y)), 0 );
            }
        textureValue /= float ((kernelSize*2+1)*(kernelSize*2+1));
        out_FragColor = vec4(vec3(colorScaleR,colorScaleG,colorScaleB),1.0)*textureValue;
        if (invert)
        {
            out_FragColor = vec4(1,1,1,0) - out_FragColor;
            out_FragColor.a = 1.0;
        }
    }
`;

const convGaussianFragShader = `
    precision highp float;
    uniform sampler2D image;
    uniform int kernelSize;

    out vec4 out_FragColor;

    #define PI 3.14159265359
    #define E 2.71828182846

    void main(void) {
        vec4 textureValue = vec4 ( 0,0,0,0 );
        for (int i=-kernelSize;i<=kernelSize;i++)
            for (int j=-kernelSize;j<=kernelSize;j++)
            {
                textureValue += texelFetch( image, ivec2(i+int(gl_FragCoord.x), j+int(gl_FragCoord.y)), 0 );
            }
        textureValue /= float ((kernelSize*2+1)*(kernelSize*2+1));
        out_FragColor = vec4(1.0, 1.0, 1.0, 1.0)*textureValue;


        
        //failsafe so we can use turn off the blur by setting the deviation to 0
        if(_StandardDeviation == 0)
            return tex2D(_MainTex, i.uv);

        //calculate the result of the gaussian function
        float stDevSquared = _StandardDeviation*_StandardDeviation;
        float gauss = (1 / sqrt(2*PI*stDevSquared)) * pow(E, -((offset*offset)/(2*stDevSquared)));


    }
`;

export class ImageProcessor {
  constructor(videoTexture, canvas, height, width) {
    this.ipMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        kernelSize: { type: "i", value: 5 },
        image: { type: "t", value: videoTexture },
      },
      vertexShader: vtxShader,
      fragmentShader: convGaussianFragShader,
      glslVersion: THREE.GLSL3,
    });

    this.canvas = canvas;
    this.context = canvas.getContext("webgl2");

    this.IVimageProcessing(height, width);
  }

  IVimageProcessing(height, width) {
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
    this.rtt = new THREE.WebGLRenderTarget(width, height, options);

    var geom = new THREE.BufferGeometry();
    geom.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0]), 3)
    );
    this.scene.add(new THREE.Mesh(geom, this.ipMaterial));
  }

  IVprocess(renderer) {
    renderer.setRenderTarget(this.rtt);
    renderer.render(this.scene, this.orthoCamera);
    renderer.setRenderTarget(null);
  }
}
