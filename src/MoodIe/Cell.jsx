import React from 'react';
import _ from 'underscore';
import { $log, css, preventDefault } from '../helpers/dom-helpers';
import { LetterClues } from './GameState';

export default function Cell(props) {
	return (
		props.flip ?
			<div className={css("cell", { 'animate':props.animate })}>
				<span className="letter front">
					{(props.letter.value || '').toUpperCase()}
				</span>
				<span className={css("letter back", { 'correct':props.correct, 'elsewhere':props.elsewhere, 'absent':props.absent })}>
					{(props.letter.value || '').toUpperCase()}
				</span>
			</div>
		:
			<div className="cell">
				<span className={css("letter", { 'correct':props.correct, 'elsewhere':props.elsewhere, 'absent':props.absent })}>
					{(props.letter.value || '').toUpperCase()}
				</span>
			</div>
	)
}
Cell.displayName = 'Cell';
