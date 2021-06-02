import ui from 'sketch/ui';
import dom from 'sketch/dom';
import settings from 'sketch/settings';
import BrowserWindow from 'sketch-module-web-view';
import { getWebview } from 'sketch-module-web-view/remote';
import {
    ACCESS_TOKEN_KEY,
    PROJECT_ID,
    ORGANIZATION
} from './constants';
import {
    getProjects,
    getLanguages,
    getStrings
} from './util/client';
import { sendStrings } from './action/send-strings';
import { useString } from './action/source-strings';
import { translate } from './action/translate';
import { uploadScreenshots } from './action/upload-screenshots';
const identifier = 'crowdin';
export default function start() {
    //set to true for local development
    const devTools = false;
    const options = {
        identifier,
        width: 380,
        height: 600,
        hidesOnDeactivate: false,
        remembersWindowFrame: true,
        alwaysOnTop: true,
        title: 'Crowdin',
        backgroundColor: '#FFFFFF',
        resizable: false,
        webPreferences: { devTools }
    };
    const browserWindow = new BrowserWindow(options);
    browserWindow.loadURL(require('../ui/plugin.html'));
    browserWindow.webContents.on('contactUs', contactUs);
    browserWindow.webContents.on('getCredentials', getCredentials);
    browserWindow.webContents.on('saveCredentials', saveCredentials);
    browserWindow.webContents.on('saveProject', saveProject);
    browserWindow.webContents.on('getProjects', getProjects);
    browserWindow.webContents.on('getLanguages', getLanguages);
    browserWindow.webContents.on('getStrings', getStrings);
    browserWindow.webContents.on('sendStrings', sendStrings);
    browserWindow.webContents.on('useString', useString);
    browserWindow.webContents.on('translate', translate);
    browserWindow.webContents.on('uploadScreenshots', uploadScreenshots);
}
;
function contactUs() {
    NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString('https://crowdin.com/contacts'));
}
function getCredentials() {
    let token = settings.settingForKey(ACCESS_TOKEN_KEY);
    if (!!token && token.length > 3) {
        token = token.substring(0, 3) + '...';
    }
    const organization = settings.settingForKey(ORGANIZATION);
    return {
        token,
        organization
    };
}
function saveCredentials(creds) {
    const token = settings.settingForKey(ACCESS_TOKEN_KEY);
    let initValue = undefined;
    if (!!token && token.length > 3) {
        initValue = token.substring(0, 3) + '...';
    }
    if (creds.token !== initValue) {
        settings.setSettingForKey(ACCESS_TOKEN_KEY, creds.token);
    }
    settings.setSettingForKey(ORGANIZATION, creds.organization);
    ui.message('Credentials saved');
}
function saveProject(projectId) {
    if (!dom.getSelectedDocument()) {
        ui.message('Please select a document');
        return;
    }
    settings.setDocumentSettingForKey(dom.getSelectedDocument(), PROJECT_ID, projectId);
    ui.message('Project saved');
}
export function onShutdown() {
    const existingWebview = getWebview(identifier);
    if (existingWebview) {
        existingWebview.close();
    }
}