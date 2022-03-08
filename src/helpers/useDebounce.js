import React from 'react';

export default function useDebounce(debounceContext) {
	var [ctx, setCtx] = React.useState(debounceContext || {});

	return function(name, action, delay) {
		var now = new Date();
		ctx[name] = now;
		setTimeout(function(){
			if (ctx[name] == now)
				action();
		}, delay || 10);
	}
}
