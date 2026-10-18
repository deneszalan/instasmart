import type { FieldId, KnowledgeCard } from '../types';
import { art } from './cards/art';
import { biology } from './cards/biology';
import { body } from './cards/body';
import { chemistry } from './cards/chemistry';
import { earth } from './cards/earth';
import { economics } from './cards/economics';
import { engineering } from './cards/engineering';
import { history } from './cards/history';
import { language } from './cards/language';
import { math } from './cards/math';
import { music } from './cards/music';
import { philosophy } from './cards/philosophy';
import { physics } from './cards/physics';
import { psychology } from './cards/psychology';
import { space } from './cards/space';
import { tech } from './cards/tech';

export const LIBRARY: KnowledgeCard[] = [
  ...physics,
  ...space,
  ...biology,
  ...chemistry,
  ...math,
  ...history,
  ...psychology,
  ...economics,
  ...tech,
  ...language,
  ...philosophy,
  ...art,
  ...music,
  ...earth,
  ...body,
  ...engineering,
];

export const CARD_BY_ID: ReadonlyMap<string, KnowledgeCard> = new Map(LIBRARY.map((c) => [c.id, c]));

export function cardsInField(field: FieldId): KnowledgeCard[] {
  return LIBRARY.filter((c) => c.field === field);
}
