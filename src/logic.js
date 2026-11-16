export const PRESETS = {
  low: { ratio: 0.85, shadow: 0, animationHz: 15 },
  medium: { ratio: 1.25, shadow: 512, animationHz: 30 },
  high: { ratio: 1.75, shadow: 1024, animationHz: 60 },
};
export const STATES = ['Idle', 'Listening', 'Talking', 'Sleeping', 'Playing', 'Snacking', 'Spilling', 'RaisingHand', 'Answering', 'WrongAnswer', 'Unsure', 'Confused'];
export function defaultQuality(device = {}) {
  return (device.hardwareConcurrency <= 4 || device.deviceMemory <= 4) ? 'low' : 'medium';
}
export class AdaptiveQuality {
  constructor(quality = 'medium') { this.quality = quality; this.reset(); }
  reset() { this.low = 0; this.high = 0; this.cooldown = 15; }
  sample(fps, seconds, automatic) {
    if (!automatic) { this.reset(); return this.quality; }
    this.cooldown = Math.max(0, this.cooldown - seconds);
    this.low = fps < 35 ? this.low + seconds : 0;
    this.high = fps > 57 ? this.high + seconds : 0;
    const levels = ['low', 'medium', 'high'];
    const index = levels.indexOf(this.quality);
    if (!this.cooldown && this.low >= 8 && index > 0) {
      this.quality = levels[index - 1]; this.reset(); this.cooldown = 25;
    } else if (!this.cooldown && this.high >= 40 && index < 1) {
      // Auto only restores Medium; High is an explicit choice.
      this.quality = levels[index + 1]; this.reset(); this.cooldown = 45;
    }
    return this.quality;
  }
}
export function blocked(x, z, colliders, radius = 0.24) {
  return colliders.some(b => b.enabled !== false && x > b.minX - radius && x < b.maxX + radius && z > b.minZ - radius && z < b.maxZ + radius);
}
export function movePlayer(position, dx, dz, colliders) {
  // Substeps prevent tunnelling even after a slow frame; axis separation slides along walls.
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.1));
  for (let i = 0; i < steps; i++) {
    if (!blocked(position.x + dx / steps, position.z, colliders)) position.x += dx / steps;
    if (!blocked(position.x, position.z + dz / steps, colliders)) position.z += dz / steps;
  }
}
export function nextStudentState(current, random = Math.random) {
  if (current !== 'Listening' && current !== 'Idle') return current;
  const n = random();
  return n < 0.12 ? 'Talking' : n < 0.19 ? 'Sleeping' : n < 0.26 ? 'Playing' : n < 0.36 ? 'RaisingHand' : 'Listening';
}
