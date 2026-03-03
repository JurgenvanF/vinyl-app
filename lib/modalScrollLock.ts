let lockCount = 0;

function syncBodyLockClass() {
  if (typeof document === "undefined") return;
  const shouldLock = lockCount > 0;
  document.body.classList.toggle("modal-open", shouldLock);
  document.documentElement.classList.toggle("modal-open", shouldLock);

  if (shouldLock) {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return;
  }

  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
}

export function acquireModalScrollLock() {
  lockCount += 1;
  syncBodyLockClass();
}

export function releaseModalScrollLock() {
  lockCount = Math.max(0, lockCount - 1);
  syncBodyLockClass();
}
