import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Line, Circle, G, Defs, RadialGradient, Stop } from 'react-native-svg';
import { SceneState, VERTEX_COLORS } from '../services/api';
import { getShape, V3 } from './Polyhedra';

export type Scene3DProps = {
  scene: SceneState | null;
  selectedVertexIndex?: number | null;
  size?: number;
};

function rotate(p: V3, ax: number, ay: number): V3 {
  const [x0, y0, z0] = p;
  const cy = Math.cos(ay), sy = Math.sin(ay);
  const x1 = x0 * cy + z0 * sy;
  const z1 = -x0 * sy + z0 * cy;
  const y1 = y0;
  const cx = Math.cos(ax), sx = Math.sin(ax);
  const y2 = y1 * cx - z1 * sx;
  const z2 = y1 * sx + z1 * cx;
  return [x1, y2, z2];
}

function project(p: V3, size: number): { x: number; y: number; depth: number; scale: number } {
  const [x, y, z] = p;
  const d = 3.5;
  const f = 1.6 / (d - z);
  return {
    x: size / 2 + x * size * 0.34 * f,
    y: size / 2 - y * size * 0.34 * f,
    depth: z,
    scale: f,
  };
}

// Compute target angles that bring `vertex` toward +Z (camera-facing)
function targetAnglesForFront(v: V3): { ax: number; ay: number } {
  const [x, y, z] = v;
  const ay = Math.atan2(-x, z);
  const r = Math.hypot(x, z);
  const ax = Math.atan2(y, r);
  return { ax, ay };
}

function shortestDelta(from: number, to: number): number {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export const Scene3D: React.FC<Scene3DProps> = ({ scene, selectedVertexIndex, size = 320 }) => {
  const goalCount = scene?.goalCount ?? 0;
  const shape = useMemo(() => getShape(goalCount), [goalCount]);

  // Growth map by vertexIndex
  const growthByIdx = useMemo(() => {
    const m = new Map<number, number>();
    (scene?.vertices ?? []).forEach(v => m.set(v.vertexIndex, v.growth ?? 0));
    return m;
  }, [scene]);

  const [angle, setAngle] = useState({ ax: -0.3, ay: 0 });
  const [pulse, setPulse] = useState(0);
  const raf = useRef<number | null>(null);
  const stateRef = useRef({ ax: -0.3, ay: 0 });

  useEffect(() => {
    let last = Date.now();
    const tick = () => {
      const now = Date.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const s = stateRef.current;

      // If selected, ease toward target so that vertex faces camera
      if (selectedVertexIndex != null && shape.vertices[selectedVertexIndex]) {
        const v = shape.vertices[selectedVertexIndex];
        const growth = growthByIdx.get(selectedVertexIndex) ?? 0;
        const scaled: V3 = [v[0] * (1 + growth * 0.4), v[1] * (1 + growth * 0.4), v[2] * (1 + growth * 0.4)];
        const target = targetAnglesForFront(scaled);
        const easing = 4.5 * dt; // quick but smooth
        s.ax += shortestDelta(s.ax, target.ax) * Math.min(1, easing);
        s.ay += shortestDelta(s.ay, target.ay) * Math.min(1, easing);
      } else {
        // Auto-rotate
        s.ay += dt * 0.35;
        // Gentle bob in X tilt
        const targetTilt = -0.3;
        s.ax += (targetTilt - s.ax) * Math.min(1, 2 * dt);
      }

      setAngle({ ax: s.ax, ay: s.ay });
      setPulse(p => (p + dt) % 1000);
      raf.current = requestAnimationFrame(tick) as unknown as number;
    };
    raf.current = requestAnimationFrame(tick) as unknown as number;
    return () => { if (raf.current != null) cancelAnimationFrame(raf.current as unknown as number); };
  }, [selectedVertexIndex, shape, growthByIdx]);

  const { ax, ay } = angle;

  // ---- Render items ----
  type RenderItem =
    | { kind: 'cubeEdge'; x1: number; y1: number; x2: number; y2: number; depth: number }
    | { kind: 'shapeEdge'; x1: number; y1: number; x2: number; y2: number; depth: number; opacity: number }
    | { kind: 'vertex'; x: number; y: number; depth: number; color: string; selected: boolean; idx: number; scale: number };

  const items: RenderItem[] = [];

  // Outer cube wireframe (sides ±0.95 for aesthetic breathing room)
  const cubeCorners: V3[] = [
    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
    [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
  ];
  const cubeEdges: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];
  const cubeProj = cubeCorners.map(c => project(rotate(c, ax, ay), size));
  for (const [a, b] of cubeEdges) {
    const pa = cubeProj[a], pb = cubeProj[b];
    items.push({ kind: 'cubeEdge', x1: pa.x, y1: pa.y, x2: pb.x, y2: pb.y, depth: (pa.depth + pb.depth) / 2 });
  }

  // Shape with vertex elongation
  const SHAPE_SCALE = 0.68; // fraction of cube half-size
  const projectedVerts = shape.vertices.map((v, i) => {
    const growth = growthByIdx.get(i) ?? 0;
    const factor = SHAPE_SCALE * (1 + growth * 0.5);
    const scaledWorld: V3 = [v[0] * factor, v[1] * factor, v[2] * factor];
    const globalRot = rotate(scaledWorld, ax, ay);
    return project(globalRot, size);
  });

  for (const [a, b] of shape.edges) {
    const pa = projectedVerts[a], pb = projectedVerts[b];
    items.push({
      kind: 'shapeEdge', x1: pa.x, y1: pa.y, x2: pb.x, y2: pb.y,
      depth: (pa.depth + pb.depth) / 2,
      opacity: 0.92,
    });
  }

  projectedVerts.forEach((p, i) => {
    const color = VERTEX_COLORS[i % VERTEX_COLORS.length];
    items.push({
      kind: 'vertex', x: p.x, y: p.y, depth: p.depth, color,
      selected: selectedVertexIndex === i, idx: i, scale: p.scale,
    });
  });

  items.sort((a, b) => a.depth - b.depth);

  // Empty state: pulsing center point
  const emptyPulse = 0.5 + 0.5 * Math.sin(pulse * Math.PI * 2 * 0.9);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="aura" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.9} />
            <Stop offset="35%" stopColor="currentColor" stopOpacity={0.55} />
            <Stop offset="100%" stopColor="currentColor" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <G>
          {items.map((it, i) => {
            if (it.kind === 'cubeEdge') {
              return <Line key={`c${i}`} x1={it.x1} y1={it.y1} x2={it.x2} y2={it.y2} stroke="#FFFFFF" strokeOpacity={0.14} strokeWidth={1} />;
            }
            if (it.kind === 'shapeEdge') {
              return <Line key={`e${i}`} x1={it.x1} y1={it.y1} x2={it.x2} y2={it.y2} stroke="#E5E7EB" strokeOpacity={it.opacity} strokeWidth={1.6} strokeLinecap="round" />;
            }
            // vertex: sharp point (tiny dot for visibility) + aura if selected
            return (
              <G key={`v${i}`}>
                {it.selected ? (
                  <>
                    <Circle cx={it.x} cy={it.y} r={28} fill={it.color} fillOpacity={0.14} />
                    <Circle cx={it.x} cy={it.y} r={16} fill={it.color} fillOpacity={0.28} />
                    <Circle cx={it.x} cy={it.y} r={6} fill="#FFFFFF" fillOpacity={0.95} />
                  </>
                ) : null}
                <Circle cx={it.x} cy={it.y} r={it.selected ? 2.2 : 1.6} fill={it.selected ? '#FFFFFF' : it.color} fillOpacity={1} />
              </G>
            );
          })}
          {goalCount === 0 ? (
            <>
              <Circle cx={size / 2} cy={size / 2} r={20 + 10 * emptyPulse} fill="#EC4899" fillOpacity={0.08 + 0.1 * emptyPulse} />
              <Circle cx={size / 2} cy={size / 2} r={6 + 3 * emptyPulse} fill="#7C3AED" fillOpacity={0.55} />
              <Circle cx={size / 2} cy={size / 2} r={2.5} fill="#FFFFFF" />
            </>
          ) : null}
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
