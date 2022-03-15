import React from 'react';

export function useReducer(reducer, initValue, init) {
	var [state, _dispatch] = React.useReducer(reducer, initValue, init);

	function dispatch(action, data) {
		if (typeof action == 'string')
			_dispatch({ type:action, data });
		else if (typeof action == 'function')
			action(dispatch);
		else
			_dispatch(action);
	}

	return [state, dispatch];
}
export function applyReducerMiddleware(middleware) {
	return (reducerState) => {
		const stateRef = React.useRef();
		stateRef.current = reducerState[0];

		function getState() {
			return stateRef.current;
		}

		var store = { store:stateRef.current, getState };
		var enhancedDispatch = applyMiddleware(...middleware)(store)(reducerState[1]);

		return [stateRef.current, enhancedDispatch];
	}
}
export function useReducerStore(reducerState, ...middleware) {
	const stateRef = React.useRef();
	stateRef.current = reducerState[0];

	function getState() {
		return stateRef.current;
	}

	var store				= { store:stateRef.current, getState };
	var enhancedDispatch	= applyMiddleware(...middleware)(store)(reducerState[1]);

	return { state:stateRef.current, getState, dispatch:enhancedDispatch };
}

export function createStore(spec) {
	var storeDef = buildReducer(spec);
	return storeDef;
}
export function useStore(storeDef, middleware, attachActions) {
	if (middleware === true) {
		attachActions	= true;
		middleware		= undefined;
	}

	const [state, setState] = React.useState(storeDef.initialState || storeDef.getInitialState);

	const draftState = React.useRef();
	draftState.current = state;

	var store = {
		state,
		getState,
		dispatch,
		actions: storeDef.actions,
	};

	if (attachActions) {
		var keys = Object.keys(storeDef.actions);
		for (var i in keys) {
			const key = keys[i];
			const action = storeDef.actions[key];
			store[key] = (...args) => dispatch(action(...args));
		}
	}

	function getState() {
		return draftState.current;
	}
	function dispatch(action, data) {
		if (typeof action == 'string')
			action = { type:action, data };

		var enhancedDispatch = middleware ? middleware(store)(innerDispatch) : innerDispatch;
		enhancedDispatch(action, data);
	}
	function innerDispatch(action, data) {
		if (typeof action == 'function') {
			innerDispatch(action());
		} else if (action instanceof Promise) {
			action.then(result => innerDispatch(result));
		} else {
			setState(s => {
				var nextState = storeDef.reducer(s, action);
				draftState.current = nextState;
				return nextState;
			});
		}
	}

	return store;
}
export function createStoreContext(storeDef, middleware) {
	const Store = React.createContext();

	function StoreProvider(props) {
		const store = useStore(storeDef, middleware);

		return (
			<Store.Provider value={store}>
				{props.children}
			</Store.Provider>
		)
	}

	return {
		Store,
		StoreProvider,
	}
}
export function useStoreContext(Store) {
	return React.useContext(Store);
}

export function applyMiddleware(...middleware) {
	return (store) => {
		var _middleware = [];

		if (middleware.length == 1 && Array.isArray(middleware[0]))
			middleware = middleware[0];
		for (var i = 0; i < middleware.length; i++)
			_middleware.push(middleware[i](store));

		return compose(..._middleware);
	}
}
export function compose(...fns) {
	return (x) => {
		var res = x;

		if (fns.length == 1 && Array.isArray(fns[0]))
			fns = fns[0];
		for (var i = fns.length-1; i >= 0; i--)
			res = fns[i](res);

		return res;
	}
}

export function createReducer(spec) {
	var def = buildReducer(spec);
	return [def.reducer, def.initialState, def.actions];
}
export function createSlice(spec) {
	var def = buildReducer(spec);
	return {
		name:				def.name,
		caseReducers:		def.caseReducers,
		reducer:			def.reducer,
		actions:			def.actions,
		getInitialState:	typeof def.initialState == 'function' ? def.initialState : () => def.initialState
	}
}
export function buildReducer(spec) {
	if (typeof spec.reducer == 'function')
		return  spec.reducer;

	var caseReducers	= {};
	var actionCreators	= {};
	var actions			= spec.reducer || spec.reducers || spec.actions;
	var actionNames		= Object.keys(actions);

	for (var i in actionNames) {
		var actionName	= actionNames[i];
		var actionDef	= actions[actionName];
		var type		= createActionType(spec.name, actionName);

		var caseReducer;
		var prepareCallback;

		if (actionDef.name && actionDef.actions) {
			var childActionNames = Object.keys(actionDef.actions);

			for (var j in childActionNames) {
				var childActionName	= childActionNames[j];
				var childType		= createActionType(spec.name, childActionName);

				actionCreators[childActionName]	= (...args) => { var action = actionDef.actions[childActionName](...args); action.type = childType; return action; };
				caseReducers[childActionName]	= actionDef.reducer;
			}
		} else {
			if (Array.isArray(actionDef)) {
				prepareCallback	= actionDef[0];
				caseReducer		= actionDef[1];
			} else if (actionDef.reducer && actionDef.prepare) {
				prepareCallback	= actionDef.prepare;
				caseReducer		= actionDef.reducer;
			} else {
				caseReducer		= actionDef;
			}

			actionCreators[actionName]	= createAction(type, prepareCallback)
			caseReducers[actionName]	= caseReducer;
		}
	}

	function reducer(state, action) {
		if (spec.name) {
			var actionName = action.type.split('/').slice(1).join('/');
			action.type = actionName;
		}

		if (caseReducers[actionName]) {
			if (spec.useActionPayload && action.payload && Array.isArray(action.payload))
				return caseReducers[actionName](state, ...action.payload);
			else if (spec.useActionPayload && action.payload)
				return caseReducers[actionName](state, action.payload);
			else
				return caseReducers[actionName](state, action);
		} else if (state) {
			return state;
		} else  {
			return (typeof spec.initialState == 'function' ? spec.initialState() : {...(spec.initialState || {})});
		}
	}

	return {
		name: spec.name,
		initialState: spec.initialState,
		actions: actionCreators,
		reducer,
	}
}

function createActionType(storeName, actionName) {
	if (storeName)
		return storeName + '/' + actionName;
	else
		return actionName;
}
function createAction(type, prepareCallback) {
	if (prepareCallback)
		return (...args) => ({ type, ...prepareCallback(...args) });
	else
		return (...args) => ({ type, payload:args ? (args.length > 1 ? [...args] : args[0]) : undefined });
}
