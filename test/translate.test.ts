import { describe, expect, it } from 'vitest';
import { applyTranslation } from '../shared/translate.ts';
import { validateContent, type ContentFile } from '../shared/validate.ts';
import { pickLang } from '../src/i18n';
import type { Post } from '../shared/schema.ts';

const post = {
  id: 'history-test-post',
  field: 'history',
  title: 'An English title for a test post',
  emoji: '🏛️',
  body: 'An English body that explains one thing in a sentence or two, long enough for the checks to accept it as a post.',
  slides: [
    { type: 'quiz', question: 'Which one?', options: ['First', 'Second'], answer: 0, explanation: 'The first.' },
    { type: 'video', src: 'clip.mp4', poster: 'clip.jpg', alt: 'A clip.', credit: 'Roma · original animation', ratings: { complexity: 3, shock: 3 } },
  ],
  tags: ['test'],
  source: { label: 'Wikipedia: Test', url: 'https://en.wikipedia.org/wiki/Test' },
  author: { name: 'Claude', kind: 'ai' },
} as unknown as Post;

describe('translations', () => {
  it('replace only the strings they give, and keep numbers, answers and order', () => {
    const { post: de, problems } = applyTranslation(post, {
      id: 'history-test-post',
      title: 'Ein deutscher Titel',
      slides: [{ question: 'Welche?', options: ['Erste', 'Zweite'] }, { src: 'clip-de.mp4', alt: 'Ein Clip.' }],
      source: { label: 'Wikipedia: Test (englisch)' },
    });
    expect(problems).toEqual([]);
    expect(de.title).toBe('Ein deutscher Titel');
    expect(de.body).toBe(post.body);
    const [quiz, video] = de.slides as unknown as [{ question: string; options: string[]; answer: number; explanation: string }, { src: string; poster: string; alt: string }];
    expect(quiz).toMatchObject({ question: 'Welche?', options: ['Erste', 'Zweite'], answer: 0, explanation: 'The first.' });
    expect(video).toMatchObject({ src: 'clip-de.mp4', poster: 'clip.jpg', alt: 'Ein Clip.' });
    expect(de.source).toEqual({ label: 'Wikipedia: Test (englisch)', url: 'https://en.wikipedia.org/wiki/Test' });
  });

  it('refuse what a translation may not change, and keep the post’s own value', () => {
    const { post: de, problems } = applyTranslation(post, {
      id: 'history-other-post',
      field: 'art',
      tags: ['x'],
      slides: [{ answer: 1, options: ['Nur eine'] }, { poster: 'other.jpg', extra: 'neu' }],
    });
    expect(problems).toEqual([
      '"id" must be "history-test-post", the post it translates',
      'field: "field" can\'t be translated; leave it out',
      'slides[0].answer: numbers and switches stay the post\'s; leave it out',
      'slides[0].options: must be a list of 2, like the post\'s',
      'slides[1].poster: "poster" can\'t be translated; leave it out',
      'slides[1].extra: the post has nothing here to translate',
    ]);
    expect(de.field).toBe('history');
    expect(de.tags).toEqual(['x']);
    expect((de.slides![0] as { answer: number }).answer).toBe(0);
  });

  it('are checked as the post they make, against the same limits', () => {
    const file = (path: string, data: unknown): ContentFile => ({ path, bytes: new TextEncoder().encode(JSON.stringify(data)) });
    const english = { ...post, slides: [post.slides![0]] };
    const files = [
      file('content/posts/history/history-test-post.json', english),
      file('content/i18n/de/history/history-test-post.json', { id: 'history-test-post', title: 'T'.repeat(91) }),
    ];
    expect(validateContent(files, ['history'], ['de']).problems.map((p) => [p.file, p.message])).toEqual([
      ['content/i18n/de/history/history-test-post.json', 'title: Too big: expected string to have <=90 characters'],
    ]);
    expect(validateContent(files, ['history']).problems.map((p) => p.message)).toEqual([
      'this app has no other languages; see "langs" in shared/editions.ts',
    ]);
  });

  it('show only in a language the app offers', () => {
    expect(pickLang(null)).toBe('en');
    expect(pickLang('xx')).toBe('en');
  });
});
