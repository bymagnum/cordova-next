import React, { useEffect } from 'react';

function ScriptCordova() {

    const NODE_ENV = process.env?.NODE_ENV ?? null;
    const CORDOVA_NEXT_PLATFORM = process.env?.CORDOVA_NEXT_PLATFORM ?? null;

    if (CORDOVA_NEXT_PLATFORM === 'web') return;

    if (NODE_ENV === 'production') {

        return (
            <script src="/cordova.js"></script>
        );

    } else if (NODE_ENV === 'development') {

        return (
            <script src="/_next/static/chunks/cordova.js"></script>
        );

    }

}

function useElectronOverlay(ready) {

    useEffect(() => {

        if (typeof window === 'undefined') return;

        if (!ready) return;

        window.electronBridge?.notifyReactReady?.();
        
    }, [ready]);

}

export { ScriptCordova, useElectronOverlay };