import { useState } from 'react';
import { LIBRARY } from '../data/library';
import { buildStories } from '../lib/stories';
import { localDay, useStore } from '../state/store';
import { Avatar } from './Avatar';
import { StoryViewer } from './StoryViewer';

export function StoriesBar() {
  const { state } = useStore();
  // Build once per visit so stories don't reshuffle while you read them.
  const [stories] = useState(() => buildStories(LIBRARY, new Set(Object.keys(state.seen)), localDay()));
  const [open, setOpen] = useState<number | null>(null);
  const today = localDay();

  return (
    <>
      <nav className="stories" aria-label="Stories">
        {stories.map((story, i) => {
          const watched = state.storiesViewed[story.id] === today;
          return (
            <button key={story.id} className="stories__item" onClick={() => setOpen(i)}>
              <Avatar emoji={story.emoji} gradient={story.gradient} size={62} ring={watched ? 'seen' : 'new'} />
              <span className="stories__label">{story.label}</span>
            </button>
          );
        })}
      </nav>
      {open !== null && <StoryViewer stories={stories} startIndex={open} onClose={() => setOpen(null)} />}
    </>
  );
}
