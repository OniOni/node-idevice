"use strict";

var exec = require('child_process').exec,
    path = require('path'),
    fs = require('fs');

var IDevice = function (udid, opts) {
    this.udid = udid || false;
    this.cmd = "ideviceinstaller";

    if (opts && opts.cmd) {
	this.cmd = opts.cmd;
    }

    if (!this._check_cmd()) {
	throw "Executable not found";
    }
};

IDevice.prototype._check_cmd = function () {
    var ret = false;

    // Check if path is given
    if (this.cmd[0] == '.' || this.cmd[0] == '/') {
	ret = fs.existsSync(this.cmd);
    } else {
	var bins = process.env.PATH.split(':'),
	    i = 0,
	    found = false;
	while (!found && i < bins.length) {
	    if (fs.existsSync(bins[i]+"/"+this.cmd)) {
		ret = true;
		found = true;
	    }
	    i++;
	}
    }

    return ret;
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

IDevice.prototype.isInstalled = function (appName, cb) {
    var self = this;

    self.listInstalled(function (err, apps) {
	if (err) {
	    cb(err);
	} else {
	    var i = 0,
		found = false;

	    while (i < apps.length && !found) {
		if (apps[i]['name'].indexOf(appName) != -1 ||
		    apps[i]['fullname'].indexOf(appName) != -1) {
		    cb(null, true);
		    found = true;
		} else {
		  i++;
		}
	    }
	    if (!found)
		cb(null, false);
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

IDevice.prototype.installAndWait = function (ipa, app, cb) {
    var self = this;

    var check = function () {
	self.isInstalled(app, function (err, installed) {
	    if (installed) {
		cb(null, true);
	    } else {
		setTimeout(check, 500);
	    }
	});
    }

    this.install(ipa, function (err) {
	if (err) {
	    cb(null);
	} else {
	    var inter = setTimeout(check, 500)
	}
    })
}


module.exports = function (uuid, opts) {
  return new IDevice(uuid, opts);
};
