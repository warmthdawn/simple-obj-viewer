import axios from "axios";
import lo from "lodash"
export async function initShaders(gl: WebGLRenderingContext, vShader: string, fShader: string) {

    const [vertexShader, fragmentShader] = await Promise.all([getShader(gl, vShader, gl.VERTEX_SHADER), getShader(gl, fShader, gl.FRAGMENT_SHADER)])
    const program = gl.createProgram();

    if (vertexShader == null || fragmentShader == null || program == null) {
        return null
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error("Could not initialise shaders");
    }

    return program;
}


function getShader(gl: WebGLRenderingContext, shaderRef: string, type: number): Promise<WebGLShader> {
    console.log("loading shader: ", shaderRef)
    return new Promise((resolve, reject) => {

        axios.get(shaderRef).then(resp => {
            const shaderScript = resp.data as string;

            const shader = gl.createShader(type)!;
            gl.shaderSource(shader, shaderScript);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                reject(new Error(gl.getShaderInfoLog(shader) ?? "Unknown Error"))
            }
            resolve(shader);
        })


    })
}

export function flatten(v: ArrayLike<number>[] | ArrayLike<number>) {
    return new Float32Array(lo.flatten(v as any))
}

export function getColor(input: HTMLInputElement) {
    let hex = input.value
    hex = hex.replace(/#/g, '');
    if (hex.length === 3) {
        hex = hex.split('').map(function (hex) {
            return hex + hex;
        }).join('');
    }
    // validate hex format
    var result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})[\da-z]{0,0}$/i.exec(hex);
    if (result) {
        var red = parseInt(result[1], 16) / 255;
        var green = parseInt(result[2], 16) / 255;
        var blue = parseInt(result[3], 16) / 255;

        return [red, green, blue];
    } else {
        // invalid color
        return [1.0, 0.776, 0.863];
    }
}