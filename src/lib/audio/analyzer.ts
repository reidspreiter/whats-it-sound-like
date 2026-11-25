// Internally allocate and manage arrays to reduce caller overhead
interface AnalyzerArrays {
  floatTimeDomainDataArray?: Float32Array<ArrayBuffer>;
}

export class WISLAnalyzerNode extends AnalyserNode {
  private arrays: AnalyzerArrays = {};

  getFloatTimeDomainData(): Float32Array<ArrayBuffer>;
  getFloatTimeDomainData(array: Float32Array<ArrayBuffer>): void;
  getFloatTimeDomainData(array?: Float32Array<ArrayBuffer>): Float32Array<ArrayBuffer> | void {
    const _array = array ?? this.getArray("floatTimeDomainDataArray", this.fftSize);

    super.getFloatTimeDomainData(_array);
    if (array === undefined) {
      return _array;
    }
  }
  /**
   * Get the root mean square. Average level of a changing signal over time
   */
  getRMS() {
    const data = this.getFloatTimeDomainData();

    let sumOfSquares = 0;
    for (let i = 0; i < data.length; i++) {
      sumOfSquares += data[i] * data[i];
    }

    return Math.sqrt(sumOfSquares / data.length);
  }

  private getArray(k: keyof AnalyzerArrays, length: number): Float32Array<ArrayBuffer> {
    if (k in this.arrays) {
      const a = this.arrays[k];
      if (a !== undefined && a.length === length) {
        return a;
      }
    }

    const a = new Float32Array(length);
    this.arrays[k] = a;
    return a;
  }
}
