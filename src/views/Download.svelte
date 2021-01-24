<script>
	import infos from '../infos.js'

</script>

<div class="p1 grow">
	{#each Object.entries(infos.downloads) as [name, file]}
		<div class="flex mb2">
			<div class="basis40pc">
				<div >{name}</div>
			</div>
			<div class="flex mb1 grow flex-column">
				{#each Object.entries(file) as [name, o]}
					<a 
						class:alert={name == 'full'}
						class:info={name == 'min'}
						class:success={name == 'gz'}
						href={o.basename} 
						class="basis0 mb1 grow button" 
						target="_blank">
						{o.basename} <span class="fade">({ parseInt(o.size / 1000)}kb)</span>
					</a>
				{/each}
			</div>
		</div>
	{/each}
</div>