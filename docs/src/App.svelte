<script>
	import api from './api.js'
	import Table from './Table.svelte'
	import Twelve from './Twelve.svelte'
	import GUI from './GUI.svelte'
	import Flex from './Flex.svelte'

	const themes = {
		'raw': [ 'none', 'aqua', 'fuscia', 'dark'],
		'terminal': ['light', 'dark'],
		'brainwash': ['creeper', 'muzak'],
		'skeueish': [ 'ives' ]
	}

	let theme = window.localStorage.getItem("sassis-theme") || Object.keys( themes )[0]
	let permutation = window.localStorage.getItem("sassis-permutation") || themes[theme][0]


</script>

<main class=" {theme} {theme}-{permutation}" id="main">


	<div class="flex">
		<div class="basis20pc">
			<div class="flex column cptb0-4">

				<h1 class="bright mr1">Crème de Sassis</h1>
				<div class="select">
					<select bind:value={theme} on:change={ e => { window.localStorage.setItem("sassis-theme", theme); permutation = themes[theme][0] } } >
						{#each Object.keys( themes ) as t}
							<option value={t} name={t}>{t}</option>
						{/each}
					</select>
				</div>
				<div class="select">
					<select 
						bind:value={permutation} 
						on:change={ e => window.localStorage.setItem("sassis-permutation", permutation) } >
						{#each themes[theme] as t}
							<option value={t} name={t}>{t}</option>
						{/each}
					</select>
				</div>

				<p>Lightweight SASS mixins and boilerplate, and shorthand CSS utilities (a bit like Tailwind, but less of it). Designed to be grokkable.</p>

				{#each api as sect}
					{#if !sect.data  }
						<a href="#{sect.id}">{sect.id}</a>
					{/if}
				{/each}
			</div>
		</div>
		<div class="grow">
			<Table />
			<div class="mb4">
				<Twelve />
			</div>
			<div class=" mb4">
				<GUI />
			</div>
			<div class=" mb4">
				<Flex />
			</div>
		</div>
	</div>

</main>

<style lang="sass" global>
@import '../../src/_index' 
html
	+reset
	+shorthand
	+gui-reset
	+fontsize( 12px ) 
	background: black
	main
		&.terminal
			+terminal-theme( false )
		&.raw
			+raw-theme
			&.raw-aqua
				+raw-theme( hsl( 190, 100%, 30% ) )
			&.raw-fuscia
				+raw-theme( hsl( 320, 90%, 40% ) )
			&.raw-dark
				+raw-theme( hsl( 200, 80%, 5% ) )
		&.brainwash
			+brainwash-theme


		font-family: monospace
		h1, h2, h3, h4, h5, h6
			font-family: Futura

		td
			padding: 0.4em 0em
</style>