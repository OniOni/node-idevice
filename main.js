"use strict";

var exec = require('child_process').exec;

var IDevice = function (udid) {
    this.udid = udid || false;
    this.cmd = "./ideviceinstaller";
};

IDevice.prototype._build_cmd = function (options) {
    var cmd = '';

    cmd += this.cmd;

    if (this.uuid) {
	cmd += " -U " + this.udid;
    }

    if (typeof options == 'object' && options.indexOf) {
	for (var i = 0; i < options.length; i++) {
	    cmd += " " + options[i];
	}
    } else {
	cmd += " " + options;
    }

    console.log(cmd);

    return cmd;
};

IDevice.prototype.list = function (option, cb) {
    exec(this._build_cmd(option), function (err, stdout, stderr) {
	if(err) {
	    cb(err, stdout);
	} else {
	    var apps = stdout.split('\n'),
		res = [];
	    for (var i = 0; i < apps.length; i++) {
		var info = apps[i].split(' - ');
		if (info.length == 2) {
		    res.push({name: info[1], fullname: info[0]});
		}
	    }
	    cb(null, res);
	}
    });
};

IDevice.prototype.listInstalled = function (cb) {
    this.list("-l", cb);
};

IDevice.prototype.listSystem = function (cb) {
    this.list("-l -o list_system", cb);
};

IDevice.prototype.listAll = function (cb) {
    this.list("-l -o list_all", cb);
};

module.exports = function (uuid) {
  return new IDevice(uuid);
};
