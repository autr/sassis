<pre
	use:codedit={{ code, autofocus, loc, ...$$restProps }}
	class="language-{lang} grow"
	{style}
	on:change
></pre>

<script context="module">
	import { CodeJar } from './codejar.js'
	import { withLineNumbers } from './linenumbers.js'
	import Prism from 'prismjs'

	export function codedit(node, { code, autofocus = false, loc = false, ...options }) {

		const highlight = loc ? withLineNumbers( Prism.highlightElement ) : Prism.highlightElement

		const editor = CodeJar(node, highlight, options)

		editor.onUpdate( neuCode => {
			const e = new CustomEvent('change', { detail:  neuCode })
			node.dispatchEvent(e)
		})

		function update({ code, autofocus = false, loc = false, ...options }) {
			editor.updateOptions(options)
			if (editor.toString() !== code) {
				editor.updateCode(code)
			}
		}

		update({ code, autofocus, loc, ...options })

		autofocus && node.focus()

		return {
			update,
			destroy() {
				editor.destroy()
			}
		}
	}
</script>

<script>
	export let lang = ''
	export let code = ''
	export let autofocus = false
	export let loc = false
	export let style
</script>
