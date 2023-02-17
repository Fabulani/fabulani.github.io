import { GUI } from "three/addons/libs/lil-gui.module.min.js";

// Setup the GUI
export function setupGUI(manager) {
  // Top level controller
  const gui = new GUI({ title: "Color Cloud" });

  // Get available video streams
  manager.getVideoDevices().then((availableDevices) => {
    // Settings
    const settings = {
      selectedDevice: Object.keys(availableDevices)[0],
      playVideo: manager.playVideo.bind(manager),
      pauseVideo: manager.pauseVideo.bind(manager),
    };

    gui
      .add(settings, "selectedDevice", availableDevices)
      .name("Camera")
      .onChange((value) => {
        manager.setDevice(value);
      });

    gui.add(settings, "playVideo").name("Play");
    gui.add(settings, "pauseVideo").name("Pause");
  });
}
