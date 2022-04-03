import { getColor, initShaders } from "./utils";
import WebGLUtils from "./webgl-utils";

import vShader from "./assets/vertex-shader.vert"
import fShader from "./assets/fragment-shader.frag"
import defaultModel from "./assets/kitten.obj"
import { Context, ObjectModel } from "./Context";
import { vec3, vec4 } from "gl-matrix";
import { setupTransformHandler } from "./transformHandler";
import axios from "axios";

export async function setupPage() {
    //初始化相关
    setupInputWheel()
    const canvas = document.getElementById("canvas") as HTMLCanvasElement

    const gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        return Promise.reject("WebGL unsupported")
    }

    const shader = (await initShaders(gl, vShader, fShader))!

    const ctx = new Context(gl, shader)

    setupUniformHandler(ctx)
    setupTransformHandler(ctx, canvas)
    onCanvasResize(ctx, canvas, gl)
    window.onresize = () => onCanvasResize(ctx, canvas, gl)

    const doRender = () => {
        if (ctx.loaded) {
            ctx.render()
        }
        window.requestAnimationFrame(doRender)
    }
    doRender()

    document.getElementById("loadDefault")?.addEventListener('click', () => {
        loadDefaultModel(ctx).catch(err => alert(err))
    })

    return ctx
}


export async function loadDefaultModel(ctx: Context) {
    const resp = await axios.get(defaultModel);
    const model = new ObjectModel()
    model.load(resp.data)
    ctx.loadModel(model)
    document.getElementById("canvas-tooltip")?.remove()
}

export function onCanvasResize(ctx: Context, canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
    const parent = canvas.parentElement!;
    canvas.height = parent.clientHeight - 2
    canvas.width = parent.clientWidth - 2

    gl.viewport(0, 0, canvas.width, canvas.height)
    ctx.aspect = canvas.width / canvas.height
    ctx.updateUniforms()
}


function setupInputWheel() {
    const elements = document.querySelectorAll("input[type=number]")
    for (const el of elements) {
        const input = el as HTMLInputElement
        input.addEventListener('wheel', function (ev) {
            let newVal = 0
            if (ev.deltaY > 0) {
                newVal = parseInt(this.value) + 1
            } else {
                newVal = parseInt(this.value) - 1
            }
            if (isNaN(newVal)) {
                newVal = 0
            }
            this.value = newVal.toString()
            el.dispatchEvent(new Event('change'))
            return false;
        }, { passive: true })

    }
}

type KeyOfValue<T, V> = keyof {
    [P in keyof T as T[P] extends V ? P : never]: T[P]
}

function addUniformColorHandler(ctx: Context, key: KeyOfValue<Context, vec4>, inputId: string) {
    const el = document.getElementById(inputId) as HTMLInputElement;
    const [r, g, b] = getColor(el)
    ctx[key] = vec4.fromValues(r, g, b, 1)
    el.addEventListener('change', _ => {
        const [r, g, b] = getColor(el)
        ctx[key] = vec4.fromValues(r, g, b, 1)
        ctx.updateUniforms()
    })
}


function setupUniformHandler(ctx: Context) {
    //Uniform更新相关
    addUniformColorHandler(ctx, 'lightAmbient', 'lightAmbient')
    addUniformColorHandler(ctx, 'lightDiffuse', 'lightDiffuse')
    addUniformColorHandler(ctx, 'lightSpecular', 'lightSpecular')
    addUniformColorHandler(ctx, 'materialAmbient', 'materialAmbient')
    addUniformColorHandler(ctx, 'materialDiffuse', 'materialDiffuse')
    addUniformColorHandler(ctx, 'materialSpecular', 'materialSpecular')

    const materialShininess = document.getElementById('materialShininess') as HTMLInputElement;
    ctx.materialShininess = parseFloat(materialShininess.value)
    materialShininess.addEventListener('change', () => {
        ctx.materialShininess = parseFloat(materialShininess.value)
        ctx.updateUniforms()
    })


    const lightPositionX = document.getElementById('lightPositionX') as HTMLInputElement;
    const lightPositionY = document.getElementById('lightPositionY') as HTMLInputElement;
    const lightPositionZ = document.getElementById('lightPositionZ') as HTMLInputElement;
    const lightPositionW = document.getElementById('lightPositionW') as HTMLInputElement;

    const handlePosChange = () => {
        ctx.lightPosition = vec4.fromValues(
            parseFloat(lightPositionX.value),
            parseFloat(lightPositionY.value),
            parseFloat(lightPositionZ.value),
            parseFloat(lightPositionW.value),
        )
        ctx.updateUniforms()
    }
    handlePosChange()
    lightPositionX.addEventListener('change', handlePosChange)
    lightPositionY.addEventListener('change', handlePosChange)
    lightPositionZ.addEventListener('change', handlePosChange)
    lightPositionW.addEventListener('change', handlePosChange)

}
