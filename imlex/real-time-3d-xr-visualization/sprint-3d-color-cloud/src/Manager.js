import * as THREE from "three";
import { createCloudFromVideo } from "/src/Cloud.js";

export class Manager {
  #videoTexture = null;

  constructor(scene, video) {
    this.scene = scene;
    this.video = video;
  }

  setVideo(video) {
    this.video = video;
    this.video.onloadeddata = this.#updateVideoTexture.bind(this);
    this.video.play();
    return;
  }

  #updateVideoTexture() {
    if (this.#videoTexture != null) {
      // Avoid memory leak
      this.#videoTexture.dispose();
    }
    this.#videoTexture = new THREE.VideoTexture(this.video);
    this.#videoTexture.minFilter = THREE.NearestFilter;
    this.#videoTexture.magFilter = THREE.NearestFilter;
    this.#videoTexture.generateMipmaps = false;
    this.#videoTexture.format = THREE.RGBAFormat;

    // Update background
    this.scene.background = this.#videoTexture;

    // Update color cloud
    const oldCloud = this.scene.getObjectByName("colorCloud");
    if (oldCloud) {
      oldCloud.dispose();
    }
    const newCloud = createCloudFromVideo(this.#videoTexture);
    newCloud.name = "colorCloud";
    newCloud.position.y = 0.5; // Centered on the cube
    this.scene.add(newCloud);
  }
}
