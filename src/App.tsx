import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Bookmark, Compass, Flame, House, Newspaper, User } from 'lucide-react';
import type { Post } from './types';
import { CARD_BY_ID, LIBRARY } from './data/library';
import { OFFLINE_ONLY } from './data/offline-set';
import { setOfflineOnly } from './lib/offline';
import { useRoute, type Tab } from './lib/route';
import { toast } from './lib/toast';
import { streak, StoreProvider, useStore, type LearnState } from './state/store';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PostView } from './components/Post';
import { Sheet } from './components/Sheet';
import { Toast } from './components/Toast';
import { Explore } from './views/Explore';
import { Feed } from './views/Feed';
import { News, NEWS } from './views/News';
import { Profile } from './views/Profile';
import { Saved } from './views/Saved';
import { t } from './i18n';
import { EDITION } from './edition';

// The News tab shows only in an edition with news posts.
const NAV: { tab: Tab; label: string; icon: typeof House }[] = [
  { tab: 'home', label: t('Home'), icon: House },
  ...(NEWS.length > 0 ? [{ tab: 'news' as const, label: t('News'), icon: Newspaper }] : []),
  { tab: 'explore', label: t('Explore'), icon: Compass },
  { tab: 'saved', label: t('Saved'), icon: Bookmark },
  { tab: 'profile', label: t('Profile'), icon: User },
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
  // Like the feed, News stays mounted once opened, so coming back keeps its place.
  const [newsOpened, setNewsOpened] = useState(route.tab === 'news');
  useEffect(() => {
    if (route.tab === 'news') setNewsOpened(true);
  }, [route.tab]);

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
      toast(t('That post isn’t available anymore'));
      navigate({ post: null }, { replace: true });
    }
  }, [route.post, openedPost, navigate]);

  return (
    <div className="app">
      <header className="topbar">
        <button className="logo" onClick={() => goTab('home')} aria-label={t('{name} home', { name: EDITION.name })}>
          {EDITION.name}
        </button>
        <button className="topbar__streak" onClick={() => goTab('profile')} aria-label={t(days === 1 ? '1-day learning streak' : '{n}-day learning streak', { n: days })}>
          <Flame size={22} className={days > 0 ? 'streak__flame--on' : undefined} />
          <span>{days}</span>
        </button>
      </header>
      {OFFLINE_ONLY && (
        <div className="offline-bar" role="status">
          <span>{t(LIBRARY.length === 1 ? 'Offline mode: 1 saved post' : 'Offline mode: {n} saved posts', { n: LIBRARY.length })}</span>
          <button onClick={() => setOfflineOnly(false)}>{t('Show all')}</button>
        </div>
      )}

      <main className="main">
        <div hidden={route.tab !== 'home'}>
          <Feed key={`${route.by || 'everyone'}:${state.settings.sort}`} by={route.by} onBy={(by) => navigate({ by }, { replace: true })} />
        </div>
        {NEWS.length > 0 && newsOpened && (
          <div hidden={route.tab !== 'news'}>
            <News />
          </div>
        )}
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

      <nav className="bottombar" aria-label={t('Main')}>
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
        <Sheet title={t('Post')} variant="dialog" onClose={() => navigate({ post: null })}>
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
