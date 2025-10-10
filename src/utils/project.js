const path = require('path');
const fse = require('fs-extra');
const shell = require('shelljs');
const chalk = require('chalk');

async function contentToRemote(cwd, contentSrc) {
    
    const getFileConfig = await fse.promises.readFile(path.join(cwd, 'config.xml'));

    let dataConfig = getFileConfig.toString();

    dataConfig = dataConfig.replace(/<content[\S\s]*?src="[^"]+"/gmi, '<content src="' + contentSrc + '"');

    await fse.promises.writeFile(path.join(cwd, 'config.xml'), dataConfig);

}

async function contentToLocal(cwd) {

    const getFileConfig = await fse.promises.readFile(path.join(cwd, 'config.xml'));

    let dataConfig = getFileConfig.toString();

    dataConfig = dataConfig.replace(/<content[\S\s]*?src="[^"]+"/gmi, '<content src="https://localhost"');

    await fse.promises.writeFile(path.join(cwd, 'config.xml'), dataConfig);

}

function rlInput(rl, prompt) {
    return new Promise(function (callbackFn, errorFn) {
        rl.question(prompt, function (uinput) {
            callbackFn(uinput);
        }, function () {
            errorFn();
        });
    });
}

function checkGlobalCordova(requiredVersion) {
    if (!requiredVersion) {
        console.log(chalk.red('Cordova version is not specified!'));
        process.exit(1);
    }
    const result = shell.exec('cordova --version', { silent: true });
    const installVersion = requiredVersion.split(' ')[0];
    // Cordova is not installed
    if (result.code !== 0) {
        console.log(chalk.green('Installing cordova...'));
        const installResult = shell.exec('npm install -g cordova@' + installVersion, { silent: false });
        if (installResult.code !== 0) {
            console.log(chalk.red('Cordova installation failed. Please install manually: npm install -g cordova@' + installVersion));
            process.exit(1);
        }
    // If cordova is installed
    } else {
        const version = result.stdout.trim();
        if (version.split(' ')[0] !== requiredVersion.split(' ')[0]) {
            console.log(chalk.yellow(`Detected global Cordova version: ${version}\nRequired version: ${requiredVersion}\nPlease update Cordova: npm install -g cordova@${installVersion}`));
            process.exit(1);
        }
    }
}

async function validateNextConfig(cwd, { requireStandalone = false, requireDistDir = false } = {}) {
    const configPath = path.join(cwd, 'next.config.js');

    if (!fse.existsSync(configPath)) {
        console.log(chalk.red('next.config.js is missing from the project root'));
        process.exit(1);
    }

    // ensure we read the current contents if the file changes between runs
    delete require.cache[require.resolve(configPath)];

    let rawConfig;
    try {
        const exportedConfig = require(configPath);
        rawConfig = typeof exportedConfig === 'function' ? exportedConfig({}, { defaultConfig: {} }): exportedConfig;
    } catch (err) {
        console.log(chalk.red('Unable to load next.config.js: ' + err.message));
        process.exit(1);
    }

    const nextConfig = await Promise.resolve(rawConfig);

    if (requireStandalone && nextConfig.output !== 'standalone') {
        console.log(chalk.red('next.config.js expected `output: "standalone"`'));
        process.exit(1);
    }

    if (requireDistDir && nextConfig.distDir !== 'www') {
        console.log(chalk.red('next.config.js expected `distDir: "www"`'));
        process.exit(1);
    }

    return nextConfig;
}

module.exports = {
    contentToRemote,
    contentToLocal,
    rlInput,
    checkGlobalCordova,
    validateNextConfig
};
