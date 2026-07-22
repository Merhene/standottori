export type Face = 'front' | 'back';
export type Side = 'left' | 'right' | 'center';

export interface BodyPart {
  id: string;
  face: Face;
  src: string;
  /** i18n key under bodymap.parts.* */
  labelKey: string;
  side: Side;
  /**
   * Matching part on the opposite face for wrap-around.
   * Only set for limbs / neck / head — torso zones never wrap.
   */
  wrapPairId?: string;
}

const FRONT = '/images/body/Front';
const BACK = '/images/body/back';

/**
 * Registry of every clickable zone.
 * Cutouts share the same canvas as the full-body base, so they stack 1:1.
 */
export const BODY_PARTS: BodyPart[] = [
  // ---- Front ----
  // Neck before head so the head cutout wins hit-tests on the face area
  { id: 'front-neck', face: 'front', src: `${FRONT}/Neck-cutout.png`, labelKey: 'neck', side: 'center', wrapPairId: 'back-head' },
  { id: 'front-head', face: 'front', src: `${FRONT}/head-cutout.png`, labelKey: 'head', side: 'center', wrapPairId: 'back-head' },
  { id: 'front-chest', face: 'front', src: `${FRONT}/chest-cutout.png`, labelKey: 'chest', side: 'center' },
  { id: 'front-belly', face: 'front', src: `${FRONT}/belly-cutout.png`, labelKey: 'belly', side: 'center' },
  { id: 'front-left-ribs', face: 'front', src: `${FRONT}/leftRibs-cutout.png`, labelKey: 'left_ribs', side: 'left' },
  { id: 'front-right-ribs', face: 'front', src: `${FRONT}/rightRibs-cutout.png`, labelKey: 'right_ribs', side: 'right' },
  { id: 'front-pubis', face: 'front', src: `${FRONT}/pubis-cutout.png`, labelKey: 'pubis', side: 'center' },

  { id: 'front-left-shoulder', face: 'front', src: `${FRONT}/LeftShoulder-cutout.png`, labelKey: 'left_shoulder', side: 'left', wrapPairId: 'back-left-arm' },
  { id: 'front-left-top-arm', face: 'front', src: `${FRONT}/LeftTopArm-cutout.png`, labelKey: 'left_top_arm', side: 'left', wrapPairId: 'back-left-elbow' },
  { id: 'front-left-bottom-arm', face: 'front', src: `${FRONT}/LeftBottomArm-cutout.png`, labelKey: 'left_bottom_arm', side: 'left', wrapPairId: 'back-left-bottom-arm' },
  { id: 'front-left-hand', face: 'front', src: `${FRONT}/Lefthand-cutout.png`, labelKey: 'left_hand', side: 'left' },

  { id: 'front-right-shoulder', face: 'front', src: `${FRONT}/rightShoulder-cutout.png`, labelKey: 'right_shoulder', side: 'right', wrapPairId: 'back-right-arm' },
  { id: 'front-right-top-arm', face: 'front', src: `${FRONT}/rightTopArm-cutout.png`, labelKey: 'right_top_arm', side: 'right', wrapPairId: 'back-right-elbow' },
  { id: 'front-right-bottom-arm', face: 'front', src: `${FRONT}/rightBottomArm-cutout.png`, labelKey: 'right_bottom_arm', side: 'right', wrapPairId: 'back-right-bottom-arm' },
  { id: 'front-right-hand', face: 'front', src: `${FRONT}/rightHand-cutout.png`, labelKey: 'right_hand', side: 'right' },

  { id: 'front-left-thigh', face: 'front', src: `${FRONT}/leftThigh-cutout.png`, labelKey: 'left_thigh', side: 'left', wrapPairId: 'back-left-top-leg' },
  { id: 'front-left-knee', face: 'front', src: `${FRONT}/leftKnee-cutout.png`, labelKey: 'left_knee', side: 'left' },
  { id: 'front-left-shin', face: 'front', src: `${FRONT}/leftShin-cutout.png`, labelKey: 'left_shin', side: 'left', wrapPairId: 'back-left-bottom-leg' },
  { id: 'front-left-foot', face: 'front', src: `${FRONT}/leftFoot-cutout.png`, labelKey: 'left_foot', side: 'left' },

  { id: 'front-right-thigh', face: 'front', src: `${FRONT}/rightThigh-cutout.png`, labelKey: 'right_thigh', side: 'right', wrapPairId: 'back-right-top-leg' },
  { id: 'front-right-knee', face: 'front', src: `${FRONT}/rightknee-cutout.png`, labelKey: 'right_knee', side: 'right' },
  { id: 'front-right-shin', face: 'front', src: `${FRONT}/rightShin-cutout.png`, labelKey: 'right_shin', side: 'right', wrapPairId: 'back-right-bottom-leg' },
  { id: 'front-right-foot', face: 'front', src: `${FRONT}/rightFoot-cutout.png`, labelKey: 'right_foot', side: 'right' },

  // ---- Back ----
  { id: 'back-head', face: 'back', src: `${BACK}/head-cutout.png`, labelKey: 'head', side: 'center', wrapPairId: 'front-head' },
  { id: 'back-torso', face: 'back', src: `${BACK}/back-cutout.png`, labelKey: 'back', side: 'center' },
  { id: 'back-booty', face: 'back', src: `${BACK}/booty-cutout.png`, labelKey: 'booty', side: 'center' },

  { id: 'back-left-arm', face: 'back', src: `${BACK}/backLeftArm-cutout.png`, labelKey: 'left_shoulder', side: 'left', wrapPairId: 'front-left-shoulder' },
  { id: 'back-left-elbow', face: 'back', src: `${BACK}/backLeftElbow-cutout.png`, labelKey: 'left_top_arm', side: 'left', wrapPairId: 'front-left-top-arm' },
  { id: 'back-left-bottom-arm', face: 'back', src: `${BACK}/backLeftBottomArm-cutout.png`, labelKey: 'left_bottom_arm', side: 'left', wrapPairId: 'front-left-bottom-arm' },

  { id: 'back-right-arm', face: 'back', src: `${BACK}/backRightArm-cutout.png`, labelKey: 'right_shoulder', side: 'right', wrapPairId: 'front-right-shoulder' },
  { id: 'back-right-elbow', face: 'back', src: `${BACK}/backRightElbow-cutout.png`, labelKey: 'right_top_arm', side: 'right', wrapPairId: 'front-right-top-arm' },
  { id: 'back-right-bottom-arm', face: 'back', src: `${BACK}/backRightBottomArm-cutout.png`, labelKey: 'right_bottom_arm', side: 'right', wrapPairId: 'front-right-bottom-arm' },

  { id: 'back-left-top-leg', face: 'back', src: `${BACK}/backLeftTopLeg-cutout.png`, labelKey: 'left_thigh', side: 'left', wrapPairId: 'front-left-thigh' },
  { id: 'back-left-bottom-leg', face: 'back', src: `${BACK}/backLeftBottomLeg-cutout.png`, labelKey: 'left_shin', side: 'left', wrapPairId: 'front-left-shin' },
  { id: 'back-right-top-leg', face: 'back', src: `${BACK}/backRightTopLeg-cutout.png`, labelKey: 'right_thigh', side: 'right', wrapPairId: 'front-right-thigh' },
  { id: 'back-right-bottom-leg', face: 'back', src: `${BACK}/backRightBottomLeg-cutout.png`, labelKey: 'right_shin', side: 'right', wrapPairId: 'front-right-shin' },
];

export const BODY_BASE: Record<Face, string> = {
  front: `${FRONT}/fullBody-cutout.png`,
  back: `${BACK}/FullBody.png`,
};

export const PARTS_BY_ID: Record<string, BodyPart> = Object.fromEntries(
  BODY_PARTS.map((p) => [p.id, p])
);

export function partsForFace(face: Face): BodyPart[] {
  return BODY_PARTS.filter((p) => p.face === face);
}
