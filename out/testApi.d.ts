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
    readonly StatusChanged: vscode.Event<Status>;
}
/**
 * Status codes.
 */
export declare enum Status {
    TagParsingBegun = 1,
    TagParsingDone = 2,
    IntelliSenseCompiling = 3,
    IntelliSenseReady = 4,
}
export declare function getCppToolsTestApi(version: Version): Promise<CppToolsTestApi | undefined>;
