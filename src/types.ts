export interface AnalyzedData {
    sampleRate: number;
    minValue: number;
    maxValue: number;
    frequencyData: number[];
}

export interface Source {
    getAnalyzedData(): AnalyzedData;
}
