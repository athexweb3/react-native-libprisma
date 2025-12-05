/**
 * Determines the optimal rendering mode based on code size.
 *
 * @param lineCount - Number of lines in the code
 * @returns Rendering mode: 'simple' | 'optimized' | 'virtualized' | 'native'
 */
export type RenderMode = 'simple' | 'optimized' | 'virtualized' | 'native';

export function getOptimalRenderMode(lineCount: number): RenderMode {
  if (lineCount < 50) {
    return 'simple';
  } else if (lineCount < 500) {
    return 'optimized';
  } else if (lineCount < 2000) {
    return 'virtualized';
  } else {
    return 'native'; // Phase 2: Fabric implementation
  }
}

/**
 * Calculates line height based on font size and line height ratio.
 *
 * @param fontSize - Font size in pixels
 * @param lineHeight - Line height multiplier
 * @returns Calculated line height in pixels
 */
export function calculateLineHeight(
  fontSize: number,
  lineHeight: number
): number {
  return fontSize * lineHeight;
}
