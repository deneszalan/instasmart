import { useStore } from '../state/store';

/** Records how the reader did on one interactive slide: true, false, or null for "played, not scored". */
export function useRecord(challengeId: string) {
  const { recordChallenge } = useStore();
  return (correct: boolean | null) => recordChallenge(challengeId, correct);
}
