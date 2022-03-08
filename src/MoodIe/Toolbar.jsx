import React from 'react';
import { $log, css } from '../helpers/dom-helpers';

export default function Toolbar() {

	return (
		<div className="toolbar">
			<i className="fa fa-moon" />
			<h2>MoodIe React</h2>
		</div>
	)
}
Toolbar.displayName = 'Toolbar';
