export const FIELD_IDS = [
  'physics',
  'space',
  'biology',
  'chemistry',
  'math',
  'history',
  'psychology',
  'economics',
  'tech',
  'language',
  'philosophy',
  'art',
  'music',
  'earth',
  'body',
  'engineering',
  'literature',
] as const;

export type FieldId = (typeof FIELD_IDS)[number];

export interface Field {
  id: FieldId;
  name: string;
  /** Account-style handle shown as the post author. */
  handle: string;
  emoji: string;
  /** Two gradient stops used for the post visual and story ring. */
  gradient: [string, string];
  /** What belongs in this field, for contributors. */
  scope: string;
}

export const FIELDS: Field[] = [
  { id: 'physics', name: 'Physics', handle: 'physics.unboxed', emoji: '⚛️', gradient: ['#3730a3', '#0e7490'], scope: 'Forces, energy, light, quantum and relativity' },
  { id: 'space', name: 'Space', handle: 'cosmic.notes', emoji: '🪐', gradient: ['#1e1b4b', '#7e22ce'], scope: 'Astronomy, planets, stars, cosmology and space exploration' },
  { id: 'biology', name: 'Biology', handle: 'life.explained', emoji: '🧬', gradient: ['#065f46', '#4d7c0f'], scope: 'Animals, plants, microbes, evolution and ecology' },
  { id: 'chemistry', name: 'Chemistry', handle: 'chem.reactions', emoji: '⚗️', gradient: ['#9d174d', '#c2410c'], scope: 'Elements, molecules, reactions and materials' },
  { id: 'math', name: 'Mathematics', handle: 'math.wonders', emoji: '📐', gradient: ['#1d4ed8', '#6d28d9'], scope: 'Numbers, probability, geometry, logic and famous problems' },
  { id: 'history', name: 'History', handle: 'history.bites', emoji: '🏛️', gradient: ['#78350f', '#b45309'], scope: 'Events, people and everyday life across all eras and continents' },
  { id: 'psychology', name: 'Psychology', handle: 'mind.matters', emoji: '🧠', gradient: ['#9d174d', '#6d28d9'], scope: 'Perception, memory, cognitive biases and behaviour' },
  { id: 'economics', name: 'Economics', handle: 'econ.simplified', emoji: '📈', gradient: ['#065f46', '#0369a1'], scope: 'Markets, money, incentives and economic history' },
  { id: 'tech', name: 'Computer Science', handle: 'code.curious', emoji: '💻', gradient: ['#111827', '#047857'], scope: 'Algorithms, computing history, the internet, cryptography and AI' },
  { id: 'language', name: 'Language', handle: 'word.origins', emoji: '🗣️', gradient: ['#9a3412', '#a16207'], scope: 'Linguistics, etymology and writing systems' },
  { id: 'philosophy', name: 'Philosophy', handle: 'big.questions', emoji: '🦉', gradient: ['#1e293b', '#475569'], scope: 'Thought experiments, paradoxes and ideas from many traditions' },
  { id: 'art', name: 'Art & Design', handle: 'art.decoded', emoji: '🎨', gradient: ['#be123c', '#c2410c'], scope: 'Art history, design, architecture, colour and typography' },
  { id: 'music', name: 'Music', handle: 'sound.science', emoji: '🎵', gradient: ['#6d28d9', '#be185d'], scope: 'Acoustics, theory, instruments and music history' },
  { id: 'earth', name: 'Earth', handle: 'planet.notes', emoji: '🌋', gradient: ['#155e75', '#15803d'], scope: 'Geology, geography, oceans, weather and climate' },
  { id: 'body', name: 'Human Body', handle: 'body.facts', emoji: '🫀', gradient: ['#991b1b', '#be123c'], scope: 'Anatomy, physiology and medicine (no medical advice)' },
  { id: 'engineering', name: 'Engineering', handle: 'how.it.works', emoji: '⚙️', gradient: ['#334155', '#b45309'], scope: 'How things work, inventions, structures, feats and failures' },
  { id: 'literature', name: 'Literature', handle: 'story.lines', emoji: '📜', gradient: ['#4c1d95', '#9f1239'], scope: 'Poems, stories, epics and the people who wrote them' },
];

export const FIELD_BY_ID: Record<FieldId, Field> = Object.fromEntries(
  FIELDS.map((f) => [f.id, f]),
) as Record<FieldId, Field>;
