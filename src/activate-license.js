const core = require('@actions/core');
const exec = require('@actions/exec');
const path = require('path');
const unity = require('./unity');

async function run() {
    try {
        const unityPath = core.getInput('unity-path') || process.env.UNITY_PATH;
        if (!unityPath) {
            throw new Error('unity path not found');
        }
        const unityUsername = core.getInput('unity-username') || process.env.UNITY_USERNAME;
        const unityPassword = core.getInput('unity-password') || process.env.UNITY_PASSWORD;
        const unityAuthenticatorKey = core.getInput('unity-authenticator-key') || process.env.UNITY_AUTHENTICATOR_KEY;
        const unitySerial = core.getInput('unity-serial') || process.env.UNITY_SERIAL;

        if (unitySerial) {
            await unity.activateSerialLicense(unityPath, unityUsername, unityPassword, unitySerial);
        } else {
            await exec.exec('npm install puppeteer@"^13.x"', [], { cwd: path.join(__dirname, '..') }); // install puppeteer for current platform
            const licenseRobot = require('./license-robot');
            const licenseRequestFile = await unity.createManualActivationFile(unityPath);
            const licenseData = await licenseRobot.getPersonalLicense(licenseRequestFile, unityUsername, unityPassword, unityAuthenticatorKey);
            await unity.activateManualLicense(unityPath, licenseData);
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();

