type Point = {
  x: number;
  y: number;
};

function add(a: Point, b: Point): Point {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  };
}

function subtract(a: Point, b: Point): Point {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
  };
}

function scale(point: Point, scalar: number): Point {
  return {
    x: point.x * scalar,
    y: point.y * scalar,
  };
}

function equal(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

function magnitude(point: Point): number {
  return Math.hypot(point.x, point.y);
}

export { type Point, add, subtract, scale, equal, magnitude };
