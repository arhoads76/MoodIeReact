import React from 'react';

export default function useReducer(reducer) {
	var [state, _dispatch] = React.useReducer(reducer);

	function dispatch(action, data) {
		if (typeof action == 'string')
			_dispatch({ type:action, data });
		else
			_dispatch(action);
	}

	return [state, dispatch];
}
