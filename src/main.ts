import "./style.css";
// import * as webglUtils from "./webglUtils";

function main() {
  const canvas = document.querySelector(`#canvas`) as HTMLCanvasElement;
  const gl = canvas.getContext("webgl")!;

  const program = window.webglUtils.createProgramFromScripts(gl, [
    "vertex-shader-2d",
    "fragment-shader-2d",
  ]);
  gl.useProgram(program);

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  const resolutionUniformLocation = gl.getUniformLocation(
    program,
    "u_resolution"
  );
  const colorUniformLocation = gl.getUniformLocation(program, "u_color");
  const translationLocation = gl.getUniformLocation(program, "u_translation");
  const rotationLocation = gl.getUniformLocation(program, "u_rotation");
  const scaleLocation = gl.getUniformLocation(program, "u_scale");

  const positionBuffer = gl.createBuffer();

  const translation = [0, 0];
  const rotation = [0, 1];
  const scale = [1, 1];
  const color = [Math.random(), Math.random(), Math.random(), 1];

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setGeometry(gl);

  drawScene();

  window.webglLessonsUI.setupSlider("#x", {
    slide: updatePosition(0),
    max: gl.canvas.width,
  });
  window.webglLessonsUI.setupSlider("#y", {
    slide: updatePosition(1),
    max: gl.canvas.height,
  });
  window.webglLessonsUI.setupSlider("#angle", {
    slide: updateAngle,
    max: 360,
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
  window.$("#rotation").gmanUnitCircle({
    width: 200,
    height: 200,
    value: 0,
    slide(e: any, u: { x: number; y: number }) {
      rotation[0] = u.x;
      rotation[1] = u.y;
      drawScene();
    },
  });

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

  function updateAngle(event: any, ui: { value: number }) {
    var angleInDegrees = 360 - ui.value;
    const angleRadians = (angleInDegrees / 180) * Math.PI;
    rotation[0] = Math.sin(angleRadians);
    rotation[1] = Math.cos(angleRadians);
    drawScene();
  }

  function drawScene() {
    window.webglUtils.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);

    // 告诉WebGL如何从裁剪空间对应到像素
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // 清空画布
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 使用我们的程序
    gl.useProgram(program);

    // 启用属性
    gl.enableVertexAttribArray(positionAttributeLocation);

    // 绑定位置缓冲
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // setRectangle(gl, translation[0], translation[1], width, height);

    gl.uniform2fv(translationLocation, translation);

    // 告诉属性怎么从positionBuffer中读取数据 (ARRAY_BUFFER)
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    // 设置缩放
    gl.uniform2fv(scaleLocation, scale);

    // 设置分辨率
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    // 设置颜色
    gl.uniform4fv(colorUniformLocation, color);

    // 设置位移
    gl.uniform2fv(translationLocation, translation);

    // 设置旋转
    gl.uniform2fv(rotationLocation, rotation);

    // 绘制矩形
    gl.drawArrays(gl.TRIANGLES, 0, 18);
  }
}

function randomInt(range: number) {
  return Math.floor(Math.random() * range);
}

function setGeometry(gl: WebGLRenderingContext) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      0, 0, 30, 0, 0, 150, 0, 150, 30, 0, 30, 150,

      30, 0, 100, 0, 30, 30, 30, 30, 100, 0, 100, 30,

      30, 60, 67, 60, 30, 90, 30, 90, 67, 60, 67, 90,
    ]),
    gl.STATIC_DRAW
  );
}

function setRectangle(
  gl: WebGLRenderingContext,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const x1 = x;
  const x2 = x + width;
  const y1 = y;
  const y2 = y + height;

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
    gl.STATIC_DRAW
  );
}

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
) {
  const program = gl.createProgram()!;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.getProgramParameter(program, gl.LINK_STATUS);
  return program;
}

main();
