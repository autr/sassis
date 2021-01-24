import App from './App.svelte'
import Layouts from './views/Layouts.svelte'
import FormFields from './views/FormFields.svelte'
import Type from './views/Type.svelte'
import Variables from './views/Variables.svelte'
import Introduction from './views/Introduction.svelte'
import Basic from './views/Basic.svelte'
import Spacing from './views/Spacing.svelte'
import Sizing from './views/Sizing.svelte'
import Search from './views/Search.svelte'
import Download from './views/Download.svelte'
import { routes } from 'svelte-hash-router'

const app = new App({
	target: document.body
})


routes.set({
	'/': Introduction,
	'/intro': Introduction,
	'/basic': Basic,
	'/basic/:id': Basic,
	'/sizing': Sizing,
	'/sizing/:id': Sizing,
	'/spacing': Spacing,
	'/spacing/:id': Spacing,
	'/layouts': Layouts,
	'/layouts/:id': Layouts,
	'/fields': FormFields,
	'/fields/:id': FormFields,
	'/type': Type,
	'/type/:id': Type,
	'/variables': Variables,
	'/search': Search,
	'/download': Download
})

export default app