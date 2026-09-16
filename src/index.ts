import {AudioVizElement} from './audio-viz.js';
import {AudioVizPanelElement} from './audio-viz-panel.js';
import {AudioVizSettingsElement} from './audio-viz-settings.js';
import {type GetAnalyzedDataFunction, type AnalyzedData, type Source, VisualizationMode} from './types.js';
import {LocalSource} from './localSource.js';
import {WebSocketSource} from './wsSource.js';

declare global {
    interface HTMLElementTagNameMap {
        "audio-viz": AudioVizElement,
        "audio-viz-panel": AudioVizPanelElement,
        "audio-viz-settings": AudioVizSettingsElement,
    }
}

export {
    AudioVizElement,
    AudioVizPanelElement,
    AudioVizSettingsElement,
    type AnalyzedData,
    type GetAnalyzedDataFunction,
    LocalSource,
    type Source,
    VisualizationMode,
    WebSocketSource,
};
