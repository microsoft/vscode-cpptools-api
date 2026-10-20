# Public API for the ms-vscode.cpptools VS Code extension

The purpose of this API is to allow for build system extensions to provide IntelliSense configurations for consumers
of Microsoft's C/C++ extension for VS Code.

When your extension activates, you can use the following code to get access to the API:

### Version >= 8.0.0

In this example, `workspaceFolder` is the workspace folder being configured, and `configurations` contains whatever
configurations the provider currently has available.

```TypeScript
    import {CppToolsApi, Version, CustomConfigurationProvider, getCppToolsApi} from 'vscode-cpptools';

    const requestedVersion: Version = Version.v8;
    let api: CppToolsApi|undefined = await getCppToolsApi(requestedVersion);
    if (api) {
        const version: Version = api.getVersion ? api.getVersion() : Version.v0;
        if (version >= Version.v2) {
            // Register early, before doing any required setup.
            api.registerCustomConfigurationProvider(provider);

            // Do any required setup that the provider needs.

            if (version >= Version.v8) {
                // Push currently available configurations. Additional batches can follow later.
                api.provideConfigurations(provider, workspaceFolder.uri, configurations);
            }

            // The provider can now service requests; not all configurations need to be available.
            api.notifyReady(provider);
        } else {
            // Older APIs require setup to finish before registration.

            // Do any required setup that the provider needs.

            api.registerCustomConfigurationProvider(provider);
            api.didChangeCustomConfiguration(provider);
        }
    }
    // Dispose of the 'api' in your extension's deactivate() method, or whenever you want to unregister the provider.
```

### Version >= 2.1.0
```TypeScript
    import {CppToolsApi, Version, CustomConfigurationProvider, getCppToolsApi} from 'vscode-cpptools';

    const requestedVersion: Version = Version.v2;
    let api: CppToolsApi|undefined = await getCppToolsApi(requestedVersion);
    if (api) {
        if (api.getVersion && api.getVersion() === requestedVersion) {
            // Inform cpptools that a custom config provider will be able to service the current workspace.
            api.registerCustomConfigurationProvider(provider);

            // Do any required setup that the provider needs.

            // Notify cpptools that the provider is ready to provide IntelliSense configurations.
            api.notifyReady(provider);
        } else {
            // An older version of cpptools returned an earlier API version.

            // Do any required setup that the provider needs.

            // Inform cpptools that a custom config provider will be able to service the current workspace.
            api.registerCustomConfigurationProvider(provider);
            api.didChangeCustomConfiguration(provider);
        }
    }
    // Dispose of the 'api' in your extension's deactivate() method, or whenever you want to unregister the provider.
```

### Version < 2.0.0

```TypeScript
    import {CppToolsApi, Version, CustomConfigurationProvider, getCppToolsApi} from 'vscode-cpptools';
 
    let api: CppToolsApi|undefined = await getCppToolsApi(Version.v1);
    if (api) {
        api.registerCustomConfigurationProvider(provider);
    }
    // Dispose of the 'api' in your extension's deactivate() method, or whenever you want to unregister the provider.
```

### Version 0.1.0 [deprecated]

```TypeScript
    let cpptools: vscode.Extension<CppToolsApi> = vscode.extensions.getExtension("ms-vscode.cpptools");
    let api: CppToolsApi;

    if (!cpptools.isActive) { 
        api = await cpptools.activate();
    } else {
        api = cpptools.exports;
    }
```

Upon registering the provider, the C/C++ extension will prompt the user if they would like to use the custom configuration
provider to serve IntelliSense configurations for the workspace folder.

In version 2, you will want to register the provider as soon as your extension activates and confirms that it is capable of
providing configurations for the active workspace so that the C/C++ extension can disable standard handling of
`c_cpp_properties.json`, including indexing and parsing the files referenced by the active configuration.

In version 8, you will want to provide (push) all configurations as soon as they are available. This provides cpptools with
valid configuration for various features that require accurate include graphs and eager analysis. For configuration
providers that process all configurations as a single batch, that batch should be provided as soon as available. For
configuration providers that lazily/incrementally generate configurations, those can be pushed as they become available,
providing limited support for features that require accurate include graphs and eager analysis.

### Configuration batches and workspace folders (version 8)

Every push must specify the workspace folder whose configuration is being updated. A provider may be selected for more
than one folder, so the provider instance alone does not identify the target folder. The folder URI is a scope, not a
containment restriction: a batch may configure shared or generated source files outside that folder.

Each `SourceFileConfigurationItem.uri` may be a single URI or a nonempty array of URIs sharing the same configuration.
Both strings and `vscode.Uri` values are supported. URI arrays require a negotiated API version of at least 8; providers
using an earlier version must continue returning single-URI items.

The existing `CustomConfigurationProvider.provideConfigurations` callback remains available when a file becomes relevant
and its configuration is not yet known. In version 8, a provider may use that request to evaluate a related project and
return configurations for additional files, including grouped URIs, in the same response. It may also push further
batches as they become available. Callback results apply to the workspace folder associated with the request; they and
unsolicited pushes use the same additive configuration model. Providers do not need a separate relevance callback.

### Updating and replacing configurations (version 8)

By default, a batch adds configurations for new files and replaces configurations for files already known. Omitted files
are unchanged, and sending an identical configuration does not invalidate existing analysis results.

When the underlying build configuration changes and previous configurations are no longer valid, replace them explicitly:

```TypeScript
    // Replace this provider's configurations for this folder with the first batch of the new configuration.
    api.provideConfigurations(provider, workspaceFolder.uri, firstBatch, true);

    // Extend the new configuration as more projects are evaluated.
    api.provideConfigurations(provider, workspaceFolder.uri, nextBatch);

    // Explicitly clear this provider's configurations for this folder.
    api.provideConfigurations(provider, workspaceFolder.uri, [], true);
```

Replacement clears the previous configurations, including cached configurations, and installs the supplied batch as one
update. It does not trigger the requests caused by `didChangeCustomConfiguration`; requests for configurations that are
not yet known remain available. The existing change notification retains its request-driven behavior.

### Startup and cached configurations (version 8)

Configurations supplied by pushes or request responses may be cached per provider and workspace folder across launches.
The C/C++ extension must restore usable cached configurations before initial database population so that temporary
provider unavailability is not interpreted as an empty configuration set. Replaying unchanged configurations must preserve
existing analysis results.

Provider activation and `notifyReady` do not invalidate previously supplied configurations. Do not replace or clear them
on every activation merely to announce that the provider is starting. Update individual files or replace the folder's
configuration set when its underlying build configuration actually changes. Cached configurations must not be reused when
the selected provider changes or inputs affecting their interpretation are no longer compatible.

Neither readiness nor a partial batch asserts that all configurations are available. Lazy providers can continue
evaluating projects on demand, and features requiring configurations operate on the subset currently known.

Prior to version 2, it is best practice to wait to register the provider until it is ready to begin serving configurations.
Once the provider is registered, it is recommended to call `didChangeCustomConfigurations` so that the C/C++ extension will
ask for configurations for files that might have been opened in the editor before the custom configuration provider was
registered.

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
