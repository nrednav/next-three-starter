import * as THREE from "three";
import { OrbitControls } from "three-stdlib";

import Tweakpane from "tweakpane";
import Stats from "stats.js";

export default function useThree() {
  return [initialize];
}

const initialize = (window, canvasRef, options) => {
  console.log("initializing");
  let frameId;
  let animationOverrides = [];

  let debug = togglePanel(options.debug, "#debug-panel", () => {
    let debugPanel = new Tweakpane({ title: "Debug" });
    debugPanel.containerElem_.id = "debug-panel";
    return debugPanel;
  });

  let stats = togglePanel(options.stats, "#stats-panel", () => {
    let statsPanel = new Stats();
    statsPanel.showPanel(0);
    statsPanel.dom.id = "stats-panel";
    document.body.appendChild(statsPanel.dom);
    return statsPanel;
  });

  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.current,
    antialias: true,
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Handle window resizing
  const handleResize = () => {
    // Update dimensions
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };
  window.addEventListener("resize", handleResize);

  // Scene
  const scene = new THREE.Scene();

  // Lighting
  const light = new THREE.DirectionalLight("#ffffff");
  light.position.set(0, 5, 5);
  scene.add(light);

  const ambientLight = new THREE.AmbientLight("#ffffff", 0.25);
  scene.add(ambientLight);

  // Camera
  const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    1000
  );
  camera.position.set(0, 0, 3);
  scene.add(camera);

  // Orbit Controls
  const orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.enableDamping = true;

  const clock = new THREE.Clock();
  const animate = () => {
    if (options.stats) stats.begin();

    const elapsedTime = clock.getElapsedTime();
    animationOverrides.forEach((override) => {
      override(elapsedTime);
    });

    orbitControls.update();
    renderer.render(scene, camera);

    if (options.stats) stats.end();

    requestAnimationFrame(animate);
  };

  const start = () => {
    if (!frameId) {
      frameId = requestAnimationFrame(animate);
    }
  };

  const stop = () => {
    cancelAnimationFrame(frameId);
    frameId = null;
    window.removeEventListener("resize", handleResize);
    cleanup(scene);
  };

  const cleanup = (obj) => {
    while (obj.children.length > 0) {
      cleanup(obj.children[0]);
      obj.remove(obj.children[0]);
    }

    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      Object.keys(obj.material).forEach((prop) => {
        if (!obj.material[prop]) return;

        if (
          obj.material[prop] !== null &&
          typeof obj.material[prop].dispose === "function"
        )
          obj.material[prop].dispose();
      });
      obj.material.dispose();
    }

    animationOverrides.length = 0;
  };

  const addObject = (obj, animationOverride = null) => {
    scene.add(obj);
    if (animationOverride) {
      animationOverrides.push(animationOverride);
    }
  };

  let output = {
    renderer,
    scene,
    camera,
  };

  if (options.debug) {
    output["debug"] = debug;
  }

  return {
    start,
    stop,
    output,
    addObject,
  };
};

const togglePanel = (show, selector, createPanel) => {
  let panel;

  const panelDomElement = document.querySelector(selector);
  if (panelDomElement) document.body.removeChild(panelDomElement);

  if (show) {
    panel = createPanel();
  }

  return panel;
};
