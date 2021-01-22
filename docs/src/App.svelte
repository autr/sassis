<script>
	import { Router } from 'svelte-hash-router'
	import { root } from './stores.js'

</script>

<!-- utilitatian -->
<main>

<div class="flex justify-content-center h100vh overflow-hidden">
	<div class="flex column cmb1 p1">
		SASSIS
	</div>
	{@html $root}
	<Router /> 
</div>
</main>

