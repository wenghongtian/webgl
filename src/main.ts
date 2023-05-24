import { m4 } from "./m4";
import "./style.css";

function main() {
  const canvas = document.querySelector(`#canvas`) as HTMLCanvasElement;
  const gl = canvas.getContext("webgl")!;

  const program = window.webglUtils.createProgramFromScripts(gl, [
    "vertex-shader-3d",
    "fragment-shader-3d",
  ]);
  gl.useProgram(program);

  const positionLocation = gl.getAttribLocation(program, "a_position");
  const colorLocation = gl.getAttribLocation(program, "a_color");
  const matrixLocation = gl.getUniformLocation(program, "u_matrix");

  const translation = [-150, 0, -360];
  const rotation = [degToRad(190), degToRad(40), degToRad(320)];
  const scale = [1, 1, 1];
  let fov = degToRad(60);
  let cameraAngleRadians = 0;

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setGeometry(gl);

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  setColors(gl);

  drawScene();

  window.webglLessonsUI.setupSlider("#cameraAngle", {
    slide: updateCameraAngle,
    max: 360,
    min: -360,
    value: radToDeg(cameraAngleRadians),
  });
  window.webglLessonsUI.setupSlider("#fieldOfView", {
    slide: updateFieldOfView,
    max: 179,
    min: 1,
    value: radToDeg(fov),
  });
  window.webglLessonsUI.setupSlider("#x", {
    slide: updatePosition(0),
    max: gl.canvas.width,
    value: translation[0],
  });
  window.webglLessonsUI.setupSlider("#y", {
    slide: updatePosition(1),
    max: gl.canvas.height,
    value: translation[1],
  });
  window.webglLessonsUI.setupSlider("#z", {
    slide: updatePosition(2),
    max: 0,
    min: -1000,
    value: translation[2],
  });
  window.webglLessonsUI.setupSlider("#angleX", {
    slide: updateAngle(0),
    max: 360,
    value: radToDeg(rotation[0]),
  });
  window.webglLessonsUI.setupSlider("#angleY", {
    slide: updateAngle(1),
    max: 360,
    value: radToDeg(rotation[1]),
  });
  window.webglLessonsUI.setupSlider("#angleZ", {
    slide: updateAngle(2),
    max: 360,
    value: radToDeg(rotation[2]),
  });
  window.webglLessonsUI.setupSlider("#scaleX", {
    value: scale[0],
    slide: updateScale(0),
    min: -5,
    max: 5,
    step: 0.01,
    precision: 2,
  });
  window.webglLessonsUI.setupSlider("#scaleY", {
    value: scale[1],
    slide: updateScale(1),
    min: -5,
    max: 5,
    step: 0.01,
    precision: 2,
  });
  window.webglLessonsUI.setupSlider("#scaleZ", {
    value: scale[2],
    slide: updateScale(2),
    min: -5,
    max: 5,
    step: 0.01,
    precision: 2,
  });

  function updateCameraAngle(event: any, ui: { value: number }) {
    cameraAngleRadians = degToRad(ui.value);
    drawScene();
  }

  function updateFieldOfView(event: any, ui: { value: number }) {
    fov = degToRad(ui.value);
    drawScene();
  }

  function updateScale(index: number) {
    return (evt: any, ui: { value: number }) => {
      scale[index] = ui.value;
      drawScene();
    };
  }

  function updatePosition(index: number) {
    return function (event: any, ui: { value: number }) {
      translation[index] = ui.value;
      drawScene();
    };
  }

  function updateAngle(index: number) {
    return (event: any, ui: { value: number }) => {
      rotation[index] = degToRad(ui.value);
      drawScene();
    };
  }

  function drawScene() {
    window.webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // 告诉WebGL如何从裁剪空间对应到像素
    gl.viewport(
      0,
      0,
      (gl.canvas as HTMLCanvasElement).clientWidth,
      (gl.canvas as HTMLCanvasElement).clientHeight
    );

    // 清空画布
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    // 使用我们的程序
    gl.useProgram(program);

    // 启用属性
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(colorLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorLocation, 3, gl.UNSIGNED_BYTE, true, 0, 0);

    const aspect =
      (gl.canvas as HTMLCanvasElement).clientWidth /
      (gl.canvas as HTMLCanvasElement).clientHeight;
    let projectMatrix = m4.perspective(fov, aspect, 1, 2000);
    // matrix = m4.translate(
    //   matrix,
    //   translation[0],
    //   translation[1],
    //   translation[2]
    // );
    // matrix = m4.xRotate(matrix, rotation[0]);
    // matrix = m4.yRotate(matrix, rotation[1]);
    // matrix = m4.zRotate(matrix, rotation[2]);
    // matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);

    const numFs = 5;
    const radius = 200;

    let cameraMatrix = m4.yRotation(cameraAngleRadians);
    cameraMatrix = m4.translate(cameraMatrix, 0, 0, radius * 1.5);
    const viewMatrix = m4.inverse(cameraMatrix);
    const viewProjectionMatrix = m4.multiply(projectMatrix, viewMatrix);

    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / numFs;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      const matrix = m4.translate(viewProjectionMatrix, x, 0, y);

      gl.uniformMatrix4fv(matrixLocation, false, matrix);
      // 绘制矩形
      gl.drawArrays(gl.TRIANGLES, 0, 96);
    }
  }
}

function setColors(gl: WebGLRenderingContext) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Uint8Array([
      // left column front
      200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200,
      70, 120,

      // top rung front
      200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200,
      70, 120,

      // middle rung front
      200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200, 70, 120, 200,
      70, 120,

      // left column back
      80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70,
      200,

      // top rung back
      80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70,
      200,

      // middle rung back
      80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70, 200, 80, 70,
      200,

      // top
      70, 200, 210, 70, 200, 210, 70, 200, 210, 70, 200, 210, 70, 200, 210, 70,
      200, 210,

      // top rung right
      200, 200, 70, 200, 200, 70, 200, 200, 70, 200, 200, 70, 200, 200, 70, 200,
      200, 70,

      // under top rung
      210, 100, 70, 210, 100, 70, 210, 100, 70, 210, 100, 70, 210, 100, 70, 210,
      100, 70,

      // between top rung and middle
      210, 160, 70, 210, 160, 70, 210, 160, 70, 210, 160, 70, 210, 160, 70, 210,
      160, 70,

      // top of middle rung
      70, 180, 210, 70, 180, 210, 70, 180, 210, 70, 180, 210, 70, 180, 210, 70,
      180, 210,

      // right of middle rung
      100, 70, 210, 100, 70, 210, 100, 70, 210, 100, 70, 210, 100, 70, 210, 100,
      70, 210,

      // bottom of middle rung.
      76, 210, 100, 76, 210, 100, 76, 210, 100, 76, 210, 100, 76, 210, 100, 76,
      210, 100,

      // right of bottom
      140, 210, 80, 140, 210, 80, 140, 210, 80, 140, 210, 80, 140, 210, 80, 140,
      210, 80,

      // bottom
      90, 130, 110, 90, 130, 110, 90, 130, 110, 90, 130, 110, 90, 130, 110, 90,
      130, 110,

      // left side
      160, 160, 220, 160, 160, 220, 160, 160, 220, 160, 160, 220, 160, 160, 220,
      160, 160, 220,
    ]),
    gl.STATIC_DRAW
  );
}

function setGeometry(gl: WebGLRenderingContext) {
  const positions = new Float32Array([
    // left column front
    0, 0, 0, 0, 150, 0, 30, 0, 0, 0, 150, 0, 30, 150, 0, 30, 0, 0,

    // top rung front
    30, 0, 0, 30, 30, 0, 100, 0, 0, 30, 30, 0, 100, 30, 0, 100, 0, 0,

    // middle rung front
    30, 60, 0, 30, 90, 0, 67, 60, 0, 30, 90, 0, 67, 90, 0, 67, 60, 0,

    // left column back
    0, 0, 30, 30, 0, 30, 0, 150, 30, 0, 150, 30, 30, 0, 30, 30, 150, 30,

    // top rung back
    30, 0, 30, 100, 0, 30, 30, 30, 30, 30, 30, 30, 100, 0, 30, 100, 30, 30,

    // middle rung back
    30, 60, 30, 67, 60, 30, 30, 90, 30, 30, 90, 30, 67, 60, 30, 67, 90, 30,

    // top
    0, 0, 0, 100, 0, 0, 100, 0, 30, 0, 0, 0, 100, 0, 30, 0, 0, 30,

    // top rung right
    100, 0, 0, 100, 30, 0, 100, 30, 30, 100, 0, 0, 100, 30, 30, 100, 0, 30,

    // under top rung
    30, 30, 0, 30, 30, 30, 100, 30, 30, 30, 30, 0, 100, 30, 30, 100, 30, 0,

    // between top rung and middle
    30, 30, 0, 30, 60, 30, 30, 30, 30, 30, 30, 0, 30, 60, 0, 30, 60, 30,

    // top of middle rung
    30, 60, 0, 67, 60, 30, 30, 60, 30, 30, 60, 0, 67, 60, 0, 67, 60, 30,

    // right of middle rung
    67, 60, 0, 67, 90, 30, 67, 60, 30, 67, 60, 0, 67, 90, 0, 67, 90, 30,

    // bottom of middle rung.
    30, 90, 0, 30, 90, 30, 67, 90, 30, 30, 90, 0, 67, 90, 30, 67, 90, 0,

    // right of bottom
    30, 90, 0, 30, 150, 30, 30, 90, 30, 30, 90, 0, 30, 150, 0, 30, 150, 30,

    // bottom
    0, 150, 0, 0, 150, 30, 30, 150, 30, 0, 150, 0, 30, 150, 30, 30, 150, 0,

    // left side
    0, 0, 0, 0, 0, 30, 0, 150, 30, 0, 0, 0, 0, 150, 30, 0, 150, 0,
  ]);

  // Center the F around the origin and Flip it around. We do this because
  // we're in 3D now with and +Y is up where as before when we started with 2D
  // we had +Y as down.

  // We could do by changing all the values above but I'm lazy.
  // We could also do it with a matrix at draw time but you should
  // never do stuff at draw time if you can do it at init time.
  var matrix = m4.xRotation(Math.PI);
  matrix = m4.translate(matrix, -50, -75, -15);

  for (var ii = 0; ii < positions.length; ii += 3) {
    var vector = m4.vectorMultiply(
      [positions[ii + 0], positions[ii + 1], positions[ii + 2], 1],
      matrix
    );
    positions[ii + 0] = vector[0];
    positions[ii + 1] = vector[1];
    positions[ii + 2] = vector[2];
  }

  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

function degToRad(d: number) {
  return (d * Math.PI) / 180;
}

function radToDeg(r: number) {
  return (r * 180) / Math.PI;
}

main();
