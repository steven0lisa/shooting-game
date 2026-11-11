// source: bundle var Z6 — pass composite: upsample AO+vol, apply to HDR color
varying vec2 vUv;
float ign(vec2 p){ return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float luma(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

uniform sampler2D tColor, tDepth, tDepthHalf, tAO, tVol;
uniform vec2 uHalfRes; uniform float uNear, uFar, uAoOn, uVolOn, uAoStrength;

uniform sampler2D tAdapt; uniform float uExposure, uKey, uMinE, uMaxE, uAuto;
float slExposure(){ float a = texture2D(tAdapt, vec2(0.5)).r; return uExposure * mix(1.0, clamp(pow(uKey / max(a, 1e-4), 0.85), uMinE, uMaxE), uAuto); }

void main(){
  vec3 col = max(texture2D(tColor, vUv).rgb, vec3(0.0));
  float d = texture2D(tDepth, vUv).r;
  if (d >= 0.05) {
    float z = (uNear * uFar) / (uFar - d * (uFar - uNear));
    // joint bilateral upsample of the half-res buffers
    vec2 hp = vUv * uHalfRes - 0.5; vec2 f = fract(hp); vec2 base = (floor(hp) + 0.5) / uHalfRes; vec2 tx = 1.0 / uHalfRes;
    float ao = 0.0; vec4 vol = vec4(0.0); float ws = 0.0;
    float zc = min(z, 300.0);
    for (int k = 0; k < 4; k++) {
      vec2 o = vec2(float(k & 1), float(k >> 1));
      vec2 uv = base + o * tx;
      float zh = min(texture2D(tDepthHalf, uv).r, 300.0);
      float w = (o.x > 0.5 ? f.x : 1.0 - f.x) * (o.y > 0.5 ? f.y : 1.0 - f.y);
      w *= 1.0 / (0.015 + abs(zh - zc) / zc) ;
      w = max(w, 1e-5);
      ao += texture2D(tAO, uv).r * w; vol += texture2D(tVol, uv) * w; ws += w;
    }
    ao /= ws; vol /= ws;
    if (uAoOn > 0.5 && d < 0.99999) {
      // occlusion belongs to ambient light: fade it out on brightly lit pixels so sunlit surfaces never get dirty halos
      float lit = smoothstep(0.16, 0.85, luma(col) * slExposure());
      float a = mix(1.0, ao, uAoStrength * (1.0 - 0.8 * lit));
      col *= mix(vec3(a), vec3(1.0), vec3(0.0, 0.03, 0.07));      // faintly cool occlusion
    }
    if (uVolOn > 0.5) col = col * vol.a + vol.rgb;
  }
  gl_FragColor = vec4(col, 1.0);
}
