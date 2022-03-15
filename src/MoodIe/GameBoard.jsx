import React from 'react';
import _ from 'underscore';
import { $log, css } from '../helpers/dom-helpers';
import { GameStates, RowStates, LetterClues, MaxGuesses } from './GameState';
import Cell from './Cell';

function makeBoardRows(game) {
	var boardRows	= [];
	var state		= game.state;

	for (var i = 0; i < MaxGuesses; i++) {
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

	React.useEffect(() => {
		if (gameState == GameStates.Scoring) {
			setAnimateLetter(-1);
			animationTimer.current = setInterval(updateAnimatedLetter, 800);
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
						{_.map(row, (letter,j) => {
							var animate = isActiveRow && j <= animateLetterRef.current;

							return (
								<Cell key={j}
										flip={isActiveRow && rowState == RowStates.Pending}
										animate={animate}
										correct={letter.clue == LetterClues.Correct}
										elsewhere={letter.clue == LetterClues.Elsewhere}
										absent={letter.clue == LetterClues.Absent}
										letter={letter}
									/>
							)
						})}
					</div>
				)
			})}

			{game.state.gameState == GameStates.Finished &&
				(game.state.isCorrect ?
					<div className="answer">
						Success!
					</div>
				:
					<div className="answer">
						The word was: {game.state.secretWord.toUpperCase()}
					</div>
				)
			}
		</div>
	)
}
GameBoard.displayName = 'GameBoard';
