export class PerlinNoise {
  permutation: number[];
  p: number[];

  constructor() {
    this.permutation = [];
    this.p = [];
    for (let i = 0; i < 256; i++) this.permutation[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.permutation[i], this.permutation[j]] = [this.permutation[j], this.permutation[i]];
    }
    for (let i = 0; i < 512; i++) this.p[i] = this.permutation[i % 256];
  }

  fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  grad(hash: number, x: number, y: number, z: number): number {
    const h = hash & 15,
      u = h < 8 ? x : y,
      v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise(x: number, y: number, z: number = 0): number {
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
        this.lerp(u, this.grad(this.p[AA + 1], x, y, z - 1), this.grad(this.p[BA + 1], x - 1, y, z - 1)),
        this.lerp(u, this.grad(this.p[AB + 1], x, y - 1, z - 1), this.grad(this.p[BB + 1], x - 1, y - 1, z - 1))
      )
    );
    return (res + 1) / 2;
  }

  terrainNoise(x: number, y: number, z: number, octaves: number = 4, persistence: number = 0.5, lacunarity: number = 2): number {
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
