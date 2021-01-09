<script>

const guis = {
buttons: `
<button>button</button>
<button class="filled ok">filled button</button>
<button class="edged success">edged button</button>
`,
links: `
<a href="#" class="bb1-solid">underlined link</a>
<a href="#" class="bb1-solid color-a">color-a link</a>
<a href="#" class="bb1-solid color-b">color-b link</a>
<a href="#" class="bb1-solid color-c">color-c link</a>
<a href="#" class="bb1-solid color-d">color-d link</a>
<a href="#" class="bb1-solid color-e">color-e link</a>
<a href="#" class="bb1-solid color-f">color-f link</a>
`,
inputs: `
<input type="text" placeholder="text input" />
<input type="range" min=0 max=100 value=50 />
<textarea rows=4 placeholder="textarea"></textarea>
<div class="select">
	<select class="p1 pr2">
		<option>option a</option>
		<option>option b</option>
		<option>option c</option>
	</select>
</div>
<select class="arrow p1">
	<option>option a</option>
	<option>option b</option>
	<option>option c</option>
</select>

`,
fontsizes: `
<!-- uses golden ratio -->

<h1>h1</h1>
<div class="f6">.f6</div>

<h3>h3</h3>
<div class="f5">.f5</div>

<h3>h3</h3>
<div class="f4">.f4</div>

<h4>h4</h4>
<div class="f3">.f3</div>

<big>big</big> // aka .f3

<h5>h5</h5>
<div class="f2">.f2</div>

<h6>h6</h6>
<div class="f1">.f1</div>

<small>small</small> // aka .f1
`,
shapes: `
<div class="w8em h8em relative cross"></div>
`
};


</script> 

<table class="w100">
	<thead class="bright">
		<tr>
			<td>what</td>
			<td>code</td>
			<td>example</td>
		</tr>
	</thead>
	<tbody>
		{#each Object.keys(guis) as k}
			<tr>
				<td>{k}</td>
				<td><pre>{guis[k]}</pre></td>
				<td><div class="flex flex-column align-items-start">{@html guis[k]}</div></td>
			</tr>
		{/each}
	</tbody>
</table>