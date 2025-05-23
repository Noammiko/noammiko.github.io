let idleTimeout: ReturnType<typeof setTimeout>;

function resetIdleTimer(redirectTime: number, redirectUrl: string) {
  if (idleTimeout) clearTimeout(idleTimeout);
  idleTimeout = setTimeout(() => {
    window.location.href = redirectUrl;
  }, redirectTime);
}

export function setupIdleRedirect(
  redirectTime: number = 30000, // time in milliseconds, default 30s
  redirectUrl: string = '/'
) {
  const reset = () => resetIdleTimer(redirectTime, redirectUrl);

  // Listen to user interactions
  ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'].forEach(event => {
    window.addEventListener(event, reset, { passive: true });
  });

  // Start the timer
  reset();
}
