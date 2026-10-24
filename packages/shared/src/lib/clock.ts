/**
 * Mock time: real time plus an offset that the demo controls can push
 * forward, so cart expiry (7 days), OTP expiry and return windows can be
 * shown without waiting.
 */
export function createClock(realNow: () => number = Date.now, initialOffsetMs = 0) {
  let offset = initialOffsetMs;
  return {
    now: () => realNow() + offset,
    date: () => new Date(realNow() + offset),
    advance: (ms: number) => {
      offset += ms;
    },
    offset: () => offset,
    reset: () => {
      offset = 0;
    },
  };
}
export type Clock = ReturnType<typeof createClock>;
