<script>
	import { root } from '../stores.js'

	$: height = `min-height: calc( ${$root.split('\n').length} * var(--line-height) )`

</script>


	<div class="basis0 h100vh overflow-auto p1">
		<textarea 
			bind:value={$root} 
			class="b0-solid p0 minw40em" 
			style={height} />
	</div>
	<div class="flex column p1 cmr1 monospace grow cmb1 maxw40em overflow-auto h100vh">
		<input type="text" placeholder="Enter some text" />
		<label class="checkbox">
			<input type="checkbox" />
			checkbox
		</label>
		<div class="select">
			<select>
				<option>option a </option>
				<option>option b </option>
				<option>option c </option>
			</select>
		</div>
		<button>button</button>
		<button class="success">success</button>
		<button class="info">info</button>
		<button class="error">error</button>
		<button class="alert">alert</button>
		<button class="filled">filled</button>
		<div class="flex">
			<div class="p2 pop grow">pop</div>
			<div class="p2 sink grow">sink</div>
		</div>
	</div>
