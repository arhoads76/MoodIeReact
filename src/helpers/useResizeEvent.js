import React from 'react';
import { $log, baseUrl } from './dom-helpers';

export default function useResizeEvent(windowSizeChanged) {
	function onResize(e) {
		windowSizeChanged(window.innerWidth, window.innerHeight);
	}

	React.useEffect(() => {
		window.addEventListener('resize', onResize);

		return function() {
			window.removeEventListener('resize', onResize);
		}
	});
}
