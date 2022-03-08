import React from 'react';
import { useGameState } from './GameState';
import GameBoard from './GameBoard';
import Keyboard from './Keyboard';
import Toolbar from './Toolbar';
import { $log, css } from '../helpers/dom-helpers';

export default function App() {
	const game = useGameState();

	var gameState	= game.state.gameState;
	var GameStates	= game.GameStates;
	var LetterClues	= game.LetterClues;

	function onKeyPress(key) {
		game.onKeyPress(key);
	}

	return (
		<div className="appRoot">
			<div className="content">
				<Toolbar />
				<GameBoard game={game} />
				<Keyboard disabled={gameState == GameStates.Scoring} lettersUsed={game.state.lettersUsed} LetterClues={LetterClues} onKeyPress={onKeyPress} />
			</div>
		</div>
	)
}
App.displayName = 'App';
