<script>
	import { root } from '../stores.js'
	import CodeEditor from '../components/CodeEditor.svelte'

	$: height = `min-height: calc( ${$root.split('\n').length} * var(--line-height) )`

	function onCode( e ) {
		$root = e.detail
	}

	let radios
</script>

<div class="ptb1 pr1 flex h100vh overflow-auto minw32em">

    <CodeEditor 
    	bind:code={$root} 
    	loc={true} 
    	style={height}
    	autofocus={false}
    	on:change={ onCode }
    	lang="javascript" />
</div>
<div class="ptb1 pr1 flex column cmb1 h100vh overflow-auto">
	<div class="flex">
		<label class="color grow mr1">
			<input type="color" value="#ff0000"/>
		</label>
		<label class="color grow mr1">
			<input type="color" value="#ff00ff"/>
		</label>
		<label class="color grow mr1">
			<input type="color" value="#0000ff"/>
		</label>
		<label class="color grow mr1">
			<input type="color" value="#00ffff"/>
		</label>
		<label class="color grow mr1">
			<input type="color" value="#00ff00"/>
		</label>
		<label class="color grow">
			<input type="color" value="#ffff00"/>
		</label>
	</div>
	<div class="flex">
		<div class="align-items-baseline rel">
			<div class="b1-solid plr0-8 h1">h1</div>
			<div class="b1-solid plr0-8 h2">h2</div>
			<div class="b1-solid plr0-8 h3">h3</div>
			<div class="b1-solid plr0-8 h4">h4</div>
			<div class="b1-solid plr0-8 h5">h5</div>
			<div class="b1-solid plr0-8 h6">h6</div>
		</div>
		<div class="justify-content-flex-end text-right">
			<div class="b1-solid plr0-8 f0">f0</div>
			<div class="b1-solid plr0-8 f1">f1</div>
			<div class="b1-solid plr0-8 f2">f2</div>
			<div class="b1-solid plr0-8 f3">f3</div>
			<div class="b1-solid plr0-8 f4">f4</div>
			<div class="b1-solid plr0-8 f5">f5</div>
		</div>
		<div class="flex grow pl1 column">
			<div class="flex align-items-center justify-content-center pop grow">pop</div>
			<div class="mt1 flex align-items-center justify-content-center  align-content-center sink grow">sink</div>
		</div>
		<div class="flex grow pl1 column">
			<div class="flex align-items-center justify-content-center  align-content-center bg-a grow">bg-a</div>
			<div class="mt1 flex align-items-center justify-content-center  align-content-center bg-b grow">bg-b</div>
			<div class="mt1 flex align-items-center justify-content-center  align-content-center bg-c grow">bg-c</div>
			<div class="mt1 flex align-items-center justify-content-center  align-content-center bg-d grow">bg-d</div>
			<div class="mt1 flex align-items-center justify-content-center  align-content-center bg-e grow">bg-e</div>

		</div>
	</div>
	<div class="flex">
		<input type="text" class="grow" placeholder="text" />
		<input class="grow ml1" type="number" placeholder="number" />
	</div>


	<div class="flex">
		<label class="checkbox">
			<input type="checkbox" checked />
			<span />
			checkbox
		</label>
		<label class="radio">
			<input type="checkbox" checked />
			<span />
			checkbox
		</label>
	</div>

	<div class="flex">
		<label class="checkbox">
			<input type="radio" checked name="checkradios" value="a" />
			<span />
			radio a
		</label>
		<label class="checkbox">
			<input type="radio" name="checkradios" value="b" />
			<span />
			radio b
		</label>
		<label class="checkbox">
			<input type="radio" name="checkradios" value="c" />
			<span />
			radio c
		</label>
	</div>
	<div class="flex">
		<label class="radio">
			<input type="radio" checked name="radioradios" value="a" />
			<span />
			radio a
		</label>
		<label class="radio">
			<input type="radio" name="radioradios" value="b" />
			<span />
			radio b
		</label>
		<label class="radio">
			<input type="radio" name="radioradios" value="c" />
			<span />
			radio c
		</label>
	</div>
	<div class="select">
		<select>
			<option>option a </option>
			<option>option b </option>
			<option>option c </option>
		</select>
	</div>

	<div class="flex">
		<input class="grow mr1" type="range" value=50 min=0 max=100 />
		<input class="grow round radius1em" type="range" value=50 min=0 max=100 />
	</div>
	<div class="flex align-items-center">
		<input class="grow mr1 h10px radius10px" type="range" value=50 min=0 max=100 />
		<input class="grow round h0em radius1em" type="range" value=50 min=0 max=100 />
	</div>
	<div class="flex align-items-center">
		<input class="grow radius1em success" type="range" value=50 min=0 max=100 />
		<input class="grow ml1 radius1em info" type="range" value=50 min=0 max=100 />
		<input class="grow ml1 radius1em alert" type="range" value=50 min=0 max=100 />
		<input class="grow ml1 radius1em error" type="range" value=50 min=0 max=100 />
	</div>
	<div class="flex">
		<input class="grow start mr1" type="range" value=50 min=0 max=100 />
		<input class="grow start radius1em" type="range" value=50 min=0 max=100 />
	</div>
	<div class="flex">
		<input class="grow end mr1" type="range" value=50 min=0 max=100 />
		<input class="grow end radius1em" type="range" value=50 min=0 max=100 />
	</div>


	<div class="flex">
		<button class="grow mr1 radius2em-right">button</button>
		<div class="flex b3-solid clickable grow justify-content-center align-items-center">clickable</div>
	</div>
	<div class="flex">
		<button class="success mr1 grow radius10px">success</button>
		<button class="info grow radius100pc">info</button>
	</div>
	<div class="flex">
		<button class="error mr1 grow">error</button>
		<button class="alert grow">alert</button>
	</div>
	<div class="flex">
		<button class="grow mr1 radius2em">rounded</button>
		<button class="filled grow radius2em">filled</button>
	</div>
	<div class="flex">
		<div class="p2 flex justify-content-center pop grow">pop</div>
		<div class="p2 flex justify-content-center sink grow">sink</div>
	</div>
	<div class="flex b1-solid">
		<div class="p1 grow bright">border</div>
		<div class="p1 grow bl1-solid">solid</div>
		<div class="p1 grow bl1-dashed">dashed</div>
		<div class="p1 grow bl1-dotted">dotted</div>
	</div>
	<div class="flex">
		<div class="p0-6 text-center grow color-a filled radius2em-left">a</div>
		<div class="p0-6 text-center grow color-b filled">b</div>
		<div class="p0-6 text-center grow color-c filled">c</div>
		<div class="p0-6 text-center grow color-d filled">d</div>
		<div class="p0-6 text-center grow color-e filled radius2em-right">e</div>
	</div>

	<textarea rows={4}>textarea</textarea>
</div>