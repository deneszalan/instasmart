import { useState } from 'react';
import { Btn, label, Readouts, Stage, useFrame, useGoal, type LabProps } from '../kit';
import { t } from '../../i18n';

/** Type as it sits in the press: the page's mirror image, so the last letter comes first and each is reversed. */
export const forme = (word: string) => [...word].reverse();

export default function Gutenberg({ onDone, active }: LabProps) {
  const [word, setWord] = useState('MAINZ');
  const [wrong, setWrong] = useState(false); // type cut the right way round, as it should read
  const [press, setPress] = useState<number | null>(null);
  const [printed, setPrinted] = useState<{ word: string; mirrored: boolean } | null>(null);
  useGoal(!!printed && !printed.mirrored && printed.word.length >= 3, onDone);
  useFrame((dt) => {
    if (press === null) return;
    if (press + dt >= 1) {
      setPress(null);
      setPrinted({ word, mirrored: wrong });
    } else setPress(press + dt);
  }, active && press !== null);

  const letter = (ctx: CanvasRenderingContext2D, ch: string, x: number, y: number, size: number, mirror: boolean, colour: string) => {
    ctx.save();
    ctx.translate(x, y);
    if (mirror) ctx.scale(-1, 1);
    label(ctx, ch, 0, 0, { size, weight: 800, color: colour });
    ctx.restore();
  };

  const draw = (ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) => {
    const letters = word ? (wrong ? [...word] : forme(word)) : [];
    const sw = Math.min(34, (w * 0.9) / Math.max(1, letters.length)), y0 = 26, x0 = w / 2 - (letters.length * sw) / 2;
    label(ctx, t('the type, face up'), w / 2, 9, { size: 10.5 });
    letters.forEach((ch, i) => {
      const x = x0 + i * sw;
      ctx.fillStyle = '#78716c';
      ctx.fillRect(x + 1, y0, sw - 2, sw * 1.1);
      ctx.fillStyle = '#a8a29e';
      ctx.fillRect(x + 1, y0, sw - 2, 4);
      letter(ctx, ch, x + sw / 2, y0 + sw * 0.6, sw * 0.7, !wrong, '#1c1917');
    });
    // the sheet coming down onto the inked type, then lifted to show the print
    const py = h * 0.58, ph = h - py - 8, drop = press === null ? 0 : Math.sin(press * Math.PI);
    ctx.fillStyle = '#f5f0e1';
    ctx.fillRect(16, py - drop * (py - y0 - sw * 1.1) * 0.6, w - 32, ph);
    if (printed && press === null) {
      const n = printed.word.length, pw = Math.min(30, (w - 60) / Math.max(1, n));
      // the print is the type's mirror image: reversed letters come out the right way round
      const shown = printed.mirrored ? forme(printed.word) : [...printed.word];
      shown.forEach((ch, i) => letter(ctx, ch, w / 2 - (n * pw) / 2 + (i + 0.5) * pw, py + ph / 2, pw * 0.85, printed.mirrored, '#111827'));
      label(ctx, printed.mirrored ? t('back to front!') : t('reads right'), w - 22, py + 10, { size: 10, align: 'right', color: printed.mirrored ? '#b91c1c' : '#15803d' });
    } else if (press === null) label(ctx, t('paper'), w / 2, py + ph / 2, { size: 11, color: '#a8a29e' });
  };

  return (
    <div className="lab">
      <div className="lab__row">
        <input
          className="lab__text"
          value={word}
          maxLength={10}
          aria-label={t('Word to set in type')}
          onChange={(e) => {
            setWord(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''));
            setPrinted(null);
          }}
        />
        <Btn onClick={() => setPress(0)} disabled={!word || press !== null}>
          {t('Ink and print')}
        </Btn>
      </div>
      <Stage draw={draw} label={t('Metal type for {w}, and the printed sheet', { w: word })} />
      <div className="lab__row">
        <Btn ghost={!wrong} onClick={() => (setWrong((x) => !x), setPrinted(null))}>
          {wrong ? t('Cut it back to front') : t('Cut the type the way it reads')}
        </Btn>
      </div>
      <Readouts
        items={[
          { label: t('Pieces of type'), value: String(word.length) },
          { label: t('Gutenberg’s type case'), value: t('about 290 sorts'), tone: 'accent' },
        ]}
      />
    </div>
  );
}
