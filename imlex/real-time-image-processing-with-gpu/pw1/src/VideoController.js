import * as THREE from "three";
import { ImageProcessor } from "./ImageProcessing.js";

export class VideoController {
  constructor(scene, video, canvas) {
    this.scene = scene;
    this.video = video;
    this.canvas = canvas;
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
    // Pipeline for image processing and applying the anaglyph.
    this.iProcessor = new ImageProcessor(this.video, this.canvas, this.video.videoHeight, this.video.videoWidth);

    var geometry = new THREE.PlaneGeometry(1, this.video.videoHeight / this.video.videoWidth);
    var material = new THREE.MeshBasicMaterial({
      map: this.iProcessor.rtt.texture,
      side: THREE.DoubleSide,
    });
    var videoPlane = new THREE.Mesh(geometry, material);
    videoPlane.receiveShadow = false;
    videoPlane.castShadow = false;
    videoPlane.name = "videoPlane";
    this.scene.add(videoPlane);

    this.video.play();
  }

  #pipeline() {
    // Pipeline for image processing and applying the anaglyph.
    var material = new THREE.MeshBasicMaterial({
      map: this.iProcessor.rtt.texture,
      side: THREE.DoubleSide,
    });
    var videoPlane = new THREE.Mesh(geometry, material);
    videoPlane.receiveShadow = false;
    videoPlane.castShadow = false;
    videoPlane.position.y = -0.3;
    videoPlane.name = "videoPlane";
    // Dispose of previous plane to free-up memory
    const oldVideoPlane = this.scene.getObjectByName("videoPlane");
    if (oldVideoPlane) {
      oldVideoPlane.geometry.dispose();
      this.scene.remove(oldVideoPlane);
    }
    this.scene.add(videoPlane);
  }
}
