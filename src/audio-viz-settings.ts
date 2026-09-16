import {LitElement, html, css, TemplateResult, PropertyValues, unsafeCSS} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import DualRangeInput from '@stanko/dual-range-input';

import dualRangeInputCss from '@stanko/dual-range-input/dist/index.css?inline';

import {VisualizationMode} from './types.js';

/**
 * Audio visualization settings web component.
 */
@customElement('audio-viz-settings')
export class AudioVizSettingsElement extends LitElement {
    public static styles = [
        css`
            :host {
                display: block;
            }

            .form-grid {
                display: grid;
                grid-template-columns: auto 1fr;
                gap: 1em;
            }

            .form-label {
                text-align: right;
            }

            .db-range-values {
                display: flex;
                flex-direction: row;
                width: 100%;
            }

            .db-range-values .description {
                text-align: center;
                flex-grow: 1;
            }
        `,
        unsafeCSS(dualRangeInputCss),
    ];

    @property({type: VisualizationMode, reflect: true, useDefault: true})
    public mode: VisualizationMode = VisualizationMode.Spectrogram;

    @property({type: Number, reflect: true, useDefault: true})
    public minDb: number = -120;

    @property({type: Number, reflect: true, useDefault: true})
    public maxDb: number = 0;

    @property({type: Number})
    public dbRangeMin: number = -120;

    @property({type: Number})
    public dbRangeMax: number = 0;

    @query('#mode')
    private _modeElement!: HTMLSelectElement;

    @query('#minDb')
    private _minDbElement!: HTMLInputElement;

    @query('#maxDb')
    private _maxDbElement!: HTMLInputElement;

    @query('#dbRangeMin')
    private _dbRangeMinElement!: HTMLDivElement;

    @query('#dbRangeMax')
    private _dbRangeMaxElement!: HTMLDivElement;

    @query('#dbRange')
    private _dbRangeElement!: HTMLDivElement;

    private _dualRangeInput: DualRangeInput | undefined;

    disconnectedCallback(): void {
        if (this._dualRangeInput !== undefined) {
            this._dualRangeInput.destroy();
        }
        super.disconnectedCallback();
    }

    protected render(): TemplateResult {
        return html`
            <div class="form-grid">
                <div class="form-label">Mode</div>
                <div>
                    <select id="mode">
                        <option value="${VisualizationMode.Waveform}">waveform</option>
                        <option value="${VisualizationMode.Spectrogram}">spectrogram</option>
                    </select>
                </div>
                <div class="form-label">dB range</div>
                <div>
                    <div class="dual-range-input">
                        <input id="minDb" type="range" step="1"/>
                        <input id="maxDb" type="range" step="1"/>
                    </div>
                    <div class="db-range-values">
                        <div id="dbRangeMin">{rangeMin}</div>
                        <div id="dbRange" class="description">{minDb} to {maxDb} dB</div>
                        <div id="dbRangeMax">{rangeMax}</div>
                    </div>
                </div>
            </div>
        `;
    }

    protected updated(_changedProperties: PropertyValues<this>) {
        super.updated(_changedProperties);
        if (this._dualRangeInput !== undefined) {
            this._dualRangeInput.destroy();
            this._dualRangeInput = undefined;
        }
        this._modeElement.value = this.mode.toString();
        this._modeElement.onchange = (event: Event) => {
            const target = event.target as HTMLSelectElement;
            this.mode = Number(target.value);
        };
        this._minDbElement.min = this.dbRangeMin.toString();
        this._minDbElement.max = this.dbRangeMax.toString();
        this._minDbElement.value = this.minDb.toString();
        this._minDbElement.oninput = (event: Event) => {
            const target = event.target as HTMLInputElement;
            this.minDb = Number(target.value);
            this.updateDbRange();
        };
        this._maxDbElement.min = this.dbRangeMin.toString();
        this._maxDbElement.max = this.dbRangeMax.toString();
        this._maxDbElement.value = this.maxDb.toString();
        this._maxDbElement.oninput = (event: Event) => {
            const target = event.target as HTMLInputElement;
            this.maxDb = Number(target.value);
            this.updateDbRange();
        };
        this._dualRangeInput = new DualRangeInput(this._minDbElement, this._maxDbElement);
        this._dbRangeMinElement.innerText = this.dbRangeMin.toString();
        this._dbRangeMaxElement.innerText = this.dbRangeMax.toString();
        this.updateDbRange();
    }

    private updateDbRange(): void {
        this._dbRangeElement.innerText = `${this.minDb} to ${this.maxDb} dB`;
    }
}
