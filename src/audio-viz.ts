import {LitElement, html, css, TemplateResult, PropertyValues} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import throttle from 'throttleit';
import {Color} from 'viridis';

import {defaultColors} from './colors.js';
import {GetAnalyzedDataFunction} from './types.js';

const minColors = 8;

/**
 * Audio visualization web component.
 */
@customElement('audio-viz')
export class AudioVizElement extends LitElement {
    public static styles = css`
        :host {
            display: block;
        }

        .container, #canvas {
            width: 100%;
            height: 100%;
        }
    `;

    @property({type: Array})
    public colors: string[] | undefined = undefined;

    @property({type: Number})
    public minDb: number = 0;

    @property({type: Number})
    public maxDb: number = -120;

    @property({type: Function})
    public getAnalyzedData: GetAnalyzedDataFunction | undefined = undefined;

    @query('#canvas')
    private _canvasElement!: HTMLCanvasElement;

    private _resizeObserver: ResizeObserver | undefined;
    private _sizeChanged: boolean = false;
    private _width: number = 0;
    private _height: number = 0;
    private _animationFrameHandle: number | undefined = undefined;

    private readonly _requestAnimationFrameCallback: FrameRequestCallback;
    private readonly _throttledResize: () => void;

    private _firstUpdateCompleted: boolean = false;
    private _colors: Color[] | undefined = undefined;

    constructor() {
        super();

        this._requestAnimationFrameCallback = this.updateAnimationFrame.bind(this);
        this._throttledResize = throttle(this.resize.bind(this), 100);
    }

    connectedCallback(): void {
        super.connectedCallback();
        this._resizeObserver = new ResizeObserver(_entries => {
            if (this._canvasElement) {
                if ((this._width !== this._canvasElement.clientWidth) || (this._height !== this._canvasElement.clientHeight)) {
                    this._sizeChanged = true;
                    this._width = this._canvasElement.clientWidth;
                    this._height = this._canvasElement.clientHeight;
                }
            }
        })
        this._resizeObserver.observe(this);
        this._animationFrameHandle = requestAnimationFrame(this._requestAnimationFrameCallback);
    }

    disconnectedCallback(): void {
        this._resizeObserver?.disconnect();
        if (this._animationFrameHandle !== undefined) {
            cancelAnimationFrame(this._animationFrameHandle);
        }
        super.disconnectedCallback();
    }

    protected shouldUpdate(_changedProperties: PropertyValues): boolean {
        if ((this.colors !== undefined) && (this.colors.length >= minColors)) {
            const newColors: Color[] = [];
            for (const color of this.colors) {
                newColors.push(Color.hex(color));
            }
            this._colors = newColors;
        } else {
            this._colors = defaultColors;
        }
        return !this._firstUpdateCompleted;
    }

    protected render(): TemplateResult {
        return html`
            <div class="container">
                <canvas id="canvas"></canvas>
            </div>
        `;
    }

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);
        this._firstUpdateCompleted = true
    }

    private updateAnimationFrame(_t: DOMHighResTimeStamp): void {
        this._animationFrameHandle = requestAnimationFrame(this._requestAnimationFrameCallback);

        this._throttledResize();

        const analyzedData = (this.getAnalyzedData !== undefined) ? this.getAnalyzedData() : undefined;
        if ((analyzedData !== undefined) && (this._colors !== undefined)) {
            const dbRange = this.maxDb - this.minDb;
            const drawContext = this._canvasElement.getContext('2d');
            if ((drawContext === undefined) || (drawContext === null)) {
                return;
            }
            const imageData = drawContext.createImageData(1, analyzedData.frequencyData.length);
            let actualMinDb = NaN;
            let actualMaxDb = NaN;
            for (let i = 0; i < analyzedData.frequencyData.length; i++) {
                const y = (analyzedData.frequencyData.length - 1) - i;
                const offset = y * 4;
                const value = analyzedData.frequencyData[i];
                if (isNaN(actualMinDb) || (value < actualMinDb)) {
                    actualMinDb = value;
                }
                if (isNaN(actualMaxDb) || (value > actualMaxDb)) {
                    actualMaxDb = value;
                }
                let normalizedValue = (value - this.minDb) / dbRange;
                if (normalizedValue < 0) {
                    normalizedValue = 0;
                }
                if (normalizedValue > 1) {
                    normalizedValue = 1;
                }
                const colorIndex = Math.round(normalizedValue * (this._colors.length - 1));
                const color = this._colors[colorIndex];
                imageData.data[offset] = color.red;
                imageData.data[offset + 1] = color.green;
                imageData.data[offset + 2] = color.blue;
                imageData.data[offset + 3] = (color.alpha / 100) * 255;
            }
            drawContext.drawImage(this._canvasElement, -1, 0);
            drawContext.putImageData(imageData, this._canvasElement.width - 1, 0, 0, 0, 1, this._canvasElement.height);
        }
    }

    private resize(): void {
        if (!this._sizeChanged) {
            return;
        }
        this._canvasElement.width = this._width;
        this._canvasElement.height = this._height;
        this._sizeChanged = false;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "audio-viz": AudioVizElement;
    }
}
