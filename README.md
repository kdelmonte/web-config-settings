# webconfig

Get the application settings from a .NET application's web/app.config from your nodejs application.

## Install

`npm install webconfig --save`

## Usage

```
var webconfig = require("webconfig");

webconfig
.compile({
    // Specify all webconfigs that you want to compile
    sources: [
      __dirname + '/web.config',
      __dirname + '/prod.web.config',
    ],
    // Configure your own overrides/extend for applicationSettings
    applicationSettings: {
      "MyApplicationSetting": "MyValue"
    },
    // Configure your own overrides/extend for appSettings
    appSettings: {
      "MyAppSetting": "MyValue"
    }
})
.then(function(compiledWebConfig){
  console.log(compiledWebConfig)
});
```

#### The compiledWebConfig object looks like this:

```
{
    // Array of xml2js translations of each web.config
    sources: [{
        configuration: [...]
    }],
    // App settings
    appSettings: {
        'webpages:Version': '3.0.0.0',
        'webpages:Enabled': 'false',
        ClientValidationEnabled: 'true',
        UnobtrusiveJavaScriptEnabled: 'true',
        MyAppSetting: "MyValue"
    },
    // Application settings
    applicationSettings: {
        Host: 'fake.company.com',
        EmailSenderDisplayName: 'FakeName',
        EmailTemplatesDirectory: 'C:\\fakepath',
        BaseUrl: 'http://localhost:50640/fake/',
        EmailSenderAddress: 'fake@fake.com',
        MyApplicationSetting: "MyValue"
    }
}
```
