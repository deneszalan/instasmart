import type { Post } from '../types';
import { postLink } from './route';
import { toast } from './toast';

export async function sharePost(post: Post): Promise<void> {
  const title = post.kind === 'card' ? post.card.title : post.title;
  const url = post.kind === 'card' ? postLink(post.card.id) : post.source.url;

  if (navigator.share) {
    try {
      await navigator.share({ title, text: title, url });
      return;
    } catch (err) {
      if ((err as DOMException).name === 'AbortError') return;
    }
  }
  try {
    await navigator.clipboard.writeText(`${title} — ${url}`);
    toast('Link copied to clipboard');
  } catch {
    toast('Couldn’t copy the link');
  }
}
