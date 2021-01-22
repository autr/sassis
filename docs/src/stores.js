import { writable } from 'svelte/store'

export const root = writable( `<style>

:root {

	--field-padding: 1em 0.6em;
	--button-padding: 1em 3em;
	--icon-padding: 3em;

	--font: monospace;
	--font-monospace: monospace;
	--font-serif: serif;
	--font-sans-serif: sans-serif;
	--font-cursive: cursive;
	--font-slab: sans-serif;
	--font-grotesque: sans-serif;

	--font-size: 13px;
	--line-height: 1.61803398875em; /* golden ratio */

	--bg: hsl( 200, 10%, 10% );
	--bg-pop: hsl( 200, 10%, 15% );
	--bg-sink: hsl( 200, 10%, 5% );

	--color: hsl( 200, 10%, 80% );
	--color-bright: hsl( 200, 10%, 95% );
	--color-fade: hsl( 200, 10%, 50% );

	--color-success: hsl( 150, 95%, 70% );
	--color-info: hsl( 200, 95%, 70% );
	--color-error: hsl( 340, 95%, 70% );
	--color-alert: hsl( 50, 95%, 70% );

	--bg-a: hsl( 200, 10%, 10% );
	--bg-b: hsl( 200, 10%, 12% );
	--bg-c: hsl( 200, 10%, 8% );
	--bg-d: hsl( 200, 10%, 8% );
	--bg-e: hsl( 200, 10%, 8% );

	--color-a: hsl( 200, 10%, 80% );
	--color-b: hsl( 200, 10%, 80% );
	--color-c: hsl( 200, 10%, 80% );
	--color-d: hsl( 200, 10%, 80% );
	--color-e: hsl( 200, 10%, 80% );
}

</style>` )