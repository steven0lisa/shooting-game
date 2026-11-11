// source: bundle var Og — shared chunk: slExposure() auto-exposure lookup
uniform sampler2D tAdapt; uniform float uExposure, uKey, uMinE, uMaxE, uAuto;
float slExposure(){ float a = texture2D(tAdapt, vec2(0.5)).r; return uExposure * mix(1.0, clamp(pow(uKey / max(a, 1e-4), 0.85), uMinE, uMaxE), uAuto); }
