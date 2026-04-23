// Generate a clean wireframe polyhedron with exactly N vertices (N in 1..12).
// Uses known polyhedra so vertices sit at geometrically meaningful positions.
export type V3 = [number, number, number];
export type Edge = [number, number];
export type Shape = { vertices: V3[]; edges: Edge[] };

function normalize(verts: V3[]): V3[] {
  let max = 0;
  for (const [x, y, z] of verts) {
    const m = Math.hypot(x, y, z);
    if (m > max) max = m;
  }
  if (max === 0) return verts;
  return verts.map(([x, y, z]) => [x / max, y / max, z / max] as V3);
}

function ringEdges(start: number, n: number): Edge[] {
  const e: Edge[] = [];
  for (let i = 0; i < n; i++) e.push([start + i, start + ((i + 1) % n)]);
  return e;
}
function apexEdges(apex: number, ringStart: number, n: number): Edge[] {
  const e: Edge[] = [];
  for (let i = 0; i < n; i++) e.push([apex, ringStart + i]);
  return e;
}
function antiprismEdges(startA: number, startB: number, n: number): Edge[] {
  // Connect each top vertex to two bottom vertices (offset)
  const e: Edge[] = [];
  for (let i = 0; i < n; i++) {
    e.push([startA + i, startB + i]);
    e.push([startA + i, startB + ((i + 1) % n)]);
  }
  return e;
}

const phi = (1 + Math.sqrt(5)) / 2;

// ---- Per-N definitions ----

function n1(): Shape { return { vertices: [[0, 0, 0]], edges: [] }; }
function n2(): Shape { return { vertices: [[-1, 0, 0], [1, 0, 0]], edges: [[0, 1]] }; }
function n3(): Shape {
  // equilateral triangle in xz plane
  const r = 1;
  const v: V3[] = [];
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * 2 * Math.PI - Math.PI / 2;
    v.push([r * Math.cos(a), 0, r * Math.sin(a)]);
  }
  return { vertices: v, edges: ringEdges(0, 3) };
}
function n4(): Shape {
  // tetrahedron
  const v: V3[] = normalize([[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]]);
  return { vertices: v, edges: [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]] };
}
function n5(): Shape {
  // square pyramid: 4-ring + 1 apex
  const r = 1;
  const v: V3[] = [];
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * 2 * Math.PI + Math.PI / 4;
    v.push([r * Math.cos(a), -0.35, r * Math.sin(a)]);
  }
  v.push([0, 1, 0]);
  const edges: Edge[] = [...ringEdges(0, 4), ...apexEdges(4, 0, 4)];
  return { vertices: normalize(v), edges };
}
function n6(): Shape {
  // octahedron
  const v: V3[] = normalize([[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]);
  const faces = [[0, 2, 4], [2, 1, 4], [1, 3, 4], [3, 0, 4], [2, 0, 5], [1, 2, 5], [3, 1, 5], [0, 3, 5]];
  return { vertices: v, edges: edgesFromFaces(faces) };
}
function n7(): Shape {
  // pentagonal bipyramid: 5-ring + 2 apices
  const r = 1;
  const v: V3[] = [];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * 2 * Math.PI - Math.PI / 2;
    v.push([r * Math.cos(a), 0, r * Math.sin(a)]);
  }
  v.push([0, 1, 0]);
  v.push([0, -1, 0]);
  const edges: Edge[] = [
    ...ringEdges(0, 5),
    ...apexEdges(5, 0, 5),
    ...apexEdges(6, 0, 5),
  ];
  return { vertices: normalize(v), edges };
}
function n8(): Shape {
  // cube
  const v: V3[] = normalize([
    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
    [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
  ]);
  const edges: Edge[] = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];
  return { vertices: v, edges };
}
function n9(): Shape {
  // square antiprism + apex = gyroelongated square pyramid (J10)
  const v: V3[] = [];
  const r = 0.95, h = 0.35;
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * 2 * Math.PI;
    v.push([r * Math.cos(a), -h, r * Math.sin(a)]);
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * 2 * Math.PI + Math.PI / 4;
    v.push([r * Math.cos(a), h, r * Math.sin(a)]);
  }
  v.push([0, 1.1, 0]);
  const edges: Edge[] = [
    ...ringEdges(0, 4),
    ...ringEdges(4, 4),
    ...antiprismEdges(4, 0, 4),
    ...apexEdges(8, 4, 4),
  ];
  return { vertices: normalize(v), edges };
}
function n10(): Shape {
  // pentagonal antiprism
  const v: V3[] = [];
  const r = 1, h = 0.45;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * 2 * Math.PI;
    v.push([r * Math.cos(a), -h, r * Math.sin(a)]);
  }
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * 2 * Math.PI + Math.PI / 5;
    v.push([r * Math.cos(a), h, r * Math.sin(a)]);
  }
  const edges: Edge[] = [
    ...ringEdges(0, 5),
    ...ringEdges(5, 5),
    ...antiprismEdges(5, 0, 5),
  ];
  return { vertices: normalize(v), edges };
}
function n11(): Shape {
  // gyroelongated pentagonal pyramid (J11): pentagonal antiprism + apex
  const v: V3[] = [];
  const r = 0.9, h = 0.35;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * 2 * Math.PI;
    v.push([r * Math.cos(a), -h, r * Math.sin(a)]);
  }
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * 2 * Math.PI + Math.PI / 5;
    v.push([r * Math.cos(a), h, r * Math.sin(a)]);
  }
  v.push([0, 1.1, 0]);
  const edges: Edge[] = [
    ...ringEdges(0, 5),
    ...ringEdges(5, 5),
    ...antiprismEdges(5, 0, 5),
    ...apexEdges(10, 5, 5),
  ];
  return { vertices: normalize(v), edges };
}
function n12(): Shape {
  // icosahedron
  const v: V3[] = normalize([
    [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
    [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
    [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1],
  ]);
  const faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];
  return { vertices: v, edges: edgesFromFaces(faces) };
}

function edgesFromFaces(faces: number[][]): Edge[] {
  const set = new Set<string>();
  for (const f of faces) {
    for (let i = 0; i < f.length; i++) {
      const a = f[i], b = f[(i + 1) % f.length];
      const k = a < b ? `${a}-${b}` : `${b}-${a}`;
      set.add(k);
    }
  }
  return Array.from(set).map(k => k.split('-').map(Number) as Edge);
}

export function getShape(n: number): Shape {
  const clamped = Math.max(0, Math.min(12, Math.floor(n)));
  switch (clamped) {
    case 0: return { vertices: [], edges: [] };
    case 1: return n1();
    case 2: return n2();
    case 3: return n3();
    case 4: return n4();
    case 5: return n5();
    case 6: return n6();
    case 7: return n7();
    case 8: return n8();
    case 9: return n9();
    case 10: return n10();
    case 11: return n11();
    case 12: return n12();
    default: return n12();
  }
}

export const SHAPE_NAMES: Record<number, string> = {
  0: 'Empty',
  1: 'Point',
  2: 'Segment',
  3: 'Triangle',
  4: 'Tetrahedron',
  5: 'Square Pyramid',
  6: 'Octahedron',
  7: 'Pentagonal Bipyramid',
  8: 'Cube',
  9: 'Gyroelongated Square Pyramid',
  10: 'Pentagonal Antiprism',
  11: 'Gyroelongated Pentagonal Pyramid',
  12: 'Icosahedron',
};
