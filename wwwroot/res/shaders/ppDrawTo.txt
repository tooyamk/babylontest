#ifdef GL_ES
    precision highp float;
#endif

varying vec2 vUV;
//uniform sampler2D textureSampler;
uniform sampler2D tex;

void main(void) {
    gl_FragColor = texture2D(tex, vUV);
	//gl_FragColor = vec4(1, 0, 0, 1);
    //gl_FragColor = vec4(vUV.x, vUV.y, 0, 1);
}