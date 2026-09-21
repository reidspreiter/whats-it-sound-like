export const useThrottleCallback = <A extends unknown[], R>(
  callback: (...args: A) => R,
  delay: number,
) => {
  let lastCallTime = 0;
  let timeoutRef: null | number = null;
  let lastArgs: A | null = null;

  const throttled = (...args: A) => {
    const now = Date.now();
    const remainingTime = delay - (now - lastCallTime);

    lastArgs = args;

    if (remainingTime <= 0) {
      if (timeoutRef !== null) {
        clearTimeout(timeoutRef);
        timeoutRef = null;
      }
      lastCallTime = now;
      callback(...args);
    } else if (timeoutRef === null) {
      timeoutRef = setTimeout(() => {
        lastCallTime = Date.now();
        timeoutRef = null;
        if (lastArgs) {
          callback(...lastArgs);
        }
      }, remainingTime);
    }
  };

  const cancel = () => {
    if (timeoutRef !== null) {
      clearTimeout(timeoutRef);
      timeoutRef = null;
    }
  };

  return { cancel, throttled };
};
