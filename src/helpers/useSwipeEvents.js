import React from 'react';
import { $log } from './dom-helpers';

export default function useSwipeEvents(touchSurface, handleSwipe, effectFlag) {
	var sideGutterWidth = 50;

	var xDown = null;
	var yDown = null;

	React.useEffect(() => {
		if (touchSurface) {
			touchSurface.addEventListener('touchstart', handleTouchStart);
			touchSurface.addEventListener('touchmove', handleTouchMove);
		}
 
		return () => {
			if (touchSurface) {
				touchSurface.removeEventListener('touchstart', handleTouchStart);
				touchSurface.removeEventListener('touchmove', handleTouchMove);
			}
		}
	}, effectFlag);

	function getTouches(evt) {
		return evt.touches ||              // browser API
				evt.originalEvent.touches; // jQuery
	}

	function handleTouchStart(evt) {
		var firstTouch = getTouches(evt)[0];

		if (firstTouch.clientX > sideGutterWidth && firstTouch.clientX < (window.innerWidth-sideGutterWidth)
				&& firstTouch.clientY > sideGutterWidth && firstTouch.clientY < (window.innerHeight-sideGutterWidth)) {
			xDown = firstTouch.clientX;
			yDown = firstTouch.clientY;
		} else {
			xDown = null;
			yDown = null;
		}
	}

	function handleTouchMove(evt) {
		if (!xDown || !yDown) {
			return;
		}

		var firstTouch = getTouches(evt)[0];

		var xUp = firstTouch.clientX;
		var yUp = firstTouch.clientY;

		var xDiff = xDown - xUp;
		var yDiff = yDown - yUp;

		if (xDown > 0 && xDown < window.innerWidth
				&& yDown > 0 && yDown < window.innerHeight
				&& (Math.abs(xDiff) > 10 || Math.abs(yDiff) > 10)) {
			if (Math.abs(xDiff) > Math.abs(yDiff)) {
				if (xDiff > 0)
					handleSwipe('swipeLeft');
				else
					handleSwipe('swipeRight');
			} else {
				if (yDiff > 0)
					handleSwipe('swipeUp');
				else
					handleSwipe('swipeDown');
			}

			/* reset values */
			xDown = null;
			yDown = null;
		}
	}
}
