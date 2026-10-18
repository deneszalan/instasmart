import type { Field, FieldId } from '../types';

export const FIELDS: Field[] = [
  { id: 'physics', name: 'Physics', handle: 'physics.unboxed', emoji: '⚛️', gradient: ['#3730a3', '#0e7490'] },
  { id: 'space', name: 'Space', handle: 'cosmic.notes', emoji: '🪐', gradient: ['#1e1b4b', '#7e22ce'] },
  { id: 'biology', name: 'Biology', handle: 'life.explained', emoji: '🧬', gradient: ['#065f46', '#4d7c0f'] },
  { id: 'chemistry', name: 'Chemistry', handle: 'chem.reactions', emoji: '⚗️', gradient: ['#9d174d', '#c2410c'] },
  { id: 'math', name: 'Mathematics', handle: 'math.wonders', emoji: '📐', gradient: ['#1d4ed8', '#6d28d9'] },
  { id: 'history', name: 'History', handle: 'history.bites', emoji: '🏛️', gradient: ['#78350f', '#b45309'] },
  { id: 'psychology', name: 'Psychology', handle: 'mind.matters', emoji: '🧠', gradient: ['#9d174d', '#6d28d9'] },
  { id: 'economics', name: 'Economics', handle: 'econ.simplified', emoji: '📈', gradient: ['#065f46', '#0369a1'] },
  { id: 'tech', name: 'Computer Science', handle: 'code.curious', emoji: '💻', gradient: ['#111827', '#047857'] },
  { id: 'language', name: 'Language', handle: 'word.origins', emoji: '🗣️', gradient: ['#9a3412', '#a16207'] },
  { id: 'philosophy', name: 'Philosophy', handle: 'big.questions', emoji: '🦉', gradient: ['#1e293b', '#475569'] },
  { id: 'art', name: 'Art & Design', handle: 'art.decoded', emoji: '🎨', gradient: ['#be123c', '#c2410c'] },
  { id: 'music', name: 'Music', handle: 'sound.science', emoji: '🎵', gradient: ['#6d28d9', '#be185d'] },
  { id: 'earth', name: 'Earth', handle: 'planet.notes', emoji: '🌋', gradient: ['#155e75', '#15803d'] },
  { id: 'body', name: 'Human Body', handle: 'body.facts', emoji: '🫀', gradient: ['#991b1b', '#be123c'] },
  { id: 'engineering', name: 'Engineering', handle: 'how.it.works', emoji: '⚙️', gradient: ['#334155', '#b45309'] },
];

export const FIELD_BY_ID: Record<FieldId, Field> = Object.fromEntries(
  FIELDS.map((f) => [f.id, f]),
) as Record<FieldId, Field>;
