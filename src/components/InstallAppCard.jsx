import React, { useState, useEffect } from 'react';
import { useInstallPrompt } from '../InstallContext';

export default function InstallAppCard() {
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { canPromptInstall, promptInstall, justInstalled } = useInstallPrompt();

  useEffect(() => {
    // Already installed and running standalone (e.g. opened from home screen)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);
  }, []);

  // Install completed this session (Chromium 'appinstalled' fired via context)
  useEffect(() => {
    if (justInstalled) {
      setIsInstalled(true);
    }
  }, [justInstalled]);

  const handleInstallClick = async () => {
    // iOS never gets a native prompt — always show manual instructions.
    // Non-iOS without a captured prompt (event hasn't fired / unsupported) also falls back.
    if (isIOS || !canPromptInstall) {
      setShowModal(true);
      return;
    }

    await promptInstall();
  };

  // Only real hide condition: the app is actually installed/running standalone
  if (isInstalled) return null;

  return (
    <>
      <div className="list-row">
        <div className="list-row-content">
          <div className="list-row-title">Install App</div>
          <div className="list-row-meta">Add to home screen for quick access</div>
        </div>
        <button className="btn btn-outline" onClick={handleInstallClick}>
          Install
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add to Home Screen</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <p className="confirm-message">To install Anchor Vault:</p>
            <ol style={{ textAlign: 'left', paddingLeft: 20, color: 'var(--text-primary)', marginBottom: 24 }}>
              <li style={{ marginBottom: 8 }}>
                {isIOS ? (
                  <>Tap the <strong>Share</strong> icon at the bottom of Safari.</>
                ) : (
                  <>Click the <strong>three dots</strong> (or install icon) in your browser menu.</>
                )}
              </li>
              <li style={{ marginBottom: 8 }}>Select <strong>Add to Home Screen</strong> or <strong>Install App</strong>.</li>
              <li>Confirm by tapping/clicking <strong>Add</strong> or <strong>Install</strong>.</li>
            </ol>
            <div className="modal-actions" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setShowModal(false)}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
