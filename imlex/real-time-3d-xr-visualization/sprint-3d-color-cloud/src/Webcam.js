import * as THREE from "three";

export let plan, video, videoTexture;

export function applyWebcamBackground(scene) {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    const constraints = {
      video: { width: 1920, height: 1080, facingMode: "user" },
    };
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
      video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      video.onloadeddata = function () {
        videoTexture = new THREE.VideoTexture(video);
        videoTexture.minFilter = THREE.NearestFilter;
        videoTexture.magFilter = THREE.NearestFilter;
        videoTexture.generateMipmaps = false;
        videoTexture.format = THREE.RGBAFormat;
        scene.background = videoTexture;
        video.play();
      };
    });
  }
}
