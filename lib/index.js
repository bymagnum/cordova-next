import React from 'react';

function ScriptCordova() {

    const env = process.env?.NODE_ENV ?? null;
    const cwd = process.cwd();

    if (env === 'production') {

        return (
            <script src="/cordova.js"></script>
        );

    } else if (env === 'development') {

        return (
            <script src="/_next/static/chunks/cordova.js"></script>
        );

    }

}

function Init() {
    

}

export { ScriptCordova };

export default Init;