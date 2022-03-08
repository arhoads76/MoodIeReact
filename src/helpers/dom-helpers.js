import ReactDOM from 'react-dom';

class Logger {
	log() {
		for (var i in arguments) {
			var message = arguments[i];
			if (console)
				console.log(message);
		}
	}
	dir() {
		for (var i in arguments) {
			var data = arguments[i];
			if (console)
				console.dir(data);
		}
	}
	table() {
		for (var i in arguments) {
			var data = arguments[i];
			if (console && console.table)
				console.table(data);
			else if (console)
				console.log(data);
		}
	}
}

export const $log = new Logger();

export const findBaseUrl = function(virtDir, beforeMarker) {
	var _pathname	= window.location.pathname.toLowerCase();
	var appPathPos	= _pathname.indexOf('.html') >= 0 ? (_pathname.indexOf('.html')+5) : (_pathname.indexOf(virtDir) >= 0 ? (_pathname.indexOf(virtDir)+(beforeMarker ? 0 : virtDir.length)) : -1);
	var baseUrl = (window.location.protocol + "//" + window.location.host + (appPathPos >= 0 ? window.location.pathname.substr(0, appPathPos) : '/') + '/-').replace('//-', '/-').replace('/-', '/');
	return baseUrl;
}

var defaultVirtDir = '/';
export var baseUrl = findBaseUrl(defaultVirtDir);
window.baseUrl = baseUrl;

export const siteUrl = function(urlPart) {
	var url = baseUrl;

	if (urlPart && urlPart != '') {
		if (url[url.length-1] != '/')
			url += '/';
		url += urlPart[0] == '/' ? urlPart.substr(1) : urlPart;
	}

	return url;
}

export const getQueryString = function(search) {
	var query = {};

	if (!search)
		search = location.search;

	if (search && search.length > 1) {
		search = search.substr(1);

		var parts = search.split('&')
		for (var i in parts) {
			var param = parts[i].split('=')
			if (param && param.length > 1)
				query[param[0]] = decodeURI(param[1]);
			else if (param && param.length > 0)
				query[param[0]] = null;
		}
	}

	return query;
}
window.getQueryString = getQueryString;

export const preventDefault = function(e) {
	if (e && e.preventDefault) e.preventDefault();
	if (e) e.returnValue = false;
}

export const stopPropagation = function(e) {
	if (e === undefined) e = window.event;
	if (e && e.stopPropagation) e.stopPropagation();
}

export const gt = '>';
export const lt = '<';
export const nbsp = '\u00A0';

export const css = function(...args) {
	var names = [];

	for (var i in args) {
		var obj = args[i];
		if (obj == null || obj == undefined)
			continue;

		if (typeof(obj) == 'string') {
			names.push(obj);
		} else {
			for (var name in obj) {
				if (obj[name])
					names.push(name);
			}
		}
	}

	var classNames = names.join(' ');
	if (classNames == '')
		classNames = undefined;

	return classNames;
}

export const bindOnce = function(selector, render) {
	var el = document.querySelector(selector);
	if (el) {
		var props = getAttributes(el);
		props._parentElement = el;
		var app = render(props);
		if (app)
			ReactDOM.render(render(props), el);
	}
}
export const bindAll = function(selector, render) {
	var els = document.querySelectorAll(selector);
	for (var i = 0; i < els.length; i++) {
		var props = getAttributes(els[i]);
		props._parentElement = els[i];
		var app = render(props);
		if (app)
			ReactDOM.render(app, els[i]);
	}
}

export const getAttributes = function(el) {
	var attrs = {};

	if (el)
	for (var i in el.attributes) {
		var att = el.attributes[i];
		if (att.name && typeof(att.value) == 'string')
			attrs[att.name] = att.value.toLowerCase() === 'true' ? true
							: att.value.toLowerCase() === 'false' ? false
							: att.value;
	}

	return attrs;
}

export const getParameterByName = function(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, '\\$&');
	var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export const getStyle = function(styleText) {
	var style = {};

	if (styleText && typeof(styleText) == 'string' && styleText != '') {
		var _style = styleText.split(';');
		for (var i in _style) {
			var item = _style[i];
			if (item != '') {
				var kvp		= item.split(':');
				var name	= kvp[0].trim();
				var value	= kvp[1].trim();
				style[name] = value;
			}
		}
	} else {
		style = styleText || {};
	}

	return style;
}

export const browserVersion = function() {
	var ua = navigator.userAgent, tem;
	var M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
	if (/trident/i.test(M[1])){
		tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
		return 'IE '+(tem[1] || '');
	}
	if (M[1] === 'Chrome'){
		tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
		if(tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
	}
	M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
	if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
	return M.join(' ');
}
export const getUserAgent = function() {
	var agent = {};

	var browser = browserVersion();
	if (browser.indexOf('IE') >= 0)
		agent.ie = true;
	else if (browser.indexOf('Edge') >= 0)
		agent.edge = true;
	else if (browser.indexOf('Chrome') >= 0)
		agent.chrome = true;
	else if (browser.indexOf('Safari') >= 0)
		agent.safari = true;
	else if (browser.indexOf('Opera') >= 0)
		agent.opera = true;
	else if (browser.indexOf('Mozilla') >= 0)
		agent.mozilla = true;

	var parts = browser.split(' ');
	if (parts.length > 0)
		agent.version = parseInt(parts[1]);

	agent.name = navigator.userAgent;

	return agent;
}
window.browserVersion = browserVersion;
window.getUserAgent = getUserAgent;

export const keyCodes = {
	8: 'backspace',
	9: 'tab',
	13: 'enter',
	16: 'shift',
	17: 'ctrl',
	18: 'alt',
	19: 'break',
	20: 'capslock',
	27: 'escape',
	33: 'pageup',
	32: 'space',
	34: 'pagedown',
	35: 'end',
	36: 'home',
	37: 'left',
	38: 'up',
	39: 'right',
	40: 'down',
	44: 'printscreen',
	45: 'insert',
	46: 'delete',
	48: '0',
	49: '1',
	50: '2',
	51: '3',
	52: '4',
	53: '5',
	54: '6',
	55: '7',
	56: '8',
	57: '9',
	59: 'semicolon',
	61: 'add',
	65: 'a',
	66: 'b',
	67: 'c',
	68: 'd',
	69: 'e',
	70: 'f',
	71: 'g',
	72: 'h',
	73: 'i',
	74: 'j',
	75: 'k',
	76: 'l',
	77: 'm',
	78: 'n',
	79: 'o',
	80: 'p',
	81: 'q',
	82: 'r',
	83: 's',
	84: 't',
	85: 'u',
	86: 'v',
	87: 'w',
	88: 'x',
	89: 'y',
	90: 'z',
	91: 'leftwinkey',
	92: 'rightwinkey',
	93: 'select',
	96: 'numpad0',
	97: 'numpad1',
	98: 'numpad2',
	99: 'numpad3',
	100: 'numpad4',
	101: 'numpad5',
	102: 'numpad6',
	103: 'numpad7',
	104: 'numpad8',
	105: 'numpad9',
	106: 'multiply',
	107: 'add',
	109: 'subtract',
	110: 'decimalpoint',
	111: 'divide',
	112: 'f1',
	113: 'f2',
	114: 'f3',
	115: 'f4',
	116: 'f5',
	117: 'f6',
	118: 'f7',
	119: 'f8',
	120: 'f9',
	121: 'f10',
	122: 'f11',
	123: 'f12',
	144: 'numlock',
	145: 'scrolllock',
	182: 'mycomputer',
	183: 'mycalculator',
	186: 'semicolon',
	187: 'equals',
	188: 'comma',
	189: 'dash',
	190: 'period',
	191: 'slash',
	192: 'tilde',
	219: 'openbrace',
	220: 'backslash',
	221: 'closebrace',
	222: 'singlequote',
	224: 'command'
};
for (var i in keyCodes) { if (parseInt(keyCodes[i]) != keyCodes[i]) keyCodes[keyCodes[i]] = i };
