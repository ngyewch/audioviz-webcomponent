import {LitElement, html, css, TemplateResult, PropertyValues, unsafeCSS} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import DualRangeInput from '@stanko/dual-range-input';

import dualRangeInputCss from '@stanko/dual-range-input/dist/index.css?inline';
import {VisualizationMode} from './types.js';

/**
 * Audio visualization panel web component.
 */
@customElement('audio-viz-panel')
export class AudioVizPanelElement extends LitElement {
    public static styles = [
        css`
            :host {
                display: block;
            }

            .container, #canvas {
                width: 100%;
                height: 100%;
            }
        `,
        unsafeCSS(dualRangeInputCss),
    ];

    @property({type: VisualizationMode})
    public mode: VisualizationMode = VisualizationMode.Waveform;

    @property({type: Array})
    public colors: string[] | undefined = undefined;

    @property({type: Number})
    public minDb: number = -120;

    @property({type: Number})
    public maxDb: number = 0;

    @property({type: Number})
    public dbRangeMin: number = -120;

    @property({type: Number})
    public dbRangeMax: number = 0;

    @query('#minDb')
    private _minDbElement!: HTMLInputElement;

    @query('#maxDb')
    private _maxDbElement!: HTMLInputElement;

    private _dualRangeInput: DualRangeInput | undefined;

    disconnectedCallback(): void {
        if (this._dualRangeInput !== undefined) {
            this._dualRangeInput.destroy();
        }
        super.disconnectedCallback();
    }

    protected render(): TemplateResult {
        return html`
            <div class="container">
                <div class="settings">
                    <div class="dbRange">
                        
                    </div>
                </div>
            </div>
        `;
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        if (this._dualRangeInput !== undefined) {
            this._dualRangeInput.destroy();
            this._dualRangeInput = undefined;
        }
        this._dualRangeInput = new DualRangeInput(this._minDbElement, this._maxDbElement);
    }
}
