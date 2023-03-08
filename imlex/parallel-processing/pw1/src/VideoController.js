import * as THREE from "three";
import { ImageProcessor } from "./ImageProcessing.js";

export class VideoController {
  #videoTexture = null;

  constructor(scene, video, canvas) {
    this.scene = scene;
    this.video = video;
    this.canvas = canvas;
  }

  get videoTexture() {
    return this.#videoTexture;
  }

  setVideo(video) {
    /* Set the video source */
    this.video.src = video;
    this.video.load();
    this.video.muted = true;
    this.video.loop = true;
    this.video.onloadeddata = this.#videoOnLoadedData.bind(this);
    return;
  }

  pausePlayVideo() {
    if (!this.video.paused) {
      this.video.pause();
    } else {
      this.video.play();
    }
  }

  #videoOnLoadedData() {
    /* Update the video texture and pass it to all elements that use it */
    if (this.#videoTexture != null) {
      // Avoid memory leak
      this.#videoTexture.dispose();
    }
    this.#videoTexture = new THREE.VideoTexture(this.video);
    this.#videoTexture.minFilter = THREE.NearestFilter;
    this.#videoTexture.magFilter = THREE.NearestFilter;
    this.#videoTexture.generateMipmaps = false;
    this.#videoTexture.format = THREE.RGBAFormat;

    this.iProcessor = new ImageProcessor(
      this.#videoTexture,
      this.canvas,
      this.video.videoHeight,
      this.video.videoWidth
    );

    var geometry = new THREE.PlaneGeometry(1, this.video.videoHeight / this.video.videoWidth);
    var material = new THREE.MeshBasicMaterial({
      map: this.iProcessor.rtt.texture,
      side: THREE.DoubleSide,
    });
    var ipVideoPlane = new THREE.Mesh(geometry, material);
    ipVideoPlane.receiveShadow = false;
    ipVideoPlane.castShadow = false;
    ipVideoPlane.position.y = -0.3;
    this.scene.add(ipVideoPlane);

    var geometry2 = new THREE.PlaneGeometry(1, this.video.videoHeight / this.video.videoWidth);
    var material2 = new THREE.MeshBasicMaterial({
      map: this.#videoTexture,
      side: THREE.FrontSide,
    });
    var rawVideoPlane = new THREE.Mesh(geometry2, material2);
    rawVideoPlane.receiveShadow = false;
    rawVideoPlane.castShadow = false;
    rawVideoPlane.position.y = 0.3;
    this.scene.add(rawVideoPlane);

    this.video.play();
  }
}
