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

module.exports = {
    contentToRemote,
    contentToLocal,
    rlInput,
    checkGlobalCordova
};
