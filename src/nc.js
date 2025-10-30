const CORDOVA_REQUIRED_VERSION = '12.0.0';
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
const {
    contentToRemote,
    contentToLocal,
    rlInput,
    checkGlobalCordova,
    validateNextConfig
} = require('./utils/project');

async function init() {
    
    const cwd = process.cwd();
    
    const packageRoot = require(path.join(__dirname, '..', 'package.json'));

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

    let ncConfig, ncConfigPortHttp, ncConfigPortHttps, packageCwd;
    
    if (pkgs.indexOf('create') === -1) {

        if (!fse.existsSync(path.join(cwd, 'package.json'))) {

            console.log(chalk.red('package.json does not exist in the project'));

            return;
        }

        packageCwd = require(path.join(cwd, 'package.json'));

        if (!fse.existsSync(path.join(cwd, 'nc.config.json'))) {

            console.log(chalk.red('The project is missing nc.config.json'));
    
            process.exit(1);
    
        }
    
        ncConfig = require(path.join(cwd, 'nc.config.json'));
    
        ncConfigPortHttp = ncConfig?.dev?.port?.http ?? 9090;
    
        ncConfigPortHttps = ncConfig?.dev?.port?.https ?? 9091;
    
        process.env.NC_DEV_HTTP_PORT = ncConfigPortHttp;

        process.env.NC_DEV_HTTPS_PORT = ncConfigPortHttps;

        process.env.NC_PACKAGE_PATH = path.dirname(__dirname);

    }
    
    if (pkgs.indexOf('create') !== -1) {

        checkGlobalCordova(CORDOVA_REQUIRED_VERSION);

        const readDir = fse.readdirSync(cwd);

        if (readDir.length > 0) {
            
            console.log(chalk.red('The directory is not empty'));

            return;

        }

        console.log(chalk.green('Copying the template'));

        fse.copySync(path.join(path.dirname(__dirname), 'template', 'cordova-next'), '.');
    
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

        if (!process.env.NODE_ENV) {

            process.env.NODE_ENV = 'development';

        }

        if (!process.env.NC_PROJECT_PATH) {

            process.env.NC_PROJECT_PATH = cwd;

        }

        if (pkgs.indexOf('web') !== -1) {

            process.env.CORDOVA_NEXT_PLATFORM = 'web';

        } else if (pkgs.indexOf('android') !== -1) {

            if (!fse.existsSync(path.join(cwd, 'platforms', 'android'))) {

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

            if (!fse.existsSync(path.join(cwd, 'platforms', 'electron'))) {

                console.log(chalk.red('No platforms added to this project. Please use `nc platform add <platform>`'));

                return;
            }

            await validateNextConfig(cwd, { requireStandalone: true, requireDistDir: true });

        } else {

            console.log(chalk.red('The platform is not supported'));

            process.exit(1);

        } 

        const childDev = shell.exec('npx next dev -p ' + ncConfigPortHttp, { async: true });

        childDev.stdout.on('data', async function (data) {
            
            data = data.toString().toLowerCase();

            if (data.indexOf(ncConfigPortHttp) !== -1 && pkgs.indexOf('electron') === -1) {

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
                        key: fse.readFileSync(path.join(path.dirname(__dirname), 'resources', 'server.key'), 'utf8'),
                        cert: fse.readFileSync(path.join(path.dirname(__dirname), 'resources', 'server.crt'), 'utf8')
                    }
                }).on('error', function (e) {
        
                    console.log(chalk.red('Request failed to ' + e.name + ': ' + e.code));
        
                });
                    
                console.log(chalk.green('- Local: https://localhost:' + ncConfigPortHttps));
                    
                server.listen(ncConfigPortHttps);

            }

            if (data.indexOf('ready') !== -1) {

                if (pkgs.indexOf('android') !== -1) {

                    if (fse.existsSync(path.join(cwd, 'platforms', 'android', 'platform_www')) && fse.existsSync(path.join(cwd, 'www', 'static', 'chunks'))) {

                        fse.copySync(path.join(cwd, 'platforms', 'android', 'platform_www'), path.join('www', 'static', 'chunks'));

                    }

                    // When the application is initially generated without plugins installed, the file is not generated, which causes an error to be displayed in the console
                    if (!fse.existsSync(path.join(cwd, 'platforms', 'android', 'platform_www', 'cordova_plugins.js')) && fse.existsSync(path.join(cwd, 'www', 'static', 'chunks')) && !fse.existsSync(path.join(cwd, 'www', 'static', 'chunks', 'cordova_plugins.js'))) {

                        fse.ensureFile(path.join(cwd, 'www', 'static', 'chunks', 'cordova_plugins.js'));

                    }

                } else if (pkgs.indexOf('electron') !== -1) {

                    if (fse.existsSync(path.join(cwd, 'platforms', 'electron', 'platform_www')) && fse.existsSync(path.join(cwd, 'www', 'static', 'chunks'))) {

                        fse.copySync(path.join(cwd, 'platforms', 'electron', 'platform_www'), path.join('www', 'static', 'chunks'));

                    }

                    // When the application is initially generated without plugins installed, the file is not generated, which causes an error to be displayed in the console
                    if (!fse.existsSync(path.join(cwd, 'platforms', 'electron', 'platform_www', 'cordova_plugins.js')) && fse.existsSync(path.join(cwd, 'www', 'static', 'chunks')) && !fse.existsSync(path.join(cwd, 'www', 'static', 'chunks', 'cordova_plugins.js'))) {

                        fse.ensureFile(path.join(cwd, 'www', 'static', 'chunks', 'cordova_plugins.js'));

                    }

                    const browserWindow = ncConfig?.electron?.browserWindow || {};

                    if (fse.existsSync(path.join(cwd, 'platforms', 'electron', 'platform_www', 'cdv-electron-settings.json'))) {
                        
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
        
                        await fse.promises.writeFile(path.join(cwd, 'platforms', 'electron', 'platform_www', 'cdv-electron-settings.json'), JSON.stringify(newBrowserWindow, null, 4));
                
                    }

                    const childEletron = shell.exec('npx cordova run electron --nobuild', { async: true, silent: true });

                    let electronStartedLogged = false;

                    childEletron.stdout.on('data', async function (data) {

                        if (!electronStartedLogged) {

                            electronStartedLogged = true;

                            console.log(chalk.green('- Electron started'));
                            console.log(chalk.yellow('  ⮡ CSP warning OK: Next dev uses unsafe-eval for hot reload'));
    
                        }
                            
                        data = data.toString().trim();

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

                        console.log(chalk.yellow('Electron: '), data);

                    });
        
                }

            }

        });

    } else if (pkgs.indexOf('build') !== -1) {
        
        if (pkgs.indexOf('android') !== -1) {

            if (!fse.existsSync(path.join(cwd, 'platforms', 'android'))) {

                console.log(chalk.red('No platforms added to this project. Please use `nc platform add <platform>`'));

                return;
            }

            if (!fse.existsSync(path.join(cwd, 'config.xml'))) {

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

                const number = await rlInput(rl, text);

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

        if (!process.env.NODE_ENV) {

            process.env.NODE_ENV = 'production';
            
        }

        if (pkgs.indexOf('android') !== -1) {

            if (!fse.existsSync(path.join(cwd, 'platforms', 'android'))) {

                console.log(chalk.red('No platforms added to this project. Please use `nc platform add <platform>`.'));

                return;
            }

            if (!fse.existsSync(path.join(cwd, 'config.xml'))) {

                console.log(chalk.red('config.xml does not exist'));

                return;
            }

            await contentToLocal(cwd);

            shell.exec('npx next build');

            shell.exec('npx cordova run android');
        
        } else if (pkgs.indexOf('electron') !== -1) {
        
            if (!fse.existsSync(path.join(cwd, 'platforms', 'electron'))) {

                console.log(chalk.red('No platforms added to this project. Please use `nc platform add <platform>`.'));

                return;
            }

            await validateNextConfig(cwd, { requireStandalone: true, requireDistDir: true });

            if (packageCwd.build?.asar !== false) {
                console.log(chalk.red('package.json expected `build.asar` to be set to false'));
                return;
            }
            let extraFiles = packageCwd.build?.extraFiles ?? [];
            if (!Array.isArray(extraFiles)) {
                extraFiles = [extraFiles];
            }
            const hasStandaloneMapping = extraFiles.some(function (item) {
                if (!item) return false;
                const from = item?.from ?? '';
                const to = item?.to ?? '';
                const filter = item?.filter ?? null;
                if (from !== 'platforms/electron/www/standalone/node_modules') return false;
                if (to !== 'resources/app/standalone/node_modules') return false;
                if (Array.isArray(filter)) {
                    return filter.indexOf('**/*') !== -1;
                }
                if (typeof filter === 'string') {
                    return filter === '**/*';
                }
                return false;
            });
            if (!hasStandaloneMapping) {
                console.log(chalk.red('package.json expected build.extraFiles mapping from "platforms/electron/www/standalone/node_modules" to "resources/app/standalone/node_modules" with filter "**/*"'));
                return;
            }

            shell.exec('npx next build');

            if (!fse.existsSync(path.join(cwd, 'public'))) {

                console.log(chalk.red('Required Next build artifact is missing: /public'));

                return;
            }
 
            if (!fse.existsSync(path.join(cwd, 'www', 'static'))) {

                console.log(chalk.red('Required Next build artifact is missing: /www/static'));

                return;
            }
 
            fse.copySync(path.join(cwd, 'public'), path.join(cwd, 'www', 'standalone', 'public'));
            fse.copySync(path.join(cwd, 'www', 'static'), path.join(cwd, 'www', 'standalone', 'www', 'static'));
            
            // When the application is initially generated without plugins installed, the file is not generated, which causes an error to be displayed in the console
            if (!fse.existsSync(path.join(cwd, 'platforms', 'electron', 'platform_www', 'cordova_plugins.js'))) {
                await fse.ensureFile(path.join(cwd, 'platforms', 'electron', 'platform_www', 'cordova_plugins.js'));
            }

            if (fse.existsSync(path.join(cwd, 'platforms', 'electron', 'platform_www', 'cordova.js'))) {
                await fse.copy(path.join(cwd, 'platforms', 'electron', 'platform_www', 'cordova.js'), path.join(cwd, 'www', 'standalone', 'public', 'cordova.js'));
            }

            if (fse.existsSync(path.join(cwd, 'platforms', 'electron', 'platform_www', 'cordova_plugins.js'))) {
                await fse.copy(path.join(cwd, 'platforms', 'electron', 'platform_www', 'cordova_plugins.js'), path.join(cwd, 'www', 'standalone', 'public', 'cordova_plugins.js'));
            }

            const browserWindow = ncConfig?.electron?.browserWindow || {};
            if (Object.keys(browserWindow).length) {
                const settingsTemplatePath = path.join(path.dirname(__dirname), 'platform', 'electron', 'cdv-electron-settings.json');
                const projectSettingsPath = path.join(cwd, 'platforms', 'electron', 'platform_www', 'cdv-electron-settings.json');
                const templateSettings = await fse.readJSON(settingsTemplatePath);
                const projectSettings = fse.existsSync(projectSettingsPath) ? await fse.readJSON(projectSettingsPath) : {};
                const mergedSettings = {
                    ...templateSettings, ...projectSettings,
                    browserWindow: {
                        ...(templateSettings.browserWindow || {}),
                        ...(projectSettings.browserWindow || {}),
                        ...browserWindow
                    }
                };
                await fse.writeFile(projectSettingsPath, JSON.stringify(mergedSettings, null, 4));
            }

            const depsElectron = packageRoot?.platformDependencies?.electron || {};
            if (Object.keys(depsElectron).length) {
                const packageElectron = path.join(cwd, 'platforms', 'electron', 'www', 'package.json');
                const electronPkg = JSON.parse(await fse.promises.readFile(packageElectron, 'utf8'));
                electronPkg.dependencies = electronPkg.dependencies || {};
                let needInstall = false;
                for (const [name, version] of Object.entries(depsElectron)) {
                    if (!electronPkg.dependencies[name]) {
                        electronPkg.dependencies[name] = version;
                        needInstall = true;
                    }
                }
                 if (needInstall) {
                    await fse.promises.writeFile(packageElectron, JSON.stringify(electronPkg, null, 2));
                }
            }

            // copy cert
            if (fse.existsSync(path.join(path.dirname(__dirname), 'resources', 'server.crt'))) {
                await fse.copy(path.join(path.dirname(__dirname), 'resources', 'server.crt'), path.join(cwd, 'www', 'resources', 'server.crt'));
            }
            if (fse.existsSync(path.join(path.dirname(__dirname), 'resources', 'server.key'))) {
                await fse.copy(path.join(path.dirname(__dirname), 'resources', 'server.key'), path.join(cwd, 'www', 'resources', 'server.key'));
            }

            // copy custom loading page
            const pageLoading = ncConfig?.electron?.pageLoading ?? {};
            const appEnabled = pageLoading?.app?.enabled ?? false;
            const appPath = pageLoading?.app?.path ?? '';
            if (typeof appPath !== 'string') {
                console.log(chalk.red('pageLoading.app.path must be a string when enabled.'));
                return;
            }
            if (appEnabled === true) {
                const appSource = path.join(cwd, appPath);
                if (!fse.existsSync(appSource)) {
                    console.log(chalk.red('Custom app loading page not found: ', appSource));
                    return;
                }
                if (path.extname(appSource).toLowerCase() !== '.html') {
                    console.log(chalk.red('Custom app loading page must be an HTML file: ', appSource));
                    return;
                }
                await fse.copy(appSource, path.join(cwd, 'www', 'resources', 'run-loading.html'));
            } else {
                await fse.copy(path.join(path.dirname(__dirname), 'resources', 'run-loading.html'), path.join(cwd, 'www', 'resources', 'run-loading.html'));
            }

            await fse.copy(path.join(cwd, 'nc.config.json'), path.join(cwd, 'www', 'resources', 'nc.config.json'));

            shell.exec('npx cordova build electron --debug');

        } else {

            console.log(chalk.red('The platform is not supported'));

            process.exit(1);
        }

    } else if (pkgs.indexOf('release') !== -1) {

        if (!process.env.NODE_ENV) {

            process.env.NODE_ENV = 'production';
            
        }

        if (pkgs.indexOf('android') !== -1) {

        } else if (pkgs.indexOf('electron') !== -1) {
        
            if (!fse.existsSync(path.join(cwd, 'platforms', 'electron'))) {

                console.log(chalk.red('No platforms added to this project. Please use `nc platform add <platform>`.'));

                return;
            }

            await validateNextConfig(cwd, { requireStandalone: true, requireDistDir: true });

            if (packageCwd.build?.asar !== false) {
                console.log(chalk.red('package.json expected `build.asar` to be set to false'));
                return;
            }
            let extraFiles = packageCwd.build?.extraFiles ?? [];
            if (!Array.isArray(extraFiles)) {
                extraFiles = [extraFiles];
            }
            const hasStandaloneMapping = extraFiles.some(function (item) {
                if (!item) return false;
                const from = item?.from ?? '';
                const to = item?.to ?? '';
                const filter = item?.filter ?? null;
                if (from !== 'platforms/electron/www/standalone/node_modules') return false;
                if (to !== 'resources/app/standalone/node_modules') return false;
                if (Array.isArray(filter)) {
                    return filter.indexOf('**/*') !== -1;
                }
                if (typeof filter === 'string') {
                    return filter === '**/*';
                }
                return false;
            });
            if (!hasStandaloneMapping) {
                console.log(chalk.red('package.json expected build.extraFiles mapping from "platforms/electron/www/standalone/node_modules" to "resources/app/standalone/node_modules" with filter "**/*"'));
                return;
            }

            shell.exec('npx next build');

            if (!fse.existsSync(path.join(cwd, 'public'))) {

                console.log(chalk.red('Required Next build artifact is missing: /public'));

                return;
            }
 
            if (!fse.existsSync(path.join(cwd, 'www', 'static'))) {

                console.log(chalk.red('Required Next build artifact is missing: /www/static'));

                return;
            }
 
            fse.copySync(path.join(cwd, 'public'), path.join(cwd, 'www', 'standalone', 'public'));
            fse.copySync(path.join(cwd, 'www', 'static'), path.join(cwd, 'www', 'standalone', 'www', 'static'));
            
            // When the application is initially generated without plugins installed, the file is not generated, which causes an error to be displayed in the console
            if (!fse.existsSync(path.join(cwd, 'platforms', 'electron', 'platform_www', 'cordova_plugins.js'))) {
                await fse.ensureFile(path.join(cwd, 'platforms', 'electron', 'platform_www', 'cordova_plugins.js'));
            }

            if (fse.existsSync(path.join(cwd, 'platforms', 'electron', 'platform_www', 'cordova.js'))) {
                await fse.copy(path.join(cwd, 'platforms', 'electron', 'platform_www', 'cordova.js'), path.join(cwd, 'www', 'standalone', 'public', 'cordova.js'));
            }

            if (fse.existsSync(path.join(cwd, 'platforms', 'electron', 'platform_www', 'cordova_plugins.js'))) {
                await fse.copy(path.join(cwd, 'platforms', 'electron', 'platform_www', 'cordova_plugins.js'), path.join(cwd, 'www', 'standalone', 'public', 'cordova_plugins.js'));
            }

            const browserWindow = ncConfig?.electron?.browserWindow || {};
            if (Object.keys(browserWindow).length) {
                const settingsTemplatePath = path.join(path.dirname(__dirname), 'platform', 'electron', 'cdv-electron-settings.json');
                const projectSettingsPath = path.join(cwd, 'platforms', 'electron', 'platform_www', 'cdv-electron-settings.json');
                const templateSettings = await fse.readJSON(settingsTemplatePath);
                const projectSettings = fse.existsSync(projectSettingsPath) ? await fse.readJSON(projectSettingsPath) : {};
                const mergedSettings = {
                    ...templateSettings, ...projectSettings,
                    browserWindow: {
                        ...(templateSettings.browserWindow || {}),
                        ...(projectSettings.browserWindow || {}),
                        ...browserWindow
                    }
                };
                await fse.writeFile(projectSettingsPath, JSON.stringify(mergedSettings, null, 4));
            }

            const depsElectron = packageRoot?.platformDependencies?.electron || {};
            if (Object.keys(depsElectron).length) {
                const packageElectron = path.join(cwd, 'platforms', 'electron', 'www', 'package.json');
                const electronPkg = JSON.parse(await fse.promises.readFile(packageElectron, 'utf8'));
                electronPkg.dependencies = electronPkg.dependencies || {};
                let needInstall = false;
                for (const [name, version] of Object.entries(depsElectron)) {
                    if (!electronPkg.dependencies[name]) {
                        electronPkg.dependencies[name] = version;
                        needInstall = true;
                    }
                }
                 if (needInstall) {
                    await fse.promises.writeFile(packageElectron, JSON.stringify(electronPkg, null, 2));
                }
            }

            // copy cert
            if (fse.existsSync(path.join(path.dirname(__dirname), 'resources', 'server.crt'))) {
                await fse.copy(path.join(path.dirname(__dirname), 'resources', 'server.crt'), path.join(cwd, 'www', 'resources', 'server.crt'));
            }
            if (fse.existsSync(path.join(path.dirname(__dirname), 'resources', 'server.key'))) {
                await fse.copy(path.join(path.dirname(__dirname), 'resources', 'server.key'), path.join(cwd, 'www', 'resources', 'server.key'));
            }

            const pageLoading = ncConfig?.electron?.pageLoading ?? {};
            const appEnabled = pageLoading?.app?.enabled ?? false;
            const appPath = pageLoading?.app?.path ?? '';
            if (typeof appPath !== 'string') {
                console.log(chalk.red('pageLoading.app.path must be a string when enabled.'));
                return;
            }
            if (appEnabled === true) {
                const appSource = path.join(cwd, appPath);
                if (!fse.existsSync(appSource)) {
                    console.log(chalk.red('Custom app loading page not found: ', appSource));
                    return;
                }
                if (path.extname(appSource).toLowerCase() !== '.html') {
                    console.log(chalk.red('Custom app loading page must be an HTML file: ', appSource));
                    return;
                }
                await fse.copy(appSource, path.join(cwd, 'www', 'resources', 'run-loading.html'));
            } else {
                await fse.copy(path.join(path.dirname(__dirname), 'resources', 'run-loading.html'), path.join(cwd, 'www', 'resources', 'run-loading.html'));
            }

            await fse.copy(path.join(cwd, 'nc.config.json'), path.join(cwd, 'www', 'resources', 'nc.config.json'));

            shell.exec('npx cordova build electron --release');

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

                if (fse.existsSync(path.join(cwd, 'platforms', 'android', 'app', 'build.gradle'))) {

                    const getFileBuildGradle = await fse.promises.readFile(path.join(cwd, 'platforms', 'android', 'app', 'build.gradle'));

                    let dataBuildGradle = getFileBuildGradle.toString();

                    if (dataBuildGradle.indexOf('aaptOptions') === -1) {

                        dataBuildGradle = dataBuildGradle.replace(/^(.+)namespace\s+cordovaConfig\.PACKAGE_NAMESPACE/gmi, '$1namespace cordovaConfig.PACKAGE_NAMESPACE' + EOL + EOL + '$1aaptOptions {' + EOL + '$1$1ignoreAssetsPattern \'!.svn:!.git:!.ds_store:!*.scc:.*:build\' ' + EOL + '$1}');

                        await fse.promises.writeFile(path.join(cwd, 'platforms', 'android', 'app', 'build.gradle'), dataBuildGradle);

                    }

                }

            }

        } else if (pkgs.indexOf('electron') !== -1) {

            shell.exec('npx cordova platform ' + action + ' electron');

            if (action === 'add') {

                fse.copySync(path.join(path.dirname(__dirname), 'platform', 'electron', 'cdv-electron-main.js'), path.join(cwd, 'platforms', 'electron', 'platform_www', 'cdv-electron-main.js'));
                
                console.log(chalk.green('cdv-electron-main.js has been copied to ', path.join(cwd, 'platforms', 'electron', 'platform_www')));

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