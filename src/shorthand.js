const fs = require('fs')
const sass = require('node-sass');



let mixins, classes, file, table

mixins = '// shorthand mixins\n\n'
table = '<table  class="w100">\n<thead class="bright"><tr><td>class</td><td>rule</td><td>mixin</td></tr></thead><tbody>'
classes = '\n=shorthand'

// --------------------------------------------------------------------------------

classes += '\n\n\t// ---------- 001 basic ----------\n\n'

// --------------------------------------------------------------------------------


const aliases = {

	'absolute': 'position: absolute',
	'relative': 'position: relative',
	'fixed': 'position: fixed',
	'table': 'display: table',
	'inline-block': 'display: inline-block',
	'block': 'display: block',
	'flex': 'display: flex',
	'flex-column': 'flex-direction: column',
	'column': 'flex-direction: column',
	'flex-row': 'flex-direction: row',
	'row': 'flex-direction: row',
	'grow': 'flex-grow: 1',
	'no-grow': 'flex-grow: 0',
	'shrink': 'flex-shrink: 1',
	'no-shrink': 'flex-shrink: 0',
	'no-basis': 'flex-basis: 0',
	'wrap': 'flex-wrap: wrap',
	'no-wrap': 'flex-wrap: nowrap',
	'border-box': 'box-sizing: border-box',
	'wrap': 'flex-wrap: wrap',
	'no-wrap': 'flex-wrap: nowrap',
	'text-left': 'text-align: left',
	'text-center': 'text-align: center',
	'text-right': 'text-align: right',
	'italic': 'font-style: italic',
	'bold': 'font-weight: bold',
	'bolder': 'font-weight: bold',
	'normal': 'font-weight: normal',
	'light': 'font-weight: light',
	'lighter': 'font-weight: lighter',
	'visible': 'opacity: 1',
	'invisible': 'opacity: 0',
	'no-bg': 'background: transparent',
	'pointer': 'cursor: pointer'
}



Object.keys( aliases ).forEach( name => {
	const rule = aliases[name]
	mixins += `\n=${name}\n\t${rule}\n`
	classes += `\n\t.${name}\n\t\t${rule}\n`
	table += `\n<tr><td>.${name}</td><td>${rule}</td><td>+${name}</td></tr>`
})


const two = ['align', 'justify']
two.forEach( main => {
	['items', 'self', 'content'].forEach( type => {
		const prop = `${main}-${type}`
		const alles = (main == 'align') ? 
			[
				['center', 'center'],
				['start', 'start'],
				['end', 'end'],
				['flex-start', 'flex-start'],
				['flex-end', 'flex-end'], 
				['stretch', 'stretch']]
		: [['between', 'space-between'],
		['evenly', 'space-evenly'],
		['around', 'space-around'],
		['center', 'center'],
		['start', 'start'],
		['end', 'end'], 
		['stretch', 'stretch'],
		['flex-start', 'flex-start'],
		['flex-end', 'flex-end']];
		const options = alles.map( a => a[0] ).join('|')
		alles.forEach( pair => {
			const short = pair[0]
			const className = `${prop}-${short}`
			const val = pair[1]
			mixins += `\n=${className}\n\t${prop}: ${val}\n`
			classes += `\n\t.${className}\n\t\t${prop}: ${val}\n`
		})
		table += `\n<tr><td>.${prop}-[${options}]</td><td>${prop}: [option]</td>+${prop}-[${options}]<td></tr>`
	})
})


// --------------------------------------------------------------------------------

classes += '\n\n\t// ---------- 002 margins paddings spacers ----------\n\n'

// --------------------------------------------------------------------------------

for ( let i = 0; i <= 80; i += 2 ) {

	let num = ( i < 10 && i > 0 ) ? '0' + i : i;
	const val = num / 10;
	num = (num%10 == 0) ? num / 10 : Math.floor( num / 10 ) + '-' + num%10;


	if (i == 0) {
		classes += `
	.twelve-${num}
		margin: 0 (${val} * -1) 0 (${val} * -1)
		.col
			padding: 0 ${val} 0 ${val}`
		table += `
<tr><td>.twelve-[0-80]</td><td>(.col) padding: 0 [spacing] 0 [spacing]</td><td>+twelve( $spacing: 0em )</td></tr>`;
	}

	[ ['p', 'padding'], ['m', 'margin'] ].forEach( two => {
		const short = two[0]
		const prop = two[1]
		const text = `
	.${short}${num}
		${prop}: ${val}em
	.${short}t${num}
		${prop}-top: ${val}em
	.${short}r${num}
		${prop}-right: ${val}em
	.${short}b${num}
		${prop}-bottom: ${val}em
	.${short}l${num}
		${prop}-left: ${val}em
	.${short}tb${num}, .${short}bt${num}
		${prop}-top: ${val}em
		${prop}-bottom: ${val}em
	.${short}lr${num}, .${short}rl${num}
		${prop}-left: ${val}em
		${prop}-right: ${val}em

	// child elements

	.c${short}${num}
		> *
			${prop}: ${val}em
	.c${short}t${num}
		> *
			${prop}-top: ${val}em
	.c${short}r${num}
		> *
			${prop}-right: ${val}em
	.c${short}b${num}
		> *
			${prop}-bottom: ${val}em
	.c${short}l${num}
		> *
			${prop}-left: ${val}em
	.c${short}tb${num}, .c${short}bt${num}
		> *
			${prop}-top: ${val}em
			${prop}-bottom: ${val}em
	.c${short}lr${num}, .c${short}rl${num}
		> *
			${prop}-left: ${val}em
			${prop}-right: ${val}em
		`;
		classes += text + '\n'

		if (i == 0) {

			table += `
<tr><td>.${short}[0-80]</td><td>${prop}: [0-80]em</td></tr>
<tr><td>.${short}t[0-80]</td><td>${prop}-top: [0-80]em</td></tr>
<tr><td>.${short}r[0-80]</td><td>${prop}-right: [0-80]em</td></tr>
<tr><td>.${short}b[0-80]</td><td>${prop}-bottom: [0-80]em</td></tr>
<tr><td>.${short}l[0-80]</td><td>${prop}-left: [0-80]em</td></tr>
<tr><td>.${short}tb[0-80]<br />.${short}bt[0-80]</td><td>${prop}-top: [0-80]em<br />${prop}-bottom: [0-80]em</td></tr>
<tr><td>.${short}lr[0-80]<br />.${short}rl[0-80]</td><td>${prop}-left: [0-80]em<br />${prop}-right: [0-80]em</td></tr>

<!-- child elements -->

<tr><td>.c${short}[0-80]</td><td>${prop}: [0-80]em</td></tr>
<tr><td>.c${short}t[0-80]</td><td>${prop}-top: [0-80]em</td></tr>
<tr><td>.c${short}r[0-80]</td><td>${prop}-right: [0-80]em</td></tr>
<tr><td>.c${short}b[0-80]</td><td>${prop}-bottom: [0-80]em</td></tr>
<tr><td>.c${short}l[0-80]</td><td>${prop}-left: [0-80]em</td></tr>
<tr><td>.c${short}tb[0-80]<br />.${short}bt[0-80]</td><td>${prop}-top: [0-80]em<br />${prop}-bottom: [0-80]em</td></tr>
<tr><td>.c${short}lr[0-80]<br />.${short}rl[0-80]</td><td>${prop}-left: [0-80]em<br />${prop}-right: [0-80]em</td></tr>


`

			table += '\n<tr><td>.s[0-80]</td><td>flex-basis: [0-80]em</td></tr>'

			const mixin = `
=${short}( $amount )
	${prop}: $amount
=${short}t( $amount )
	${prop}-top: $amount
=${short}r( $amount )
	${prop}-right: $amount
=${short}b( $amount )
	${prop}-bottom: $amount
=${short}l( $amount )
	${prop}-left: $amount
=${short}tb( $amount )
	${prop}-top: $amount
	${prop}-bottom: $amount
=${short}bt( $amount )
	${prop}-top: $amount
	${prop}-bottom: $amount
=${short}lr( $amount )
	${prop}-left: $amount
	${prop}-right: $amount
=${short}rl( $amount )
	${prop}-left: $amount
	${prop}-right: $amount

// child elements

=c${short}( $amount )
	> *
		${prop}: $amount
=c${short}t( $amount )
	> *
		${prop}-top: $amount
=c${short}r( $amount )
	> *
		${prop}-right: $amount
=c${short}b( $amount )
	> *
		${prop}-bottom: $amount
=c${short}l( $amount )
	> *
		${prop}-left: $amount
=c${short}tb( $amount )
	> *
		${prop}-top: $amount
	${prop}-bottom: $amount
=c${short}bt( $amount )
	> *
		${prop}-top: $amount
	${prop}-bottom: $amount
=c${short}lr( $amount )
	> *
		${prop}-left: $amount
	${prop}-right: $amount
=c${short}rl( $amount )
	> *
		${prop}-left: $amount
	${prop}-right: $amount
			`;
			mixins += mixin + '\n'
		}
	})


	const spacer = `
	.s${num}
		flex-basis: ${val}em
	`
	classes += spacer

	if (i == 0) {

		const mixin = `
=s( $amount )
	flex-basis: $amount
		`

		mixins += mixin

	}
}

// --------------------------------------------------------------------------------

classes += '\n\n\t// ---------- 003 borders ----------\n\n'

// --------------------------------------------------------------------------------

for ( let i = 0; i <= 8; i ++ ) {

	['solid', 'dashed', 'dotted'].forEach( type => {

		const text = `
	.b${i}-${type}
		border-width: ${i}px
		border-style: ${type}
	.btb${i}-${type}, .bbt${i}-${type}
		border-top-width: ${i}px
		border-bottom-width: ${i}px
		border-style: ${type}
	.blr${i}-${type}, .brl${i}-${type}
		border-left-width: ${i}px
		border-right-width: ${i}px
		border-style: ${type}
	.br${i}-${type}
		border-right-width: ${i}px
		border-style: ${type}
	.bt${i}-${type}
		border-top-width: ${i}px
		border-style: ${type}
	.bb${i}-${type}
		border-bottom-width: ${i}px
		border-style: ${type}
	.bl${i}-${type}
		border-left-width: ${i}px
		border-style: ${type}
		`;


		classes += text

	})

	if (i == 0) {
		table += `	
<tr><td>.b[0-8]-[solid|dashed|dotted]</td><td>border-width: [0-8]px<br />border-style: [solid|dashed|dotted]</td></tr>
<tr><td>.btb[0-8]-[solid|dashed|dotted]<br />.bbt[0-8]-[solid|dashed|dotted]</td><td>border-top-width: [0-8]px<br />border-bottom-width: [0-8]px<br />border-style: [solid|dashed|dotted]</td></tr>
<tr><td>.blr[0-8]-[solid|dashed|dotted]<br />.brl[0-8]-[solid|dashed|dotted]</td><td>border-left-width: [0-8]px<br />border-right-width: [0-8]px<br />border-style: [solid|dashed|dotted]</td></tr>
<tr><td>.br[0-8]-[solid|dashed|dotted]</td><td>border-right-width: [0-8]px<br />border-style: [solid|dashed|dotted]</td></tr>
<tr><td>.bt[0-8]-[solid|dashed|dotted]</td><td>border-top-width: [0-8]px<br />border-style: [solid|dashed|dotted]</td></tr>
<tr><td>.bb[0-8]-[solid|dashed|dotted]</td><td>border-bottom-width: [0-8]px<br />border-style: [solid|dashed|dotted]</td></tr>
<tr><td>.bl[0-8]-[solid|dashed|dotted]</td><td>border-left-width: [0-8]px<br />border-style: [solid|dashed|dotted]</td></tr>
		`
	}
}


// --------------------------------------------------------------------------------

classes += '\n\n\t// ---------- 004 top left bottom right width height origin ----------\n\n'

// --------------------------------------------------------------------------------

classes += '\n\n\t// top left right bottom width height\n\n'

for ( let i = 0; i <= 100; i++ ) {
	const tlrbwh = {'t': 'top','l': 'left','b': 'bottom','r': 'right','w': 'width','h': 'height', 'o': 'transform-origin', 'max-width': 'max-width', 'max-height': 'max-height'};

	Object.keys( tlrbwh ).forEach( letter => {

		const property = tlrbwh[ letter ]



		if (letter != 'o') {
			classes += `\t.${letter}${i}em\n\t\t${property}: ${i}em\n`
			classes += `\t.${letter}${i}\n\t\t${property}: ${i}%\n`
			if (i == 0) table += `\n<tr><td>.${letter}[0-100]</td><td>${property}: [0-100]%</td></tr>\n<tr><td>.${letter}[0-100]em</td><td>${property}: [0-100]em</td></tr>`
		} else {
			classes += `\t.${letter}${i}\n\t\t${property}: ${i}% ${i}%\n`
			if (i == 0) table += `\n<tr><td>.${letter}[0-100]</td><td>${property}: [0-100]% [0-100]%</td></tr>`
		}
	})

	classes += `\t.vh${i}\n\t\theight: ${i}vh\n\t.vw${i}\n\t\twidth: ${i}vw\n`
	if (i == 0) table += `\n<tr><td>.vw[0-100]</td><td>width: [0-100]vw</td></tr>\n<tr><td>.vh[0-100]</td><td>height: [0-100]vh</td></tr>\n`
}


file = '// autogenerated by shorthand.js\n\n'
file += mixins + '\n\n'
file += classes + '\n\n'


file = `
@import './_misc.sass'
${file}
html
	+twelve
`

fs.writeFile('./_shorthand.sass', file, function(err) {
	if (err) return console.error('❌ 💅', err.message)
	console.log('✅ 💅  successfully written _shorthand.sass')


	sass.render({ data: file, indentedSyntax: true }, function(err, result) { 
		if (err) return console.error('❌ 📜', err.message)
		const str = result.toString()
		console.log('✅ 📜  successfully compiled _shorthand.sass')

		fs.writeFile('../dist/shorthand.css', str, function(err) {
			if (err) return console.error('❌ 🌐', err.message)
			console.log('✅ 🌐  successfully written dist/shorthand.css')
		})
	});
})

table += '\n\n</tbody></table>';

fs.writeFile('../docs/src/Table.svelte', table, function(err) {
	if (err) return console.error('❌ 🧩', err.message)
	console.log('✅ 🧩  successfully written Table.svelte')

})
