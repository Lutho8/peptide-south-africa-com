import { useEffect, useRef, useState } from "react";

/**
 * ShaderBackdrop — dependency-free WebGL2 iridescent flow shader.
 * Renders a domain-warped FBM aurora tuned to the PSA Vial palette.
 * - Pauses when offscreen (IntersectionObserver) or tab hidden
 * - Renders one static frame under prefers-reduced-motion
 * - Falls back to a static gradient when WebGL is unavailable
 */

const VERT = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uDark;
out vec4 outColor;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(in vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = rot * p * 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = (gl_FragCoord.xy / uRes - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  float t = uTime * 0.05;

  vec2 q = vec2(fbm(uv * 1.5 + t), fbm(uv * 1.5 - t * 0.7));
  vec2 r = vec2(fbm(uv * 2.1 + 4.0 * q + vec2(1.7, 9.2) + t * 0.5),
                fbm(uv * 2.1 + 4.0 * q + vec2(8.3, 2.8) - t * 0.35));
  float f = fbm(uv * 2.3 + 3.5 * r);

  float m = exp(-3.0 * length(uv - uMouse * vec2(uRes.x / uRes.y, 1.0) * 0.5));

  // PSA palette: clinical navy, vial teal, trusted blue
  vec3 navy  = vec3(0.016, 0.078, 0.165);   // #0a2540 family
  vec3 teal  = vec3(0.000, 0.831, 0.667);   // #00d4aa
  vec3 blue  = vec3(0.235, 0.510, 0.965);   // primary blue
  vec3 ice   = vec3(0.369, 0.918, 0.831);   // #5eead4

  vec3 col;
  if (uDark > 0.5) {
    col = navy;
    col = mix(col, blue * 0.55, smoothstep(0.35, 0.95, f) * 0.65);
    col = mix(col, teal * 0.60, smoothstep(0.55, 1.00, q.y) * 0.55);
    col = mix(col, ice * 0.50, smoothstep(0.60, 1.00, r.x) * 0.45);
    col += teal * m * 0.20 + ice * m * 0.10;
    float band = exp(-pow(uv.y + 0.28 - 0.14 * sin(t * 2.0 + uv.x * 2.0), 2.0) * 16.0);
    col += mix(teal, blue, uv.x + 0.5) * band * 0.14;
    col *= 1.0 - 0.45 * dot(uv * 0.7, uv * 0.7);
  } else {
    vec3 paper = vec3(0.985, 0.995, 1.000);
    col = paper;
    col = mix(col, ice, smoothstep(0.45, 1.00, f) * 0.28);
    col = mix(col, teal, smoothstep(0.62, 1.00, q.y) * 0.16);
    col = mix(col, blue, smoothstep(0.68, 1.05, r.x) * 0.10);
    col += teal * m * 0.10;
    col *= 1.0 - 0.10 * dot(uv * 0.8, uv * 0.8);
  }

  col += (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.012;
  outColor = vec4(col, 1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export default function ShaderBackdrop({
  variant = "dark",
  className = "",
}: {
  variant?: "dark" | "light";
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) {
      setFailed(true);
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) {
      setFailed(true);
      return;
    }
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      setFailed(true);
      return;
    }
    gl.useProgram(prog);

    const uTime = gl.getUniformLocation(prog, "uTime");
    const uRes = gl.getUniformLocation(prog, "uRes");
    const uMouse = gl.getUniformLocation(prog, "uMouse");
    const uDark = gl.getUniformLocation(prog, "uDark");
    gl.uniform1f(uDark, variant === "dark" ? 1 : 0);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let visible = true;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const start = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      const { clientWidth: w, clientHeight: h } = canvas;
      if (canvas.width !== ((w * dpr) | 0) || canvas.height !== ((h * dpr) | 0)) {
        canvas.width = (w * dpr) | 0;
        canvas.height = (h * dpr) | 0;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    const draw = (now: number) => {
      resize();
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now: number) => {
      if (visible && !document.hidden) draw(now);
      raf = requestAnimationFrame(loop);
    };

    const onPointer = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);

    if (reduced) {
      draw(start + 1200); // single static frame
    } else {
      window.addEventListener("pointermove", onPointer, { passive: true });
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      io.disconnect();
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [variant]);

  if (failed) {
    return (
      <div
        aria-hidden
        className={`absolute inset-0 ${
          variant === "dark"
            ? "bg-[radial-gradient(ellipse_at_top,#123a5e,#0a2540_70%)]"
            : "bg-[radial-gradient(ellipse_at_top,#e6fbf5,#f8fbff_70%)]"
        } ${className}`}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`absolute inset-0 h-full w-full ${className}`}
    />
  );
}
