import { GUI } from "three/addons/libs/lil-gui.module.min.js";

// Setup the GUI
export function setupGui(videoController) {
  // Top level controller
  const gui = new GUI({ title: "Shader Image Processing" });

  // Settings
  const settings = {
    pausePlayVideo: videoController.pausePlayVideo.bind(videoController),
    setVideo: "video.mp4",
  };

  gui
    .add(settings, "setVideo", { city: "video.mp4", moon: "moon.mp4" })
    .name("Choose video")
    .onChange((value) => {
      videoController.setVideo(value);
    });

  gui.add(settings, "pausePlayVideo").name("Pause | Play");
}
