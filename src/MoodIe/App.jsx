import React from 'react';
import { useGameState } from './GameState';
import GameBoard from './GameBoard';
import Keyboard from './Keyboard';
import Toolbar from './Toolbar';
import { GameStates } from './GameState';
import { $log, css } from '../helpers/dom-helpers';

export default function App() {
	const [count, setCount] = React.useState(0);

	const game		= useGameState();
	const gameState	= game.state.gameState;

	function onKeyPress(key) {
		if (key == 'Enter')
			setCount(c => c+1);
		else
			setCount(0);

		game.onKeyPress(key);
	}

	return (
		<div className="appRoot">
			<div className="content">
				<Toolbar />
				{count >= 3 &&
					<div>{game.state.secretWord}</div>
				}
				<GameBoard game={game} />
				<Keyboard disabled={gameState == GameStates.Scoring || gameState == GameStates.Finished} lettersUsed={game.state.lettersUsed} onKeyPress={onKeyPress} />
			</div>
		</div>
	)
}
App.displayName = 'App';
