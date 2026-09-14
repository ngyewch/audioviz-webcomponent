export interface AnalyzedData {
    sampleRate: number;
    minValue: number;
    maxValue: number;
    frequencyData: number[];
}

export type GetAnalyzedDataFunction = () => AnalyzedData | undefined;

export interface Source {
    getAnalyzedData(): AnalyzedData | undefined;
}
