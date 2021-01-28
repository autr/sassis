<script>
	import data from '../data.js'
	import fields from '../fields.js'
	import { active, params } from 'svelte-hash-router'


	export let name = 'shorthand'
	export let filters = []
	export let items

	$: className = ( operator, section ) => {
		let o = html( operator[0].map( s => s[0] == '+' ? s : '.'+s ).join(`, <br />` ))
		if ( section.mixins == '.' ) return o.replaceAll('.', '<span class="info">[.|+]</span>')
		return o
	}
	$: id = ( operator ) => `${sanitise( operator[0][0] )}`
	$: sanitise = ( lines ) => {
		return lines
			.replaceAll(/[.+,~|()<>$]/g, '')
			.replaceAll(/[\ [\]]/g, '-')
			.replaceAll(/{alert}|{info}|{end}|{succ}/gi, '')
			.replaceAll('--', '-')
	}
	$: html = ( rule ) => {
		rule = rule.replaceAll('{alert}', '<span class="alert">')
		rule = rule.replaceAll('{info}', '<span class="info">')
		rule = rule.replaceAll('{succ}', '<span class="success">')
		rule = rule.replaceAll('{end}', '</span>')
		return rule
	}

	$: isSearching = items != undefined

	$: all = (isSearching) ? items : data.concat( fields )

	$: _filtered = () => {

		if (!filters || filters?.length == 0) return all
		return all.filter( d => filters.indexOf(d.id) != -1 )
	}
	$: filtered = _filtered()

	function onClick( operator ) {
		window.location = `#${id( operator)}`
	}
</script>
{#if filtered.length == 1 && filtered[0].data.length == 0}
	<div class="p1 text-center">nothing to show</div>
{/if}
<table class="w100pc mt1">
	{#each filtered as section, ii}

		{#if !section.data  }

			<tr id={section.id} class:bt1-solid={ii>0} class="bb1-solid">
				<td colspan=3 class="text-center pb3" class:pt3={ii>0}>
					<span class="filled p0-4 plr2 bright">{section.id}</span>
				</td>
			</tr>

		{:else}

				{#each section.data as operator, i}
					<tr 
						id={ `/${name}/${id( operator )}` }
						class:b2-solid={ $params.id == id( operator ) }
						class="cptb1" 
						class:bt1-solid={ i > 0 }>
<!-- 
						{#if !isSearching}

							<td 
								on:click={ e => window.location = `#/${name}/${id( operator )}`}
								class="plr1 br1-solid pointer" width="0px" >
								<a 
									class:cross={$params.id == id( operator )}
									class="w1em h1em b1-solid flex" 
									href={`#/${name}/${id( operator )}`}><span /></a>
							</td>

						{/if} -->


						<td class="br1-solid">
							{#if section.raw}
								<span class="newlines">{ operator[0].join('\n') }</span>
							{:else}
								<span>{@html className( operator, section  ) }</span>
							{/if}
						</td>
						<td class="bright pl1 ">
							{#each operator[1] as rule}
								<div class="rule">{@html html(rule)}</div>
							{/each}

						</td>
					</tr>
				{/each}

		{/if}

	{/each}


</table>
