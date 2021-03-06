var UiLogger = (function() {
	(function () {
		// intercept console logs, thanks to Toby Ho (see http://tobyho.com/2012/07/27/taking-over-console-log/)
		var console = window.console;
		if (!console) {
			return;
		}

		function intercept(method){
			var original = console[method];

			console[method] = function() {
				// Dispatch to UiLogger
				UiLogger[method].apply(UiLogger, arguments);

				if (original.apply){
					// Do this for normal browsers
					original.apply(console, arguments);
				} else {
					// Do this for IE
					var message = Array.prototype.slice.apply(arguments).join(' ');
					original(message);
				}
			};
		}

		var methods = ['log', 'debug', 'info', 'warn', 'error'];
		for (var i = 0; i < methods.length; i++) {
			intercept(methods[i]);
		}
	})();

	var LogLevel = {
		DEFAULT : 0,
		DEBUG : 1,
		INFO : 2,
		WARN : 3,
		ERROR : 4
	};

	var logger = {
		// disabled by default
		messages : []
	};

	var logToUi = function(logEntry) {
		var message = logger.messageDecorator(logEntry);

		var logItem = document.createElement('li');
		var logMessage = document.createTextNode(message);
		logItem.appendChild(logMessage);

		// use font color with respect to log level
		switch(logEntry.level) {
			case LogLevel.DEBUG:
				logItem.className = 'debug';
				break;
			case LogLevel.WARN:
				logItem.className = 'warn';
				break;
			case LogLevel.ERROR:
				logItem.className = 'error';
				break;
			default:
				logItem.className = 'info';
				break;
		}

		var logPanel = document.getElementById('logPanel');
		logPanel.appendChild(logItem);
		logPanel.scrollTop = logPanel.scrollHeight;
	};

	var populateLogMessages = function() {
		while (logPanel.firstChild) {
			logPanel.removeChild(logPanel.firstChild);
		}

		for (var i = 0; i < logger.messages.length; i++) {
			logToUi(logger.messages[i]);
		}
	};

	var doLog = function(logEntry) {
		// store timestamp in log entry
		logEntry.timestamp = new Date();

		// collect messages to access them later
		logger.messages.push(logEntry);

		if(logger.isShowingLogPanel()) {
			logToUi(logEntry);
		}
	};

	logger.log = function(data, level) {
		var logLevel;

		if (level) {
			logLevel = level;
		} else {
			logLevel = LogLevel.DEFAULT;
		}

		doLog({
			'data' : data,
			'level': logLevel
		});
	};

	logger.debug = function(data) {
		doLog({
			'data' : data,
			'level': LogLevel.DEBUG
		});
	};

	logger.info = function(data) {
		doLog({
			'data' : data,
			'level': LogLevel.INFO
		});
	};

	logger.warn = function(data) {
		doLog({
			'data' : data,
			'level': LogLevel.WARN
		});
	};

	logger.error = function(data) {
		doLog({
			'data' : data,
			'level': LogLevel.ERROR
		});
	};

	logger.showLogPanel = function() {
		var showFn = function() {
			if (!logger.isShowingLogPanel()) {
				var logPanel = document.createElement('ol');

				logPanel.id = 'logPanel';
				logPanel.className = 'logPanel';

				document.body.appendChild(logPanel);

				populateLogMessages();
			}
		};

		if (document.body) {
			// show panel directly
			showFn();
		} else {
			// wait until DOM is loaded
			document.addEventListener("DOMContentLoaded", showFn, false);
		}
	};

	logger.hideLogPanel = function() {
		if (logger.isShowingLogPanel()) {
			var logPanel = document.getElementById('logPanel');
			document.body.removeChild(logPanel);
		}
	};

	logger.isShowingLogPanel = function() {
		return document.getElementById('logPanel') !== null;
	};

	logger.clear = function() {
		logger.messages = [];
		populateLogMessages();
	};

	logger.messageDecorator = function() {
		var pad = function(a, b) { // see https://gist.github.com/aemkei/1180489
			return (1e15 + a + "").slice(-b);
		};

		return function(logEntry) {
			var d = logEntry.timestamp;
			var h = d.getHours();
			var m = pad(d.getMinutes(), 2);
			var s = pad(d.getSeconds(), 2);
			var ms = pad(d.getMilliseconds(), 3);

			var time = new Array(h, m, s).join(':');

			var message;
			if (typeof logEntry.data === 'string') {
				message = logEntry.data;
			} else {
				message = JSON.stringify(logEntry.data);
			}

			return ' [' + time + '.' + ms + '] ' + message;
		};
	}();

	logger.setMessageDecorator = function(decorator) {
		logger.messageDecorator = decorator;
	};

	logger.getMessageDecorator = function() {
		return logger.messageDecorator;
	};

	var UiLoggerApi = {
		LogLevel            : LogLevel,
		log                 : logger.log,
		debug               : logger.debug,
		info                : logger.info,
		warn                : logger.warn,
		error               : logger.error,
		showLogPanel        : logger.showLogPanel,
		hideLogPanel        : logger.hideLogPanel,
		isShowingLogPanel   : logger.isShowingLogPanel,
		clear               : logger.clear,
		getMessageDecorator : logger.getMessageDecorator,
		setMessageDecorator : logger.setMessageDecorator
	};
	//for (var attrname in nativeConsole) { UiLoggerApi[attrname] = nativeConsole[attrname]; }

	return UiLoggerApi;
})();