import { FIELD_BY_ID as ALL_FIELDS, type Field, type FieldId } from '../../shared/fields.ts';
import { EDITION } from '../edition';
import { LANG } from '../i18n';

/** This edition's fields, in its order and in the reader's language. */
export const FIELDS: Field[] = EDITION.fields.map((id) => ({ ...ALL_FIELDS[id], ...EDITION.fieldText?.[id], ...EDITION.langs?.[LANG]?.fieldText?.[id] }));
export const FIELD_IDS: readonly FieldId[] = EDITION.fields;
export const FIELD_BY_ID = Object.fromEntries(FIELDS.map((f) => [f.id, f])) as Record<FieldId, Field>;
