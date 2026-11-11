// source: bundle var j6 — pass motion: velocity reprojection motion blur
varying vec2 vUv;
float ign(vec2 p){ return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float luma(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

uniform sampler2D tColor, tDepth; uniform mat4 uInvViewProj, uPrevViewProj; uniform float uShutter; uniform vec2 uRes;
void main(){
  vec4 c0 = texture2D(tColor, vUv);
  float d = texture2D(tDepth, vUv).r;
  if (d < 0.05) { gl_FragColor = c0; return; }
  vec4 wp = uInvViewProj * vec4(vUv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0); wp /= wp.w;
  vec4 pc = uPrevViewProj * wp;
  vec2 puv = pc.xy / max(pc.w, 1e-4) * 0.5 + 0.5;
  vec2 vel = (vUv - puv) * uShutter;
  float len = length(vel);
  if (pc.w <= 0.0 || len * uRes.y < 0.75) { gl_FragColor = c0; return; }
  vel *= min(1.0, 0.018 / len);
  float j = ign(gl_FragCoord.xy) - 0.5;
  vec3 acc = c0.rgb; float ws = 1.0;
  for (int i = 0; i < 9; i++) {
    vec2 uv = vUv + vel * ((float(i) + 0.5 + j) / 9.0 - 0.5);
    float w = texture2D(tDepth, uv).r < 0.05 ? 0.0 : 1.0;
    acc += texture2D(tColor, uv).rgb * w; ws += w;
  }
  gl_FragColor = vec4(acc / ws, 1.0);
}
