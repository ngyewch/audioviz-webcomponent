import {Color, Gradient} from 'viridis';

export function getColors(gradient: Gradient, numColors: number): Color[] {
    const colors: Color[] = [];
    for (let i = 0; i < numColors; i++) {
        colors.push(gradient.getColor(i, 0, numColors - 1));
    }
    return colors;
}
