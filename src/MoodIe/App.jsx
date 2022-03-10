import React from 'react';
import { useGameState } from './GameState';
import GameBoard from './GameBoard';
import Keyboard from './Keyboard';
import Toolbar from './Toolbar';
import { GameStates } from './GameState';
import { $log, css } from '../helpers/dom-helpers';

export default function App() {
	const game		= useGameState();
	const gameState	= game.state.gameState;

	return (
		<div className="appRoot">
			<div className="content">
				<Toolbar />
				<GameBoard game={game} />
				<Keyboard disabled={gameState == GameStates.Scoring || gameState == GameStates.Finished} lettersUsed={game.state.lettersUsed} onKeyPress={onKeyPress} />
			</div>
		</div>
	)
}
App.displayName = 'App';
