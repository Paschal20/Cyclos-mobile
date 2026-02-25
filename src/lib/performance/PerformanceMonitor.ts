export interface PerformanceMetrics {
  fps: number;
  memory?: number;
  renderTime?: number;
}

class PerformanceMonitor {
  private frames: number[] = [];
  private lastTime: number = 0;
  private fps: number = 60;

  start(): void {
    this.lastTime = Date.now();
    this.frames = [];
  }

  recordFrame(): void {
    const now = Date.now();
    const delta = now - this.lastTime;
    this.lastTime = now;
    
    this.frames.push(delta);
    if (this.frames.length > 60) {
      this.frames.shift();
    }
    
    const avgDelta = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
    this.fps = Math.round(1000 / avgDelta);
  }

  getMetrics(): PerformanceMetrics {
    return { fps: this.fps };
  }

  stop(): void {
    this.frames = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();
