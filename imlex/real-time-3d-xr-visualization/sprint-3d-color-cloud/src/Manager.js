import * as THREE from "three";
import { createCloudFromVideo } from "./Cloud.js";

export class Manager {
  #videoTexture = null;

  constructor(scene, video, constraints) {
    this.scene = scene;
    this.video = video;
    this.videoConstraints = constraints;
    this.availableDevices = {};
  }

  async getVideoDevices() {
    /* Get available video devices (e.g. webcam, phone) */
    let availableDevices = {};
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((device) => device.kind === "videoinput");
    videoDevices.map((videoDevice) => {
      availableDevices[videoDevice.label] = videoDevice.deviceId;
    });
    this.availableDevices = availableDevices;
    return availableDevices;
  }

  setDevice(deviceId) {
    /* Set the current video stream to the given device by deviceId */
    if ("mediaDevices" in navigator && navigator.mediaDevices.getUserMedia) {
      this.videoConstraints["video"]["deviceId"] = deviceId;
      navigator.mediaDevices.getUserMedia(this.videoConstraints).then((stream) => {
        this.video.srcObject = stream;
      });
    }
  }

  setVideo(video) {
    /* Set the video source */
    this.video = video;
    this.video.onloadeddata = this.#updateVideoTexture.bind(this);
    return;
  }

  #clearScene() {
    /* Dispose of unused geometries and remove from scene */
    const cloud = this.scene.getObjectByName("colorCloud");
    cloud.geometry.dispose();
    this.scene.remove(cloud);
  }

  #updateVideoTexture() {
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

    // Update background
    this.scene.background = this.#videoTexture;

    // Clear the scene to avoid memory leak
    if (this.scene.children.length > 1) {
      // First child is the 3d cube grid. Second one should be the cloud. Clear it.
      this.#clearScene();
    }

    // Add new point cloud
    const newCloud = createCloudFromVideo(this.#videoTexture);
    newCloud.name = "colorCloud";
    newCloud.position.y = 0.5; // Centered on the cube
    this.scene.add(newCloud);

    // Play
    this.playVideo();
  }

  pauseVideo() {
    this.video.pause();
  }

  playVideo() {
    this.video.play();
  }
}
