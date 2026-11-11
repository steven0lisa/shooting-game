// source: bundle var V6 — sky vertex shader (fullscreen-ish box, vDir)
varying vec3 vDir;
void main(){ vDir = position; vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position, 1.0); gl_Position = p.xyww; }
