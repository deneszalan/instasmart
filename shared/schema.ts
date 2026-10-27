import { z } from 'zod';
import { FIELD_IDS } from './fields.ts';
import { LAB_IDS } from './labs.ts';
import { bubbleBox, bubbleLines, captionBox, COMIC, COVERED, edgeOnly, overlaps } from './comic.ts';

/**
 * The content format for every post in content/posts/. Shared by the app,
 * the `npm run content` validator and the MCP upload server.
 */

/** Hosts that posts may link images from directly. Anything else must be committed under content/media/. */
export const IMAGE_HOSTS = ['upload.wikimedia.org', 'thumb.wikimedia.org'];

export const MEDIA_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif', 'svg'] as const;

/** Video clips are committed like images; only MP4 (H.264, optionally AAC audio) plays on every phone. */
export const VIDEO_EXTENSIONS = ['mp4'] as const;

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

/** A clip in the post's media folder: content/media/<post-id>/<name>.mp4. */
export const VideoSrc = z
  .string()
  .regex(/^[a-z0-9][a-z0-9_-]*\.mp4$/, 'Use an .mp4 file name from content/media/<post-id>/ (lowercase, e.g. "launch.mp4")')
  .describe('File name of an MP4 clip in content/media/<post-id>/. Make it with `npm run clip`.');

/** A still from the clip, shown before it plays: a local image file. */
const LocalImage = z
  .string()
  .regex(new RegExp(`^[a-z0-9][a-z0-9_-]*\\.(${MEDIA_EXTENSIONS.filter((e) => e !== 'svg').join('|')})$`), 'Use an image file name from content/media/<post-id>/, e.g. "launch.jpg"');

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

const percent = z.number().min(0).max(100);

export const ComicBubble = z
  .object({
    text: text(110).describe('The words, lettered in capitals. Real people only say what the record says they said, wrote or did.'),
    speaker: text(40).optional().describe('Who speaks, read out by screen readers, e.g. "John Snow".'),
    x: percent.describe('Centre of the bubble across the panel, 0 (left edge) to 100 (right edge).'),
    y: percent.describe('Centre of the bubble down the panel, 0 (top) to 100 (bottom).'),
    width: z.number().min(24).max(90).optional().describe(`Bubble width in percent of the panel's width. Default ${COMIC.bubbleWidth}.`),
    tail: z
      .object({ x: percent, y: percent })
      .strict()
      .optional()
      .describe("Where the tail points: the speaker's mouth (or head, for a thought), in the same units. Leave it out for a voice from off the panel."),
    kind: z
      .enum(['speech', 'thought', 'shout', 'laugh'])
      .optional()
      .describe('Default "speech". "thought" is a cloud with bubbles for a tail; "shout" a jagged burst; "laugh" laughter (HA HA!) lettered with shake marks and no balloon, beside the laugher and without a tail.'),
    timing: z
      .enum(['interrupts', 'together'])
      .optional()
      .describe('How this bubble meets the one before it. "interrupts": it cuts that line off, so the line before ends with a dash (—) and this bubble overlaps its edge, drawn on top. "together": both are said at once, so the two bubbles overlap.'),
  })
  .strict()
  .superRefine((b, ctx) => {
    if (b.kind === 'laugh' && b.tail) ctx.addIssue({ code: 'custom', path: ['tail'], message: 'laughter has no tail: letter it right beside the laugher' });
  });

export const ComicSlide = z
  .object({
    type: z.literal('comic'),
    src: ImageSrc.describe('The panel art: a 4:5 picture (1080 × 1350) with no words in it. The app letters the caption and bubbles on top.'),
    alt: text(300).describe('What the panel shows, for screen readers. The caption and bubbles are read out after it.'),
    caption: text(150).optional().describe("The narrator's box: where and when, and the facts. Dates and numbers belong here, not in a bubble."),
    captionAt: z.enum(['top', 'bottom']).optional().describe('Where the caption box sits. Default top.'),
    bubbles: z.array(ComicBubble).max(3).optional().describe('Speech, thought or shout bubbles, in reading order (left to right, top to bottom).'),
    credit: text(120).optional().describe('Who drew the art and its licence, if not the post\'s author.'),
  })
  .strict()
  .superRefine((slide, ctx) => {
    const caption = slide.caption && captionBox(slide.caption, slide.captionAt ?? 'top');
    const boxes = (slide.bubbles ?? []).map((b, i) => {
      const width = b.width ?? COMIC.bubbleWidth;
      const box = bubbleBox(b.text, b.x, b.y, width, b.kind);
      const path = ['bubbles', i];
      if (bubbleLines(b.text, width, b.kind) > COMIC.maxLines) {
        ctx.addIssue({ code: 'custom', path: [...path, 'text'], message: `takes more than ${COMIC.maxLines} lines at width ${width}: shorten it or widen the bubble` });
      }
      if (box.left < 1 || box.right > 99 || box.top < 1 || box.bottom > 99) {
        ctx.addIssue({ code: 'custom', path, message: 'runs off the panel: move it in from the edge, narrow it or shorten the text' });
      }
      if (overlaps(box, COVERED.counter)) {
        ctx.addIssue({ code: 'custom', path, message: 'sits under the slide counter in the top right corner: move it down or left' });
      } else if (overlaps(box, COVERED.next)) {
        ctx.addIssue({ code: 'custom', path, message: 'runs under the "Read on" tab in the bottom right corner: move it up or left' });
      }
      if (caption && overlaps(box, caption)) {
        ctx.addIssue({ code: 'custom', path, message: 'covers the caption box: move it, or put the caption at the other end' });
      }
      return box;
    });
    const bubbles = slide.bubbles ?? [];
    boxes.forEach((a, i) =>
      boxes.slice(i + 1).forEach((b, j) => {
        const k = i + 1 + j;
        // A bubble that interrupts or talks over the one just before it overlaps it on purpose.
        if (k === i + 1 && bubbles[k].timing) return;
        if (overlaps(a, b)) ctx.addIssue({ code: 'custom', path: ['bubbles', k], message: `overlaps bubble ${i + 1}` });
      }),
    );
    bubbles.forEach((b, i) => {
      if (!b.timing) return;
      const path = ['bubbles', i, 'timing'];
      if (i === 0) return ctx.addIssue({ code: 'custom', path, message: 'needs a bubble before it to interrupt or talk over' });
      const before = boxes[i - 1], box = boxes[i];
      if (b.timing === 'interrupts' && !/[—–-]$/.test(bubbles[i - 1].text.trim())) {
        ctx.addIssue({ code: 'custom', path: ['bubbles', i - 1, 'text'], message: `end this line with a dash (—), where bubble ${i + 1} cuts it off` });
      }
      if (!overlaps(before, box)) {
        ctx.addIssue({ code: 'custom', path, message: `should overlap bubble ${i}, so readers see the two lines collide` });
      } else if (!edgeOnly(before, box)) {
        ctx.addIssue({ code: 'custom', path, message: `covers words in bubble ${i}: let it overlap only that bubble's edge, so both stay readable` });
      }
    });
  });

export const StatSlide = z
  .object({
    type: z.literal('stat'),
    value: text(16).describe('The big number, e.g. "86 billion" or "3×".'),
    label: text(90).describe('What the number counts.'),
    text: text(220).optional(),
  })
  .strict();

export const VideoSlide = z
  .object({
    type: z.literal('video'),
    src: VideoSrc,
    poster: LocalImage.describe('A still from the clip, shown before it plays (`npm run clip` makes one).'),
    alt: text(300).describe('What the clip shows, for screen readers.'),
    caption: text(200).optional(),
    fit: z
      .enum(['contain', 'cover'])
      .optional()
      .describe('"contain" shows the whole frame on the field colours (default, best for landscape footage); "cover" fills the slide.'),
    animation: z
      .boolean()
      .optional()
      .describe('true for an animated explainer drawn for this post (`npm run explainer`) rather than footage. Explore lists these under "Animation".'),
    credit: text(120).describe('Who made the footage and its licence, e.g. "NASA/JPL-Caltech · Public domain · excerpt".'),
    href: httpsUrl.optional().describe('The page the footage comes from, e.g. its NASA or Wikimedia Commons page.'),
    music: text(160)
      .optional()
      .describe('Credit for the soundtrack, required when the clip has audio, e.g. "“Mesmerizing Galaxy” Kevin MacLeod (incompetech.com) · CC BY 4.0".'),
    steps: z
      .array(z.object({ start: z.number().min(0), end: z.number().positive() }).strict())
      .min(2)
      .max(24)
      .optional()
      .describe(
        'The clip\'s steps in order, in seconds: when each caption or stage appears and when it goes. The player marks them on the seek bar, jumps between them and can pause at the end of each. The clip needs a keyframe 0.3 s before each step ends (where a paused clip shows it), one within 1 s before each start, and keyframes at most 4 s apart; `npm run explainer` writes the steps and encodes the clip that way.',
      ),
    ratings: z
      .object({
        complexity: z.number().int().min(1).max(10).describe('How much a viewer must know and keep in mind to follow it, 1–10.'),
        shock: z.number().int().min(1).max(10).describe('Shock factor: how far the result is from what most people expect beforehand, 1–10.'),
      })
      .strict()
      .describe('The short\'s ratings, shown with it in the app. Score them with the scales in "Rating a short" in content/README.md.'),
  })
  .strict();

export const ExploreSlide = z
  .object({
    type: z.literal('explore'),
    lab: z.enum(LAB_IDS).describe('Which built-in lab to show: an experiment the reader runs themselves. shared/labs.ts lists them.'),
    heading: text(40).optional().describe('Defaults to "Try it yourself".'),
    prompt: text(160).describe('What to try: the goal, in one or two short sentences.'),
    takeaway: text(220).describe('What the reader has found out, shown in place of the prompt once they reach the goal.'),
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
      .regex(/^[A-Za-zÄÖÜäöü]{3,14}$/, 'One word of 3–14 letters (A–Z, or Ä, Ö, Ü), no spaces, other accents or ß')
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
  ExploreSlide,
  TextSlide,
  ImageSlide,
  ComicSlide,
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
  VideoSlide,
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
      .array(z.string().regex(/^[a-z0-9äöüß]+$/, 'Tags are lowercase letters (ä, ö, ü and ß too) and digits, without "#"').max(30))
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
      .regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?Z)?$/, 'Use YYYY-MM-DDTHH:MM:SSZ (UTC), or YYYY-MM-DD')
      .refine((s) => !Number.isNaN(Date.parse(s.length === 10 ? `${s}T00:00:00Z` : s)), 'Not a real date')
      .optional()
      .describe('When the post was published, in UTC: YYYY-MM-DDTHH:MM:SSZ. A bare YYYY-MM-DD also works. The app shows it on the post and sorts by it.'),
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

/** Every image and video file name a post refers to (excluding allowed remote URLs). */
export function localMedia(post: Post): string[] {
  const srcs = [
    post.cover?.src,
    ...(post.slides ?? []).flatMap((s) => (s.type === 'image' || s.type === 'comic' ? [s.src] : s.type === 'video' ? [s.src, s.poster] : [])),
  ];
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
