import {glMatrix, mat3, mat4, vec3, vec4} from "../_snowpack/pkg/gl-matrix.js";
import {Transform} from "./transformHandler.js";
import {flatten} from "./utils.js";
glMatrix.setMatrixArrayType(Array);
export class Context {
  constructor(gl, shader) {
    this.vertNumber = 0;
    this.aspect = 1;
    this.transform = new Transform();
    this.lightPosition = vec4.fromValues(10, 10, 10, 0);
    this.lightAmbient = vec4.fromValues(0.2, 0.2, 0.2, 1);
    this.lightDiffuse = vec4.fromValues(1, 1, 1, 1);
    this.lightSpecular = vec4.fromValues(1, 1, 1, 1);
    this.materialAmbient = vec4.fromValues(1, 0, 1, 1);
    this.materialDiffuse = vec4.fromValues(1, 0.8, 0, 1);
    this.materialSpecular = vec4.fromValues(1, 0.8, 0, 1);
    this.materialShininess = 100;
    this.gl = gl;
    this.shader = shader;
    gl.useProgram(shader);
    this.vBuffer = gl.createBuffer();
    this.nBuffer = gl.createBuffer();
    gl.enable(gl.DEPTH_TEST);
    this.updateUniforms();
  }
  loadModel(model) {
    const buf = model.toBuffer();
    this.vertNumber = buf.vertNumber;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, buf.points, this.gl.STATIC_DRAW);
    const vPosition = this.gl.getAttribLocation(this.shader, "vPosition");
    this.gl.vertexAttribPointer(vPosition, 4, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(vPosition);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, buf.normals, this.gl.STATIC_DRAW);
    const vNormal = this.gl.getAttribLocation(this.shader, "vNormal");
    this.gl.vertexAttribPointer(vNormal, 3, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(vNormal);
  }
  updateUniforms() {
    const scale = 0.8;
    const projection = mat4.ortho(mat4.create(), -(1 / scale) * this.aspect, 1 / scale * this.aspect, -(1 / scale), 1 / scale, -200, 200);
    const ambientProduct = vec4.mul(vec4.create(), this.lightAmbient, this.materialAmbient);
    const diffuseProduct = vec4.mul(vec4.create(), this.lightDiffuse, this.materialDiffuse);
    const specularProduct = vec4.mul(vec4.create(), this.lightSpecular, this.materialSpecular);
    this.gl.uniform4fv(this.gl.getUniformLocation(this.shader, "ambientProduct"), flatten(ambientProduct));
    this.gl.uniform4fv(this.gl.getUniformLocation(this.shader, "diffuseProduct"), flatten(diffuseProduct));
    this.gl.uniform4fv(this.gl.getUniformLocation(this.shader, "specularProduct"), flatten(specularProduct));
    this.gl.uniform4fv(this.gl.getUniformLocation(this.shader, "lightPosition"), flatten(this.lightPosition));
    this.gl.uniform1f(this.gl.getUniformLocation(this.shader, "shininess"), this.materialShininess);
    this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shader, "projectionMatrix"), false, flatten(projection));
  }
  render() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    let modelView = mat4.create();
    const scale = Math.exp(this.transform.scale);
    mat4.mul(modelView, this.transform.rotation, modelView);
    mat4.mul(modelView, mat4.fromTranslation(mat4.create(), vec3.fromValues(this.transform.translateX, this.transform.translateY, this.transform.translateZ)), modelView);
    mat4.scale(modelView, modelView, vec3.fromValues(scale, scale, scale));
    this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shader, "modelViewMatrix"), false, flatten(modelView));
    const normalMatrix = mat3.fromValues(modelView[0], modelView[1], modelView[2], modelView[4], modelView[5], modelView[6], modelView[8], modelView[9], modelView[10]);
    this.gl.uniformMatrix3fv(this.gl.getUniformLocation(this.shader, "normalMatrix"), false, flatten(normalMatrix));
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertNumber);
  }
}
export class ObjectModel {
  constructor() {
    this.verts = [];
    this.normals = [];
    this.quads = [];
  }
  toBuffer() {
    const vertNumber = this.quads.length * 3;
    const pointsArray = [];
    const normalsArray = [];
    for (const quad of this.quads) {
      for (let i = 0; i < 3; i++) {
        const {vert, normal} = quad[i];
        pointsArray.push(this.verts[vert - 1]);
        normalsArray.push(this.normals[normal - 1]);
      }
    }
    return {
      points: new Float32Array(flatten(pointsArray)),
      normals: new Float32Array(flatten(normalsArray)),
      vertNumber
    };
  }
  load(obj) {
    const lines = obj.split(/\r\n|\n/);
    for (const line of lines) {
      if (!line || line.startsWith("#")) {
        continue;
      }
      const split = line.split(" ");
      if (split.length !== 4) {
        throw new SyntaxError("不支持的obj模型格式：" + line);
      }
      const type = split.shift();
      if (type === "v") {
        const [x, y, z] = split.map(parseFloat);
        this.verts.push(vec4.fromValues(x, y, z, 1));
      } else if (type === "vn") {
        const [x, y, z] = split.map(parseFloat);
        this.normals.push(vec3.fromValues(x, y, z));
      } else if (type === "f") {
        const [a, b, c] = split.map((it) => {
          const [v, n] = it.split("//");
          return {
            vert: parseInt(v),
            normal: parseInt(n)
          };
        });
        this.quads.push([a, b, c]);
      } else {
        throw new SyntaxError("不支持的obj模型格式：" + line);
      }
    }
  }
}
