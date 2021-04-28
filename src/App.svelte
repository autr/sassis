<script>
	import { onMount } from 'svelte'
	import infos from './infos.js'
	import { Router, routes, params, active } from 'svelte-hash-router'
	import { root } from './stores.js'
	import hotkeys from 'hotkeys-js'

	onMount(async () => {
		const res = await fetch(`/defaults.css`)
		const text = await res.text()
		$root = '<style>'+text+'</style >'
		hotkeys('ctrl+f,cmd+f', function(event, handler){
			console.log('!!!!')
			event.preventDefault() 
			window.location = '/#/search'
			setTimeout( e => {
				document.getElementById('search').focus()
			}, 10)
		});
	})


	$: date = (new Date()).getDate() + "/" + ((new Date()).getMonth() + 1) + "/" + ((new Date()).getFullYear() - 2000);

</script>

<!-- utilitatian -->
<main>

	{@html $root}
	<div class="margin-auto align-self-center w100vw flex justify-content-center h100vh overflow-hidden">
		<div class="flex basis20em grow justify-content-flex-end overflow-auto">
			<div class="flex column p1 maxw15em grow justify-content-between">
				<div class="flex column">
					<div class="bright f5 pb0">SASSIS</div>
					{#each Object.entries($routes) as [k,v]}
						{#if v.$$href != '#/' && v.$$href.indexOf(':') == -1}
							<div 
								class="p0-4 bright pointer"
								class:alert={ k == '/intro'}
								class:mt1={ k == '/search'}
								class:info={ k == '/search' || k == '/download'}
								class:error={ k == '/variables' }
								on:click={ e => window.location = v.$$href }
								class:filled={ $active.$$href.indexOf( v.$$href ) != -1 } 
								class:bright={ $active.$$href.indexOf( v.$$href ) != -1 }>
								{k.substring(1)}
							</div>
						{/if}
					{/each}
				</div>
				<div>
					<div class="bright">v{infos.package.version} <span class="fade">{date}</span></div>
				</div>
			</div>

		</div>
		<div class="flex basis60em overflow-auto grow">
			<div class="flex maxw60em grow pt1">
				<Router />  
			</div>
		</div>
	</div>
</main>

