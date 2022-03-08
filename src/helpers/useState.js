import React from 'react';

export default function useState(initialState) {
	var [state, _setState] = React.useState(initialState);

	function setState(next) {
		if (typeof next == 'function')
			_setState(s => ({...s, ...next(s)}));
		else
			_setState(s => ({...s, ...next}));
	}

	return [state, setState];
}
