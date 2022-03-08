import React from 'react';
import { $log, keyCodes } from './dom-helpers';

var _bindingList	= [];
var _bindkeyMatches	= [];
var _bindkeyLen		= 0;

document.addEventListener('keydown', keyhandler);

function keyhandler(e, prefix) {
	try
	{
		var code		= (e.altKey ? 'alt+' : '') + (e.ctrlKey ? 'ctrl+' : '') + keyCodes[e.keyCode];
		var bindkeys	= _bindkeyMatches.length > 0 ? _bindkeyMatches : _bindingList;
		var matches		= [];

		for (var i in bindkeys)
		{
			if (bindkeys[i].keys.length > _bindkeyLen)
			{
				var bindkey = bindkeys[i].keys[_bindkeyLen];
				if (bindkey == code)
				{
					matches.push(bindkeys[i]);
					if (bindkeys[i].keys.length == _bindkeyLen + 1)
						break;
				}
			}
		}

		if (matches.length == 0)
		{
			_bindkeyMatches	= [];
			_bindkeyLen		= 0;
		}
		else
		{
			if (matches[matches.length-1].keys.length == _bindkeyLen + 1)
			{
				_bindkeyMatches	= [];
				_bindkeyLen		= 0;

				var match = matches[matches.length-1];
				if (match.excludeInputs && isInputField(e))
					return;

				if (match.handler != undefined)
				{
					var result = match.handler(match.name);
					if (result)
						return;
				}
				else if (match.ref && match.ref.current)
				{
					if (match.ref.current.tagName == 'A' || match.ref.current.tagName == 'BUTTON')
						match.ref.current.click();
					else
						match.ref.current.focus();
				}
			}
			else
			{
				_bindkeyMatches = matches;
				_bindkeyLen++;
			}
		}
	}
	catch (ex)
	{
	}

	if (window.parent)
		forwardTo(window.parent, e);
}
function forwardTo(parent, e) {
	if (parent != window) {
		if (parent != undefined && parent.hotkeyKeyHandler != undefined)
			parent.hotkeyKeyHandler(e, '-> parent: ');
		else if (parent != undefined && parent.$ != undefined && parent.$.hotkeys != undefined)
			parent.$.hotkeys.keyhandler(e);
	}
}
function normalizeKeyName(name){
	if (name.indexOf('+', name.indexOf('+')+1) < 0)
		return name;
	if (name.indexOf('shift+') >= 0)
		name = 'shift+' + name.replace('shift+', '');
	if (name.indexOf('ctrl+') >= 0)
		name = 'ctrl+' + name.replace('ctrl+', '');
	if (name.indexOf('alt+') >= 0)
		name = 'alt+' + name.replace('alt+', '');
	return name;
}
function isInputField(event) {
	var target		= event.target || event.srcElement;
	var inputField	= target.isContentEditable
						|| target.tagName === 'TEXTAREA'
						|| ((target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') && !target.readOnly);

	return inputField;
}

export default function useHotkeys(hotkeyHandlers) {
	function bind(bindkeys, handler, ref) {
		if (typeof bindkeys == 'string')
			bindkeys = bindkeys.split(';');

		for (var i in bindkeys) {
			var keys = bindkeys[i].split(',');
			for (var k in keys)
				keys[k] = normalizeKeyName(keys[k]);

			_bindingList[_bindingList.length] = { name:bindkeys[i], keys, handler, ref };
		}
	}
	function unbind(bindkeys) {
		if (typeof bindkeys == 'string')
			bindkeys = bindkeys.split(';');

		for (var i in bindkeys) {
			var keys = bindkeys[i].split(',');
			for (var k in keys)
				keys[k] = normalizeKeyName(keys[k]);
			var searchKeys = keys.join(',');

			for (var j in _bindingList)  {
				var testKeys = _bindingList[j].keys.join(',');
				if (testKeys == searchKeys) {
					_bindingList.splice(j, 1);
					break;
				}
			}
		}
	}

	React.useEffect(() => {
		var haveKeys = false;

		for (var i in hotkeyHandlers) {
			haveKeys = true;

			var hotkey	= hotkeyHandlers[i].hotkey;
			var handler	= hotkeyHandlers[i].handler;
			var ref		= hotkeyHandlers[i].ref;

			bind(hotkey, handler, ref);
		}

		if (haveKeys) {
			window.hotkeyKeyHandler = keyhandler;
			window.hotkeyBindings = _bindingList;

			return () => {
				for (var i in hotkeyHandlers) {
					haveKeys = true;

					var hotkey	= hotkeyHandlers[i].hotkey;
					var handler	= hotkeyHandlers[i].handler;
					var ref		= hotkeyHandlers[i].ref;

					unbind(hotkey, handler, ref);
				}

				//if (_bindingList.length == 0) {
				//	document.removeEventListener('keydown', keyhandler);
				//	window.hotkeyKeyHandler = undefined;
				//}
			}
		}
	});
}
