<script>
	import { onMount } from 'svelte'
	import infos from './infos.js'
	import { Router, routes, params, active } from 'svelte-hash-router'
	import { root } from './stores.js'
	import hotkeys from 'hotkeys-js'

	onMount(async () => {
		const res = await fetch(`defaults.css`)
		const text = await res.text()
		$root = '<style>'+text+'</style >'
		hotkeys('ctrl+f,cmd+f', function(event, handler){
			event.preventDefault() 
			window.location.hash = '#/search'
			setTimeout( e => {
				document.getElementById('search').focus()
			}, 10)
		});
	})


	$: date = (new Date()).getDate() + "/" + ((new Date()).getMonth() + 1) + "/" + ((new Date()).getFullYear() - 2000);

</script>

<!-- utilitatian -->
<main class="sassis">

	{@html $root}
	<div class="flex w100vw h100vh overflow-hidden row-center-flex-start">
		<div class="overflow-hidden flex row-center-flex-start grow">
			<div class="flex basis20em justify-content-flex-end overflow-auto h100vh">
				<div class="flex column p1 grow justify-content-between">
					<div class="flex column">
						<a href="#/intro" class="unclickable bright f5 pb0">SASSIS</a>
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
									{k.substring(1)} {k == '/search' ? '(cmd/ctrl+f)' : ''}
								</div>
							{/if}
						{/each}
					</div>
					<div>

						<div class="bright">
							v{infos.package.version} 
							<span class="fade">{date}</span>
							<a href="https://autr.tv" target="_blank">autr.tv</a>
						</div>
					</div>
				</div>

			</div>
			<div class="basis40em flex overflow-auto grow h100vh">
				<div class="flex maxw60em grow pt1">
					<Router />  
				</div>
			</div>
		</div>
	</div>
</main>

