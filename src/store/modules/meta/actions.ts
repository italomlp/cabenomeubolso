const PREFIX = '@meta';

export const TYPES = {
  markIntroAsViewed: `${PREFIX}/MARK_INTRO_AS_VIEWED`,
};

export function markIntroAsViewed() {
  return {
    type: TYPES.markIntroAsViewed,
  };
}
