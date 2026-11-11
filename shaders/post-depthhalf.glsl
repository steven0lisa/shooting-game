// source: bundle var X6 — pass depthhalf: linearize depth at half res
varying vec2 vUv;
float ign(vec2 p){ return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float luma(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

uniform sampler2D tDepth; uniform float uNear, uFar;
void main(){
  // exact texel fetch: sampling at a texel corner would pick rows unpredictably and band the AO on grazing floors
  ivec2 p = min(ivec2(gl_FragCoord.xy) * 2, textureSize(tDepth, 0) - 1);
  float d = texelFetch(tDepth, p, 0).r;
  float z = d < 0.05 ? 0.01 : (uNear * uFar) / (uFar - d * (uFar - uNear));
  gl_FragColor = vec4(z, 0.0, 0.0, 1.0);
}
