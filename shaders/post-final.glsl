// source: bundle var iA — pass final: FXAA + sharpen + grain + dither to screen
varying vec2 vUv;
float ign(vec2 p){ return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float luma(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uTime, uGrain, uSharpen, uFxaa;
void main(){
  vec4 M = texture2D(tSrc, vUv);
  vec3 col = M.rgb;
  vec4 NW = texture2D(tSrc, vUv + vec2(-1.0, -1.0) * uTexel), NE = texture2D(tSrc, vUv + vec2(1.0, -1.0) * uTexel);
  vec4 SW = texture2D(tSrc, vUv + vec2(-1.0, 1.0) * uTexel), SE = texture2D(tSrc, vUv + vec2(1.0, 1.0) * uTexel);
  float lMin = min(M.a, min(min(NW.a, NE.a), min(SW.a, SE.a)));
  float lMax = max(M.a, max(max(NW.a, NE.a), max(SW.a, SE.a)));
  float contrast = lMax - lMin;
  if (uFxaa > 0.5 && contrast > max(0.0312, lMax * 0.10)) {
    vec2 dir = vec2(-((NW.a + NE.a) - (SW.a + SE.a)), (NW.a + SW.a) - (NE.a + SE.a));
    float dirReduce = max((NW.a + NE.a + SW.a + SE.a) * 0.03125, 0.0078125);
    float rcp = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
    dir = clamp(dir * rcp, vec2(-8.0), vec2(8.0)) * uTexel;
    vec4 A = 0.5 * (texture2D(tSrc, vUv + dir * (1.0 / 3.0 - 0.5)) + texture2D(tSrc, vUv + dir * (2.0 / 3.0 - 0.5)));
    vec4 B = A * 0.5 + 0.25 * (texture2D(tSrc, vUv - dir * 0.5) + texture2D(tSrc, vUv + dir * 0.5));
    col = (B.a < lMin || B.a > lMax) ? A.rgb : B.rgb;
  }
  // light unsharp mask, backed off on strong edges (those belong to FXAA)
  vec3 blur = (NW.rgb + NE.rgb + SW.rgb + SE.rgb) * 0.25;
  col += (M.rgb - blur) * uSharpen * (1.0 - smoothstep(0.04, 0.22, contrast));
  // animated, luminance-weighted film grain
  vec2 seed = gl_FragCoord.xy + fract(uTime * vec2(7.31, 3.17)) * vec2(311.7, 173.3);
  float g = hash12(seed) + hash12(seed + 57.3) - 1.0;
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  col += g * uGrain * mix(1.0, 0.30, smoothstep(0.25, 0.9, l)) * (0.35 + 0.65 * smoothstep(0.0, 0.08, l));
  // dither against banding in the sky gradients
  col += (hash12(gl_FragCoord.xy * 1.37 + 11.0) + hash12(gl_FragCoord.xy * 0.71 + 3.0) - 1.0) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
