import * as vscode from 'vscode';
/**
 * API version information.
 */
export declare enum Version {
    v0 = 0,
    v1 = 1,
    v2 = 2,
    v3 = 3,
    v4 = 4,
    v5 = 5,
    v6 = 6,
    v7 = 7,
    v8 = 8,
    latest = 8
}
export type CStandard = "c89" | "c99" | "c11" | "c17" | "c23";
export type GnuCStandard = "gnu89" | "gnu99" | "gnu11" | "gnu17" | "gnu23";
export type CppStandard = "c++98" | "c++03" | "c++11" | "c++14" | "c++17" | "c++20" | "c++23" | "c++26";
export type GnuCppStandard = "gnu++98" | "gnu++03" | "gnu++11" | "gnu++14" | "gnu++17" | "gnu++20" | "gnu++23" | "gnu++26";
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
     * Readiness means the provider can service configuration requests, not that every configuration is available.
     * In version 8, this notification does not clear configurations already provided or cached from a previous session.
     * @param provider An instance of the [CustomConfigurationProvider](#CustomConfigurationProvider)
     * instance representing the provider extension.
     */
    notifyReady(provider: CustomConfigurationProvider): void;
    /**
     * Notify the C/C++ extension that the current set of configurations has changed. Upon receiving this
     * notification, the C/C++ extension will request the new configurations.
     * To replace pushed configurations without initiating those requests, use
     * [provideConfigurations](#CppToolsApi.provideConfigurations) with `replaceExisting` set to `true`.
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
    /**
     * Push IntelliSense configurations for source files associated with a workspace folder. Available in version 8.
     * A registered provider should push whatever configurations are available as soon as they are available,
     * before or after [notifyReady](#CppToolsApi.notifyReady). It need not evaluate every project first.
     * Configurations apply only to the specified workspace folder while it uses this provider; this call does not
     * select the provider. Source files need not be contained within the workspace folder.
     *
     * By default, configurations are additive: each supplied file's configuration replaces its previous value,
     * and configurations for files omitted from the batch remain unchanged. Identical configurations do not
     * invalidate existing analysis results. Configurations may be cached across sessions.
     *
     * When `replaceExisting` is `true`, replace this provider's configurations for the specified workspace folder,
     * including cached configurations, with `items` as one update. An empty batch with `replaceExisting` set to
     * `true` explicitly clears them. This does not initiate the configuration requests caused by
     * [didChangeCustomConfiguration](#CppToolsApi.didChangeCustomConfiguration).
     * Do not replace configurations merely because the provider has activated again.
     *
     * Configuration requests remain available for files whose configurations are not yet known. Their responses
     * and these pushes may both include additional related files and grouped URIs.
     * @param provider An instance of the [CustomConfigurationProvider](#CustomConfigurationProvider)
     * instance representing the provider extension.
     * @param workspaceFolderUri The file URI of the workspace folder whose configuration is being updated.
     * @param items A list of [SourceFileConfigurationItem](#SourceFileConfigurationItem) representing the source files and their configurations.
     * @param replaceExisting Whether to replace all configurations for this provider and workspace folder.
     * Defaults to `false`.
     */
    provideConfigurations(provider: CustomConfigurationProvider, workspaceFolderUri: string | vscode.Uri, items: SourceFileConfigurationItem[], replaceExisting?: boolean): void;
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
     *
     * In version 8, the request can also serve as a signal to evaluate a related project. The provider may return
     * configurations for additional related files, including grouped URIs in
     * [SourceFileConfigurationItem](#SourceFileConfigurationItem), without waiting for individual requests.
     * These configurations apply to the workspace folder associated with the request and are additive, like
     * [CppToolsApi.provideConfigurations](#CppToolsApi.provideConfigurations).
     * Providers using earlier API versions must return single-URI items.
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
    readonly intelliSenseMode?: "linux-clang-x86" | "linux-clang-x64" | "linux-clang-arm" | "linux-clang-arm64" | "linux-gcc-x86" | "linux-gcc-x64" | "linux-gcc-arm" | "linux-gcc-arm64" | "macos-clang-x86" | "macos-clang-x64" | "macos-clang-arm" | "macos-clang-arm64" | "macos-gcc-x86" | "macos-gcc-x64" | "macos-gcc-arm" | "macos-gcc-arm64" | "windows-clang-x86" | "windows-clang-x64" | "windows-clang-arm" | "windows-clang-arm64" | "windows-gcc-x86" | "windows-gcc-x64" | "windows-gcc-arm" | "windows-gcc-arm64" | "windows-msvc-x86" | "windows-msvc-x64" | "windows-msvc-arm" | "windows-msvc-arm64" | "msvc-x86" | "msvc-x64" | "msvc-arm" | "msvc-arm64" | "gcc-x86" | "gcc-x64" | "gcc-arm" | "gcc-arm64" | "clang-x86" | "clang-x64" | "clang-arm" | "clang-arm64";
    /**
     * The C or C++ standard to emulate.
     */
    readonly standard?: CStandard | GnuCStandard | CppStandard | GnuCppStandard;
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
 * The model representing source files and their corresponding configuration.
 */
export interface SourceFileConfigurationItem {
    /**
     * The URI of the source file, or, in version 8, an array of URIs for files sharing this configuration.
     * Each URI should follow the file URI scheme and represent an absolute path to the file.
     * Arrays may be used in both pushed configurations and configuration request responses after negotiating
     * version 8. A URI array must not be empty.
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
    readonly uri: string | vscode.Uri | (string | vscode.Uri)[];
    /**
     * The IntelliSense configuration for every file in [uri](#SourceFileConfigurationItem.uri).
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
    readonly standard?: CStandard | GnuCStandard | CppStandard | GnuCppStandard;
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
export declare function getCppToolsApi(version: Version): Promise<CppToolsApi | undefined>;
