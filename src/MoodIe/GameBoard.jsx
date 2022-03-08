import React from 'react';
import _ from 'underscore';
import { $log, css } from '../helpers/dom-helpers';

function makeBoardRows(game) {
	var boardRows	= [];
	var state		= game.state;

	for (var i = 0; i < game.MaxGuesses; i++) {
		if (i < state.activeRow) {
			var row = [];
			for (var j = 0; j < state.wordLength; j++)
				row.push(state.rows[i].letters[j]);
			boardRows.push(row);
		} else if (i == state.activeRow) {
			var activeRow = state.rows[state.activeRow];
			var row = [];
			for (var j = 0; j < state.wordLength; j++) {
				if (j < activeRow.letters.length)
					row.push(activeRow.letters[j]);
				else
					row.push({ });
			}
			boardRows.push(row);
		} else {
			var row = [];
			for (var j = 0; j < state.wordLength; j++)
				row.push({ });
			boardRows.push(row);
		}
	}

	return boardRows;
}

export default function GameBoard(props) {
	const [animateLetter, setAnimateLetter] = React.useState(-1);

	var animationTimer		= React.useRef();
	var animateLetterRef	= React.useRef();

	animateLetterRef.current = animateLetter;

	var game		= props.game;
	var boardRows	= makeBoardRows(game);

	var gameState	= game.state.gameState;
	var GameStates	= game.GameStates;
	var RowStates	= game.RowStates;
	var LetterClues	= game.LetterClues;

	React.useEffect(() => {
		if (gameState == GameStates.Scoring) {
			setAnimateLetter(0);
			animationTimer.current = setInterval(updateAnimatedLetter, 500);
		}
	}, [gameState]);

	function updateAnimatedLetter() {
		if (animateLetterRef.current < game.state.wordLength) {
			setAnimateLetter(x => x+1);
		} else {
			setAnimateLetter(-1);
			clearInterval(animationTimer.current);
			game.onScoringCompleted();
		}
	}

	return (
		<div className="gameBoard">
			{_.map(boardRows, (row,i) => {
				var isActiveRow	= i == game.state.activeRow;
				var invalidWord	= undefined;
				var rowState	= i < game.state.rows.length ? game.state.rows[i].rowState : 0;

				if (isActiveRow) {
					var activeRow = game.state.rows[i];
					if (activeRow.letters.length == game.state.wordLength)
						invalidWord = !activeRow.isValidWord;
				}

				return (
					<div key={i} className={css("guess", { 'invalidWord':invalidWord })}>
						{_.map(row, (letter,j) => (
							<div key={j} className={css("letter", {
														'animate':j == animateLetter,
														'correct':(rowState == RowStates.Locked || rowState == RowStates.Pending) && letter.clue == LetterClues.Correct,
														'elsewhere':(rowState == RowStates.Locked || rowState == RowStates.Pending) && letter.clue == LetterClues.Elsewhere,
														'absent':(rowState == RowStates.Locked || rowState == RowStates.Pending) && letter.clue == LetterClues.Absent })}>
								<span>{(letter.value || '').toUpperCase()}</span>
							</div>
						))}
					</div>
				)
			})}
		</div>
	)
}
GameBoard.displayName = 'GameBoard';
