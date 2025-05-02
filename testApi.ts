/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT license.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import { CppToolsApi, CppToolsExtension, Version } from './api';
import * as vscode from 'vscode';

/**
 * The interface provided by the C/C++ extension during activation. [CppToolsExtension](#CppToolsExtension)
 * is also castable to [CppToolsTestExtension](#CppToolsTestExtension)
 */
export interface CppToolsTestExtension extends CppToolsExtension {
    /**
     * Get an API object.
     * @param version The desired version.
     */
    getTestApi(version: Version): CppToolsTestApi;
}

/**
 * An interface to grant CustomConfigurationProvider extensions access to a test hook that
 * lets tests synchronize with the C/C++ extension.
 */
export interface CppToolsTestApi extends CppToolsApi {
    /**
     * Get the test hook that will allow the test to register for notifications from the C/C++
     * extension.
     */
    getTestHook(): CppToolsTestHook;
}

/**
 * An interface to allow tests to synchronize with the C/C++ extension
 */
export interface CppToolsTestHook extends vscode.Disposable {
    /**
     * [Deprecated] Fires when the Tag Parser or IntelliSense engine's status changes.
     */
    readonly StatusChanged: vscode.Event<Status>;

    /**
     * Fires when the status of the Tag Parser or IntelliSense engine changes for an active document.
     */
    readonly IntelliSenseStatusChanged: vscode.Event<IntelliSenseStatus>;
}

/**
 * Tag Parser or IntelliSense status codes.
 */
export enum Status {
    TagParsingBegun = 1,
    TagParsingDone = 2,
    IntelliSenseCompiling = 3,
    IntelliSenseReady = 4,
    Idle = 5
}

/**
 * Information about the status of Tag Parser or IntelliSense for an active document.
 */
export interface IntelliSenseStatus {
    status: Status;
    filename?: string;
}

function isCppToolsTestExtension(extension: CppToolsTestApi | CppToolsTestExtension): extension is CppToolsTestExtension {
    return (<CppToolsTestExtension>extension).getTestApi !== undefined;
}

export async function getCppToolsTestApi(version: Version): Promise<CppToolsTestApi | undefined> {
    let cpptools: vscode.Extension<any> | undefined = vscode.extensions.getExtension("ms-vscode.cpptools");
    let extension: CppToolsTestApi | CppToolsTestExtension;
    let api: CppToolsTestApi | undefined;

    if (cpptools) {
        if (!cpptools.isActive) { 
            extension = await cpptools.activate();
        } else {
            extension = cpptools.exports;
        }
     
        if (isCppToolsTestExtension(extension)) {
            // ms-vscode.cpptools > 0.17.5
            try {
                api = extension.getTestApi(version);
            } catch (err) {
                // Unfortunately, ms-vscode.cpptools [0.17.6, 0.18.1] throws a RangeError if you specify a version greater than v1.
                // These versions of the extension will not be able to act on the newer interface and v2 is a superset of v1, so we can safely fall back to v1.
                let e: RangeError = <RangeError>err;
                if (e.message && e.message.startsWith("Invalid version")) {
                    api = extension.getTestApi(Version.v1);
                }
            }

            if (version !== Version.v1) {
                if (!api.getVersion) {
                    console.warn(`vscode-cpptools-api version ${version} requested, but is not available in the current version of the cpptools extension. Using version 1 instead.`);
                } else if (version !== api.getVersion()) {
                    console.warn(`vscode-cpptools-api version ${version} requested, but is not available in the current version of the cpptools extension. Using version ${api.getVersion()} instead.`);
                }
            }
        } else {
            // ms-vscode.cpptools version 0.17.5
            api = extension;
            if (version !== Version.v0) {
                console.warn(`vscode-cpptools-api version ${version} requested, but is not available in version 0.17.5 of the cpptools extension. Using version 0 instead.`);
            }
        }
    } else {
        console.warn("C/C++ extension is not installed");
    }
    return api;
}
