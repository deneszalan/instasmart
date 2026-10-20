/**
 * The reader's sound choice, shared by slides and stories: null until they turn sound on or off.
 * Animations the reader starts play with sound unless they have turned it off; clips that start
 * by themselves stay muted until they turn it on.
 */
export const sound: { wanted: boolean | null } = { wanted: null };
