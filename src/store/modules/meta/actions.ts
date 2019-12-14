const PREFIX = '@meta';

export const TYPES = {
  markIntroAsSawn: `${PREFIX}/MARK_INTRO_AS_SAWN`,
};

export function markIntroAsSawn() {
  return {
    type: TYPES.markIntroAsSawn,
  };
}
