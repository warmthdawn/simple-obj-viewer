import { glMatrix, mat3, mat4, vec3, vec4 } from "gl-matrix"
import { flatten } from "./utils"

glMatrix.setMatrixArrayType(Array)
export class Context {
    gl: WebGLRenderingContext
    shader: WebGLProgram

    nBuffer: WebGLBuffer
    vBuffer: WebGLBuffer
    vertNumber: number = 0

    aspect = 1




    lightPosition = vec4.fromValues(10.0, 10.0, 10.0, 0.0);
    lightAmbient = vec4.fromValues(0.2, 0.2, 0.2, 1.0);
    lightDiffuse = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
    lightSpecular = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
    materialAmbient = vec4.fromValues(1.0, 0.0, 1.0, 1.0);
    materialDiffuse = vec4.fromValues(1.0, 0.8, 0.0, 1.0);
    materialSpecular = vec4.fromValues(1.0, 0.8, 0.0, 1.0);
    materialShininess = 10.0;



    constructor(gl: WebGLRenderingContext, shader: WebGLProgram) {
        this.gl = gl
        this.shader = shader
        gl.useProgram(shader)
        this.vBuffer = gl.createBuffer()!;
        this.nBuffer = gl.createBuffer()!;
        gl.enable(gl.DEPTH_TEST);



        this.updateUniforms()

    }


    loadModel(model: ObjectModel) {
        const buf = model.toBuffer()
        this.vertNumber = buf.vertNumber

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBuffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, buf.points, this.gl.STATIC_DRAW)
        const vPosition = this.gl.getAttribLocation(this.shader, "vPosition");
        this.gl.vertexAttribPointer(vPosition, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(vPosition);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nBuffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, buf.normals, this.gl.STATIC_DRAW)
        const vNormal = this.gl.getAttribLocation(this.shader, "vNormal");
        this.gl.vertexAttribPointer(vNormal, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(vNormal);

    }


    updateUniforms() {

        const viewerPos = vec3.fromValues(0.0, 0.0, -20.0);

        const projection = mat4.ortho(mat4.create(), -1.3 * this.aspect, 1.3* this.aspect, -1.3, 1.3, -200, 200);
        const ambientProduct = vec4.mul(vec4.create(), this.lightAmbient, this.materialAmbient);
        const diffuseProduct = vec4.mul(vec4.create(), this.lightDiffuse, this.materialDiffuse);
        const specularProduct = vec4.mul(vec4.create(), this.lightSpecular, this.materialSpecular);

        this.gl.uniform4fv(this.gl.getUniformLocation(this.shader, "ambientProduct"),
            flatten(ambientProduct));
        this.gl.uniform4fv(this.gl.getUniformLocation(this.shader, "diffuseProduct"),
            flatten(diffuseProduct));
        this.gl.uniform4fv(this.gl.getUniformLocation(this.shader, "specularProduct"),
            flatten(specularProduct));
        this.gl.uniform4fv(this.gl.getUniformLocation(this.shader, "lightPosition"),
            flatten(this.lightPosition));
        this.gl.uniform1f(this.gl.getUniformLocation(this.shader,
            "shininess"), this.materialShininess);

        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shader, "projectionMatrix"),
            false, flatten(projection));

    }

    render() {

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        let modelView = mat4.create();
        // mat4.rotateX(modelView, )
        // modelView = mat4.translate(mat4.create(), modelView, vec3.fromValues(
        //     0, 0, -2
        // ))

        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shader,
            "modelViewMatrix"), false, flatten(modelView));

        const normalMatrix = mat3.fromValues(
            modelView[0], modelView[1], modelView[2],
            modelView[4], modelView[5], modelView[6],
            modelView[8], modelView[9], modelView[10]
        )
        this.gl.uniformMatrix3fv(this.gl.getUniformLocation(this.shader, "normalMatrix"), false, flatten(normalMatrix));
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertNumber);


    }


}

interface VecAndNormal {
    vert: number
    normal: number
}

export class ObjectModel {
    verts: vec4[] = []
    normals: vec3[] = []
    quads: [VecAndNormal, VecAndNormal, VecAndNormal][] = []

    toBuffer() {
        const vertNumber = this.quads.length * 3
        const pointsArray = []
        const normalsArray = []

        for (const quad of this.quads) {
            for (let i = 0; i < 3; i++) {
                const { vert, normal } = quad[i]
                pointsArray.push(this.verts[vert - 1])
                normalsArray.push(this.normals[normal - 1])
            }
        }



        return {
            points: new Float32Array(flatten(pointsArray)),
            normals: new Float32Array(flatten(normalsArray)),
            vertNumber
        }
    }

    load(obj: string) {
        const lines = obj.split(/\r\n|\n/)
        for (const line of lines) {
            if (!line || line.startsWith('#')) {
                continue
            }
            const split = line.split(' ')
            if (split.length !== 4) {
                throw new SyntaxError("不支持的obj模型格式：" + line)
            }
            const type = split.shift()
            if (type === 'v') {
                const [x, y, z] = split.map(parseFloat)
                this.verts.push(vec4.fromValues(x, y, z, 1))

            } else if (type === 'vn') {
                const [x, y, z] = split.map(parseFloat)
                this.normals.push(vec3.fromValues(x, y, z))
            } else if (type === 'f') {
                const [a, b, c] = split.map(it => {
                    const [v, n] = it.split("//")
                    return {
                        vert: parseInt(v),
                        normal: parseInt(n)
                    }
                })
                this.quads.push([a, b, c])
            } else {
                throw new SyntaxError("不支持的obj模型格式：" + line)
            }

        }
    }
}