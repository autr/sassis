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
	'/themes+colours': Variables,
	'/basic-utils': Basic,
	'/basic-utils/:id': Basic,
	'/dimensions': Sizing,
	'/dimensions/:id': Sizing,
	'/margin+padding': Spacing,
	'/margin+padding/:id': Spacing,
	'/layouts': Layouts,
	'/layouts/:id': Layouts,
	'/user-interface': FormFields,
	'/user-interface/:id': FormFields,
	'/fonts': Type,
	'/fonts/:id': Type,
	'/search': Search,
	'/download': Download
})

export default app