# Public API for the ms-vscode.cpptools VS Code extension

The purpose of this API is to allow for build system extensions to provide IntelliSense configurations for consumers
of Microsoft's C/C++ extension for VS Code.

When your extension activates, you can use the following code to get access to the API:

### Version >= 2.1.0
```TypeScript
    import {CppToolsApi, Version, CustomConfigurationProvider, getCppToolsApi} from 'vscode-cpptools';
 
    let api: CppToolsApi|undefined = await getCppToolsApi(Version.v2);
    if (api) {
        if (api.notifyReady) {
            // Inform cpptools that a custom config provider will be able to service the current workspace.
            api.registerCustomConfigurationProvider(provider);

            // Do any required setup that the provider needs.

            // Notify cpptools that the provider is ready to provide IntelliSense configurations.
            api.notifyReady(provider);
        } else {
            // Running on a version of cpptools that doesn't support v2 yet.
            
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

