import React from 'react';
import { $log, baseUrl } from './dom-helpers';

export default function useHashChangeEvent(hashChanged) {
	React.useEffect(() => {
		window.addEventListener('hashchange', hashChanged);

		return function() {
			window.removeEventListener('hashchange', hashChanged);
		}
	});
}
