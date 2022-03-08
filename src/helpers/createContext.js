export function createContext(useHook) {
	let Context = React.createContext(null)

	function Provider(props) {
		let value = useHook()
		return <Context.Provider value={value}>{props.children}</Context.Provider>
	}

	function context() {
		let value = React.useContext(Context)
		if (value === null) {
			throw new Error("Component must be wrapped with <Container.Provider>")
		}
		return value
	}

	return { Provider, context }
}
