attribute vec4 vPosition;
attribute vec3 vNormal;
varying vec4 fColor;

uniform vec4 ambientProduct,diffuseProduct,specularProduct;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec4 lightPosition;
uniform float shininess;
uniform mat3 normalMatrix;

void main()
{
    
    vec3 pos=-(modelViewMatrix*vPosition).xyz;
    vec3 light=lightPosition.xyz;
    //光源方向
    vec3 L=normalize(light-pos);
    //观察向量
    vec3 E=normalize(-pos);
    //半角向量
    vec3 H=normalize(L+E);
    //法向量
    vec3 N=normalize(normalMatrix*vNormal);
    
    //环境光分量
    vec4 ambient=ambientProduct;
    
    //漫反射分量
    float Kd=max(dot(L,N),0.);
    vec4 diffuse=Kd*diffuseProduct;
    
    //镜面反射分量
    float Ks=pow(max(dot(N,H),0.),shininess);
    vec4 specular=Ks*specularProduct;
    
    if(dot(L,N)<0.){
        specular=vec4(0.,0.,0.,1.);
    }
    
    //坐标变换
    gl_Position=projectionMatrix*modelViewMatrix*vPosition;
    
    fColor=ambient+diffuse+specular;
    fColor.a=1.;
    
}