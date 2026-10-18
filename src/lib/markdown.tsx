import { Fragment, type ReactNode } from 'react';

// Inline formatting allowed in post text: **bold**, *italic*, `code` and [links](https://…).
const TOKEN = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|`[^`\n]+`|\[[^\]\n]+\]\(https:\/\/[^)\s]+\))/g;

/** Render a post's inline markdown as React elements (never as raw HTML). */
export function inline(text: string): ReactNode {
  const parts = text.split(TOKEN);
  return parts.map((part, i) => {
    if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
    if (part.startsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>;
    if (part.startsWith('[')) {
      const match = /^\[([^\]]+)\]\((.+)\)$/.exec(part);
      if (!match) return <Fragment key={i}>{part}</Fragment>;
      const [, label, href] = match;
      return (
        <a key={i} href={href} target="_blank" rel="noreferrer">
          {label}
        </a>
      );
    }
    return <em key={i}>{part.slice(1, -1)}</em>;
  });
}

/** Strip the formatting marks, for places that need plain text (search, share text). */
export function plain(text: string): string {
  return text
    .replace(/\[([^\]\n]+)\]\(https:\/\/[^)\s]+\)/g, '$1')
    .replace(/\*\*([^*\n]+)\*\*/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/`([^`\n]+)`/g, '$1');
}
