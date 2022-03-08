import React from 'react';
import { pathToRegexp } from 'path-to-regexp/dist';
import { $log, baseUrl } from './dom-helpers';

export function isRouteSelected(route) {
	if (typeof route == 'array') {
		for (var i in route) {
			if (matchPath(route[i], location.hash))
				return true;
		}
		return false;
	} else {
		return matchPath(route, location.hash)
	}
}

export function useHashRoutes(routes) {
	const [changed, setChanged] = React.useState(0);

	const changeRef = React.useRef();
	changeRef.current = changed;

	React.useEffect(() => {
		window.addEventListener('hashchange', hashChanged);

		return function() {
			window.removeEventListener('hashchange', hashChanged);
		}
	}, []);


	function hashChanged() {
		setChanged(changeRef.current+1);
	}

	var options = { defaultToLast:true };

	if (routes.routes) {
		options	= routes;
		routes	= routes.routes;
	} else if (!Array.isArray(routes) && arguments.length > 1) {
		routes = [];
		for (var i = 0; i < arguments.length; i++) // arguments has some other properties besides the index
			routes.push(arguments[i]);
	}

	var defaultRoute	= undefined;
	var lastKey			= undefined;

	for (var i in routes) {
		lastKey = i;

		var route		= routes[i].props || routes[i];
		var path		= !Array.isArray(routes) && i || route.path || '';
		var isDefault	= route.default;
		var render		= route.render || route.children || route;

		if (Array.isArray(path)) {
			for (var j in path) {
				var _path = path[j]
				var match = matchPath(_path, location.hash);
				if (match)
					return render(match.params);
				else if (isDefault || _path == '' && !defaultRoute)
					defaultRoute = render({});
			}
		} else {
			var match = matchPath(path, location.hash);
			if (match)
				return render(match.params);
			else if (isDefault || path == '' && !defaultRoute)
				defaultRoute = render({});
		}
	}

	if (!defaultRoute && options.defaultToLast) {
		var route	= routes[lastKey];
		var render	= route.render || route.children || route;

		defaultRoute = render({});
	}

	return defaultRoute;
}
export function matchPath(path, refPath) {
	if (!refPath)
		refPath = location.hash;

	var _path = path;
	if (_path && _path.length > 0 && _path.substr(0, 1) != '#')
		_path = '#' + _path;

	var keys	= [];
	var regexp	= pathToRegexp(_path, keys, { delimiter:'/' }); // default delimiter = '/#?', which is different than the previous version
	var re		= new RegExp(regexp);
	var result	= re.exec(refPath);

	if (result) {
		var params = {};

		for (var i = 1; i < result.length; i++)
			params[keys[i-1].name] = result[i];

		var match = { path, params };

		return match;
	}

	return false;
}
export function navigateTo(path) {
	var _path = path;
	if (_path && _path.length > 0 && _path.substr(0, 1) != '#')
		_path = '#' + _path;

	if (path == 'back' || path == -1)
		history.back();
	else if (path < 0)
		history.go(path);
	else if (_path.toLowerCase() != location.hash.toLowerCase())
		location.hash = _path;
}

export function Route(props) {
	return null;
}
