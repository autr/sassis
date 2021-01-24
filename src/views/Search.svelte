<script>
	import ShorthandTable from '../components/ShorthandTable.svelte'
	let search
	import data from '../data.js'
	import fields from '../fields.js'
	let concated = data.concat( fields )
	$: _items = () => {
		let out = {
			type: 'table',
			id: 'search-results',
			data: []
		}
		if (!search) return [out]
		const parts = search.split(' ')
		data.concat( fields ).forEach( item => {
			if (!item.data) return
			if (search.length < 2) return
			for (let i = 0; i < item.data.length; i++ ) {
				let matches = 0
				for (let ii = 0; ii < item.data[i].length ; ii++ ) {
					for (let iii = 0; iii < item.data[i][ii].length ; iii++ ) {
						const str = item.data[i][ii][iii]
						parts.forEach( s => {
							matches += str.indexOf( s ) != -1 ? 1 : 0
							matches += ('.'+str).indexOf( s ) != -1 ? 1 : 0
						})
					}
				}
				item.data[i].sort = matches
				if (matches > 0) out.data.push( item.data[i] )
			}
		})

		out.data.sort( (a, b) => b.sort - a.sort )
		return [out]

	}

	$: items = _items()
</script>

<div class="flex column ptb1 grow">
	<input type="text" bind:value={search} placeholder="search terms" />
	<ShorthandTable {items} />
</div>