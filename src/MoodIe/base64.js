export function encode(text) {
	return window.btoa(text).replace(/\//g, "_").replace(/\+/g, "-").replace(/=*$/, "");
}

export function decode(text) {
	return window.atob(text.replace(/_/g, "/").replace(/-/g, "+"));
}
