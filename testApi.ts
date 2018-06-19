/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All Rights Reserved.
 * See 'LICENSE' in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import { CppToolsApi } from './api';
import * as vscode from 'vscode';

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