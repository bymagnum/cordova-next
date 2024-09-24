# Cordova and Next.js. Optional - Framework7

Use this package if you want to configure an application running Next, Cordova, optionally Framework 7.
Real-time development mode on an emulator device, phone, browser.
This package allows you to test in real time, write code together with plugins. And only after changing/refining the plugin code will the application need to be recompiled. Therefore, you can write code calmly, with ready-made plugins in real time on the emulator with a quick page reload.
In addition, this package has a full extension that allows you to use other packages of the framework without resorting to global changes. It is enough to remove some unnecessary details.

_You can help the project with the amount in Telegram: @bymagnum_

# Install

```
npm install cordova-next -g
```

or

```
yarn global add cordova-next
```



# Available platforms

Platform | Description
-- | --
`android` | &#9745;
`ios` | &#9744;
`electron` | &#9744;

Platforms that are not marked require improvement



# Steps required

Run the command that will create in the current directory all the necessary tools to work with the application:
```
nc create
```



# Available commands

Command | Description
-- | --
`nc create [option]` | Creates an application of the current directory, ready to work
`nc dev <platform>` | Running two development servers, on http and https. The application installed for development listens to https
`nc build <platform>` | Building a project for deployment on a device for further dev mode development
`nc run <platform>` | Full build of the debug version project
`nc release <platform>` | Complete project build for release
`nc platform <action> <platform>` | Add / remove a platform
`nc plugin <action> <plugin>` | Add / remove a plugin

&nbsp;

Platform | Description
-- | --
`android` | &#9745;
`ios` | &#9744; (Work is underway)

&nbsp;

Options | Command | Description
-- | -- | --
`-f7, --framework7` | `nc create` | Add Framework7

&nbsp;

Action | Description
-- | --
`add` | Add
`remove` | Remove



# cordova-next as a library

You can use the package as a library. At the moment, only the following React components are available:

```
import { ScriptCordova } from 'cordova-next';

<ScriptCordova />
```

Imports cordova.js, a good option for using a component in one place is _document.js, but it is also possible to use it at your discretion, up to complete deletion, if you do not need it as a system script.



# Package.json in the deployed application

Parameter | Default | Description
-- | -- | --
`nc.port.http` | 9090 | Development port http
`nc.port.https` | 9091 | Development port https



# General information

You can add all other commands directly to your package by applying npx.

Commands that you can add:

1. [Cordova](https://cordova.apache.org/docs/en/latest/)

2. [NextJS](https://nextjs.org/docs/getting-started)

3. Use the documentation for building the application [Framework7](https://framework7.io/react/)

Do not try to create an application again using the "create next-app" or "cordova create" commands, everything you need is already present in this package, and you only need to work on your application.

Everything else - You can use it as if you used cordova, next, framework 7 separately.

Two servers are used in this package for the following purposes: WebRTC requires an SSL connection, as well as several other technologies that require a secure connection and do not allow development without SSL. Https is also a direct working ready-made tool.




