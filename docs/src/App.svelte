<script>
	import Table from './Table.svelte'
	import Twelve from './Twelve.svelte'
	import GUI from './GUI.svelte'
	import Flex from './Flex.svelte'
	// let className;
 
	// // creates a `class` property, even
	// // though it is a reserved word 
	// export { className as class };


	const themes = {
		'raw': [ 'none', 'aqua', 'fuscia', 'dark'],
		'terminal': ['light', 'dark'],
		'brainwash': ['creeper', 'muzak'],
		'skeueish': [ 'ives' ]
	}

	let theme = window.localStorage.getItem("sassis-theme") || Object.keys( themes )[0]
	let permutation = window.localStorage.getItem("sassis-permutation") || themes[theme][0]


</script>

<main class="p1 {theme} {theme}-{permutation}" id="main">
	<header class="flex flex-row align-items-center">
		<h1 class="bright mr1">Crème de Sassis</h1>
		<div class="select">
			<select bind:value={theme} on:change={ e => { window.localStorage.setItem("sassis-theme", theme); permutation = themes[theme][0] } } >
				{#each Object.keys( themes ) as t}
					<option value={t} name={t}>{t}</option>
				{/each}
			</select>
		</div>
		<div class="select">
			<select bind:value={permutation} on:change={ e => window.localStorage.setItem("sassis-permutation", permutation) } >
				{#each themes[theme] as t}
					<option value={t} name={t}>{t}</option>
				{/each}
			</select>
		</div>
	</header>
	<p class="mb1">Lightweight SASS mixins and boilerplate, and shorthand CSS utilities (a bit like Tailwind, but less of it). Designed to be grokkable.</p>
	<div class="mb4">
		<Table />
	</div>
	<div class="mb4">
		<Twelve />
	</div>
	<div class=" mb4">
		<GUI />
	</div>
	<div class=" mb4">
		<Flex />
	</div>
</main>

<style lang="sass" global>
@import '../../src/_index'
html
	@include reset()
	@include shorthand()
	@include fontsize(13px)

	main
		&.terminal
			@include terminal-theme( false )
		&.raw
			@include raw-theme
			&.raw-aqua
				@include raw-theme( hsl( 190, 100%, 30% ) )
			&.raw-fuscia
				@include raw-theme( hsl( 320, 90%, 40% ) )
			&.raw-dark
				@include raw-theme( hsl( 200, 80%, 5% ) )
		&.brainwash
			@include brainwash-theme


		font-family: monospace
		h1, h2, h3, h4, h5, h6
			font-family: Futura

		td
			padding: 0.4em 0em
</style>