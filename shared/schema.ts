import { z } from 'zod';
import { FIELD_IDS } from './fields.ts';

/**
 * The content format for every post in content/posts/. Shared by the app,
 * the `npm run content` validator and the MCP upload server.
 */

/** Hosts that posts may link images from directly. Anything else must be committed under content/media/. */
export const IMAGE_HOSTS = ['upload.wikimedia.org', 'thumb.wikimedia.org'];

export const MEDIA_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif', 'svg'] as const;

const MEDIA_NAME = new RegExp(`^[a-z0-9][a-z0-9_-]*\\.(${MEDIA_EXTENSIONS.join('|')})$`);

const text = (max: number) => z.string().trim().min(1).max(max);

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a 6-digit hex colour such as #1d4ed8');

const httpsUrl = z.url({ protocol: /^https$/, error: 'Use a full https:// URL' });

/** A file in the post's media folder (content/media/<post-id>/<name>) or an image on an allowed host. */
export const ImageSrc = z
  .string()
  .refine(
    (src) => {
      if (MEDIA_NAME.test(src)) return true;
      try {
        const url = new URL(src);
        return url.protocol === 'https:' && IMAGE_HOSTS.includes(url.hostname);
      } catch {
        return false;
      }
    },
    {
      error: `Use a file name from content/media/<post-id>/ (lowercase, e.g. "diagram.svg"; allowed: ${MEDIA_EXTENSIONS.join(', ')}) or an https URL on ${IMAGE_HOSTS.join(', ')}`,
    },
  )
  .describe('File name in content/media/<post-id>/, e.g. "diagram.svg", or an https:// URL on upload.wikimedia.org or thumb.wikimedia.org');

export const TextSlide = z
  .object({
    type: z.literal('text'),
    heading: text(40).optional(),
    text: text(320).describe('Supports **bold**, *italic* and [links](https://…).'),
  })
  .strict();

export const ImageSlide = z
  .object({
    type: z.literal('image'),
    src: ImageSrc,
    alt: text(300).describe('What the image shows, for screen readers.'),
    caption: text(200).optional(),
    fit: z
      .enum(['cover', 'contain'])
      .optional()
      .describe('"cover" fills the slide (photos); "contain" shows the whole image on the field colours (diagrams). Default cover.'),
    credit: text(120).optional().describe('Photographer / licence, e.g. "NASA · Public domain".'),
  })
  .strict();

export const StatSlide = z
  .object({
    type: z.literal('stat'),
    value: text(16).describe('The big number, e.g. "86 billion" or "3×".'),
    label: text(90).describe('What the number counts.'),
    text: text(220).optional(),
  })
  .strict();

/** Rough number of lines a piece of text takes on a phone-width slide. */
const lines = (value: string, perLine: number) => Math.max(1, Math.ceil(value.length / perLine));
/** How many such lines fit on one slide below its heading. */
const SLIDE_LINES = 12;

export const ListSlide = z
  .object({
    type: z.literal('list'),
    heading: text(40).optional(),
    style: z.enum(['bullets', 'numbers', 'steps']).optional(),
    items: z.array(text(110)).min(2).max(6),
  })
  .strict()
  .superRefine((slide, ctx) => {
    const rows = slide.items.reduce((n, item) => n + lines(item, 30), 0);
    if (rows > SLIDE_LINES) {
      ctx.addIssue({
        code: 'custom',
        path: ['items'],
        message: `Too much text for one slide: about ${rows} lines, and ${SLIDE_LINES} fit. Shorten the items or use fewer.`,
      });
    }
  });

export const QuoteSlide = z
  .object({
    type: z.literal('quote'),
    text: text(240).describe('A real, verifiable quotation. Never invent or misattribute quotes.'),
    attribution: text(80).optional(),
  })
  .strict();

const CompareSide = z.object({ label: text(24), text: text(160) }).strict();

export const CompareSlide = z
  .object({
    type: z.literal('compare'),
    heading: text(40).optional(),
    left: CompareSide.describe('e.g. { "label": "Myth", ... }'),
    right: CompareSide.describe('e.g. { "label": "Fact", ... }'),
  })
  .strict();

export const TimelineSlide = z
  .object({
    type: z.literal('timeline'),
    heading: text(40).optional(),
    events: z
      .array(z.object({ when: text(24), text: text(110) }).strict())
      .min(2)
      .max(5),
  })
  .strict()
  .superRefine((slide, ctx) => {
    // Each event takes a line for its date plus its text.
    const rows = slide.events.reduce((n, e) => n + 1 + lines(e.text, 34), 0);
    if (rows > SLIDE_LINES) {
      ctx.addIssue({
        code: 'custom',
        path: ['events'],
        message: `Too much text for one slide: about ${rows} lines, and ${SLIDE_LINES} fit. Shorten the events or use fewer.`,
      });
    }
  });

export const QuizSlide = z
  .object({
    type: z.literal('quiz'),
    question: text(140),
    options: z.array(text(40)).min(2).max(4).describe('2–4 short answers; make the wrong ones plausible.'),
    answer: z.number().int().min(0).describe('Index of the correct option, counting from 0.'),
    explanation: text(200).describe('Shown after answering: why that is the answer.'),
  })
  .strict()
  .superRefine((slide, ctx) => {
    if (slide.answer >= slide.options.length) {
      ctx.addIssue({ code: 'custom', path: ['answer'], message: `answer must be between 0 and ${slide.options.length - 1}` });
    }
  });

export const RevealSlide = z
  .object({
    type: z.literal('reveal'),
    prompt: text(140).describe('The teaser or question shown first.'),
    answer: text(80).describe('Revealed when the reader taps.'),
    detail: text(200).optional().describe('A line of context under the answer.'),
  })
  .strict();

export const EstimateSlide = z
  .object({
    type: z.literal('estimate'),
    question: text(120).describe('What to guess, e.g. "How hot is the surface of Venus?"'),
    min: z.number(),
    max: z.number(),
    step: z.number().positive().optional().describe('Slider step; defaults to a hundredth of the range.'),
    answer: z.number().describe('The real value, between min and max.'),
    unit: text(16).optional().describe('Shown after the number, e.g. "km", "%", "°C".'),
    format: z.enum(['number', 'year']).optional().describe('"year" shows 1582 rather than 1,582.'),
    explanation: text(200).describe('Shown after guessing.'),
  })
  .strict()
  .superRefine((slide, ctx) => {
    if (slide.max <= slide.min) ctx.addIssue({ code: 'custom', path: ['max'], message: 'max must be greater than min' });
    else if (slide.answer < slide.min || slide.answer > slide.max) {
      ctx.addIssue({ code: 'custom', path: ['answer'], message: 'answer must lie between min and max' });
    }
    if (slide.step !== undefined && slide.step > slide.max - slide.min) {
      ctx.addIssue({ code: 'custom', path: ['step'], message: 'step must be smaller than the range' });
    }
  });

export const OrderSlide = z
  .object({
    type: z.literal('order'),
    heading: text(60).describe('The instruction, e.g. "Oldest first" or "Smallest to largest".'),
    items: z.array(text(40)).min(3).max(5).describe('In the correct order; the app shuffles them.'),
    explanation: text(160).optional().describe('Shown after the reader has ordered them.'),
  })
  .strict();

/* ---- Visual slides: drawn by the app from numbers, so they need no image files. ---- */

const Datum = z.object({
  label: text(28),
  value: z.number().finite().describe('The number, in the unit the slide names.'),
  emphasis: z.boolean().optional().describe('Highlight this one.'),
});

export const ChartSlide = z
  .object({
    type: z.literal('chart'),
    heading: text(80).describe('What the bars compare, e.g. "CO₂ per person, tonnes a year".'),
    items: z.array(Datum.strict()).min(2).max(6).describe('Bars, top to bottom. Values must be 0 or more.'),
    unit: text(16).optional().describe('Shown after each number, e.g. "t", "%", "km".'),
    note: text(100).optional().describe('A line under the chart: the year, the measure, a caveat.'),
  })
  .strict()
  .superRefine((slide, ctx) => {
    if (slide.items.some((d) => d.value < 0)) ctx.addIssue({ code: 'custom', path: ['items'], message: 'bar values must be 0 or more' });
    else if (!slide.items.some((d) => d.value > 0)) ctx.addIssue({ code: 'custom', path: ['items'], message: 'at least one bar must be above 0' });
  });

export const PictogramSlide = z
  .object({
    type: z.literal('pictogram'),
    heading: text(90).describe('The statement the icons show, e.g. "1 in 4 adults don’t get enough exercise".'),
    icon: text(8).describe('One emoji, repeated once per unit, e.g. "🧍".'),
    total: z.number().int().min(2).max(100).describe('How many icons to draw: the whole. 100 makes a 10×10 grid.'),
    count: z.number().int().min(0).describe('How many of them light up: the part.'),
    note: text(100).optional(),
  })
  .strict()
  .superRefine((slide, ctx) => {
    if (slide.count > slide.total) ctx.addIssue({ code: 'custom', path: ['count'], message: 'count cannot be more than total' });
  });

export const ScaleSlide = z
  .object({
    type: z.literal('scale'),
    heading: text(80).describe('What is being compared, e.g. "Earth next to Jupiter, by volume".'),
    items: z
      .array(Datum.extend({ label: text(20) }).strict())
      .min(2)
      .max(4)
      .describe('Circles whose areas are proportional to the values. Smallest to largest reads best.'),
    unit: text(16).optional(),
    note: text(100).optional(),
  })
  .strict()
  .superRefine((slide, ctx) => {
    if (slide.items.some((d) => d.value <= 0)) ctx.addIssue({ code: 'custom', path: ['items'], message: 'scale values must be above 0' });
  });

export const SpectrumSlide = z
  .object({
    type: z.literal('spectrum'),
    heading: text(80).describe('What the scale measures, e.g. "How loud is loud? (decibels)".'),
    min: z.number(),
    max: z.number(),
    marks: z
      .array(z.object({ label: text(28), value: z.number(), emphasis: z.boolean().optional() }).strict())
      .min(2)
      .max(6)
      .describe('Points on the scale, each between min and max.'),
    unit: text(16).optional(),
    format: z.enum(['number', 'year']).optional().describe('"year" shows 1963 rather than 1,963. Assumed for unit-less whole numbers between 1000 and 2100.'),
    ends: z.tuple([text(16), text(16)]).optional().describe('Words at the low and high ends, e.g. ["Acid", "Alkaline"].'),
    colors: z.tuple([hexColor, hexColor]).optional().describe('Bar colours at the low and high ends.'),
    note: text(100).optional(),
  })
  .strict()
  .superRefine((slide, ctx) => {
    if (slide.max <= slide.min) ctx.addIssue({ code: 'custom', path: ['max'], message: 'max must be greater than min' });
    else if (slide.marks.some((m) => m.value < slide.min || m.value > slide.max)) {
      ctx.addIssue({ code: 'custom', path: ['marks'], message: 'every mark must lie between min and max' });
    }
  });

export const FlowSlide = z
  .object({
    type: z.literal('flow'),
    heading: text(60).describe('The process, e.g. "How a vaccine trains the immune system".'),
    steps: z
      .array(z.object({ icon: text(8).optional().describe('One emoji.'), label: text(44) }).strict())
      .min(3)
      .max(5),
    cycle: z.boolean().optional().describe('The last step leads back to the first.'),
  })
  .strict();

/* ---- Puzzle slides: interactive like quiz and order; the app records how the reader did. ---- */

export const MatchSlide = z
  .object({
    type: z.literal('match'),
    heading: text(60).describe('The instruction, e.g. "Match the scientist to the discovery".'),
    pairs: z
      .array(z.object({ left: text(28), right: text(28) }).strict())
      .min(3)
      .max(5)
      .describe('Correct pairs; the app shuffles the right-hand side.'),
    explanation: text(160).optional().describe('Shown once every pair is matched.'),
  })
  .strict()
  .superRefine((slide, ctx) => {
    const lefts = new Set(slide.pairs.map((p) => p.left.toLowerCase()));
    const rights = new Set(slide.pairs.map((p) => p.right.toLowerCase()));
    if (lefts.size < slide.pairs.length || rights.size < slide.pairs.length) {
      ctx.addIssue({ code: 'custom', path: ['pairs'], message: 'each side of the pairs must be unique' });
    }
  });

export const SortSlide = z
  .object({
    type: z.literal('sort'),
    heading: text(60).describe('The question each item answers, e.g. "Fact or myth?" or "Mammal or not?".'),
    bins: z.tuple([text(16), text(16)]).describe('The two answers, e.g. ["Fact", "Myth"].'),
    items: z
      .array(z.object({ text: text(60), bin: z.number().int().min(0).max(1).describe('0 for the first bin, 1 for the second.') }).strict())
      .min(3)
      .max(5),
    explanation: text(160).optional().describe('Shown at the end.'),
  })
  .strict()
  .superRefine((slide, ctx) => {
    if (new Set(slide.items.map((i) => i.bin)).size < 2) {
      ctx.addIssue({ code: 'custom', path: ['items'], message: 'use both bins at least once' });
    }
  });

export const ScrambleSlide = z
  .object({
    type: z.literal('scramble'),
    clue: text(120).describe('The hint, e.g. "The process plants use to turn light into sugar".'),
    answer: z
      .string()
      .trim()
      .regex(/^[A-Za-z]{3,14}$/, 'One word of 3–14 plain letters (A–Z), no spaces or accents')
      .describe('The word, shown as shuffled letter tiles.'),
    detail: text(160).optional().describe('Shown after solving.'),
  })
  .strict();

export const OddSlide = z
  .object({
    type: z.literal('odd'),
    heading: text(60).optional().describe('Defaults to "Which one doesn’t belong?".'),
    items: z.array(text(36)).min(3).max(4),
    answer: z.number().int().min(0).describe('Index of the odd one out, counting from 0.'),
    explanation: text(200).describe('Why it doesn’t belong, and what the others share.'),
  })
  .strict()
  .superRefine((slide, ctx) => {
    if (slide.answer >= slide.items.length) {
      ctx.addIssue({ code: 'custom', path: ['answer'], message: `answer must be between 0 and ${slide.items.length - 1}` });
    }
  });

/* ---- Visual puzzles: a chart, pictogram or spectrum the reader guesses at before it is revealed. ---- */

export const RankSlide = z
  .object({
    type: z.literal('rank'),
    heading: text(80).describe('What to rank, e.g. "Which emits the most CO₂ per person?"'),
    items: z
      .array(Datum.strict())
      .min(3)
      .max(5)
      .describe('Any order; the app shuffles them and the reader taps from largest to smallest. Values must all differ.'),
    unit: text(16).optional(),
    note: text(100).optional(),
    explanation: text(160).optional().describe('Shown with the revealed bars.'),
  })
  .strict()
  .superRefine((slide, ctx) => {
    if (slide.items.some((d) => d.value < 0)) ctx.addIssue({ code: 'custom', path: ['items'], message: 'values must be 0 or more' });
    else if (new Set(slide.items.map((d) => d.value)).size < slide.items.length) {
      ctx.addIssue({ code: 'custom', path: ['items'], message: 'values must all differ, or there is no single right order' });
    }
  });

export const HigherSlide = z
  .object({
    type: z.literal('higher'),
    heading: text(80).describe('The measure, e.g. "Known moons" or "Boiling point".'),
    items: z
      .array(Datum.strict())
      .min(3)
      .max(5)
      .describe('In play order: the first is shown, then the reader guesses higher or lower for each of the rest.'),
    unit: text(16).optional(),
    note: text(100).optional(),
    explanation: text(160).optional(),
  })
  .strict()
  .superRefine((slide, ctx) => {
    if (slide.items.some((d) => d.value < 0)) ctx.addIssue({ code: 'custom', path: ['items'], message: 'values must be 0 or more' });
    else if (slide.items.some((d, i) => i > 0 && d.value === slide.items[i - 1].value)) {
      ctx.addIssue({ code: 'custom', path: ['items'], message: 'two items in a row must not have the same value' });
    }
  });

export const FillSlide = z
  .object({
    type: z.literal('fill'),
    question: text(120).describe('e.g. "Out of 10 adults, how many don’t get enough exercise?"'),
    icon: text(8).describe('One emoji, repeated.'),
    total: z.number().int().min(2).max(20).describe('How many icons: 10 or 20 are easiest to count.'),
    answer: z.number().int().min(0).describe('How many really count: the real share, rounded.'),
    explanation: text(200).describe('Shown after the guess.'),
  })
  .strict()
  .superRefine((slide, ctx) => {
    if (slide.answer > slide.total) ctx.addIssue({ code: 'custom', path: ['answer'], message: 'answer cannot be more than total' });
  });

export const PlaceSlide = z
  .object({
    type: z.literal('place'),
    question: text(120).describe('e.g. "How loud is a rock concert?"'),
    min: z.number(),
    max: z.number(),
    step: z.number().positive().optional().describe('Slider step; defaults to a hundredth of the range.'),
    answer: z.number().describe('The real value, between min and max.'),
    unit: text(16).optional(),
    format: z.enum(['number', 'year']).optional().describe('"year" shows 1963 rather than 1,963. Assumed for unit-less whole numbers between 1000 and 2100.'),
    ends: z.tuple([text(16), text(16)]).optional().describe('Words at the low and high ends, e.g. ["Silence", "Pain"].'),
    colors: z.tuple([hexColor, hexColor]).optional().describe('Bar colours at the low and high ends.'),
    hints: z
      .array(z.object({ label: text(14), value: z.number() }).strict())
      .max(4)
      .optional()
      .describe('Known points shown on the scale as clues, e.g. a whisper at 30 dB.'),
    explanation: text(200).describe('Shown after the guess.'),
  })
  .strict()
  .superRefine((slide, ctx) => {
    if (slide.max <= slide.min) {
      ctx.addIssue({ code: 'custom', path: ['max'], message: 'max must be greater than min' });
    } else {
      if (slide.answer < slide.min || slide.answer > slide.max) {
        ctx.addIssue({ code: 'custom', path: ['answer'], message: 'answer must lie between min and max' });
      }
      if (slide.hints?.some((h) => h.value < slide.min || h.value > slide.max)) {
        ctx.addIssue({ code: 'custom', path: ['hints'], message: 'every hint must lie between min and max' });
      }
    }
    if (slide.step !== undefined && slide.step > slide.max - slide.min) {
      ctx.addIssue({ code: 'custom', path: ['step'], message: 'step must be smaller than the range' });
    }
  });

export const Slide = z.discriminatedUnion('type', [
  TextSlide,
  ImageSlide,
  StatSlide,
  ListSlide,
  QuoteSlide,
  CompareSlide,
  TimelineSlide,
  QuizSlide,
  RevealSlide,
  EstimateSlide,
  OrderSlide,
  ChartSlide,
  PictogramSlide,
  ScaleSlide,
  SpectrumSlide,
  FlowSlide,
  MatchSlide,
  SortSlide,
  ScrambleSlide,
  OddSlide,
  RankSlide,
  HigherSlide,
  FillSlide,
  PlaceSlide,
]);

export const Source = z.object({ label: text(120), url: httpsUrl }).strict();

export const Post = z
  .object({
    $schema: z.string().optional(),
    id: z
      .string()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase kebab-case, e.g. "physics-mpemba-effect"')
      .max(80)
      .describe('`<field>-<slug>`. Also the file name: content/posts/<field>/<id>.json'),
    field: z.enum(FIELD_IDS),
    title: text(90).describe('The hook shown big on the first slide: a surprising, complete statement.'),
    emoji: text(16).describe('One emoji illustrating the post.'),
    cover: z
      .object({ src: ImageSrc, alt: text(300), credit: text(120).optional() })
      .strict()
      .optional()
      .describe('Optional photo behind the title on the first slide.'),
    body: text(1200).min(80).describe('The caption: 2–5 sentences explaining why or how. Supports **bold**, *italic*, [links](https://…).'),
    slides: z.array(Slide).max(9).optional().describe('Extra carousel slides after the title slide.'),
    tags: z
      .array(z.string().regex(/^[a-z0-9]+$/, 'Tags are lowercase letters and digits, without "#"').max(30))
      .min(1)
      .max(6),
    source: Source.describe('Where a reader can check the claim. Prefer Wikipedia or a primary/academic source.'),
    theme: z
      .object({ gradient: z.tuple([hexColor, hexColor]) })
      .strict()
      .optional()
      .describe('Override the field colours. Pick dark enough colours for white text.'),
    author: z
      .object({
        name: text(60),
        kind: z.enum(['ai', 'human']),
        model: text(60).optional(),
      })
      .strict()
      .optional()
      .describe('Who wrote it. LLM contributors use kind "ai".'),
    createdAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
      .optional(),
  })
  .strict()
  .superRefine((post, ctx) => {
    if (!post.id.startsWith(`${post.field}-`)) {
      ctx.addIssue({ code: 'custom', path: ['id'], message: `id must start with "${post.field}-"` });
    }
  });

export type Post = z.infer<typeof Post>;
export type Slide = z.infer<typeof Slide>;
export type Source = z.infer<typeof Source>;

/** Every image file name a post refers to (excluding allowed remote URLs). */
export function localMedia(post: Post): string[] {
  const srcs = [post.cover?.src, ...(post.slides ?? []).map((s) => (s.type === 'image' ? s.src : undefined))];
  return [...new Set(srcs.filter((s): s is string => !!s && !s.startsWith('https://')))];
}

export function formatIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.map((p) => (typeof p === 'number' ? `[${p}]` : `.${String(p)}`)).join('').replace(/^\./, '');
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}

export function postJsonSchema(): unknown {
  return {
    $id: 'https://github.com/deneszalan/instasmart/content/schema/post.schema.json',
    title: 'Reckon post',
    ...(z.toJSONSchema(Post, { io: 'input', unrepresentable: 'any' }) as object),
  };
}
