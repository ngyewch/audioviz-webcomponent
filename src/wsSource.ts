import {AnalyzedData, type Source} from './types.js';

export class WebSocketSource implements Source {
    private readonly ws: WebSocket;
    private analyzedData: AnalyzedData | undefined;

    constructor(public readonly url: string) {
        this.ws = new WebSocket(url);
        this.ws.onmessage = this.handleMessage.bind(this);
    }

    public close(): void {
        this.ws.close();
    }

    getAnalyzedData(): AnalyzedData | undefined {
        return this.analyzedData;
    }

    private handleMessage(messageEvent: MessageEvent): void {
        const jsonString = messageEvent.data as string;
        this.analyzedData = JSON.parse(jsonString) as AnalyzedData;
    }
}
