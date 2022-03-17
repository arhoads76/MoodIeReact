import React from 'react';
import { $log, css } from '../helpers/dom-helpers';

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
