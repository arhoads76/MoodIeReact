import React from 'react';
import App from './App';
import { $log, bindOnce, getQueryString } from '../helpers/dom-helpers';

bindOnce('moodie-app', props => (
	<App {...props} />
));
