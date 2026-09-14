<script lang="ts">
    import {onDestroy, onMount} from 'svelte';
    import DualRangeInput from '@stanko/dual-range-input';
    import {Palette, type PaletteName} from 'viridis';
    import {type AnalyzedData, LocalSource, VisualizationMode} from 'audioviz-webcomponent';

    import {getColors} from './colors.js';

    const rangeMin = -150;
    const rangeMax = 0;

    let dualRangeInput: DualRangeInput | undefined;

    let minDbEl = $state<HTMLInputElement>();
    let maxDbEl = $state<HTMLInputElement>();
    let minDb = $state<number>(-150);
    let maxDb = $state<number>(-50);
    let mode = $state<VisualizationMode>(VisualizationMode.Spectrogram);
    let colorMapName = $state<PaletteName>('Inferno');
    let colors = $derived.by(() => {
        const colors = getColors(Palette[colorMapName], 256);
        colors.reverse();
        return colors.map(color => color.toString('hex'));
    });
    let started = $state<boolean>(false);
    let source = $state<LocalSource>();

    onMount(() => {
        if ((minDbEl !== undefined) && (maxDbEl !== undefined)) {
            dualRangeInput = new DualRangeInput(minDbEl, maxDbEl);
        }
    });

    onDestroy(() => {
        if (dualRangeInput !== undefined) {
            dualRangeInput.destroy();
        }
    });

    function start() {
        if (source !== undefined) {
            return;
        }
        LocalSource.create(1024)
            .then(newSource => {
                source = newSource;
                started = true;
            });
    }

    function stop() {
        if (source === undefined) {
            return;
        }
        source.close();
        source = undefined;
        started = false;
    }

    function getAnalyzedData(): AnalyzedData | undefined {
        if (source === undefined) {
            return undefined;
        }
        return source.getAnalyzedData();
    }
</script>

<div class="spectrograms-container">
    <div class="box">
        <div class="field is-horizontal">
            <div class="field-label is-normal">
                <label class="label" for="mode">Mode</label>
            </div>
            <div class="field-body">
                <div class="field">
                    <div class="select">
                        <select id="mode" bind:value={mode}>
                            <option value={VisualizationMode.Waveform}>waveform</option>
                            <option value={VisualizationMode.Spectrogram}>spectrogram</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <div class="field is-horizontal">
            <div class="field-label is-normal">
                <label class="label" for="palette">Palette</label>
            </div>
            <div class="field-body">
                <div class="field">
                    <div class="select">
                        <select id="palette" bind:value={colorMapName}>
                            <option>Viridis</option>
                            <option>Inferno</option>
                            <option>Magma</option>
                            <option>Plasma</option>
                            <option>Grayscale</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <div class="field is-horizontal">
            <div class="field-label is-normal">
                <label class="label" for="mode">Palette</label>
            </div>
            <div class="field-body">
                <div class="field">
                    <div class="dual-range-input">
                        <input bind:this={minDbEl} type="range" min={rangeMin} max={rangeMax} step="1"
                               bind:value={minDb}
                               id="min"/>
                        <input bind:this={maxDbEl} type="range" min={rangeMin} max={rangeMax} step="1"
                               bind:value={maxDb}
                               id="max"/>
                    </div>
                    <div class="db-range-values">
                        <div>{rangeMin}</div>
                        <div class="description">{minDb} to {maxDb} dB</div>
                        <div>{rangeMax}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="field is-horizontal">
            <div class="field-label is-normal">
            </div>
            <div class="field-body">
                <button class="button" onclick={start} class:is-hidden={started}>Start</button>
                <button class="button" onclick={stop} class:is-hidden={!started}>Stop</button>
            </div>
        </div>
    </div>
    <div class="box">
        <audio-viz class="audioviz" colors={colors} minDb={minDb} maxDb={maxDb} mode={mode}
                   getAnalyzedData={() => getAnalyzedData()}></audio-viz>
    </div>
</div>

<style>
    .spectrograms-container {
        display: flex;
        flex-direction: column;
        padding: 1em;
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

    .audioviz {
        width: 100%;
        height: 320px;
    }
</style>
