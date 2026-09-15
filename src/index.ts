import {AudioVizElement} from './audio-viz.js';
import {type GetAnalyzedDataFunction, type AnalyzedData, type Source, VisualizationMode} from './types.js';
import {LocalSource} from './localSource.js';
import {WebSocketSource} from './wsSource.js';

declare global {
    interface HTMLElementTagNameMap {
        "audio-viz": AudioVizElement;
    }
}

export {
    AudioVizElement,
    type AnalyzedData,
    type GetAnalyzedDataFunction,
    LocalSource,
    type Source,
    VisualizationMode,
    WebSocketSource,
};
