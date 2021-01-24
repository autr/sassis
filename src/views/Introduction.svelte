<script>
	import { root } from '../stores.js'
	import CodeEditor from '../components/CodeEditor.svelte'
	import readme from '../readme.js'

	$: height = `min-height: calc( ${$root.split('\n').length} * var(--line-height) )`

	function onCode( e ) {
		$root = e.detail
	}
</script>

<div class="p1">
{@html readme}
</div>