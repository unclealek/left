export const SLIDE_CONFIRM_THRESHOLD = 0.78;

export function hasCompletedSlide(position: number, maxTravel: number) {
  return maxTravel > 0 && position >= maxTravel * SLIDE_CONFIRM_THRESHOLD;
}
