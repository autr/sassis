<script>
	import { root } from '../stores.js'
	import CodeEditor from '../components/CodeEditor.svelte'
	import readme from '../intro.js'

	$: height = `min-height: calc( ${$root.split('\n').length} * var(--line-height) )`

	function onCode( e ) {
		$root = e.detail
	}
</script>

<div class="p1">
	<div>SASSIS is a SASS / CSS library and boilerplate for shorthand frontend styling.</div>
	<div>It can be loaded as a single minified CSS file, or included as SASS mixins.</div>
	<div>Use Cmd/Ctrl+F to search through available mixins and classes.</div>
	<div class="ptb2">
		<a class="alert button" href="https://github.com/autr/sassis" target="_blank">github</a>
		<a class="bright button" href="#/layouts">layouts</a>
		<a class="error button" href="#/variables">variables</a>
		<a class="info button" href="#/download">download</a>
	</div>
	<div>Created by <a href="https://autr.tv" class="bb1-solid" target="_blank">G.Sinnott</a></div>

</div>

