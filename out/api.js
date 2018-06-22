/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All Rights Reserved.
 * See 'LICENSE' in the project root for license information.
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
const vscode = require("vscode");
/**
 * API version information.
 */
var Version;
(function (Version) {
    Version[Version["v0"] = 0] = "v0";
    Version[Version["v1"] = 1] = "v1";
    Version[Version["latest"] = 1] = "latest";
})(Version = exports.Version || (exports.Version = {}));
function isCppToolsExtension(extension) {
    return extension.getApi !== undefined;
}
function getCppToolsApi(version) {
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
            if (isCppToolsExtension(extension)) {
                // ms-vscode.cpptools > 0.17.5
                api = extension.getApi(version);
            }
            else {
                // ms-vscode.cpptools version 0.17.5
                api = extension;
            }
        }
        else {
            console.warn("C/C++ extension is not installed");
        }
        return api;
    });
}
exports.getCppToolsApi = getCppToolsApi;
