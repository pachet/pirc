var req = require('req');

var ResponseTypes = req('/constants/response-types');


function load(key) {
	return req('/lib/server/messages/' + key);
}

module.exports = {

	[ResponseTypes.WELCOME]:        load('welcome'),                // 001
	[ResponseTypes.YOURHOST]:       load('your-host'),              // 002
	[ResponseTypes.CREATED]:        load('created'),                // 003
	[ResponseTypes.MYINFO]:         load('my-info'),                // 004
	[ResponseTypes.BOUNCE]:         load('bounce'),                 // 005

	[ResponseTypes.YOURID]:         load('your-id'),                // 042

	[ResponseTypes.LUSERCLIENT]:    load('l-user-client'),          // 251
	[ResponseTypes.LUSEROP]:        load('l-user-op'),              // 252

	[ResponseTypes.LUSERCHANNELS]:  load('l-user-channels'),        // 254
	[ResponseTypes.LUSERME]:        load('l-user-me'),              // 255

	[ResponseTypes.LOCALUSERS]:     load('local-users'),            // 265

	[ResponseTypes.GLOBALUSERS]:    load('global-users'),           // 266
	[ResponseTypes.MOTD]:           load('motd'),                   // 372
	[ResponseTypes.MOTDSTART]:      load('motd-start'),             // 375
	[ResponseTypes.ENDOFMOTD]:      load('end-of-motd'),            // 376

	[ResponseTypes.NICKNAMEINUSE]:  load('nickname-in-use')         // 433

};

