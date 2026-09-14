import {type AnalyzedData, type Source} from 'audioviz-webcomponent';

export class LocalSource implements Source {
    private readonly audioSource: MediaStreamAudioSourceNode;
    private readonly analyserNode: AnalyserNode;
    private readonly floatTimeDomainData: Float32Array<ArrayBuffer>;
    private readonly floatFrequencyData: Float32Array<ArrayBuffer>;

    constructor(private readonly audioContext: AudioContext, private readonly mediaStream: MediaStream, private readonly fftSize: number) {
        this.audioSource = new MediaStreamAudioSourceNode(audioContext, {
            mediaStream: mediaStream,
        })
        this.analyserNode = audioContext.createAnalyser();
        this.analyserNode.fftSize = fftSize;
        this.floatTimeDomainData = new Float32Array(this.analyserNode.fftSize);
        this.floatFrequencyData = new Float32Array(this.analyserNode.frequencyBinCount);
        this.audioSource.connect(this.analyserNode);
    }

    public static create(fftSize: number): Promise<LocalSource> {
        if (!navigator.mediaDevices.getUserMedia) {
            throw new Error("Your browser does not support navigator.mediaDevices.getUserMedia");
        }
        const audioContext = new AudioContext();
        return navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
        })
            .then(mediaStream => {
                return new LocalSource(audioContext, mediaStream, fftSize);
            })
    }

    public close(): Promise<void> {
        this.audioSource.disconnect();
        return this.audioContext.close();
    }

    public getAnalyzedData(): AnalyzedData | undefined {
        this.analyserNode.getFloatTimeDomainData(this.floatTimeDomainData);
        this.analyserNode.getFloatFrequencyData(this.floatFrequencyData);
        let minValue: number = NaN;
        let maxValue: number = NaN;
        for (const v of this.floatTimeDomainData) {
            if (isNaN(minValue) || (v < minValue)) {
                minValue = v;
            }
            if (isNaN(maxValue) || (v > maxValue)) {
                maxValue = v;
            }
        }
        return {
            sampleRate: this.audioContext.sampleRate,
            minValue: minValue,
            maxValue: maxValue,
            frequencyData: Array.from(this.floatFrequencyData.values()),
        };
    }
}
