import Head from "next/head";
import { useRef, useEffect } from "react";

import * as THREE from "three";
import useThree from "../hooks/useThree";

export default function Home() {
  const canvasRef = useRef(null);
  const [initialize] = useThree();

  useEffect(() => {
    const options = {
      stats: true,
      debug: true,
    };
    const debugParams = {
      cube: {
        color: "#7B68EE",
      },
    };
    const { start, stop, addObject, output } = initialize(
      window,
      canvasRef,
      options
    );

    output.camera.position.set(0, 1.5, 2);

    const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: debugParams.cube.color,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = "cube";
    addObject(mesh, (elapsedTime) => (mesh.rotation.y = elapsedTime));

    // Debug
    if (options.debug) {
      const { debug, scene } = output;

      const cubeFolder = debug.addFolder({ title: "Cube" });
      cubeFolder
        .addInput(debugParams.cube, "color")
        .on("change", (ev) =>
          scene.getObjectByName("cube").material.color.set(ev.value)
        );
    }

    start();

    return () => {
      stop();
    };
  }, []);

  return (
    <div>
      <Head>
        <title>Next Three Starter</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <canvas id="webgl" ref={canvasRef}></canvas>
    </div>
  );
}
