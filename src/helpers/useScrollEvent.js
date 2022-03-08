import React from 'react';
import { $log, baseUrl } from './dom-helpers';

export default function useScrollEvent(scrollChanged) {
	function onScrollChanged(e) {
		scrollChanged(window.pageXOffset, window.pageYOffset);
	}

	React.useEffect(() => {
		window.addEventListener('scroll', onScrollChanged);

		return function() {
			window.removeEventListener('scroll', onScrollChanged);
		}
	});
}
