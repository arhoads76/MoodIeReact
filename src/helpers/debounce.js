export default function debounce(ctx, name, action, delay) {
	var now = new Date();
	ctx[name] = now;
	setTimeout(function(){
		if (ctx[name] == now)
			action();
	}, delay || 10);
}
