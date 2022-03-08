import moment from 'moment';

export const dict2List = (dict) => {
	var list = [];
	for (var key in dict){
		if (key == undefined)
			continue;
		if (dict.hasOwnProperty(key))
		{
			var item = dict[key];
			if (typeof item.Name == 'undefined')
				list.push({Key:key, Value:item});
			else
				list.push(item)
		}
	}
	return list;
}
export const list2Dict = (list) => {
	var dict = {};
	for (var key in list){
		var item = list[key];
		if (typeof item.Name != undefined && item.Name != '')
			dict[item.Name] = item;
		else if (typeof item.Key != undefined && item.Key != '')
			dict[item.Key] = item.Value;
	}
	return dict;
}
export const sanitizeDate = (date) => {
	if (date && date != '')
		return moment(date).format();
	return date;
}

export const autobind = (self, options) => {
	if (options === undefined)
		options = {};
	if (options.exclude === undefined)
		options.exclude = excludedReactMethods;

	const filter = key => {
		const match = pattern => typeof pattern === 'string' ? key === pattern : pattern.test(key);

		if (options.include)
			return options.include.some(match);

		if (options.exclude)
			return !options.exclude.some(match);

		return true;
	};

	const ownPropertyNames = Object.getOwnPropertyNames(self.constructor.prototype);
	for (const i in ownPropertyNames) {
		const key = ownPropertyNames[i];
		const value = self[key];

		if (key !== 'constructor' && typeof value === 'function' && filter(key))
			self[key] = value.bind(self);
	}
}
const excludedReactMethods = [
	'componentWillMount',
	'UNSAFE_componentWillMount',
	'render',
	'getSnapshotBeforeUpdate',
	'componentDidMount',
	'componentWillReceiveProps',
	'UNSAFE_componentWillReceiveProps',
	'shouldComponentUpdate',
	'componentWillUpdate',
	'UNSAFE_componentWillUpdate',
	'componentDidUpdate',
	'componentWillUnmount',
	'componentDidCatch',
	'setState',
	'forceUpdate'
];
