import {Color, Gradient, Palette} from 'viridis';

function getColors(gradient: Gradient): Color[] {
    const colors: Color[] = [];
    for (let i = 0; i < 256; i++) {
        colors.push(gradient.getColor(i, 0, 255));
    }
    colors.reverse();
    return colors;
}

const defaultPalette: Gradient = Palette.Inferno;

export const defaultColors: Color[] = getColors(defaultPalette);
