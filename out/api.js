/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT license.
 * ------------------------------------------------------------------------------------------ */
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCppToolsApi = exports.Version = void 0;
const vscode = require("vscode");
/**
 * API version information.
 */
var Version;
(function (Version) {
    Version[Version["v0"] = 0] = "v0";
    Version[Version["v1"] = 1] = "v1";
    Version[Version["v2"] = 2] = "v2";
    Version[Version["v3"] = 3] = "v3";
    Version[Version["v4"] = 4] = "v4";
    Version[Version["v5"] = 5] = "v5";
    Version[Version["v6"] = 6] = "v6";
    Version[Version["latest"] = 6] = "latest";
})(Version = exports.Version || (exports.Version = {}));
/**
 * Check if an object satisfies the contract of the CppToolsExtension interface.
 */
function isCppToolsExtension(extension) {
    return extension && extension.getApi;
}
/**
 * Check if an object satisfies the contract of the first version of the CppToolsApi.
 * (The first release of the API only had two functions)
 */
function isLegacyCppToolsApi(api) {
    return api && api.registerCustomConfigurationProvider && api.didChangeCustomConfiguration;
}
/**
 * Helper function to get the CppToolsApi from the cpptools extension.
 * @param version The desired API version
 * @example
```
    import {CppToolsApi, Version, CustomConfigurationProvider, getCppToolsApi} from 'vscode-cpptools';

    let api: CppToolsApi|undefined = await getCppToolsApi(Version.v1);
    if (api) {
        // Inform cpptools that a custom config provider
        // will be able to service the current workspace.
        api.registerCustomConfigurationProvider(provider);

        // Do any required setup that the provider needs.

        // Notify cpptools that the provider is ready to
        // provide IntelliSense configurations.
        api.notifyReady(provider);
    }
    // Dispose of the 'api' in your extension's
    // deactivate() method, or whenever you want to
    // unregister the provider.
```
 */
function getCppToolsApi(version) {
    return __awaiter(this, void 0, void 0, function* () {
        let cpptools = vscode.extensions.getExtension("ms-vscode.cpptools");
        let extension = undefined;
        let api = undefined;
        if (cpptools) {
            if (!cpptools.isActive) {
                try {
                    // activate may throw if VS Code is shutting down.
                    extension = yield cpptools.activate();
                }
                catch (_a) {
                }
            }
            else {
                extension = cpptools.exports;
            }
            if (isCppToolsExtension(extension)) {
                // ms-vscode.cpptools > 0.17.5
                try {
                    api = extension.getApi(version);
                }
                catch (err) {
                    // Unfortunately, ms-vscode.cpptools [0.17.6, 0.18.1] throws a RangeError if you specify a version greater than v1.
                    // These versions of the extension will not be able to act on the newer interface and v2 is a superset of v1, so we can safely fall back to v1.
                    let e = err;
                    if (e && e.message && e.message.startsWith("Invalid version")) {
                        api = extension.getApi(Version.v1);
                    }
                }
                if (version !== Version.v1) {
                    if (!api.getVersion) {
                        console.warn(`[vscode-cpptools-api] version ${version} requested, but is not available in the current version of the cpptools extension. Using version 1 instead.`);
                    }
                    else if (version !== api.getVersion()) {
                        console.warn(`[vscode-cpptools-api] version ${version} requested, but is not available in the current version of the cpptools extension. Using version ${api.getVersion()} instead.`);
                    }
                }
            }
            else if (isLegacyCppToolsApi(extension)) {
                // ms-vscode.cpptools version 0.17.5
                api = extension;
                if (version !== Version.v0) {
                    console.warn(`[vscode-cpptools-api] version ${version} requested, but is not available in version 0.17.5 of the cpptools extension. Using version 0 instead.`);
                }
            }
            else {
                console.warn('[vscode-cpptools-api] No cpptools API was found.');
            }
        }
        else {
            console.warn('[vscode-cpptools-api] C/C++ extension is not installed');
        }
        return api;
    });
}
exports.getCppToolsApi = getCppToolsApi;
