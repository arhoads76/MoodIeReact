import React from 'react';
import { $log, baseUrl } from './dom-helpers';

export default function useSelectionChangeEvent(selectionChanged) {
	function onSelectionChanged(e) {
		selectionChanged(e);
	}

	React.useEffect(() => {
		document.addEventListener('selectionchange', onSelectionChanged);

		return function() {
			document.removeEventListener('selectionchange', onSelectionChanged);
		}
	});
}
