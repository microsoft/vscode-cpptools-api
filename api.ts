/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT license.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import * as vscode from 'vscode';

/**
 * API version information.
 */
export enum Version {
    v0 = 0, // 0.x.x
    v1 = 1, // 1.x.x
    v2 = 2, // 2.x.x
    v3 = 3, // 3.x.x
    v4 = 4, // 4.x.x
    v5 = 5, // 5.x.x
    v6 = 6, // 6.x.x
    latest = v6
}

/**
 * An interface to allow VS Code extensions to communicate with the C/C++ extension.
 * @see [CppToolsExtension](#CppToolsExtension) for a code example.
 */
export interface CppToolsApi extends vscode.Disposable {
    /**
     * The version of the API being used.
     */
    getVersion(): Version;

    /**
     * Register a [CustomConfigurationProvider](#CustomConfigurationProvider).
     * This should be called as soon as the provider extension has been activated and determines that
     * it is capable of providing configurations for the workspace. The provider extension does not
     * need to be ready to provide configurations when this is called. The C/C++ extension will not
     * request configurations until the extension has signaled that it is ready to provide them.
     * @see [](#)
     * @param provider An instance of the [CustomConfigurationProvider](#CustomConfigurationProvider)
     * instance representing the provider extension.
     */
    registerCustomConfigurationProvider(provider: CustomConfigurationProvider): void;

    /**
     * Notify the C/C++ extension that the [CustomConfigurationProvider](#CustomConfigurationProvider)
     * is ready to provide custom configurations.
     * @param provider An instance of the [CustomConfigurationProvider](#CustomConfigurationProvider)
     * instance representing the provider extension.
     */
    notifyReady(provider: CustomConfigurationProvider): void;

    /**
     * Notify the C/C++ extension that the current configuration has changed. Upon receiving this
     * notification, the C/C++ extension will request the new configurations.
     * @param provider An instance of the [CustomConfigurationProvider](#CustomConfigurationProvider)
     * instance representing the provider extension.
     */
    didChangeCustomConfiguration(provider: CustomConfigurationProvider): void;

    /**
     * Notify the C/C++ extension that the code browsing configuration has changed. Upon receiving this
     * notification, the C/C++ extension will request the new configuration.
     * @param provider An instance of the [CustomConfigurationProvider](#CustomConfigurationProvider)
     * instance representing the provider extension.
     */
    didChangeCustomBrowseConfiguration(provider: CustomConfigurationProvider): void;
}

/**
 * An interface to allow this extension to communicate with Custom Configuration Provider extensions.
 */
export interface CustomConfigurationProvider extends vscode.Disposable {
    /**
     * The friendly name of the Custom Configuration Provider extension.
     */
    readonly name: string;

    /**
     * The id of the extension providing custom configurations. (e.g. `ms-vscode.cpptools`)
     */
    readonly extensionId: string;

    /**
     * A request to determine whether this provider can provide IntelliSense configurations for the given document.
     * @param uri The URI of the document.
     * @param token (optional) The cancellation token.
     * @returns 'true' if this provider can provide IntelliSense configurations for the given document.
     */
    canProvideConfiguration(uri: vscode.Uri, token?: vscode.CancellationToken): Thenable<boolean>;

    /**
     * A request to get Intellisense configurations for the given files.
     * @param uris A list of one of more URIs for the files to provide configurations for.
     * @param token (optional) The cancellation token.
     * @returns A list of [SourceFileConfigurationItem](#SourceFileConfigurationItem) for the documents that this provider
     * is able to provide IntelliSense configurations for.
     * Note: If this provider cannot provide configurations for any of the files in `uris`, the provider may omit the
     * configuration for that file in the return value. An empty array may be returned if the provider cannot provide
     * configurations for any of the files requested.
     */
    provideConfigurations(uris: vscode.Uri[], token?: vscode.CancellationToken): Thenable<SourceFileConfigurationItem[]>;

    /**
     * A request to determine whether this provider can provide a code browsing configuration for the workspace folder.
     * @param token (optional) The cancellation token.
     * @returns 'true' if this provider can provide a code browsing configuration for the workspace folder.
     */
    canProvideBrowseConfiguration(token?: vscode.CancellationToken): Thenable<boolean>;

    /**
     * A request to get the code browsing configuration for the workspace folder.
     * @param token (optional) The cancellation token.
     * @returns A [WorkspaceBrowseConfiguration](#WorkspaceBrowseConfiguration) with the information required to
     * construct the equivalent of `browse.path` from `c_cpp_properties.json`. If there is no configuration to report, or
     * the provider indicated that it cannot provide a [WorkspaceBrowseConfiguration](#WorkspaceBrowseConfiguration)
     * then `null` should be returned.
     */
    provideBrowseConfiguration(token?: vscode.CancellationToken): Thenable<WorkspaceBrowseConfiguration | null>;

    /**
     * A request to determine whether this provider can provide a code browsing configuration for each folder in a multi-root workspace.
     * @param token (optional) The cancellation token.
     * @returns 'true' if this provider can provide a code browsing configuration for each folder in a multi-root workspace.
     */
    canProvideBrowseConfigurationsPerFolder(token?: vscode.CancellationToken): Thenable<boolean>;

    /**
     * A request to get the code browsing configuration for the workspace folder.
     * @param uri The URI of the folder to provide a browse configuration for.
     * @param token (optional) The cancellation token.
     * @returns A [WorkspaceBrowseConfiguration](#WorkspaceBrowseConfiguration) with the information required to
     * construct the equivalent of `browse.path` from `c_cpp_properties.json`. If there is no configuration for this folder, or
     * the provider indicated that it cannot provide a [WorkspaceBrowseConfiguration](#WorkspaceBrowseConfiguration) per folder
     * then `null` should be returned.
     */
    provideFolderBrowseConfiguration(uri: vscode.Uri, token?: vscode.CancellationToken): Thenable<WorkspaceBrowseConfiguration | null>;
}

/**
 * The model representing the custom IntelliSense configurations for a source file.
 */
export interface SourceFileConfiguration {
    /**
     * This must also include the system include path (compiler defaults) unless
     * [compilerPath](#SourceFileConfiguration.compilerPath) is specified.
     * Mac framework paths may also be added to this array.
     */
    readonly includePath: string[];

    /**
     * This must also include the compiler default defines (__cplusplus, etc) unless
     * [compilerPath](#SourceFileConfiguration.compilerPath) is specified.
     */
    readonly defines: string[];

    /**
     * The platform, compiler, and architecture variant to emulate.
     * IntelliSenseMode values without a platform variant will resolve to a value that matches
     * the host platform. For example, if the host platform is Windows and the IntelliSenseMode
     * is "clang-x64", then "clang-x64" will resolve to "windows-clang-x64".
     */
    readonly intelliSenseMode?: "linux-clang-x86" | "linux-clang-x64" | "linux-clang-arm" | "linux-clang-arm64" |
        "linux-gcc-x86" | "linux-gcc-x64" | "linux-gcc-arm" | "linux-gcc-arm64" |
        "macos-clang-x86" | "macos-clang-x64" | "macos-clang-arm" | "macos-clang-arm64" |
        "macos-gcc-x86" | "macos-gcc-x64" | "macos-gcc-arm" | "macos-gcc-arm64" |
        "windows-clang-x86" | "windows-clang-x64" | "windows-clang-arm" | "windows-clang-arm64" |
        "windows-gcc-x86" | "windows-gcc-x64" | "windows-gcc-arm" | "windows-gcc-arm64" |
        "windows-msvc-x86" | "windows-msvc-x64" | "windows-msvc-arm" | "windows-msvc-arm64" |
        "msvc-x86" | "msvc-x64" | "msvc-arm" | "msvc-arm64" |
        "gcc-x86" | "gcc-x64" | "gcc-arm" | "gcc-arm64" |
        "clang-x86" | "clang-x64" | "clang-arm" | "clang-arm64";

    /**
     * The C or C++ standard to emulate.
     */
    readonly standard?: "c89" | "c99" | "c11" | "c17" | "c++98" | "c++03" | "c++11" | "c++14" | "c++17" | "c++20" | "c++23" |
        "gnu89" | "gnu99" | "gnu11" | "gnu17" | "gnu++98" | "gnu++03" | "gnu++11" | "gnu++14" | "gnu++17" | "gnu++20" | "gnu++23";
    /**
     * Any files that need to be included before the source file is parsed.
     */
    readonly forcedInclude?: string[];

    /**
     * The full path to the compiler. If specified, the extension will query it for system includes and defines and
     * add them to [includePath](#SourceFileConfiguration.includePath) and [defines](#SourceFileConfiguration.defines).
     */
    readonly compilerPath?: string;

    /**
     * Arguments for the compiler. These arguments will not be processed by the shell and should not include any
     * shell variables, quoting or escaping.
     */
    readonly compilerArgs?: string[];

    /**
     * Command line fragments for the compiler. These are similar to compiler arguments, but support shell parsed
     * content such as shell quoting and escaping.
     */
    readonly compilerFragments?: string[];

    /**
     * The version of the Windows SDK that should be used. This field will only be used if
     * [compilerPath](#SourceFileConfiguration.compilerPath) is set and the compiler is capable of targeting Windows.
     */
    readonly windowsSdkVersion?: string;
}

/**
 * The model representing a source file and its corresponding configuration.
 */
export interface SourceFileConfigurationItem {
    /**
     * The URI of the source file. It should follow the file URI scheme and represent an absolute path to the file.
     * @example
```
    // When working with a file path,
    // convert it to a vscode.Uri first.
    let path: string = ...;
    let item: SourceFileConfigurationItem = {
        uri: vscode.Uri.file(path),
        configuration: ...
    };
```
     */
    readonly uri: string | vscode.Uri;

    /**
     * The IntelliSense configuration for [uri](#SourceFileConfigurationItem.uri)
     */
    readonly configuration: SourceFileConfiguration;
}

/**
 * The model representing the source browsing configuration for a workspace folder.
 */
export interface WorkspaceBrowseConfiguration {
    /**
     * This must also include the system include path (compiler defaults) unless
     * [compilerPath](#WorkspaceBrowseConfiguration.compilerPath) is specified.
     */
    readonly browsePath: string[];

    /**
     * The full path to the compiler. If specified, the extension will query it for system includes and
     * add them to [browsePath](#WorkspaceBrowseConfiguration.browsePath).
     */
    readonly compilerPath?: string;

    /**
     * Arguments for the compiler. These arguments will not be processed by the shell and should not include any
     * shell variables, quoting or escaping.
     */
    readonly compilerArgs?: string[];

    /**
     * Command line fragments for the compiler. These are similar to compiler arguments, but support shell parsed
     * content such as shell quoting and escaping.
     */
    readonly compilerFragments?: string[];

    /**
     * The C or C++ standard to emulate. This field defaults to "c++17" and will only be used if
     * [compilerPath](#WorkspaceBrowseConfiguration.compilerPath) is set.
     */
    readonly standard?: "c89" | "c99" | "c11" | "c17" | "c++98" | "c++03" | "c++11" | "c++14" | "c++17" | "c++20" | "c++23" |
        "gnu89" | "gnu99" | "gnu11" | "gnu17" | "gnu++98" | "gnu++03" | "gnu++11" | "gnu++14" | "gnu++17" | "gnu++20" | "gnu++23";
    /**
     * The version of the Windows SDK that should be used. This field defaults to the latest Windows SDK
     * installed on the PC and will only be used if [compilerPath](#WorkspaceBrowseConfiguration.compilerPath)
     * is set and the compiler is capable of targeting Windows.
     */
    readonly windowsSdkVersion?: string;
}

/**
 * The interface provided by the C/C++ extension during activation.
 * It is recommended to use the helper function [getCppToolsApi](#getCppToolsApi) instead
 * of querying the extension instance directly.
 */
export interface CppToolsExtension {
    /**
     * Get an API object.
     * @param version The desired version.
     */
    getApi(version: Version): CppToolsApi;
}

/**
 * Check if an object satisfies the contract of the CppToolsExtension interface.
 */
function isCppToolsExtension(extension: any): extension is CppToolsExtension {
    return extension && extension.getApi;
}

/**
 * Check if an object satisfies the contract of the first version of the CppToolsApi.
 * (The first release of the API only had two functions)
 */
function isLegacyCppToolsApi(api: any): api is CppToolsApi {
    return api && api.registerCustomConfigurationProvider && api.didChangeCustomConfiguration
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
export async function getCppToolsApi(version: Version): Promise<CppToolsApi | undefined> {
    let cpptools: vscode.Extension<any> | undefined = vscode.extensions.getExtension("ms-vscode.cpptools");
    let extension: CppToolsApi | CppToolsExtension | undefined = undefined;
    let api: CppToolsApi | undefined = undefined;

    if (cpptools) {
        if (!cpptools.isActive) {
            try {
                // activate may throw if VS Code is shutting down.
                extension = await cpptools.activate();
            } catch {
            }
        } else {
            extension = cpptools.exports;
        }

        if (isCppToolsExtension(extension)) {
            // ms-vscode.cpptools > 0.17.5
            try {
                api = extension.getApi(version);
            } catch (err) {
                // Unfortunately, ms-vscode.cpptools [0.17.6, 0.18.1] throws a RangeError if you specify a version greater than v1.
                // These versions of the extension will not be able to act on the newer interface and v2 is a superset of v1, so we can safely fall back to v1.
                let e: RangeError = <RangeError>err;
                if (e && e.message && e.message.startsWith("Invalid version")) {
                    api = extension.getApi(Version.v1);
                }
            }

            if (version !== Version.v1) {
                if (!api.getVersion) {
                    console.warn(`[vscode-cpptools-api] version ${version} requested, but is not available in the current version of the cpptools extension. Using version 1 instead.`);
                } else if (version !== api.getVersion()) {
                    console.warn(`[vscode-cpptools-api] version ${version} requested, but is not available in the current version of the cpptools extension. Using version ${api.getVersion()} instead.`);
                }
            }
        } else if (isLegacyCppToolsApi(extension)) {
            // ms-vscode.cpptools version 0.17.5
            api = extension;
            if (version !== Version.v0) {
                console.warn(`[vscode-cpptools-api] version ${version} requested, but is not available in version 0.17.5 of the cpptools extension. Using version 0 instead.`);
            }
        } else {
            console.warn('[vscode-cpptools-api] No cpptools API was found.')
        }
    } else {
        console.warn('[vscode-cpptools-api] C/C++ extension is not installed');
    }
    return api;
}
