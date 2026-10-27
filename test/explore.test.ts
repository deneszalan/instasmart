import { describe, expect, it } from 'vitest';
import { isLoadError } from '../src/components/Explore';

describe('explore slides', () => {
  it('tell a lab whose code could not be fetched (offline or replaced by an update) from a lab that crashed', () => {
    expect(isLoadError(new TypeError('Failed to fetch dynamically imported module: https://x/assets/lab-abc.js'))).toBe(true);
    expect(isLoadError(new TypeError('Importing a module script failed.'))).toBe(true);
    expect(isLoadError(new TypeError('error loading dynamically imported module: https://x/assets/lab-abc.js'))).toBe(true);
    expect(isLoadError(new TypeError("Cannot read properties of undefined (reading 'x')"))).toBe(false);
  });
});
