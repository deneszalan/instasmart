import { useEffect, useLayoutEffect, useRef } from 'react';
import { Bookmark, Compass, Flame, House, User } from 'lucide-react';
import type { Post } from './types';
import { CARD_BY_ID } from './data/library';
import { useRoute, type Tab } from './lib/route';
import { toast } from './lib/toast';
import { streak, StoreProvider, useStore, type LearnState } from './state/store';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PostView } from './components/Post';
import { Sheet } from './components/Sheet';
import { Toast } from './components/Toast';
import { Explore } from './views/Explore';
import { Feed } from './views/Feed';
import { Profile } from './views/Profile';
import { Saved } from './views/Saved';

const NAV: { tab: Tab; label: string; icon: typeof House }[] = [
  { tab: 'home', label: 'Home', icon: House },
  { tab: 'explore', label: 'Explore', icon: Compass },
  { tab: 'saved', label: 'Saved', icon: Bookmark },
  { tab: 'profile', label: 'Profile', icon: User },
];

function useTheme() {
  const { state } = useStore();
  const theme = state.settings.theme;
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') delete root.dataset.theme;
    else root.dataset.theme = theme;
  }, [theme]);
}

function findPost(id: string, saved: LearnState['saved']): Post | null {
  const card = CARD_BY_ID.get(id);
  if (card) return { kind: 'card', key: card.id, card };
  return saved[id]?.wiki ?? null;
}

function Shell() {
  useTheme();
  const { state } = useStore();
  const [route, navigate] = useRoute();
  const scrollByTab = useRef<Partial<Record<Tab, number>>>({});
  const lastTab = useRef(route.tab);
  const days = streak(state.activeDays);

  // Each tab keeps its own scroll position, like a native app.
  useEffect(() => {
    const onScroll = () => {
      scrollByTab.current[lastTab.current] = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useLayoutEffect(() => {
    if (lastTab.current === route.tab) return;
    lastTab.current = route.tab;
    window.scrollTo(0, scrollByTab.current[route.tab] ?? 0);
  }, [route.tab]);

  const goTab = (tab: Tab) => {
    if (tab === route.tab) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // The search stays with Explore; the "Written by" filter is shared by the feed and Explore.
    navigate({ tab, post: null, q: tab === 'explore' ? route.q : '' });
  };

  const openPost = (id: string) => navigate({ post: id });
  const openedPost = route.post ? findPost(route.post, state.saved) : null;

  useEffect(() => {
    if (route.post && !openedPost) {
      toast('That post isn’t available anymore');
      navigate({ post: null }, { replace: true });
    }
  }, [route.post, openedPost, navigate]);

  return (
    <div className="app">
      <header className="topbar">
        <button className="logo" onClick={() => goTab('home')} aria-label="Reckon home">
          Reckon
        </button>
        <button className="topbar__streak" onClick={() => goTab('profile')} aria-label={`${days}-day learning streak`}>
          <Flame size={22} className={days > 0 ? 'streak__flame--on' : undefined} />
          <span>{days}</span>
        </button>
      </header>

      <main className="main">
        <div hidden={route.tab !== 'home'}>
          <Feed key={route.by || 'everyone'} by={route.by} onBy={(by) => navigate({ by }, { replace: true })} />
        </div>
        {route.tab === 'explore' && (
          <Explore
            query={route.q}
            onQuery={(q) => navigate({ q }, { replace: true })}
            author={route.by}
            onAuthor={(by) => navigate({ by }, { replace: true })}
            onOpen={openPost}
          />
        )}
        {route.tab === 'saved' && <Saved onOpen={openPost} />}
        {route.tab === 'profile' && <Profile />}
      </main>

      <nav className="bottombar" aria-label="Main">
        {NAV.map(({ tab, label, icon: Icon }) => (
          <button
            key={tab}
            className={`bottombar__btn${route.tab === tab ? ' bottombar__btn--on' : ''}`}
            onClick={() => goTab(tab)}
            aria-label={label}
            aria-current={route.tab === tab ? 'page' : undefined}
          >
            <Icon size={26} strokeWidth={route.tab === tab ? 2.6 : 1.8} />
          </button>
        ))}
      </nav>

      {openedPost && (
        <Sheet title="Post" variant="dialog" onClose={() => navigate({ post: null })}>
          <PostView key={openedPost.key} post={openedPost} className="post--flat" />
        </Sheet>
      )}
      <Toast />
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </ErrorBoundary>
  );
}
