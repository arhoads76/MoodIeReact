import React from 'react';
import _ from 'underscore';
import { $log, css, preventDefault } from '../helpers/dom-helpers';
import { LetterClues } from './GameState';

const keyboardKeys = [
	["Q","W","E","R","T","Y","U","I","O","P"],
	["A","S","D","F","G","H","J","K","L"],
	["Backspace", "Z","X","C","V","B","N","M", "Enter"]
]

export default function Keyboard(props) {
	var lettersUsed	= props.lettersUsed;

	React.useEffect(() => {
		document.addEventListener('keydown', onKeyDown);
		document.addEventListener('keypress', onKeyPress);

		return () => {
			document.removeEventListener('keydown', onKeyDown);
			document.removeEventListener('keypress', onKeyPress);
		}
	}, []);

	function onKeyDown(e) {
		if (props.disabled)
			return;

		var key = e.key;
		if (props.onKeyPress && key == 'Backspace') {
			preventDefault(e);
			props.onKeyPress(key);
		}
	}
	function onKeyPress(e) {
		preventDefault(e);

		if (props.disabled)
			return;

		var key = e.key;
		if (props.onKeyPress && (key == 'Enter' || key >= 'a' && key <= 'z' || key >= 'A' && key <= 'Z'))
			props.onKeyPress(key);
	}
	function onKeyClick(e) {
		preventDefault(e);

		if (props.disabled)
			return;

		var key = e.target.getAttribute('rel') || e.target.parentElement.getAttribute('rel') || e.target.parentElement.parentElement.getAttribute('rel');
		if (props.onKeyPress)
			props.onKeyPress(key);
	}
	function isLetterStatus(letter, status) {
		return lettersUsed[letter.toLowerCase()] == status;
	}

	return (
		<div className={css("keyboard", { 'disabled':props.disabled })}>
			{_.map(keyboardKeys, (row,i) => (
				<div key={i} className="keys">
					{_.map(row, key => (
						<div key={key} className={css("key", {
														'large':key == 'Enter' || key == 'Backspace',
														'absent':isLetterStatus(key, LetterClues.Absent),
														'elsewhere':isLetterStatus(key, LetterClues.Elsewhere),
														'correct':isLetterStatus(key, LetterClues.Correct)
													})} rel={key} onClick={onKeyClick}>{
							key == 'Enter' ?
								<span><i className="fa fa-rocket" /></span>
							: key == 'Backspace' ?
								<span><i className="fa fa-arrow-left" /></span>
							:
								<span>{key}</span>
						}</div>
					))}
				</div>
			))}
		</div>
	)
}
Keyboard.displayName = 'Keyboard';
