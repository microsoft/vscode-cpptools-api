/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT license.
 * ------------------------------------------------------------------------------------------ */
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("./api");
const vscode = require("vscode");
/**
 * Tag Parser or IntelliSense status codes.
 */
var Status;
(function (Status) {
    Status[Status["TagParsingBegun"] = 1] = "TagParsingBegun";
    Status[Status["TagParsingDone"] = 2] = "TagParsingDone";
    Status[Status["IntelliSenseCompiling"] = 3] = "IntelliSenseCompiling";
    Status[Status["IntelliSenseReady"] = 4] = "IntelliSenseReady";
})(Status = exports.Status || (exports.Status = {}));
function isCppToolsTestExtension(extension) {
    return extension.getTestApi !== undefined;
}
function getCppToolsTestApi(version) {
    return __awaiter(this, void 0, void 0, function* () {
        let cpptools = vscode.extensions.getExtension("ms-vscode.cpptools");
        let extension;
        let api;
        if (cpptools) {
            if (!cpptools.isActive) {
                extension = yield cpptools.activate();
            }
            else {
                extension = cpptools.exports;
            }
            if (isCppToolsTestExtension(extension)) {
                // ms-vscode.cpptools > 0.17.5
                try {
                    api = extension.getTestApi(version);
                }
                catch (err) {
                    // Unfortunately, ms-vscode.cpptools [0.17.6, 0.18.1] throws a RangeError if you specify a version greater than v1.
                    // These versions of the extension will not be able to act on the newer interface and v2 is a superset of v1, so we can safely fall back to v1.
                    let e = err;
                    if (e.message && e.message.startsWith("Invalid version")) {
                        api = extension.getTestApi(api_1.Version.v1);
                    }
                }
                if (version !== api_1.Version.v1) {
                    if (!api.getVersion) {
                        console.warn(`vscode-cpptools-api version ${version} requested, but is not available in the current version of the cpptools extension. Using version 1 instead.`);
                    }
                    else if (version !== api.getVersion()) {
                        console.warn(`vscode-cpptools-api version ${version} requested, but is not available in the current version of the cpptools extension. Using version ${api.getVersion()} instead.`);
                    }
                }
            }
            else {
                // ms-vscode.cpptools version 0.17.5
                api = extension;
                if (version !== api_1.Version.v0) {
                    console.warn(`vscode-cpptools-api version ${version} requested, but is not available in version 0.17.5 of the cpptools extension. Using version 0 instead.`);
                }
            }
        }
        else {
            console.warn("C/C++ extension is not installed");
        }
        return api;
    });
}
exports.getCppToolsTestApi = getCppToolsTestApi;
