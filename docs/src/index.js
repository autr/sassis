import App from './App.svelte'
import Shorthand from './views/Shorthand.svelte'
import Layouts from './views/Layouts.svelte'
import FormFields from './views/FormFields.svelte'
import Texts from './views/Texts.svelte'
import Colours from './views/Colours.svelte'
import Introduction from './views/Introduction.svelte'
import { routes } from 'svelte-hash-router'

const app = new App({
	target: document.body
})


routes.set({
	'/': Introduction,
	'/Shorthand': Shorthand,
	'/Layouts': Layouts,
	'/FormFields': FormFields,
	'/Texts': Texts,
	'/Colours': Colours
})

export default app