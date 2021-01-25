import { writable } from 'svelte/store'

export const root = writable( `<style>

:root {

	--stroke-width: 1px;

	--input-padding: 1em 0.6em;
	--button-padding: 1em 3em;

	--font: monospace;
	--font-monospace: monospace;
	--font-serif: serif;
	--font-sans-serif: sans-serif;
	--font-cursive: cursive;
	--font-slab: sans-serif;
	--font-grotesque: sans-serif; 

	--font-size: 13px;
	--line-height: 1.61803398875em;

	--bg: hsl( 200, 10%, 10% );
	--bg-pop: hsl( 200, 10%, 12% );
	--bg-sink: hsl( 200, 10%, 8% );

	--color: hsl( 200, 10%, 75% );
	--color-bright: hsl( 200, 10%, 95% );
	--color-fade: hsl( 200, 10%, 50% );

	--color-success: hsl( 150, 95%, 70% );
	--color-info: hsl( 200, 95%, 70% );
	--color-error: hsl( 340, 95%, 70% );
	--color-alert: hsl( 50, 95%, 70% );

	--bg-a: hsl( 300, 20%, 10% );
	--bg-b: hsl( 300, 20%, 15% );
	--bg-c: hsl( 300, 20%, 20% );
	--bg-d: hsl( 300, 20%, 25% );
	--bg-e: hsl( 300, 20%, 30% );

	--color-a: hsl( 0, 90%, 75% );
	--color-b: hsl( 80, 90%, 75% );
	--color-c: hsl( 160, 90%, 75% );
	--color-d: hsl( 240, 90%, 75% );
	--color-e: hsl( 320, 90%, 75% );

	--code: hsl( 200, 10%, 90% );
	--code-operator: hsl( 200, 10%, 60% );
	--code-punctuation: hsl( 290, 95%, 70% );

	--code-number: hsl( 220, 95%, 80% );
	--code-atrule: hsl( 180, 95%, 70% );

	--code-cdata: hsl( 0, 95%, 70% );
	--code-namespace: hsl( 60, 95%, 70% );
	--code-property: hsl( 90, 95%, 70% );
	--code-selector: hsl( 170, 95%, 70% );
	--code-keyboard: hsl( 260, 95%, 70% );
	--code-regex: hsl( 300, 95%, 70% );

}

</style>` )