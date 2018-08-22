import * as vscode from 'vscode';
import { CancellationToken } from 'vscode-jsonrpc';
/**
 * API version information.
 */
export declare enum Version {
    v0 = 0,
    v1 = 1,
    v2 = 2,
    latest = 2,
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
     * The version of the API being used.
     */
    version: Version;
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
    didChangeCustomBrowseConfiguration(provider: CustomConfigurationProvider): void;
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
     * Note: If this provider cannot provide configurations for any of the files in `uris`, the provider may omit the
     * configuration for that file in the return value. An empty array may be returned if the provider cannot provide
     * configurations for any of the files requested.
     */
    provideConfigurations(uris: vscode.Uri[], token?: CancellationToken): Thenable<SourceFileConfigurationItem[]>;
    /**
     * TODO
     * @param token (optional) The cancellation token.
     */
    canProvideBrowseConfiguration(token?: CancellationToken): Thenable<boolean>;
    /**
     * A request to get the browse configuration for the workspace folder.
     * @returns A [WorkspaceBrowseConfiguration](#WorkspaceBrowseConfiguration)
     */
    provideBrowseConfiguration(token?: CancellationToken): Thenable<WorkspaceBrowseConfiguration>;
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
     * The compiler to emulate.
     */
    intelliSenseMode: "msvc-x64" | "gcc-x64" | "clang-x64";
    /**
     * The C or C++ standard to emulate.
     */
    standard: "c89" | "c99" | "c11" | "c++98" | "c++03" | "c++11" | "c++14" | "c++17";
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
 * The model representing a source file and its corresponding configuration.
 */
export interface SourceFileConfigurationItem {
    /**
     * The URI of the source file. It should follow the file URI scheme and represent an absolute path to the file.
     * @example
```
    // When working with a vscode.Uri,
    // use the toString() method to populate this field.
    let uri: vscode.Uri = ...;
    let item: SourceFileConfigurationItem = {
        uri: uri.toString(),
        configuration: ...
    };

    // When working with a file path,
    // convert it to a vscode.Uri first.
    let path: string = ...;
    let item: SourceFileConfigurationItem = {
        uri: vscode.Uri.file(path).toString(),
        configuration: ...
    };
```
     */
    uri: string;
    /**
     * The IntelliSense configuration for [uri](#SourceFileConfigurationItem.uri)
     */
    configuration: SourceFileConfiguration;
}
/**
 * The model representing the source browsing configuration for the workspace folder.
 */
export interface WorkspaceBrowseConfiguration {
    /**
     *
     */
    browsePath: string[];
}
/**
 * Helper function to get the CppToolsApi from the cpptools extension.
 * @param version The desired API version
 * @example
```
    import {CppToolsApi, Version, CustomConfigurationProvider, getCppToolsApi} from 'vscode-cpptools';

    let api: CppToolsApi|undefined = await getCppToolsApi(Version.v1);
    if (api) {
        // Dispose of the 'api' in your extension's
        // deactivate() method, or whenever you want to
        // deregister the provider.
        api.registerCustomConfigurationProvider(provider);
    }
```
 */
export declare function getCppToolsApi(version: Version): Promise<CppToolsApi | undefined>;
