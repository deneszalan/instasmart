import { useCallback, useEffect, useState } from 'react';

export type Tab = 'home' | 'news' | 'explore' | 'saved' | 'profile';

export interface Route {
  tab: Tab;
  /** Explore search query. */
  q: string;
  /** Id of a post opened in the overlay. */
  post: string | null;
  /** Explore "Written by" filter: an author group id such as "chatgpt". */
  by: string;
}

const TABS: Tab[] = ['home', 'news', 'explore', 'saved', 'profile'];

export function parseHash(hash: string): Route {
  const [path, query = ''] = hash.replace(/^#\/?/, '').split('?');
  const params = new URLSearchParams(query);
  const [first, second] = path.split('/');
  // Shared deep link: #/p/<id> opens the post over the home feed.
  if (first === 'p' && second) return { tab: 'home', q: '', post: decodeURIComponent(second), by: '' };
  const tab = (TABS as string[]).includes(first) ? (first as Tab) : 'home';
  return { tab, q: params.get('q') ?? '', post: params.get('p'), by: params.get('by') ?? '' };
}

export function toHash(route: Route): string {
  const params = new URLSearchParams();
  if (route.q) params.set('q', route.q);
  if (route.by) params.set('by', route.by);
  if (route.post) params.set('p', route.post);
  const query = params.toString();
  return `#/${route.tab === 'home' ? '' : route.tab}${query ? `?${query}` : ''}`;
}

export function postLink(id: string): string {
  return `${location.origin}${location.pathname}#/p/${encodeURIComponent(id)}`;
}

export function useRoute(): [Route, (next: Partial<Route>, opts?: { replace?: boolean }) => void] {
  const [route, setRoute] = useState(() => parseHash(location.hash));

  useEffect(() => {
    const onChange = () => setRoute(parseHash(location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((next: Partial<Route>, opts?: { replace?: boolean }) => {
    const target = toHash({ ...parseHash(location.hash), ...next });
    if (target === location.hash || (target === '#/' && !location.hash)) return;
    if (opts?.replace) {
      history.replaceState(null, '', target);
      // replaceState doesn't fire hashchange; notify every useRoute() listener ourselves.
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } else {
      location.hash = target;
    }
  }, []);

  return [route, navigate];
}
