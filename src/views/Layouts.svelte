<script>
	import ShorthandTable from '../components/ShorthandTable.svelte'
</script>



<div class="flex flex-column grow">
	<div class="cross minh10em flex row-center-center cs0-8">

		<div class="cross p1 b1-solid y-flex-start"></div>
		<div class="spacer" />
		<div class="cross p1 b1-solid y-stretch"></div>
		<div class="spacer" />
		<div class="cross p1 b1-solid y-flex-end"></div>

	</div>

	<ShorthandTable filters={['alignments', 'spacer', 'flex-basis', 'example']} name="layouts" />

	<div class="flex flex-row grow">
		<div class="flex b1-dashed grow w40 flex-column">
			
			<div class="grow b1-dotted flex flex-row">
				
				<div class="grow b1-dotted cross">
					
				</div>
				<span class="spacer s4 cross error" />
				<div class="grow b1-dotted cross">
					
				</div>
			</div>
			<span class="spacer s4 cross error" />
			<div class="grow b1-dotted cross">
				
			</div>
		</div>
		<span class="spacer s6 cross error" />
		<div class="flex flex-column b1-dashed grow">
			<div class="grow b1-dotted cross">
				
			</div>
			<span class="spacer s4 cross error" />
			<div class="grow b1-dotted cross">
				
			</div>
			<span class="spacer s4 cross error" />
			<div class="grow b1-dotted flex flex-column">
				<div class="cross grow" />
				<span class="spacer s4 cross error" />
				<div class="cross grow" />
			</div>
			<span class="spacer s4 cross error" />
			<div class="grow b1-dotted cross">
				
			</div>
		</div>
		<span class="spacer s8 cross error" />
		<div class="flex b1-dashed w20 cross">
			
		</div>

	</div>
</div>