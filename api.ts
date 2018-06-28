/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT license.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import * as vscode from 'vscode';
import { CancellationToken } from 'vscode-jsonrpc';

/**
 * API version information.
 */
export enum Version {
    v0 = 0, // 0.x.x
    v1 = 1, // 1.x.x
    latest = v1
}

/**
 * The interface provided by the C/C++ extension during activation.
 * @example
```
    let extension: CppToolsExtension;
    let cpptools: vscode.Extension<CppToolsExtension> =
        vscode.extensions.getExtension("ms-vscode.cpptools");

    if (!cpptools.isActive) { 
        extension = await cpptools.activate();
    } else {
        extension = cpptools.exports;
    }
    let api: CppToolsApi = extension.getApi(Version.v1);
```
 */
export interface CppToolsExtension {
    /**
     * Get an API object.
     * @param version The desired version.
     */
    getApi(version: Version): CppToolsApi;
}

/**
 * An interface to allow VS Code extensions to communicate with the C/C++ extension.
 * @see [CppToolsExtension](#CppToolsExtension) for a code example.
 */
export interface CppToolsApi extends vscode.Disposable {
    /**
     * Register a [CustomConfigurationProvider](#CustomConfigurationProvider).
     * This must be called as soon as the provider extension is ready. This is necessary for cpptools
     * to request configurations from the provider.
     * @param provider An instance of the [CustomConfigurationProvider](#CustomConfigurationProvider)
     * instance representing the provider extension.
     */
    registerCustomConfigurationProvider(provider: CustomConfigurationProvider): void;

    /**
     * Notifies cpptools that the current configuration has changed. Upon receiving this notification,
     * cpptools will request the new configurations.
     * @param provider An instance of the [CustomConfigurationProvider](#CustomConfigurationProvider)
     * instance representing the provider extension.
     */
    didChangeCustomConfiguration(provider: CustomConfigurationProvider): void;
}

/**
 * An interface to allow this extension to communicate with Custom Configuration Provider extensions.
 */
export interface CustomConfigurationProvider extends vscode.Disposable {
    /**
     * The friendly name of the Custom Configuration Provider extension.
     */
    name: string;

    /**
     * The id of the extension providing custom configurations. (e.g. `ms-vscode.cpptools`)
     */
    extensionId: string;

    /**
     * A request to determine whether this provider can provide IntelliSense configurations for the given document.
     * @param uri The URI of the document.
     * @param token (optional) The cancellation token.
     * @returns 'true' if this provider can provide IntelliSense configurations for the given document.
     */
    canProvideConfiguration(uri: vscode.Uri, token?: CancellationToken): Thenable<boolean>;

    /**
     * A request to get Intellisense configurations for the given files.
     * @param uris A list of one of more URIs for the files to provide configurations for.
     * @param token (optional) The cancellation token.
     * @returns A list of [SourceFileConfigurationItem](#SourceFileConfigurationItem) for the documents that this provider
     * is able to provide IntelliSense configurations for.
     * Note: If this provider cannot provide configurations for a file in `uris`, then the file will not be included
     * in the return value. An empty list will be returned if the provider cannot provide configurations for any of the files.
     */
    provideConfigurations(uris: vscode.Uri[], token?: CancellationToken): Thenable<SourceFileConfigurationItem[]>;
}

/**
 * The model representing the custom IntelliSense configurations for a source file.
 */
export interface SourceFileConfiguration {
    /**
     * This must also include the system include path (compiler defaults) unless
     * [compilerPath](#SourceFileConfiguration.compilerPath) is specified.
     */
    includePath: string[];

    /**
     * This must also include the compiler default defines (__cplusplus, etc) unless
     * [compilerPath](#SourceFileConfiguration.compilerPath) is specified.
     */
    defines: string[];

    /**
     * Currently, "msvc-x64" or "clang-x64".
     */
    intelliSenseMode: string;
    
    /**
     * The C or C++ standard. See `package.json` for valid values.
     */
    standard: string;

    /**
     * Any files that need to be included before the source file is parsed.
     */
    forcedInclude?: string[];

    /**
     * The full path to the compiler. If specified, the extension will query it for default includes and defines and
     * add them to [includePath](#SourceFileConfiguration.includePath) and [defines](#SourceFileConfiguration.defines).
     */
    compilerPath?: string;
}

/**
 * A model representing a source file and its corresponding configuration.
 */
export interface SourceFileConfigurationItem {
    /**
     * The URI of the source file.
     */
    uri: string;

    /**
     * The IntelliSense configuration for [uri](#SourceFileConfigurationItem.uri)
     */
    configuration: SourceFileConfiguration;
}

function isCppToolsExtension(extension: CppToolsApi | CppToolsExtension): extension is CppToolsExtension {
    return (<CppToolsExtension>extension).getApi !== undefined;
}

export async function getCppToolsApi(version: Version): Promise<CppToolsApi | undefined> {
    let cpptools: vscode.Extension<any> | undefined = vscode.extensions.getExtension("ms-vscode.cpptools");
    let extension: CppToolsApi | CppToolsExtension;
    let api: CppToolsApi | undefined;

    if (cpptools) {
        if (!cpptools.isActive) { 
            extension = await cpptools.activate();
        } else {
            extension = cpptools.exports;
        }
     
        if (isCppToolsExtension(extension)) {
            // ms-vscode.cpptools > 0.17.5
            api = extension.getApi(version);
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
