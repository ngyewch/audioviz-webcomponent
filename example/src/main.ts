import {mount} from 'svelte';

import 'bulma/css/bulma.css';
import '@stanko/dual-range-input/dist/index.css';
import './app.css';

import App from './App.svelte';

const app = mount(App, {
    target: document.getElementById('app')!,
});

export default app;
