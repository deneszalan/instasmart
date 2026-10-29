declare module 'virtual:clip-lengths' {
  /** Every clip's length in seconds, keyed "<post-id>/<file>.mp4" (see vite.config.ts). */
  const lengths: Record<string, number>;
  export default lengths;
}

declare module 'virtual:media-sizes' {
  /** Every media file's size in bytes, keyed "<post-id>/<file>" (see vite.config.ts). */
  const sizes: Record<string, number>;
  export default sizes;
}
