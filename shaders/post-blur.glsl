// source: bundle var $y — pass blur-ao / blur-vol: depth-aware separable blur
varying vec2 vUv;
float ign(vec2 p){ return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float luma(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

uniform sampler2D tSrc, tDepthHalf; uniform vec2 uDir;
void main(){
  float z0 = texture2D(tDepthHalf, vUv).r;
  float zc = min(z0, 300.0);
  vec4 acc = vec4(0.0); float ws = 0.0;
  for (int i = -3; i <= 3; i++) {
    vec2 uv = vUv + uDir * float(i);
    float z = min(texture2D(tDepthHalf, uv).r, 300.0);
    float w = (1.0 - abs(float(i)) * 0.22) * max(0.0, 1.0 - abs(z - zc) / (BLUR_TOL * zc + 0.02));
    acc += texture2D(tSrc, uv) * w; ws += w;
  }
  gl_FragColor = ws > 1e-4 ? acc / ws : texture2D(tSrc, vUv);
}
