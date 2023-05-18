import "./style.css";
import * as webglUtils from "./webglUtils";

const translation = [0, 0];
const width = 100;
const height = 30;
const color = [Math.random(), Math.random(), Math.random(), 1];

function main() {
  const canvas = document.querySelector(`#canvas`) as HTMLCanvasElement;
  const gl = canvas.getContext("webgl")!;

  const vertexShaderSource =
    document.querySelector("#vertex-shader-2d")!.textContent!;
  const fragmentShaderSource = document.querySelector("#fragment-shader-2d")!
    .textContent!;

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

  const program = createProgram(gl, vertexShader, fragmentShader);

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  const resolutionUniformLocation = gl.getUniformLocation(
    program,
    "u_resolution"
  );

  const colorUniformLocation = gl.getUniformLocation(program, "u_color");

  const positionBuffer = gl.createBuffer();

  drawScene();

  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);

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

    setRectangle(gl, translation[0], translation[1], width, height);

    // 告诉属性怎么从positionBuffer中读取数据 (ARRAY_BUFFER)
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    // 设置分辨率
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    // 设置颜色
    gl.uniform4fv(colorUniformLocation, color);

    // 绘制矩形
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}

function randomInt(range: number) {
  return Math.floor(Math.random() * range);
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
