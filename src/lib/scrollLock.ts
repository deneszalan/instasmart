let locks = 0;

/** Stop the page behind an overlay from scrolling. Returns the matching unlock. */
export function lockScroll(): () => void {
  locks++;
  document.body.classList.add('no-scroll');
  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks--;
    if (locks === 0) document.body.classList.remove('no-scroll');
  };
}
