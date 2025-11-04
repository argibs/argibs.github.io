import React, { useEffect, useRef } from 'react';

class PerlinNoise {
  permutation: number[];
  p: number[];

  constructor() {
    this.permutation = [];
    this.p = [];
    for (let i = 0; i < 256; i++) this.permutation[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.permutation[i], this.permutation[j]] = [
        this.permutation[j],
        this.permutation[i],
      ];
    }
    for (let i = 0; i < 512; i++) this.p[i] = this.permutation[i % 256];
  }

  fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(t: number, a: number, b: number) {
    return a + t * (b - a);
  }

  grad(hash: number, x: number, y: number, z: number) {
    const h = hash & 15,
      u = h < 8 ? x : y,
      v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise(x: number, y: number, z: number = 0) {
    const X = Math.floor(x) & 255,
      Y = Math.floor(y) & 255,
      Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    const u = this.fade(x),
      v = this.fade(y),
      w = this.fade(z);
    const A = this.p[X] + Y,
      AA = this.p[A] + Z,
      AB = this.p[A + 1] + Z,
      B = this.p[X + 1] + Y,
      BA = this.p[B] + Z,
      BB = this.p[B + 1] + Z;
    const res = this.lerp(
      w,
      this.lerp(
        v,
        this.lerp(u, this.grad(this.p[AA], x, y, z), this.grad(this.p[BA], x - 1, y, z)),
        this.lerp(u, this.grad(this.p[AB], x, y - 1, z), this.grad(this.p[BB], x - 1, y - 1, z))
      ),
      this.lerp(
        v,
        this.lerp(
          u,
          this.grad(this.p[AA + 1], x, y, z - 1),
          this.grad(this.p[BA + 1], x - 1, y, z - 1)
        ),
        this.lerp(
          u,
          this.grad(this.p[AB + 1], x, y - 1, z - 1),
          this.grad(this.p[BB + 1], x - 1, y - 1, z - 1)
        )
      )
    );
    return (res + 1) / 2;
  }

  terrainNoise(
    x: number,
    y: number,
    z: number,
    octaves: number = 4,
    persistence: number = 0.5,
    lacunarity: number = 2
  ) {
    let total = 0,
      amp = 1,
      freq = 1,
      max = 0;
    for (let i = 0; i < octaves; i++) {
      total += this.noise(x * freq, y * freq, z) * amp;
      max += amp;
      amp *= persistence;
      freq *= lacunarity;
    }
    return total / max;
  }
}

class FastTopographicMap {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  perlin: PerlinNoise;
  cellSize: number;
  noiseScale: number;
  elevationColors: { threshold: number; color: { r: number; g: number; b: number } }[];
  contourLevels: number;
  contourColors: { water: string; land: string; mountain: string };
  width: number = 0;
  height: number = 0;
  cols: number = 0;
  rows: number = 0;
  grid: Float32Array = new Float32Array(0);

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;

    this.perlin = new PerlinNoise();
    this.cellSize = 16;
    this.noiseScale = 0.03;

    this.elevationColors = [
      { threshold: 0.0, color: { r: 5, g: 45, b: 110 } },
      { threshold: 0.15, color: { r: 15, g: 75, b: 140 } },
      { threshold: 0.25, color: { r: 35, g: 105, b: 170 } },
      { threshold: 0.3, color: { r: 65, g: 145, b: 200 } },
      { threshold: 0.35, color: { r: 235, g: 220, b: 180 } },
      { threshold: 0.4, color: { r: 140, g: 200, b: 120 } },
      { threshold: 0.5, color: { r: 80, g: 160, b: 80 } },
      { threshold: 0.6, color: { r: 50, g: 120, b: 50 } },
      { threshold: 0.7, color: { r: 140, g: 120, b: 80 } },
      { threshold: 0.8, color: { r: 120, g: 100, b: 70 } },
      { threshold: 0.88, color: { r: 140, g: 140, b: 140 } },
      { threshold: 0.95, color: { r: 250, g: 250, b: 250 } },
    ];

    this.contourLevels = 20;
    this.contourColors = {
      water: 'rgba(0,50,100,0.3)',
      land: 'rgba(80,60,40,0.4)',
      mountain: 'rgba(60,60,60,0.5)',
    };

    this.onResize();
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.cols = Math.ceil(this.width / this.cellSize) + 2;
    this.rows = Math.ceil(this.height / this.cellSize) + 2;
    this.grid = new Float32Array(this.cols * this.rows);

    this.renderStaticMap();
  }

  generateTerrain() {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const idx = y * this.cols + x;
        const e = this.perlin.terrainNoise(
          x * this.noiseScale,
          y * this.noiseScale,
          0.5,
          4,
          0.55,
          2
        );
        this.grid[idx] = Math.pow(e, 1.2);
      }
    }
  }

  sampleGrid(x: number, y: number) {
    const gx = x / this.cellSize,
      gy = y / this.cellSize;
    const x0 = Math.floor(gx),
      x1 = Math.min(x0 + 1, this.cols - 1);
    const y0 = Math.floor(gy),
      y1 = Math.min(y0 + 1, this.rows - 1);
    const sx = gx - x0,
      sy = gy - y0;
    const v00 = this.grid[y0 * this.cols + x0],
      v10 = this.grid[y0 * this.cols + x1],
      v01 = this.grid[y1 * this.cols + x0],
      v11 = this.grid[y1 * this.cols + x1];
    const v0 = v00 * (1 - sx) + v10 * sx;
    const v1 = v01 * (1 - sx) + v11 * sx;
    return v0 * (1 - sy) + v1 * sy;
  }

  getColor(e: number): [number, number, number] {
    for (let i = 0; i < this.elevationColors.length - 1; i++) {
      const c0 = this.elevationColors[i],
        c1 = this.elevationColors[i + 1];
      if (e >= c0.threshold && e < c1.threshold) {
        const t = (e - c0.threshold) / (c1.threshold - c0.threshold);
        const r = Math.floor(c0.color.r + (c1.color.r - c0.color.r) * t);
        const g = Math.floor(c0.color.g + (c1.color.g - c0.color.g) * t);
        const b = Math.floor(c0.color.b + (c1.color.b - c0.color.b) * t);
        return [r, g, b];
      }
    }
    const last = this.elevationColors[this.elevationColors.length - 1].color;
    return [last.r, last.g, last.b];
  }

  renderBackground() {
    const img = this.ctx.createImageData(this.width, this.height);
    const d = img.data;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const e = this.sampleGrid(x, y);
        const [r, g, b] = this.getColor(e);
        const i = (y * this.width + x) * 4;
        d[i] = r;
        d[i + 1] = g;
        d[i + 2] = b;
        d[i + 3] = 255;
      }
    }
    this.ctx.putImageData(img, 0, 0);
  }

  renderContours() {
    const ctx = this.ctx;
    for (let level = 0; level < this.contourLevels; level++) {
      const threshold = level / this.contourLevels;
      ctx.beginPath();
      let style = this.contourColors.land;
      if (threshold < 0.35) style = this.contourColors.water;
      else if (threshold > 0.8) style = this.contourColors.mountain;
      ctx.strokeStyle = style;
      ctx.lineWidth = level % 5 === 0 ? 1.2 : 0.5;

      for (let y = 0; y < this.rows - 1; y++) {
        for (let x = 0; x < this.cols - 1; x++) {
          const i = y * this.cols + x;
          const tl = this.grid[i],
            tr = this.grid[i + 1],
            bl = this.grid[i + this.cols],
            br = this.grid[i + this.cols + 1];
          const state =
            ((tl > threshold ? 1 : 0) << 3) |
            ((tr > threshold ? 1 : 0) << 2) |
            ((br > threshold ? 1 : 0) << 1) |
            (bl > threshold ? 1 : 0);
          if (state && state !== 15) {
            const px = x * this.cellSize,
              py = y * this.cellSize,
              s = this.cellSize;
            const lerp = (a: number, b: number) => (threshold - a) / (b - a);
            switch (state) {
              case 1:
              case 14:
                ctx.moveTo(px, py + s * lerp(tl, bl));
                ctx.lineTo(px + s * lerp(bl, br), py + s);
                break;
              case 2:
              case 13:
                ctx.moveTo(px + s * lerp(bl, br), py + s);
                ctx.lineTo(px + s, py + s * lerp(tr, br));
                break;
              case 3:
              case 12:
                ctx.moveTo(px, py + s * lerp(tl, bl));
                ctx.lineTo(px + s, py + s * lerp(tr, br));
                break;
              case 4:
              case 11:
                ctx.moveTo(px + s * lerp(tl, tr), py);
                ctx.lineTo(px + s, py + s * lerp(tr, br));
                break;
              case 6:
              case 9:
                ctx.moveTo(px + s * lerp(tl, tr), py);
                ctx.lineTo(px + s * lerp(bl, br), py + s);
                break;
              case 7:
              case 8:
                ctx.moveTo(px, py + s * lerp(tl, bl));
                ctx.lineTo(px + s * lerp(tl, tr), py);
                break;
            }
          }
        }
      }
      ctx.stroke();
    }
  }

  renderStaticMap() {
    this.generateTerrain();
    this.renderBackground();
    this.renderContours();
  }
}

const TopographicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const map = new FastTopographicMap(canvasRef.current);

    const handleResize = () => {
      map.onResize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas id="topographic-background" ref={canvasRef} />;
};

export default TopographicBackground;
