import {LitElement, html, css, TemplateResult, PropertyValues} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import ky from 'ky';

import {type RemoteSources, type Source, VisualizationMode} from './types.js';
import {AudioVizSettingsElement} from './audio-viz-settings.js';
import {WebSocketSource} from "./wsSource";

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
    private _remoteSources: RemoteSources | undefined;

    @state()
    private _sources: Source[] = [];

    @query('#settings')
    private _settingsElement!: AudioVizSettingsElement;

    private _mutationObserver: MutationObserver | undefined;

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
            this._remoteSources = undefined;
            this._sources = [];
            if ((this.url !== undefined && this.url !== '')) {
                ky.get(this.url)
                    .then(response => response.json<RemoteSources>())
                    .then(remoteSources => {
                        this._remoteSources = remoteSources;
                        this._sources = [];
                        for (const remoteSource of remoteSources.sources) {
                            switch (remoteSource.type) {
                                case 'ws':
                                case 'websocket': {
                                    const source = new WebSocketSource(remoteSource.url);
                                    this._sources.push(source);
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
                    <audio-viz-settings id="settings" mode="${this.mode}"
                                        minDb="${this.minDb}" maxDb="${this.maxDb}"
                                        dbRangeMin="${this.dbRangeMin}" dbRangeMax="${this.dbRangeMax}">
                    </audio-viz-settings>
                </div>
                ${repeat(
                        this._sources,
                        (source) => source.getId(),
                        (source, index) => html`
                            <div class="section">
                                <div>Channel ${index}</div>
                                <audio-viz id="audioviz-${source.getId()}" mode="${this.mode}"
                                           minDb="${this.minDb}" maxDb="${this.maxDb}"
                                           colors="${this.colors}"
                                           style="width: 100%; height: ${this.elementHeight};"></audio-viz>
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
                        const attribute = this._settingsElement.attributes.getNamedItem(attributeName);
                        if (attribute !== null) {
                            console.log('mutated', attribute.name, attribute.value);
                        }
                    }
                }
            }
        });
        this._mutationObserver.observe(this._settingsElement, {
            attributes: true,
        });
    }
}
