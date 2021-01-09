<script>
	import api from './api.js'
	$: title = ( l ) => '.' + l.join(', .')
</script>

<table class="grow">

	{#each api as sect}

		{#if !sect.data  }

			<tr id={sect.id} class="filled bright" >
				<td class="p0-8">{sect.id}</td>
				<td></td>
			</tr>

		{:else}

				{#each sect.data as line}
					<tr class="bb1-solid fade cptb1">
						<td>
							<a class="class plain" title={title(line[0])}>
								<span>{title(line[0])}</span>
							</a>
						</td>
						<!-- <td>
						</td> -->
						<td>
							{#each line[1] as rule}
								<div class="rule plain">{rule}</div>
							{/each}

						</td>
						<!-- <td class="error">
							{JSON.stringify( line )}
						</td> -->
					</tr>
				{/each}

		{/if}

	{/each}


</table>