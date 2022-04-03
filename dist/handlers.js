import {getColor, initShaders} from "./utils.js";
import WebGLUtils from "./webgl-utils.js";
import vShader from "./assets/vertex-shader.vert.proxy.js";
import fShader from "./assets/fragment-shader.frag.proxy.js";
import {Context} from "./Context.js";
import {vec4} from "../_snowpack/pkg/gl-matrix.js";
import {setupTransformHandler} from "./transformHandler.js";
export async function setupPage() {
  setupInputWheel();
  const canvas = document.getElementById("canvas");
  const gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    return Promise.reject("WebGL unsupported");
  }
  const shader = await initShaders(gl, vShader, fShader);
  const ctx = new Context(gl, shader);
  setupUniformHandler(ctx);
  setupTransformHandler(ctx, canvas);
  onCanvasResize(ctx, canvas, gl);
  window.onresize = () => onCanvasResize(ctx, canvas, gl);
  const doRender = () => {
    ctx.render();
    window.requestAnimationFrame(doRender);
  };
  doRender();
  return ctx;
}
export function onCanvasResize(ctx, canvas, gl) {
  const parent = canvas.parentElement;
  canvas.height = parent.clientHeight - 2;
  canvas.width = parent.clientWidth - 2;
  gl.viewport(0, 0, canvas.width, canvas.height);
  ctx.aspect = canvas.width / canvas.height;
  ctx.updateUniforms();
}
function setupInputWheel() {
  const elements = document.querySelectorAll("input[type=number]");
  for (const el of elements) {
    const input = el;
    input.addEventListener("wheel", function(ev) {
      let newVal = 0;
      if (ev.deltaY > 0) {
        newVal = parseInt(this.value) + 1;
      } else {
        newVal = parseInt(this.value) - 1;
      }
      if (isNaN(newVal)) {
        newVal = 0;
      }
      this.value = newVal.toString();
      el.dispatchEvent(new Event("change"));
      return false;
    }, {passive: true});
  }
}
function addUniformColorHandler(ctx, key, inputId) {
  const el = document.getElementById(inputId);
  const [r, g, b] = getColor(el);
  ctx[key] = vec4.fromValues(r, g, b, 1);
  el.addEventListener("change", (_) => {
    const [r2, g2, b2] = getColor(el);
    ctx[key] = vec4.fromValues(r2, g2, b2, 1);
    ctx.updateUniforms();
  });
}
function setupUniformHandler(ctx) {
  addUniformColorHandler(ctx, "lightAmbient", "lightAmbient");
  addUniformColorHandler(ctx, "lightDiffuse", "lightDiffuse");
  addUniformColorHandler(ctx, "lightSpecular", "lightSpecular");
  addUniformColorHandler(ctx, "materialAmbient", "materialAmbient");
  addUniformColorHandler(ctx, "materialDiffuse", "materialDiffuse");
  addUniformColorHandler(ctx, "materialSpecular", "materialSpecular");
  const materialShininess = document.getElementById("materialShininess");
  ctx.materialShininess = parseFloat(materialShininess.value);
  materialShininess.addEventListener("change", () => {
    ctx.materialShininess = parseFloat(materialShininess.value);
    ctx.updateUniforms();
  });
  const lightPositionX = document.getElementById("lightPositionX");
  const lightPositionY = document.getElementById("lightPositionY");
  const lightPositionZ = document.getElementById("lightPositionZ");
  const lightPositionW = document.getElementById("lightPositionW");
  const handlePosChange = () => {
    ctx.lightPosition = vec4.fromValues(parseFloat(lightPositionX.value), parseFloat(lightPositionY.value), parseFloat(lightPositionZ.value), parseFloat(lightPositionW.value));
    ctx.updateUniforms();
  };
  handlePosChange();
  lightPositionX.addEventListener("change", handlePosChange);
  lightPositionY.addEventListener("change", handlePosChange);
  lightPositionZ.addEventListener("change", handlePosChange);
  lightPositionW.addEventListener("change", handlePosChange);
}
