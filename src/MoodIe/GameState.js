import React from 'react';
import _ from 'underscore';
import dictionary from './dictionary';
import { encode, decode} from './base64';
import { $log, css, getQueryString } from '../helpers/dom-helpers';

export const GameStates = {
	Guessing: 0,
	Scoring: 1,
	Finished: 2,
}

export const RowStates = {
	Editing: 0,
	Pending: 1,
	Locked: 2,
}

export const LetterClues = {
	Editing: 0,
	Absent: 1,
	Elsewhere: 2,
	Correct: 3,
}

export const MaxGuesses = 6;

export function useGameState() {
	const [state, dispatch] = React.useReducer(gameStateReducer, 5, makeInitialGameState);

	function onHintCleared() {
		dispatch({ type:'ClearHint' });
	}
	function onKeyPress(key) {
		dispatch({ type:'KeyPress', key:key });
	}
	function onScoringCompleted() {
		dispatch({ type:'ScoringCompleted' });
	}
	function onWordLengthChanged(wordLength) {
		dispatch({ type:'ChangeWordLength', wordLength })
	}

	return {
		state,

		onHintCleared,
		onKeyPress,
		onScoringCompleted,
		onWordLengthChanged,
	}
}

function makeInitialGameState(wordLength) {
	return {
		secretWord: pickSecretWord(wordLength),
		wordLength,
		rows: [makeInitialRowState()],
		lettersUsed: {},
		activeRow: 0,
		hint: '',
		gameState: GameStates.Guessing,
		isCorrect: false,
	}
}
function makeInitialRowState() {
	return {
		letters: [],
		isValidWord: false,
		rowState: RowStates.Editing,
	}
}
function pickSecretWord(wordLength) {
	var word		= '';
	var queryString	= getQueryString();

	if (queryString.challenge) {
		word = decode(queryString.challenge);
	} else {
		var validWords	= _.filter(dictionary, word => (word.length == wordLength && word[0] != '*'));
		var randomValue	= queryString.seed ? mulberry32(Number(queryString.seed)) : Math.random();

		word = validWords[Math.floor(validWords.length * randomValue)];
	}

	return word;
}
function mulberry32(seed) {
	var t = (seed += 0x6d2b79f5);
	t = Math.imul(t ^ (t >>> 15), t | 1);
	t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function isValidWord(letters) {
	var test 	= _.map(letters, letter => letter.value).join('');
	var found 	= _.find(dictionary, word => test == word);

	return !!found;
}

export function gameStateReducer(state, action) {
	switch (action.type) {
		case 'KeyPress':			{ state = onKeyPress(state, action.key); break; }
		case 'ScoringCompleted':	{ state = onScoringCompleted(state); break; }
		case 'ClearHint': 			{ state = clearHint(state); break; }
		case 'ChangeWordLength':	{ state = makeInitialGameState(action.wordLength); break }
	}
	return state;

	function addLetter(state, letter) {
		var row = state.rows[state.activeRow];
		row = {...row, letters:[...row.letters]}

		row.letters.push({ value:letter, clue:LetterClues.Editing });

		if (row.letters.length == state.wordLength)
			row.isValidWord = isValidWord(row.letters);

		var rows = [...state.rows];
		rows[state.activeRow] = row;

		var newState = {...state, rows };
		return newState;
	}
	function removeLetter(state) {
		var row = state.rows[state.activeRow];
		row = {...row, letters:row.letters.slice(0, row.letters.length-1), isValidWord:undefined };

		var rows = [...state.rows];
		rows[state.activeRow] = row;

		var newState = {...state, rows };
		return newState;
	}
	function scoreGuess(state) {
		var row = state.rows[state.activeRow];

		if (!row.isValidWord) {
			if (row.letters.length < state.wordLength)
				return setHint(state, 'Too short');
			else
				return setHint(state, 'Not a valid word');
		}

		row = {...row, letters:[...row.letters] };

		var word	= _.map(row.letters, letter => letter.value).join('');
		var target	= state.secretWord;

		var elusive	= [];
		_.each(target.split(''), (letter, i) => {
			if (word[i] !== letter)
				elusive.push(letter);
		});

		for (var i in row.letters) {
			if (target[i] === row.letters[i].value) {
				row.letters[i].clue = LetterClues.Correct;
			} else {
				var pos = elusive.indexOf(row.letters[i].value);
				if (pos >= 0) {
					row.letters[i].clue = LetterClues.Elsewhere;
					elusive[pos] = ''; // "use it" so we don't clue the same letter twice
				} else {
					row.letters[i].clue = LetterClues.Absent;
				}
			}
		}

		row.rowState = RowStates.Pending;

		var rows = [...state.rows];
		rows[state.activeRow] = row;

		var lettersUsed	= updateLettersUsed(state.lettersUsed, row);
		var isCorrect	= _.all(row.letters, l => l.clue == LetterClues.Correct);

		var newState = {...state, rows, lettersUsed, gameState:GameStates.Scoring, isCorrect };
		return newState;
	}
	function updateLettersUsed(lettersUsed, row) {
		lettersUsed = {...lettersUsed};

		for (var i in row.letters) {
			var letter = row.letters[i];

			if (!lettersUsed[letter.value] || lettersUsed[letter.value] < letter.clue)
				lettersUsed[letter.value] = letter.clue;
		}

		return lettersUsed;
	}
	function setHint(state, hint) {
		var newState = {...state, hint };
		return newState;
	}
	function clearHint(state) {
		var newState = {...state, hint:'' };
		return newState;
	}
	function onKeyPress(state, key) {
		if (key == 'Enter') {
			state = scoreGuess(state);
		} else if (key == 'Backspace') {
			state = removeLetter(state);
		} else {
			key = key.toLowerCase();

			if (key >= 'a' && key <= 'z')
				state = addLetter(state, key);
		}

		return state;
	}
	function onScoringCompleted(state) {
		var newState = {...state};

		if (newState.isCorrect || newState.rows.length == 6)
			newState.gameState = GameStates.Finished;
		else
			newState.gameState = GameStates.Guessing;

		newState.rows = [...newState.rows];
		newState.rows[newState.rows.length-1].rowState = RowStates.Locked;
		newState.rows.push(makeInitialRowState());
		newState.activeRow++;

		return newState;
	}
}
