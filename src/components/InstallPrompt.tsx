"use client";

import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("install-prompt-dismissed");
    if (dismissed) return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) return;

    const ua = window.navigator.userAgent;
    const iosDevice = /iPad|iPhone|iPod/.test(ua);
    setIsIOS(iosDevice);

    if (iosDevice) {
      setShowBanner(true);
      return;
    }

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowBanner(false);
  }

  function handleDismiss() {
    localStorage.setItem("install-prompt-dismissed", "true");
    setShowBanner(false);
  }

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white border rounded-xl shadow-lg p-4 z-50 safe-bottom">
      <p className="text-sm font-medium mb-1">Install VIT Carpool</p>
      {isIOS ? (
        <p className="text-xs text-gray-600 mb-3">
          Tap the Share icon, then &quot;Add to Home Screen&quot; for quick access.
        </p>
      ) : (
        <p className="text-xs text-gray-600 mb-3">
          Add to your home screen for faster access, just like a native app.
        </p>
      )}
      <div className="flex gap-2">
        {!isIOS && (
          <button onClick={handleInstall} className="flex-1 bg-blue-600 text-white text-xs rounded-lg py-2 font-medium">
            Install
          </button>
        )}
        <button onClick={handleDismiss} className="flex-1 text-xs text-gray-500 py-2">
          {isIOS ? "Got it" : "Not now"}
        </button>
      </div>
    </div>
  );
}
