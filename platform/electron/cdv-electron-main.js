/*
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*/

const fs = require('fs');
const path = require('path');
const { cordova } = require('./package.json');

const proxy = require('http-proxy');
process.env.NC_DEV_HTTP_PORT = process.env.NC_DEV_HTTP_PORT ?? 9090;
if (process.env.NC_DEV_HTTP_PORT == '') {
    process.env.NC_DEV_HTTP_PORT = 9090;
}
const DEFAULT_DEV_HTTP_PORT = parseInt(process.env.NC_DEV_HTTP_PORT, 10);
process.env.NC_DEV_HTTPS_PORT = process.env.NC_DEV_HTTPS_PORT ?? 9091;
if (process.env.NC_DEV_HTTPS_PORT == '') {
    process.env.NC_DEV_HTTPS_PORT = 9091;
}
const DEFAULT_DEV_HTTPS_PORT = parseInt(process.env.NC_DEV_HTTPS_PORT, 10);
const NODE_ENV = process.env.NODE_ENV;
process.env.NC_PACKAGE_PATH = process.env.NC_PACKAGE_PATH ?? null;

// Module to control application life, browser window and tray.
const { app, BrowserWindow, protocol, ipcMain, net } = require('electron');

app.commandLine.appendSwitch('ignore-certificate-errors');

// Electron settings from .json file.
const cdvElectronSettings = require('./cdv-electron-settings.json');
const reservedScheme = require('./cdv-reserved-scheme.json');

const devTools = cdvElectronSettings.browserWindow.webPreferences.devTools ? require('electron-devtools-installer'): false;

const scheme = cdvElectronSettings.scheme;
const hostname = cdvElectronSettings.hostname;
const isFileProtocol = scheme === 'file';

/**
 * The base url path.
 * E.g:
 * When scheme is defined as "file" the base path is "file://path-to-the-app-root-directory"
 * When scheme is anything except "file", for example "app", the base path will be "app://localhost"
 *  The hostname "localhost" can be changed but only set when scheme is not "file"
 */
const basePath = (() => isFileProtocol ? `file://${__dirname}` : `${scheme}://${hostname}`)();

if (reservedScheme.includes(scheme)) {
    throw new Error(`The scheme "${scheme}" can not be registered. Please use a non-reserved scheme.`);
}

if (!isFileProtocol) {
    protocol.registerSchemesAsPrivileged([{
        scheme,
        privileges: {
            standard: true,
            secure: true,
            // Enable Fetch API support for custom protocol
            supportFetchAPI: true
        }
    }]);
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    // Create the browser window.
    let appIcon;
    if (fs.existsSync(path.join(__dirname, 'img/app.png'))) {
        appIcon = path.join(__dirname, 'img/app.png');
    } else if (fs.existsSync(path.join(__dirname, 'img/icon.png'))) {
        appIcon = path.join(__dirname, 'img/icon.png');
    } else {
        appIcon = path.join(__dirname, 'img/logo.png');
    }

    const browserWindowOpts = Object.assign({}, cdvElectronSettings.browserWindow, { icon: appIcon });

    browserWindowOpts.webPreferences.preload = path.join(app.getAppPath(), 'cdv-electron-preload.js');
    browserWindowOpts.webPreferences.contextIsolation = true;
    // @todo review if using default "sandbox" is possible. When enabled, "Unable to load preload script:" error occurs.
    // Other require statements also fails.
    browserWindowOpts.webPreferences.sandbox = false;

    mainWindow = new BrowserWindow(browserWindowOpts);

    // Load a local HTML file or a remote URL.
    const cdvUrl = cdvElectronSettings.browserWindowInstance.loadURL.url;
    const loadUrl = cdvUrl.includes('://') ? cdvUrl : `${basePath}/${cdvUrl}`;
    const loadUrlOpts = Object.assign({}, cdvElectronSettings.browserWindowInstance.loadURL.options);

    let _loadUrl;
    if (NODE_ENV === 'development') {
        _loadUrl = 'https://localhost:' + DEFAULT_DEV_HTTPS_PORT;
    } else {
        _loadUrl = loadUrl;
    }

    mainWindow.loadURL(_loadUrl, loadUrlOpts);

    // Open the DevTools.
    if (cdvElectronSettings.browserWindow.webPreferences.devTools) {
        mainWindow.webContents.openDevTools();
    }

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}

function configureProtocol() {
    // `protocol.handle` was added in Electron 25.0 and replaced the deprecated
    // `protocol.{register,intercept}{String,Buffer,Stream,Http,File}Protocol`.
    if (protocol.handle) {
        // If using Electron 25.0+
        protocol.handle(scheme, (request) => {
            const url = request.url.substr(basePath.length + 1);
            const fileUrl = `file://${path.normalize(path.join(__dirname, url))}`;
            return net.fetch(fileUrl);
        });
    } else if (protocol.registerFileProtocol) {
        // If using Electron 24.x and older
        protocol.registerFileProtocol(scheme, (request, cb) => {
            const url = request.url.substr(basePath.length + 1);
            cb({ path: path.normalize(path.join(__dirname, url)) }); // eslint-disable-line n/no-callback-literal
        });
        protocol.interceptFileProtocol('file', (_, cb) => {
            cb(null);
        });
    } else {
        // Cant configure if missing `protocol.handle` and `protocol.registerFileProtocol`...
        console.info('Unable to configure the protocol.');
    }
}

let _startHttpsProxy;
async function startHttpsProxy() {
    _startHttpsProxy = proxy.createServer({
        xfwd: true,
        ws: true,
        target: {
            host: 'localhost',
            port: DEFAULT_DEV_HTTP_PORT
        },
        headers: {
            'Connection': 'Upgrade'
        },
        ssl: {
            key: fs.readFileSync(path.join(process.env.NC_PACKAGE_PATH, 'resources', 'server.key'), 'utf8'),
            cert: fs.readFileSync(path.join(process.env.NC_PACKAGE_PATH, 'resources', 'server.crt'), 'utf8')
        }
    }).on('error', function (e) {
        console.error('cordova-next: HTTPS proxy error', e);
    });
    await new Promise((resolve) => {
        _startHttpsProxy.listen(DEFAULT_DEV_HTTPS_PORT, () => {
            console.log('cordova-next: HTTPS dev proxy → https://localhost:' + DEFAULT_DEV_HTTPS_PORT);
            resolve();
        });
    });
    return true;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    if (NODE_ENV === 'development') {
        await startHttpsProxy();
    } else if (!isFileProtocol) {
        configureProtocol();
    }
    if (devTools && cdvElectronSettings.devToolsExtension) {
        const extensions = cdvElectronSettings.devToolsExtension.map((id) => devTools[id] || id);
        // default = install extension
        devTools.default(extensions).then((name) => console.log(`Added Extension:  ${name}`)).catch((err) => console.log('An error occurred: ', err));
    }
    createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    if (!_startHttpsProxy) return;
    _startHttpsProxy.close();
    _startHttpsProxy = null;
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        if (!isFileProtocol) {
            configureProtocol();
        }
        createWindow();
    }
});

ipcMain.handle('cdv-plugin-exec', async (_, serviceName, action, ...args) => {
    if (cordova && cordova.services && cordova.services[serviceName]) {
        const plugin = require(cordova.services[serviceName]);
        return plugin[action] ? plugin[action](...args): Promise.reject(new Error(`The action "${action}" for the requested plugin service "${serviceName}" does not exist.`));
    } else {
        return Promise.reject(new Error(`The requested plugin service "${serviceName}" does not exist have native support.`));
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
