import type { Slide } from '../types';
import { t } from '../i18n';

type VideoSlide = Extract<Slide, { type: 'video' }>;

/** A short's ratings (content/README.md, "Rating a short"), each as a ten-step meter with its score. */
export function Ratings({ ratings }: { ratings: VideoSlide['ratings'] }) {
  return (
    <div className="ratings">
      <Meter label={t('Complexity')} value={ratings.complexity} />
      <Meter label={t('Shock factor')} value={ratings.shock} />
    </div>
  );
}

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <span className="rating" role="img" aria-label={t('{label}: {value} out of 10', { label, value })}>
      <span className="rating__label" aria-hidden="true">
        {label}
      </span>
      <span className="rating__bar" aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className={`rating__step${i < value ? ' rating__step--on' : ''}`} />
        ))}
      </span>
      <span className="rating__value" aria-hidden="true">
        {value}
      </span>
    </span>
  );
}
