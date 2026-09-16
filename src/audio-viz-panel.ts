import {LitElement, html, css, TemplateResult, PropertyValues} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import ky from 'ky';

import {type RemoteSources, type Source, VisualizationMode} from './types.js';
import {AudioVizSettingsElement} from './audio-viz-settings.js';
import {WebSocketSource} from "./wsSource";

interface SourceEntry {
    label: string;
    source: Source;
    closer: () => void;
}

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

            .container {
                display: flex;
                flex-direction: column;
                width: 100%;
                font-family: sans-serif;
                gap: 0.5em;
            }

            .section {
                padding: 1em;
                border-radius: 8px;
                box-shadow: 4px 4px 10px 0 rgba(0, 0, 0, 0.25);
            }
        `,
    ];

    @property({type: String})
    public url: string | undefined = undefined;

    @property({type: VisualizationMode})
    public mode: VisualizationMode = VisualizationMode.Spectrogram;

    @property({type: Number})
    public minDb: number = -120;

    @property({type: Number})
    public maxDb: number = 0;

    @property({type: Number})
    public dbRangeMin: number = -120;

    @property({type: Number})
    public dbRangeMax: number = 0;

    @property({type: Array})
    public colors: string[] | undefined = undefined;

    @property({type: String})
    public elementHeight: string = '320px';

    @state()
    private _sourceEntries: SourceEntry[] = [];

    @query('#settings')
    private _settingsElement!: AudioVizSettingsElement;

    private _mutationObserver: MutationObserver | undefined;
    private _childElements: Element[] = [];

    disconnectedCallback(): void {
        if (this._mutationObserver !== undefined) {
            this._mutationObserver.disconnect();
            this._mutationObserver = undefined;
        }
        super.disconnectedCallback();
    }

    protected willUpdate(changedProperties: PropertyValues<this>): void {
        super.willUpdate(changedProperties);

        if (changedProperties.has('url')) {
            for (const sourceEntry of this._sourceEntries) {
                sourceEntry.closer();
            }
            this._sourceEntries = [];
            if ((this.url !== undefined) && (this.url !== '')) {
                ky.get(this.url)
                    .then(response => response.json<RemoteSources>())
                    .then(remoteSources => {
                        this._sourceEntries = [];
                        for (const remoteSource of remoteSources.sources) {
                            switch (remoteSource.type) {
                                case 'ws':
                                case 'websocket': {
                                    const source = new WebSocketSource(remoteSource.url);
                                    this._sourceEntries.push({
                                        label: remoteSource.label,
                                        source: source,
                                        closer: () => {
                                            source.close();
                                        },
                                    });
                                    break;
                                }
                                default:
                                    throw new Error(`unsupported remote source type ${remoteSource.type}`);
                            }
                        }
                    })
                    .catch(reason => {
                        console.error('audio-viz-panel', 'could not get remote sources', reason);
                    });
            }
        }
    }

    protected render(): TemplateResult {
        return html`
            <div class="container">
                <div class="section">
                    <audio-viz-settings id="settings"
                                        mode="${this.mode}"
                                        minDb="${this.minDb}"
                                        maxDb="${this.maxDb}"
                                        dbRangeMin="${this.dbRangeMin}"
                                        dbRangeMax="${this.dbRangeMax}">
                    </audio-viz-settings>
                </div>
                ${repeat(
                        this._sourceEntries,
                        (sourceEntry) => sourceEntry.source.getId(),
                        (sourceEntry, index) => html`
                            <div class="section">
                                <div>${sourceEntry.label}</div>
                                <audio-viz id="audioviz-${index}"
                                           mode="${this.mode}"
                                           minDb="${this.minDb}"
                                           maxDb="${this.maxDb}"
                                           colors="${this.colors}"
                                           style="width: 100%; height: ${this.elementHeight};">
                                </audio-viz>
                            </div>
                        `,
                )}
            </div>
        `;
    }

    protected updated(changedProperties: PropertyValues<this>) {
        super.updated(changedProperties);

        if (this._mutationObserver !== undefined) {
            this._mutationObserver.disconnect();
            this._mutationObserver = undefined;
        }
        this._mutationObserver = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes') {
                    const attributeName = mutation.attributeName;
                    if (attributeName !== null) {
                        const attributeValue = this._settingsElement.getAttribute(attributeName);
                        console.log('mutated', attributeName, attributeValue);
                        for (const childElement of this._childElements) {
                            if (attributeValue !== null) {
                                childElement.setAttribute(attributeName, attributeValue);
                            } else {
                                childElement.removeAttribute(attributeName);
                            }
                        }
                    }
                }
            }
        });
        this._mutationObserver.observe(this._settingsElement, {
            attributes: true,
        });

        const childElements: Element[] = [];
        for (let i = 0; i < this._sourceEntries.length; i++) {
            const el = this.renderRoot.querySelector(`#audioviz-${i}`);
            if (el !== null) {
                childElements.push(el);
            }
        }
        this._childElements = childElements;
    }
}
