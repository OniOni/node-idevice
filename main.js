"use strict";

var exec = require('child_process').exec,
    path = require('path');

var IDevice = function (udid, opts) {
    this.udid = udid || false;
    this.cmd = "./ideviceinstaller/bin/ideviceinstaller";
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

    return cmd;
};

IDevice.prototype.list = function (option, cb) {
    var foption = "-l ";

    if (option) {
	foption += option;
    }

    exec(this._build_cmd(foption), function (err, stdout, stderr) {
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
    this.list(null, cb);
};

IDevice.prototype.listSystem = function (cb) {
    this.list("-o list_system", cb);
};

IDevice.prototype.listAll = function (cb) {
    this.list("-o list_all", cb);
};

IDevice.prototype.remove = function (app, cb) {
    exec(this._build_cmd(['-u', app]), function (err, stdout, stderr) {
	if (err) {
	    cb(err, stdout);
	} else {
	    if (stdout.indexOf('Complete') != -1) {
		cb(null);
	    } else {
		cb(new Error('Removing ' + app + ' failed'));
	    }
	}
    });
};

IDevice.prototype.install = function (app, cb) {
    exec(this._build_cmd(['-i', app]), function (err, stdout, stderr) {
	if (err) {
	    cb(err, stdout);
	} else {
	    if (stdout.indexOf('Complete') != -1) {
		cb(null);
	    } else {
		cb(new Error('Installing ' + app + ' failed'));
	    }
	}
    });
};


module.exports = function (uuid) {
  return new IDevice(uuid);
};
