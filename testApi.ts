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
     * Fires when the Tag Parser or IntelliSense engine's status changes.
     */
    StatusChanged: vscode.Event<Status>;
}

/**
 * Status codes.
 */
export enum Status {
    TagParsingBegun = 1,
    TagParsingDone = 2,
    IntelliSenseCompiling = 3,
    IntelliSenseReady = 4
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
            api = extension.getTestApi(version);
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
