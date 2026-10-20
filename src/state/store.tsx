import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { Post } from '../types';
import type { WikiPost } from '../lib/wiki';

export type Theme = 'system' | 'light' | 'dark';

export interface LearnState {
  /** Post id → time it was liked. */
  liked: Record<string, number>;
  /** Post id → saved entry. Wikipedia posts keep a snapshot since they aren't in the library. */
  saved: Record<string, { at: number; wiki?: WikiPost }>;
  /** Post id → time it was first read. */
  seen: Record<string, number>;
  /** Local days (YYYY-MM-DD) on which something was read. */
  activeDays: string[];
  /** Story id → local day it was last watched. */
  storiesViewed: Record<string, string>;
  /** `${postId}#${slideIndex}` → result of a quiz, guess or ordering puzzle (null when it has no right answer). */
  challenges: Record<string, { correct: boolean | null; at: number }>;
  /**
   * speed: the playback speed the reader picked for clips, or null to play each at its own default
   * (animations a little slower); stepMode: pause explainers at the end of each step.
   */
  settings: { wiki: boolean; theme: Theme; speed: number | null; stepMode: boolean };
}

type Action =
  | { type: 'like'; id: string; on?: boolean }
  | { type: 'save'; post: Post }
  | { type: 'seen'; id: string }
  | { type: 'story'; id: string }
  | { type: 'challenge'; id: string; correct: boolean | null }
  | { type: 'settings'; patch: Partial<LearnState['settings']> }
  | { type: 'reset' };

const STORAGE_KEY = 'reckon:v1';
/** Where progress was saved before the app was renamed; read once, then carried over. */
const LEGACY_KEY = 'instasmart:v1';

export const initialState: LearnState = {
  liked: {},
  saved: {},
  seen: {},
  activeDays: [],
  storiesViewed: {},
  challenges: {},
  settings: { wiki: true, theme: 'system', speed: null, stepMode: false },
};

export function localDay(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function postId(post: Post): string {
  return post.kind === 'card' ? post.card.id : post.id;
}

function without<T>(record: Record<string, T>, key: string): Record<string, T> {
  const { [key]: _removed, ...rest } = record;
  return rest;
}

export function reducer(state: LearnState, action: Action): LearnState {
  switch (action.type) {
    case 'like': {
      const isLiked = action.id in state.liked;
      const on = action.on ?? !isLiked;
      if (on === isLiked) return state;
      return {
        ...state,
        liked: on ? { ...state.liked, [action.id]: Date.now() } : without(state.liked, action.id),
      };
    }
    case 'save': {
      const id = postId(action.post);
      if (id in state.saved) return { ...state, saved: without(state.saved, id) };
      const entry = { at: Date.now(), ...(action.post.kind === 'wiki' ? { wiki: action.post } : {}) };
      return { ...state, saved: { ...state.saved, [id]: entry } };
    }
    case 'seen': {
      const today = localDay();
      const hasDay = state.activeDays.includes(today);
      if (action.id in state.seen && hasDay) return state;
      return {
        ...state,
        seen: action.id in state.seen ? state.seen : { ...state.seen, [action.id]: Date.now() },
        activeDays: hasDay ? state.activeDays : [...state.activeDays, today].sort(),
      };
    }
    case 'story': {
      const today = localDay();
      if (state.storiesViewed[action.id] === today) return state;
      return { ...state, storiesViewed: { ...state.storiesViewed, [action.id]: today } };
    }
    case 'challenge':
      return { ...state, challenges: { ...state.challenges, [action.id]: { correct: action.correct, at: Date.now() } } };
    case 'settings':
      return { ...state, settings: { ...state.settings, ...action.patch } };
    case 'reset':
      return { ...initialState, settings: state.settings };
  }
}

/** Consecutive active days ending today (or yesterday, so the streak survives until you read today). */
export function streak(activeDays: readonly string[], today = new Date()): number {
  const days = new Set(activeDays);
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!days.has(localDay(cursor))) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (days.has(localDay(cursor))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

function load(): LearnState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<LearnState>;
    // The old videoRate setting saved 1 whether or not the reader chose it, so it is dropped and
    // clips start from their own defaults.
    const { videoRate: _dropped, ...settings } = (parsed.settings ?? {}) as Partial<LearnState['settings']> & { videoRate?: number };
    return {
      ...initialState,
      ...parsed,
      settings: { ...initialState.settings, ...settings },
    };
  } catch {
    return initialState;
  }
}

interface Store {
  state: LearnState;
  toggleLike: (id: string) => void;
  like: (id: string) => void;
  toggleSave: (post: Post) => void;
  markSeen: (id: string) => void;
  markStory: (id: string) => void;
  recordChallenge: (id: string, correct: boolean | null) => void;
  updateSettings: (patch: Partial<LearnState['settings']>) => void;
  reset: () => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage can be unavailable (private mode, quota); the app still works for this session.
    }
  }, [state]);

  // Actions keep a stable identity so effects can depend on them without re-running.
  const actions = useMemo<Omit<Store, 'state'>>(
    () => ({
      toggleLike: (id) => dispatch({ type: 'like', id }),
      like: (id) => dispatch({ type: 'like', id, on: true }),
      toggleSave: (post) => dispatch({ type: 'save', post }),
      markSeen: (id) => dispatch({ type: 'seen', id }),
      markStory: (id) => dispatch({ type: 'story', id }),
      recordChallenge: (id, correct) => dispatch({ type: 'challenge', id, correct }),
      updateSettings: (patch) => dispatch({ type: 'settings', patch }),
      reset: () => dispatch({ type: 'reset' }),
    }),
    [],
  );
  const store = useMemo<Store>(() => ({ state, ...actions }), [state, actions]);

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside <StoreProvider>');
  return store;
}
