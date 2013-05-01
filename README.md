# node-idevice

Install apps to your ios device with node.

This project depends on ideviceinstaller from the [libimobiledevice](http://www.libimobiledevice.org/) project.
The currently preferred way of obtaining the binary is to use brew.
```
brew install ideviceinstaller
```
You can then tell node-idevice to use the command as:
```javascript
var device = new IDevice(false, {cmd: 'ideviceinstaller'});
```

If you want to build the binary yourself you can try:
```
./utils/steps
```
This should pull and build all the dependencies. Be warned this is pretty long.

We currently support installing, removing and listing apps on a device.
## Installing
```javascript
var app = path.resolve(__dirname, '../path/to/your/App.ipa');
device.install(app, function (err) {
	// Do stuff when app is installed
});
```
### Removing
```javascript
device.remove('domain.organisation.App', function (err) {
	// Do stuff when app is installed
});
```
### Listing Installed apps
```javascript
device.listInstalled(function (err, data) {
	// data is list of objects, one per app
	// The object contains info about the app, currently 'name' and 'fullname'
});
```
