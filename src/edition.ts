import type { Edition } from '../shared/editions.ts';

declare const __EDITION__: Edition;

/** The edition this build is, put in by vite.config.ts from `vite --mode`; a build carries only its own. */
export const EDITION: Edition = __EDITION__;
