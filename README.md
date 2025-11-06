# Cordova and Next.js

Use this package if you want to configure an application running Next, Cordova.
Real-time development mode on an emulator device, phone, browser.
This package allows you to test in real time, write code together with plugins. And only after changing/refining the plugin code will the application need to be recompiled. Therefore, you can write code calmly, with ready-made plugins in real time on the emulator with a quick page reload.
In addition, this package has a full extension that allows you to use other packages of the framework without resorting to global changes.
Added support (starting from version 0.0.4) for the Android - ADB platform. There is no ADB implementation server in this package, so it must be pre-installed on your computer. This is a client for the <a href="https://developer.android.com/studio/command-line/adb.html" target="_blank">Android Debug Bridge</a> server.



### Features

- Real-time plugin development: hot reload on device, emulator, or browser without rebuilding.
- Full Electron workflow: `nc dev`, `nc run`, and `nc release` all work out of the box.
- Optional custom splash screens defined in `nc.config.json`.
- Cordova and Next.js commands available via `npx` alongside `nc`.



# Install

```
npm install cordova-next -g
```

or

```
yarn global add cordova-next
```



# Steps required

Run the command that will create in the current directory all the necessary tools to work with the application:
```
nc create
```



# Available commands

Command | Description
-- | --
`nc create` | Creates an application of the current directory, ready to work
`nc dev <platform>` | Running two development servers, on http and https. The application installed for development listens to https
`nc build <platform>` | Building a project for deployment on a device for further dev mode development
`nc run <platform>` | Full build of the debug version project
`nc release <platform>` | Complete project build for release
`nc platform <action> <platform>` | Add / remove a platform
`nc plugin <action> <plugin>` | Add / remove a plugin

&nbsp;

Platform | Description
-- | --
`web` | &#9745; Available during development
`android` | &#9745; (beta)
`ios` | &#9744; (Not available yet)
`electron` | &#9745; (beta)

&nbsp;

Action | Description
-- | --
`add` | Add
`remove` | Remove

&nbsp;
&nbsp;

# cordova-next as a library

You can use the package as a library. The following React exports are available:

```js
import { ScriptCordova, useElectronOverlay } from 'cordova-next';
```

### ScriptCordova

```js
<ScriptCordova />
```
Injects `cordova.js`. A good place to render this component once is `_document.js`, but you can include or remove it wherever you prefer if you don’t need it as a global script.

During development (`nc dev web`) `cordova.js` is not injected, which lets you develop in the browser without extra steps. You don’t need to remove the component manually for web development.

### Overlay Hook (React)

```
useElectronOverlay(ready: boolean)
```
Hides the Electron BrowserView overlay (splash) when `ready === true`. Typical usage is to signal readiness after your app determines the auth state or completes initial data loading.

Example:
```js
import { useElectronOverlay } from 'cordova-next';

export function AppReadyGate({ ready }) {
    useElectronOverlay(ready);
    return null;
}
```

Manual alternative (without the hook):
```js
import { useEffect } from 'react';

export function AuthGate({ auth }) {
    useEffect(() => {
        if (typeof window === 'undefined' || auth === null) return;
        window.electronBridge?.notifyReactReady?.();
    }, [auth]);
    return null;
}
```

&nbsp;

# nc.config.json in the deployed application

Parameter | Default | Description
-- | -- | --
`dev.port.http` | 9090 | Development port http
`dev.port.https` | 9091 | Development port https
`electron.browserWindow` | Cordova Electron | Electron options
`electron.pageLoading.app.enabled` | true | Determining whether a splash screen is enabled
`electron.pageLoading.app.path` | '' | Local splash screen path in .html format
`electron.pageLoading.app.overlay.enabled` | false | Enable BrowserView overlay (splash over main window)
`electron.pageLoading.app.overlay.duration` | 300 | Overlay fade-out duration in milliseconds

> The custom splash Electron page must be an existing `.html` file.

&nbsp;
&nbsp;

# General information

You can add all other commands directly to your package by applying npx.

Commands that you can add:

1. [Cordova](https://cordova.apache.org/docs/en/latest/)

2. [NextJS](https://nextjs.org/docs/getting-started)

Do not try to create an application again using the "create next-app" or "cordova create" commands, everything you need is already present in this package, and you only need to work on your application.

Everything else - You can use it as if you used cordova, next.

Two servers are used in this package for the following purposes: WebRTC requires an SSL connection, as well as several other technologies that require a secure connection and do not allow development without SSL. Https is also a direct working ready-made tool.


Support the project via Telegram: @bymagnum

