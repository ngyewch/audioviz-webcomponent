import {LitElement, html, css, TemplateResult} from 'lit';
import {customElement, query} from 'lit/decorators.js';
import throttle from 'throttleit';

/**
 * Audio visualization web component.
 */
@customElement('audio-viz')
export class AudioVizElement extends LitElement {
    public static styles = css`
        :host {
            display: block;
        }

        #canvas {
            width: 100%;
            height: 100%;
        }
    `;

    @query('#canvas')
    private canvasElement!: HTMLCanvasElement;

    private _resizeObserver: ResizeObserver | undefined;
    private _sizeChanged: boolean = false;
    private _width: number = 0;
    private _height: number = 0;
    private _animationFrameHandle: number | undefined = undefined;

    private readonly _requestAnimationFrameCallback: FrameRequestCallback;
    private readonly _throttledResize: () => void;

    constructor() {
        super();

        this._requestAnimationFrameCallback = this.updateAnimationFrame.bind(this);
        this._throttledResize = throttle(this.resize.bind(this), 100);
    }

    connectedCallback(): void {
        super.connectedCallback();
        this._resizeObserver = new ResizeObserver(_entries => {
            if (this.canvasElement) {
                if ((this._width !== this.canvasElement.clientWidth) || (this._height !== this.canvasElement.clientHeight)) {
                    this._sizeChanged = true;
                    this._width = this.canvasElement.clientWidth;
                    this._height = this.canvasElement.clientHeight;
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

    protected render(): TemplateResult {
        return html`
            <canvas id="canvas">
            </canvas>
        `;
    }

    private updateAnimationFrame(_t: DOMHighResTimeStamp): void {
        this._animationFrameHandle = requestAnimationFrame(this._requestAnimationFrameCallback);

        this._throttledResize();
    }

    private resize(): void {
        if (!this._sizeChanged) {
            return;
        }
        this.canvasElement.width = this._width;
        this.canvasElement.height = this._height;
        this._sizeChanged = false;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "audio-viz": AudioVizElement;
    }
}
