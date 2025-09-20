const CORDOVA_REQUIRED_VERSION = '12.0.0 (cordova-lib@12.0.2)';
const { program } = require('commander');
const fse = require('fs-extra');
const proxy = require('http-proxy');
const path = require('path');
const shell = require('shelljs');
const chalk = require('chalk');
const { EOL } = require('os');
const loading = require('loading-cli');
const adb = require('adbkit');
const readline = require('readline');

async function contentToRemote(cwd, contentSrc) {
    
    const getFileConfig = await fse.promises.readFile(cwd + '/config.xml');

    let dataConfig = getFileConfig.toString();

    dataConfig = dataConfig.replace(/<content[\S\s]*?src="[^"]+"/gmi, '<content src="' + contentSrc + '"');

    await fse.promises.writeFile(cwd + '/config.xml', dataConfig);

}

async function contentToLocal(cwd) {

    const getFileConfig = await fse.promises.readFile(cwd + '/config.xml');

    dataConfig = getFileConfig.toString();

    dataConfig = dataConfig.replace(/<content[\S\s]*?src="[^"]+"/gmi, '<content src="https://localhost"');

    await fse.promises.writeFile(cwd + '/config.xml', dataConfig);

}

function rl_input(rl, prompt) {
    return new Promise(function (callbackFn, errorFn) {
        rl.question(prompt, function (uinput) {
            callbackFn(uinput);
        }, function () {
            errorFn();
        });
    });
}

const getAllFiles = function(dirPath, arrayOfFiles, level, slash = '') {
    const files = fse.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    level = level + 1 || 0;
    slash = level > 0 ? slash + '/..': '';
    files.forEach(function(file) {
        if (fse.statSync(dirPath + '/' + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles, level, slash);
        } else {
            if (
                path.extname(file) == '.html' || path.extname(file) == '.css'
            ) {
                // arrayOfFiles.push(path.join(dirPath, '/', file));
                arrayOfFiles.push({
                    path: dirPath,
                    file,
                    level,
                    slash: '.' + slash
                });
            }
        }
    });
    return arrayOfFiles;
}

function checkGlobalCordova(requiredVersion) {
    if (!requiredVersion) {
        console.log(chalk.red('Cordova version is not specified!'));
        process.exit(1);
    }
    const result = shell.exec('cordova --version', { silent: true });
    const installVersion = requiredVersion.split(' ')[0];
    if (result.code !== 0) {
        console.log(chalk.green('Installing cordova...'));
        const installResult = shell.exec('npm install -g cordova@' + installVersion, { silent: false });
        if (installResult.code !== 0) {
            console.log(chalk.red('Cordova installation failed. Please install manually: npm install -g cordova@' + installVersion));
            process.exit(1);
        }
    } else {
        let version = result.stdout.trim();
        if (version !== requiredVersion) {
            console.log(chalk.yellow(`Detected global Cordova version: ${version}\nRequired version: ${requiredVersion}\nPlease update Cordova: npm install -g cordova@${installVersion}`));
            process.exit(1);
        }
    }
}

async function init() {
    
    const cwd = process.cwd();
    
    packageRoot = require('./../package.json');

    program.command('create').description('Creates an application of the current directory, ready to work');

    program.command('dev').argument('<android|web|electron>').description('Running two development servers, on http and https. The application installed for development listens to https');

    program.command('build').argument('<android>').description('Building a project for deployment on a device for further dev mode development');

    program.command('run').argument('<android|electron>').description('Full build of the debug version project');

    program.command('release').argument('<android>').description('Complete project build for release');

    program.command('platform').argument('<add|remove> <android>').description('Add / remove a platform');

    program.command('plugin').argument('<add|remove> <name of plugin or url github>').description('Add / remove a plugin');

    program.version(packageRoot.version, '-v, --version', 'Current version');

    program.parse(process.argv);

    const pkgs = program.args;

    process.on('SIGINT', async function () {

        console.log(chalk.red('The operation has been stopped'));

        await contentToLocal(cwd);

        process.exit(1);
    });
    
    process.on('SIGQUIT', async function () {

        console.log(chalk.red('The operation has been stopped'));

        await contentToLocal(cwd);

        process.exit(1);
    });

    process.on('SIGTERM', async function () {

        console.log(chalk.red('The operation has been stopped'));

        await contentToLocal(cwd);

        process.exit(1);
    });

    let ncConfig, ncConfigPortHttp, ncConfigPortHttps;
    
    if (pkgs.indexOf('create') === -1) {

        if (!fse.existsSync(path.join(cwd, 'nc.config.json'))) {

            console.log(chalk.red('The project is missing nc.config.json'));
    
            process.exit(1);
    
        }
    
        ncConfig = require(path.join(cwd, 'nc.config.json'));
    
        ncConfigPortHttp = ncConfig?.port?.http ?? 9090;
    
        ncConfigPortHttps = ncConfig?.port?.https ?? 9091;
    
    }
    
    if (pkgs.indexOf('create') !== -1) {

        checkGlobalCordova(CORDOVA_REQUIRED_VERSION);

        const readDir = fse.readdirSync(cwd);

        if (readDir.length > 0) {
            
            console.log(chalk.red('The directory is not empty'));

            return;

        }

        const ROOT_DIR = path.join(path.dirname(__dirname), 'template/cordova-next/');

        console.log(chalk.green('Copying the template'));

        fse.copySync(ROOT_DIR, '.');
    
        const load = loading({
            'text': chalk.green('Installing dependencies...'),
            'color': 'green',
            'interval': 300,
            'frames': ['←', '↖', '↑', '↗', '→', '↘', '↓', '↙']
        });

        load.start();
        
        shell.exec('npm install && npm install cordova-next', { silent: true }, function (code, stdout, stderr) {

            load.stop();

            console.log(chalk.green('Dependency installation is complete'));

            shell.exec('git init', { silent: true }, function (code, stdout, stderr) {

                shell.exec('git add .', { silent: true }, function (code, stdout, stderr) {

                    shell.exec('git commit -m "init"', { silent: true }, function (code, stdout, stderr) {
    
                        console.log(chalk.green('The commit was successfully created'));
            
                    });
    
                });
                
            });
    
        });

    } else if (pkgs.indexOf('dev') !== -1) {

        if (pkgs.indexOf('web') !== -1) {

            process.env.CORDOVA_NEXT_PLATFORM = 'web';

        } else if (pkgs.indexOf('android') !== -1) {

            if (!fse.existsSync(cwd + '/platforms/android')) {

                console.log(chalk.red('No platforms added to this project. Please use `nc platform add <platform>`'));

                return;
            }

            try {

                const client = adb.createClient();

                let list = await client.listDevices();

                list = list.filter(item => item.type !== 'offline');

                if (list !== null && list.length === 0) {
                    
                    console.log(chalk.red('The device is not connected'));

                    return;

                } else {

                    list.map(function (item) {

                        const id = item?.id ?? null;
                        const type = item?.type ?? null;

                        if (!id) return;

                        if (type === 'device' || type === 'emulator') {

                            client.reverse(id, 'tcp:' + ncConfigPortHttp, 'tcp:' + ncConfigPortHttp);
                            client.reverse(id, 'tcp:' + ncConfigPortHttps, 'tcp:' + ncConfigPortHttps);
                            
                        }

                    });

                }

            } catch (err) {

                console.error(chalk.red('ADB error: ', err));

                return;

            }

        } else if (pkgs.indexOf('electron') !== -1) {

            if (!fse.existsSync(cwd + '/platforms/electron')) {

                console.log(chalk.red('No platforms added to this project. Please use `nc platform add <platform>`'));

                return;
            }

        } else {

            console.log(chalk.red('The platform is not supported'));

            process.exit(1);

        } 

        const childDev = shell.exec('npx next dev -p ' + ncConfigPortHttp, { async: true });

        childDev.stdout.on('data', async function (data) {
            
            data = data.toString().toLowerCase();

            if (data.indexOf(ncConfigPortHttp) !== -1) {

                const server = proxy.createServer({
                    xfwd: true,
                    ws: true,
                    target: {
                        host: 'localhost',
                        port: ncConfigPortHttp
                    },
                    headers: {
                        'Connection': 'Upgrade'
                    },
                    ssl: {
                        key: fse.readFileSync(path.join(path.dirname(__dirname), 'resources/server.key'), 'utf8'),
                        cert: fse.readFileSync(path.join(path.dirname(__dirname), 'resources/server.crt'), 'utf8')
                    }
                }).on('error', function (e) {
        
                    console.log(chalk.red('Request failed to ' + e.name + ': ' + e.code));
        
                });
                    
                console.log(chalk.green('- Local: https://localhost:' + ncConfigPortHttps));
                    
                server.listen(ncConfigPortHttps);

            }

            if (data.indexOf('ready') !== -1) {

                if (pkgs.indexOf('android') !== -1) {

                    if (fse.existsSync(cwd + '/platforms/android/platform_www') && fse.existsSync(cwd + '/www/static/chunks')) {

                        fse.copySync(cwd + '/platforms/android/platform_www', 'www/static/chunks');

                    }

                    // When the application is initially generated without plugins installed, the file is not generated, which causes an error to be displayed in the console
                    if (!fse.existsSync(cwd + '/platforms/android/platform_www/cordova_plugins.js') && fse.existsSync(cwd + '/www/static/chunks') && !fse.existsSync(cwd + '/www/static/chunks/cordova_plugins.js')) {

                        fse.ensureFile(cwd + '/www/static/chunks/cordova_plugins.js');

                    }

                } else if (pkgs.indexOf('electron') !== -1) {

                    if (fse.existsSync(cwd + '/platforms/electron/platform_www') && fse.existsSync(cwd + '/www/static/chunks')) {

                        fse.copySync(cwd + '/platforms/electron/platform_www', 'www/static/chunks');

                    }

                    // When the application is initially generated without plugins installed, the file is not generated, which causes an error to be displayed in the console
                    if (!fse.existsSync(cwd + '/platforms/electron/platform_www/cordova_plugins.js') && fse.existsSync(cwd + '/www/static/chunks') && !fse.existsSync(cwd + '/www/static/chunks/cordova_plugins.js')) {

                        fse.ensureFile(cwd + '/www/static/chunks/cordova_plugins.js');

                    }

                    const browserWindow = ncConfig?.electron?.browserWindow || {};

                    if (fse.existsSync(path.join(cwd, '/platforms/electron/platform_www/cdv-electron-settings.json'))) {
                        
                        const defaultConfig = {
                            browserWindow: {
                                width: 800,
                                height: 600,
                                webPreferences: {
                                    devTools: true,
                                    nodeIntegration: false
                                }
                            }
                        }
        
                        const newBrowserWindow = {
                            browserWindow: Object.assign({}, defaultConfig.browserWindow, browserWindow)
                        };
        
                        await fse.promises.writeFile(cwd + '/platforms/electron/platform_www/cdv-electron-settings.json', JSON.stringify(newBrowserWindow, null, 4));
                
                    }

                    await contentToRemote(cwd, 'https://localhost:' + ncConfigPortHttps);

                    const childEletron = shell.exec('npx cordova run electron --nobuild', { async: true, silent: true });

                    childEletron.stdout.on('data', async function (data) {

                        await contentToLocal(cwd);

                        console.log(chalk.green('- Electron started'));

                        data = data.trim();

                        if (!data) return;
                        
                        console.log('Electron: ', data);

                    });

                    childEletron.stderr.on('data', function (data) {

                        data = data.trim();

                        if (!data) return;

                        if (data.indexOf('Error:') !== -1) {

                            console.log(chalk.red(data));

                            return;
                        }

                        console.log(chalk.yellow('Electron: ') + data);

                    });
        
                }

            }

        });

    } else if (pkgs.indexOf('build') !== -1) {
        
        if (pkgs.indexOf('android') !== -1) {

            if (!fse.existsSync(cwd + '/platforms/android')) {

                console.log(chalk.red('No platforms added to this project. Please use `nc platform add <platform>`'));

                return;
            }

            if (!fse.existsSync(cwd + '/config.xml')) {

                console.log(chalk.red('config.xml does not exist'));

                return;
            }

            const device = [];

            try {

                const client = adb.createClient();

                let list = await client.listDevices();

                list = list.filter(item => item.type !== 'offline');

                if (list !== null && list.length === 0) {
                    
                    console.log(chalk.red('The device is not connected'));

                    return;

                } else {

                    list.map(function (item, index) {

                        const id = item?.id ?? null;
                        const type = item?.type ?? null;

                        if (!id) return;
                        
                        if (type === 'device' || type === 'emulator') {

                            device.push(item);

                        }

                    });
                    
                }
    
            } catch (err) {

                console.error(chalk.red('ADB error: ', err));

                return;
            }

            let runCommand = 'npx cordova run android';

            if (device.length > 1) {
                
                let text = chalk.yellow('Select a device:\n');

                device.forEach((item, index) => {

                    text += chalk.yellow(index + '. ' + item.id + '\n');

                });

                text += chalk.yellow('Enter the device number: ');

                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });

                const number = await rl_input(rl, text);

                rl.close();

                const deviceSelect = device[number] ?? null;

                if (!deviceSelect) {

                    console.log(chalk.red('Device number <' + number + '> does not exist'));

                    return;
                }

                const id = deviceSelect?.id ?? null;

                if (id) {

                    runCommand = runCommand + ' --target="' + id + '"';

                }

            }

            await contentToRemote(cwd, 'https://localhost:' + ncConfigPortHttps);

            shell.exec(runCommand, {}, async function (code, stdout, stderr) {

                await contentToLocal(cwd);

                if (code !== 0) {

                    console.log(chalk.red(stderr));

                    return;
                }

            });

        } else {

            console.log(chalk.red('The platform is not supported'));

            process.exit(1);
        }

    } else if (pkgs.indexOf('run') !== -1) {

        if (pkgs.indexOf('android') !== -1) {

            if (!fse.existsSync(cwd + '/platforms/android')) {

                console.log(chalk.red('No platforms added to this project. Please use `nc platform add <platform>`.'));

                return;
            }

            if (!fse.existsSync(cwd + '/config.xml')) {

                console.log(chalk.red('config.xml does not exist'));

                return;
            }

            await contentToLocal(cwd);

            shell.exec('npx next build');

            shell.exec('npx cordova run android');
        
        } else if (pkgs.indexOf('electron') !== -1) {
        
            if (!fse.existsSync(cwd + '/platforms/electron')) {

                console.log(chalk.red('No platforms added to this project. Please use `nc platform add <platform>`.'));

                return;
            }
 
            if (!fse.existsSync(cwd + '/config.xml')) {

                console.log(chalk.red('config.xml does not exist'));

                return;
            }

            const loadURL = ncConfig?.electron?.browserWindowInstance?.loadURL?.url ?? 'index.html';

            await contentToRemote(cwd, loadURL);

            shell.exec('npx next build');

            const getFileCdvElectronMain = await fse.promises.readFile(cwd + '/platforms/electron/platform_www/cdv-electron-main.js');

            let dataCdvElectronMain = getFileCdvElectronMain.toString();

            if (dataCdvElectronMain.indexOf('cdvElectronSettings.scheme') !== -1) {

                dataCdvElectronMain = dataCdvElectronMain.replace(/const\s+scheme\s+=\s+cdvElectronSettings\.scheme(;)?/gmi, 'const scheme = \'app\';');

                await fse.promises.writeFile(cwd + '/platforms/electron/platform_www/cdv-electron-main.js', dataCdvElectronMain);

            }

            // When the application is initially generated without plugins installed, the file is not generated, which causes an error to be displayed in the console
            if (!fse.existsSync(cwd + '/platforms/electron/platform_www/cordova_plugins.js')) {

                await fse.ensureFile(cwd + '/platforms/electron/platform_www/cordova_plugins.js');

            }

            const browserWindow = ncConfig?.electron?.browserWindow || {};

            if (fse.existsSync(path.join(cwd, '/platforms/electron/platform_www/cdv-electron-settings.json'))) {
                
                const defaultConfig = {
                    browserWindow: {
                        width: 800,
                        height: 600,
                        webPreferences: {
                            devTools: true,
                            nodeIntegration: false
                        }
                    }
                }

                const newBrowserWindow = {
                    browserWindow: Object.assign({}, defaultConfig.browserWindow, browserWindow)
                };

                await fse.promises.writeFile(cwd + '/platforms/electron/platform_www/cdv-electron-settings.json', JSON.stringify(newBrowserWindow, null, 4));
        
            }

            shell.exec('npx cordova build electron --debug');

            const getFileCdvElectronMain2 = await fse.promises.readFile(cwd + '/platforms/electron/platform_www/cdv-electron-main.js');

            let dataCdvElectronMain2 = getFileCdvElectronMain2.toString();

            if (dataCdvElectronMain2.indexOf('\'app\'') !== -1) {

                dataCdvElectronMain2 = dataCdvElectronMain2.replace(/const\s+scheme\s+=\s+\'app\'(;)?/gmi, 'const scheme = cdvElectronSettings.scheme;');

                await fse.promises.writeFile(cwd + '/platforms/electron/platform_www/cdv-electron-main.js', dataCdvElectronMain2);

            }

            await contentToLocal(cwd);

        } else {

            console.log(chalk.red('The platform is not supported'));

            process.exit(1);
        }

    } else if (pkgs.indexOf('release') !== -1) {

        if (pkgs.indexOf('android') !== -1) {

        } else if (pkgs.indexOf('electron') !== -1) {
        
            if (!fse.existsSync(cwd + '/platforms/electron')) {

                console.log(chalk.red('No platforms added to this project. Please use `nc platform add <platform>`.'));

                return;
            }
 
            if (!fse.existsSync(cwd + '/config.xml')) {

                console.log(chalk.red('config.xml does not exist'));

                return;
            }

            const loadURL = ncConfig?.electron?.browserWindowInstance?.loadURL?.url ?? 'index.html';

            await contentToRemote(cwd, loadURL);

            shell.exec('npx next build');

            const getFileCdvElectronMain = await fse.promises.readFile(cwd + '/platforms/electron/platform_www/cdv-electron-main.js');

            let dataCdvElectronMain = getFileCdvElectronMain.toString();

            if (dataCdvElectronMain.indexOf('cdvElectronSettings.scheme') !== -1) {

                dataCdvElectronMain = dataCdvElectronMain.replace(/const\s+scheme\s+=\s+cdvElectronSettings\.scheme(;)?/gmi, 'const scheme = \'app\';');

                await fse.promises.writeFile(cwd + '/platforms/electron/platform_www/cdv-electron-main.js', dataCdvElectronMain);

            }

            // When the application is initially generated without plugins installed, the file is not generated, which causes an error to be displayed in the console
            if (!fse.existsSync(cwd + '/platforms/electron/platform_www/cordova_plugins.js')) {

                await fse.ensureFile(cwd + '/platforms/electron/platform_www/cordova_plugins.js');

            }

            const browserWindow = ncConfig?.electron?.browserWindow || {};

            if (fse.existsSync(path.join(cwd, '/platforms/electron/platform_www/cdv-electron-settings.json'))) {
                
                const defaultConfig = {
                    browserWindow: {
                        width: 800,
                        height: 600,
                        webPreferences: {
                            devTools: false,
                            nodeIntegration: false
                        },
                        autoHideMenuBar: true
                    }
                }

                const newBrowserWindow = {
                    browserWindow: Object.assign({}, defaultConfig.browserWindow, browserWindow)
                };

                await fse.promises.writeFile(cwd + '/platforms/electron/platform_www/cdv-electron-settings.json', JSON.stringify(newBrowserWindow, null, 4));
        
            }

            shell.exec('npx cordova build electron --release');

            const getFileCdvElectronMain2 = await fse.promises.readFile(cwd + '/platforms/electron/platform_www/cdv-electron-main.js');

            let dataCdvElectronMain2 = getFileCdvElectronMain2.toString();

            if (dataCdvElectronMain2.indexOf('\'app\'') !== -1) {

                dataCdvElectronMain2 = dataCdvElectronMain2.replace(/const\s+scheme\s+=\s+\'app\'(;)?/gmi, 'const scheme = cdvElectronSettings.scheme;');

                await fse.promises.writeFile(cwd + '/platforms/electron/platform_www/cdv-electron-main.js', dataCdvElectronMain2);

            }

            await contentToLocal(cwd);

        } else {

            console.log(chalk.red('The platform is not supported'));

            process.exit(1);
        }

    } else if (pkgs.indexOf('platform') !== -1) {

        const add = pkgs.indexOf('add') !== -1;
        const remove = pkgs.indexOf('remove') !== -1;

        if (!add && !remove) {

            console.log(chalk.red('It is only possible to add or remove a platform'));

            process.exit(1);
        }

        const action = add ? 'add' : 'rm';

        if (pkgs.indexOf('android') !== -1) {

            shell.exec('npx cordova platform ' + action + ' android');

            if (action === 'add') {

                if (fse.existsSync(cwd + '/platforms/android/app/build.gradle')) {

                    const getFileBuildGradle = await fse.promises.readFile(cwd + '/platforms/android/app/build.gradle');

                    let dataBuildGradle = getFileBuildGradle.toString();

                    if (dataBuildGradle.indexOf('aaptOptions') === -1) {

                        dataBuildGradle = dataBuildGradle.replace(/^(.+)namespace\s+cordovaConfig\.PACKAGE_NAMESPACE/gmi, '$1namespace cordovaConfig.PACKAGE_NAMESPACE' + EOL + EOL + '$1aaptOptions {' + EOL + '$1$1ignoreAssetsPattern \'!.svn:!.git:!.ds_store:!*.scc:.*:build\' ' + EOL + '$1}');

                        await fse.promises.writeFile(cwd + '/platforms/android/app/build.gradle', dataBuildGradle);

                    }

                }

            }

        } else if (pkgs.indexOf('electron') !== -1) {

            shell.exec('npx cordova platform ' + action + ' electron');

            if (action === 'add') {

                fse.copySync(path.join(path.dirname(__dirname), 'platform/electron/cdv-electron-main.js'), path.join(cwd, 'platforms/electron/platform_www/cdv-electron-main.js'));
                
                console.log(chalk.green('cdv-electron-main.js has been copied to platforms/electron/platform_www'));

            }

        } else {

            console.log(chalk.red('The platform is not supported'));

            process.exit(1);
        }

    } else if (pkgs.indexOf('plugin') !== -1) {

        const add = pkgs.indexOf('add') !== -1;
        const remove = pkgs.indexOf('remove') !== -1;

        if (!add && !remove) {

            console.log(chalk.red('It is only possible to add or remove a plugin'));

            process.exit(1);
        }

        const action = add ? 'add' : 'rm';

        const name = pkgs[2] ?? null;

        if (!name) {

            console.log(chalk.red('The name of the plugin is not specified. Please use `nc plugin add <plugin>`'));

            process.exit(1);
        }

        shell.exec('npx cordova plugin ' + action + ' ' + name);

    }

}

module.exports = {
    init
}