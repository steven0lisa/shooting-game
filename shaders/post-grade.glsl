// source: bundle var nA — pass grade: AgX/ACES tonemap + CA/bloom/flare/vignette grade
varying vec2 vUv;
float ign(vec2 p){ return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float luma(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

uniform sampler2D tScene, tBloom, tBlur, tStreak, tDirt;

uniform sampler2D tAdapt; uniform float uExposure, uKey, uMinE, uMaxE, uAuto;
float slExposure(){ float a = texture2D(tAdapt, vec2(0.5)).r; return uExposure * mix(1.0, clamp(pow(uKey / max(a, 1e-4), 0.85), uMinE, uMaxE), uAuto); }

uniform vec3 uSunCol;
uniform vec2 uSunUv;
uniform float uTime, uAspect, uBloom, uDirt, uStreak, uFlare, uCA, uVignette;
uniform float uDamage, uLowHealth, uAds, uFlash, uFade, uSaturation, uSunOn, uThunder, uAgxMix;

// ---- AgX (Filament/Blender fit, as in three.js) ----
const mat3 SL_REC2020_TO_SRGB = mat3(vec3(1.6605, -0.1246, -0.0182), vec3(-0.5876, 1.1329, -0.1006), vec3(-0.0728, -0.0083, 1.1187));
const mat3 SL_SRGB_TO_REC2020 = mat3(vec3(0.6274, 0.0691, 0.0164), vec3(0.3293, 0.9195, 0.0880), vec3(0.0433, 0.0113, 0.8956));
vec3 slAgxContrast(vec3 x){ vec3 x2 = x * x; vec3 x4 = x2 * x2; return 15.5 * x4 * x2 - 40.14 * x4 * x + 31.96 * x4 - 6.868 * x2 * x + 0.4298 * x2 + 0.1191 * x - 0.00232; }
vec3 slAgx(vec3 color){
  const mat3 inset = mat3(vec3(0.856627153315983, 0.137318972929847, 0.11189821299995), vec3(0.0951212405381588, 0.761241990602591, 0.0767994186031903), vec3(0.0482516061458583, 0.101439036467562, 0.811302368396859));
  const mat3 outset = mat3(vec3(1.1271005818144368, -0.1413297634984383, -0.14132976349843826), vec3(-0.11060664309660323, 1.157823702216272, -0.11060664309660294), vec3(-0.016493938717834573, -0.016493938717834257, 1.2519364065950405));
  const float minEv = -12.47393, maxEv = 4.026069;
  color = inset * (SL_SRGB_TO_REC2020 * color);
  color = clamp((log2(max(color, 1e-10)) - minEv) / (maxEv - minEv), 0.0, 1.0);
  color = slAgxContrast(color);
  // "punchy"-style look: a little more contrast and chroma than the base AgX rendering
  float l = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color = pow(max(color, vec3(0.0)), vec3(LOOK_POWER));
  color = l + (color - l) * LOOK_SAT;
  color = outset * color;
  color = pow(max(color, vec3(0.0)), vec3(2.2));
  return clamp(SL_REC2020_TO_SRGB * color, 0.0, 1.0);
}
vec3 slRRTODT(vec3 v){ vec3 a = v * (v + 0.0245786) - 0.000090537; vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081; return a / b; }
vec3 slAces(vec3 c){
  const mat3 inM = mat3(vec3(0.59719, 0.07600, 0.02840), vec3(0.35458, 0.90834, 0.13383), vec3(0.04823, 0.01566, 0.83777));
  const mat3 outM = mat3(vec3(1.60475, -0.10208, -0.00327), vec3(-0.53108, 1.10813, -0.07276), vec3(-0.07367, -0.00605, 1.07602));
  return clamp(outM * slRRTODT(inM * (c * 1.3)), 0.0, 1.0);
}
vec3 toSRGB(vec3 c){ return mix(c * 12.92, 1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c)); }

vec3 flare(vec2 uv, vec2 sun, float vis){
  vec2 asp = vec2(uAspect, 1.0);
  vec2 p = (uv - 0.5) * asp, s = (sun - 0.5) * asp;
  vec2 dv = p - s; float r = length(dv);
  vec3 c = vec3(0.0);
  // veiling glare + a few soft diffraction spikes
  float ang = atan(dv.y, dv.x);
  float spikes = pow(abs(cos(ang * 3.0 + 0.4)), 24.0) + 0.6 * pow(abs(cos(ang * 4.0 - 1.1)), 40.0);
  c += uSunCol * (0.020 / (r * r * 9.0 + 0.010) + 0.10 * exp(-r * 3.2));
  c += uSunCol * spikes * 0.30 * exp(-r * 5.5);
  // ghosts along the sun -> centre axis
  vec3 g = vec3(0.0);
  float k0 = length(p + s * 0.38);  g += vec3(0.30, 0.75, 0.55) * smoothstep(0.085, 0.06, k0) * 0.050;
  float k1 = length(p + s * 0.82);  g += vec3(0.85, 0.45, 0.25) * smoothstep(0.045, 0.030, k1) * 0.075;
  float k2 = length(p + s * 1.35);  g += vec3(0.35, 0.50, 0.95) * smoothstep(0.17, 0.12, k2) * (0.4 + 0.6 * smoothstep(0.05, 0.16, k2)) * 0.040;
  float k3 = length(p - s * 0.45);  g += vec3(0.80, 0.70, 0.35) * smoothstep(0.030, 0.018, k3) * 0.060;
  // halo ring opposite the sun
  float hr = length(p + s * 0.15);
  g += vec3(0.45, 0.55, 0.85) * exp(-pow((hr - 0.52) * 16.0, 2.0)) * 0.035 * smoothstep(0.1, 0.5, length(s));
  c += g * uSunCol * 2.4;
  return c * vis;
}

void main(){
  vec2 c = vUv - 0.5;
  float r2 = dot(c * vec2(uAspect, 1.0), c * vec2(uAspect, 1.0)) / (0.25 * (uAspect * uAspect + 1.0));   // 0 centre .. 1 corner
  vec4 ad = texture2D(tAdapt, vec2(0.5));
  // radial chromatic aberration (tiny; grows a little when hurt)
  vec2 off = c * r2 * (uCA + uDamage * 0.006);
  vec3 col = vec3(texture2D(tScene, vUv + off).r, texture2D(tScene, vUv).g, texture2D(tScene, vUv - off).b);
  // ADS: soften the periphery
  vec3 soft = texture2D(tBlur, vUv).rgb;
  col = mix(col, soft, uAds * 0.75 * smoothstep(0.22, 0.85, r2));
  // bloom (energy conserving mix), lens dirt, anamorphic streak
  vec3 bloom = texture2D(tBloom, vUv).rgb;
  vec3 dirt = texture2D(tDirt, vUv).rgb;
  col = mix(col, bloom, uBloom);
  col += bloom * dirt * uDirt;
  col += texture2D(tStreak, vUv).rgb * vec3(0.45, 0.62, 1.0) * uStreak;
  // sun glare + flare (occlusion-tested)
  float vis = ad.g * uSunOn;
  if (vis > 0.002) { vec3 fl = flare(vUv, uSunUv, vis) * uFlare; col += fl * (1.0 + dirt * 1.5); }
  // exposure: manual * eye adaptation
  col *= slExposure();
  col += vec3(1.0, 0.97, 0.9) * uFlash * 2.5;
  // filmic curve: ACES (Hill fit) for punch and burning oranges, pulled toward AgX so highlights roll off to white
  col = mix(slAces(col), slAgx(col), uAgxMix);

  // ---- grade (display-linear) ----
  float l = luma(col);
  // split tone: teal shadows, warm highlights
  vec3 sh = vec3(0.80, 1.01, 1.13), hi = vec3(1.07, 1.0, 0.90);
  col *= mix(sh, hi, smoothstep(0.03, 0.55, l));
  // gentle S-curve
  col = mix(col, col * col * (3.0 - 2.0 * col), 0.22);
  // lifted, slightly teal blacks
  col = col * 0.988 + vec3(0.006, 0.0085, 0.011);
  // saturation (gameplay driven)
  float sat = uSaturation * (1.0 - 0.65 * uLowHealth) * (1.0 - 0.5 * uDamage);
  l = luma(col);
  col = mix(vec3(l), col, sat);
  // vignette: base + low health + ADS tightening
  float vig = uVignette + uLowHealth * 0.55 + uAds * 0.22;
  float vr = smoothstep(0.15 - uAds * 0.08, 1.05, r2);
  col *= 1.0 - vig * vr * vr * (3.0 - 2.0 * vr) ;
  // damage: red-edged pulse
  float edge = smoothstep(0.18, 1.0, r2);
  col = mix(col, vec3(0.55, 0.02, 0.01) * (0.35 + l), clamp(uDamage * edge * 0.85 + uLowHealth * edge * edge * 0.25 * (0.75 + 0.25 * sin(uTime * 5.0)), 0.0, 1.0));
  col *= 1.0 - uFade;
  col = toSRGB(clamp(col, 0.0, 1.0));
  gl_FragColor = vec4(col, dot(col, vec3(0.299, 0.587, 0.114)));
}
