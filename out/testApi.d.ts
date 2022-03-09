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
export declare enum Status {
    TagParsingBegun = 1,
    TagParsingDone = 2,
    IntelliSenseCompiling = 3,
    IntelliSenseReady = 4
}
/**
 * Information about the status of Tag Parser or IntelliSense for an active document.
 */
export interface IntelliSenseStatus {
    status: Status;
    filename?: string;
}
export declare function getCppToolsTestApi(version: Version): Promise<CppToolsTestApi | undefined>;
