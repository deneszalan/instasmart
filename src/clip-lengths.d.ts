declare module 'virtual:clip-lengths' {
  /** Every clip's length in seconds, keyed "<post-id>/<file>.mp4" (see vite.config.ts). */
  const lengths: Record<string, number>;
  export default lengths;
}
