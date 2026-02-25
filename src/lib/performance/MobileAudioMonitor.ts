export interface AudioMetrics {
  latency: number;
  bufferUnderruns: number;
  playTime: number;
}

class MobileAudioMonitor {
  private latencies: number[] = [];
  private bufferUnderruns: number = 0;
  private playStartTime: number = 0;
  private maxSamples: number = 100;

  recordLatency(latency: number): void {
    this.latencies.push(latency);
    if (this.latencies.length > this.maxSamples) {
      this.latencies.shift();
    }
  }

  recordBufferUnderrun(): void {
    this.bufferUnderruns++;
  }

  startPlay(): void {
    this.playStartTime = Date.now();
  }

  getMetrics(): AudioMetrics {
    const avgLatency = this.latencies.length > 0
      ? this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length
      : 0;
    
    return {
      latency: avgLatency,
      bufferUnderruns: this.bufferUnderruns,
      playTime: Date.now() - this.playStartTime,
    };
  }

  reset(): void {
    this.latencies = [];
    this.bufferUnderruns = 0;
    this.playStartTime = 0;
  }
}

export const mobileAudioMonitor = new MobileAudioMonitor();
