import { initShaders } from "./utils";
import WebGLUtils from "./webgl-utils";

import vShader from "./assets/vertex-shader.vert"
import fShader from "./assets/fragment-shader.frag"
import { Context } from "./Context";

export async function setupPage() {

    const canvas = document.getElementById("canvas") as HTMLCanvasElement

    const gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        return Promise.reject("WebGL unsupported")
    }




    const shader = (await initShaders(gl, vShader, fShader))!

    const ctx = new Context(gl, shader)

    onCanvasResize(ctx, canvas, gl)
    window.onresize = () => onCanvasResize(ctx, canvas, gl)

    const doRender = () => {
        ctx.render()
        window.requestAnimationFrame(doRender)
    }
    doRender()

    return ctx
}


export function onCanvasResize(ctx: Context, canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
    const parent = canvas.parentElement!;
    canvas.height = parent.clientHeight - 2
    canvas.width = parent.clientWidth - 2

    gl.viewport(0, 0, canvas.width, canvas.height)
    ctx.aspect = canvas.width / canvas.height
    ctx.updateUniforms()
}

