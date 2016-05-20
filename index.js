var _ = require('lodash');
var Q = require('q');
var fs = require('fs');
var xml2js = require('xml2js');
var async = require('async');

module.exports = {
    // Gets all applicationSettings from the .NET web.config and returns them in a JavaScript object
	compile: function(options){
        // options should always be an object
        options = options || {};
        
        // Since this method is async, let's setup a promise
        var deferred = Q.defer();
    
        // parse the web.config using `xml2js`
        var parser = new xml2js.Parser();
    
        // If the sources options is not an array, let's make it one to normalize
        if(!_.isArray(options.sources)){
            options.sources = [options.sources];
        }
        
        
        // Declare our destination settings object. This will be what we return
        var compiledWebConfig = {
            sources:[],
            appSettings: {
                
            },
            applicationSettings: {
                
            }
        };
        
        // Read all the contents of the web.config
        async.each(options.sources, function(source, done){
            
            // let's read config file
            fs.readFile(source, function (err, data) {
                // Using the parser convert the XML to a JavaScript object
                parser.parseString(data, function (err, result) {
                    // If an error occurred, reject the promise
                    if (err) {
                        done(err);
                        return;
                    }
                    
                    // Add the xml2js result to the compiled web config sources
                    compiledWebConfig.sources.push(result);
                    
                    // The translated JavaScript object from the xml is really ugly and hard to work with.
                    // Let's look for what we want in it and put the setting in key-value pairs.
                    
                    // Get the array of appSettings from the parsed web.config
                    if(result.configuration["appSettings"] && result.configuration["appSettings"][0]) {
                        var appSettings = result.configuration["appSettings"][0]['add'];

                        // Loop through the translated appSettings
                        _.each(appSettings, function (xmlSetting) {
                            // Extract the names and values
                            var appSetting = xmlSetting['$'];
                            var settingName = appSetting.key;
                            var settingValue = appSetting.value;

                            // Put the setting in our applicationSettings object
                            compiledWebConfig.appSettings[settingName] = settingValue;
                        });
                    }
                    
                    // Get the array of applicationSettings from the parsed web.config
                    if(result.configuration["applicationSettings"] && result.configuration["applicationSettings"][0]) {
                        var applicationSettingsObject = result.configuration["applicationSettings"][0];
                        var applicationSettingStore = _(applicationSettingsObject).keys().first();
                        var applicationSettings = applicationSettingsObject[applicationSettingStore][0]['setting'];

                        // Loop through the translated
                        _.each(applicationSettings, function (xmlSetting) {
                            // Extract the names and values
                            var applicationSetting = xmlSetting['$'];
                            var settingName = applicationSetting.name;
                            var settingValue = xmlSetting['value'][0];

                            // Put the setting in our applicationSettings object
                            compiledWebConfig.applicationSettings[settingName] = settingValue;
                        });
                    }
                    
                    // Move to next item in async queue
                    done();           
                });
            });
        }, function(err){
            // If an error occurred, reject the promise
            if (err) {
                deferred.reject(err);
                return;
            }          
            
            // If there is an override for applicationSettings, then extend the applicationSettings from the `compiledWebConfig`
            if(options.applicationSettings){
                _.extend(compiledWebConfig.applicationSettings, options.applicationSettings);
            }
            
            // If there is an override for appSettings, then extend the appSettings from the `compiledWebConfig`
            if(options.appSettings){
                _.extend(compiledWebConfig.appSettings, options.appSettings);
            }
            
            // Resolve the promise and return our nice settings object
            deferred.resolve(compiledWebConfig);
        });        
    
        // Return our promise
        return deferred.promise;
    }
};