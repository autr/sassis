const fs = require('fs')
const sass = require('node-sass');



let mixins, classes, file, table

mixins = '// shorthand mixins\n\n'
table = '<table  class="w100">\n<thead class="bright"><tr><td>class</td><td>rule</td><td>mixin</td></tr></thead><tbody>'
classes = '\n=shorthand'

// --------------------------------------------------------------------------------

classes += '\n\n\t// ---------- 001 basic ----------\n\n'

// --------------------------------------------------------------------------------


const aliases = [

	[ ['absolute', 'abs'], 'position: absolute' ],
	[ ['relative', 'rel'], 'position: relative' ],
	[ ['fixed', 'fix'], 'position: fixed' ],
	[ ['sticky', 'stick'], 'position: sticky' ],
	[ ['table'], 'display: table' ],
	[ ['inline-block', 'iblock'], 'display: inline-block' ],
	[ ['block'], 'display: block' ],
	[ ['flex', 'fx'], 'display: flex' ],
	[ ['flex-column', 'column', 'fx-col'], 'flex-direction: column' ],
	[ ['flex-row', 'row', 'fx-row'], 'flex-direction: row' ],
	[ ['grow'], 'flex-grow: 1' ],
	[ ['no-grow'], 'flex-grow: 0' ],
	[ ['shrink'], 'flex-shrink: 1' ],
	[ ['no-shrink'], 'flex-shrink: 0' ],
	[ ['no-basis'], 'flex-basis: 0' ],
	[ ['wrap'], 'flex-wrap: wrap' ],
	[ ['no-wrap'], 'flex-wrap: nowrap' ],
	[ ['border-box'], 'box-sizing: border-box' ],
	[ ['wrap'], 'flex-wrap: wrap' ],
	[ ['no-wrap'], 'flex-wrap: nowrap' ],
	[ ['text-left'], 'text-align: left' ],
	[ ['text-center'], 'text-align: center' ],
	[ ['text-right'], 'text-align: right' ],
	[ ['italic'], 'font-style: italic' ],
	[ ['bold'], 'font-weight: bold' ],
	[ ['bolder'], 'font-weight: bold' ],
	[ ['normal'], 'font-weight: normal' ],
	[ ['light'], 'font-weight: light' ],
	[ ['lighter'], 'font-weight: lighter' ],
	[ ['visible'], 'opacity: 1' ],
	[ ['invisible'], 'opacity: 0' ],
	[ ['no-bg'], 'background: transparent' ],
	[ ['pointer'], 'cursor: pointer' ],
	[ ['overflow-hidden', 'hidden'], 'overflow: hidden' ],
	[ ['overflow-auto'], 'overflow: auto' ]
]



aliases.forEach( pair => {
	const names = pair[0]
	const rule = pair[1]
	mixins += `\n=${names.join(`\n\t${rule}\n=`)}\n\t${rule}\n`
	classes += `\n\t.${names.join(', .')}\n\t\t${rule}\n`
})


const alignments = [
	[ // rule
		[ // 0 = names
			[ 'align-self', 'a-s' ], 
			[ 'align-items', 'a-i' ], 
			[ 'justify-self', 'j-s' ], 
			[ 'justify-items', 'j-i' ]
		], 
		[ // 1 = props
			[ 'center', 'c' ], 
			[ 'end', 'e' ], 
			[ 'flex-end', 'fe' ], 
			[ 'start', 's' ], 
			[ 'flex-start', 'fs' ], 
			[ 'stretch', 'str', 'st' ]
		]
	],
	[
		[ // 0 = names
			[ 'align-content', 'a-c' ], 
			[ 'justify-content', 'j-c' ], 
		], 
		[ // 1 = props
			[ 'space-between', 'between', 'b' ],
			[ 'space-evenly', 'evenly', 'e' ],
			[ 'space-around', 'around', 'a' ],
			[ 'left', 'l' ],
			[ 'right', 'r' ],
			[ 'center', 'c' ], 
			[ 'end', 'e' ], 
			[ 'flex-end', 'fe' ], 
			[ 'start', 's' ], 
			[ 'flex-start', 'fs' ], 
			[ 'stretch', 'str', 'st' ]
		]
	]
]

alignments.forEach( a => {
	const nameMega = a[0]
	const values = a[1]

	values.forEach( classList => {
		nameMega.forEach( nameList => {

			let rule = []
			nameList.forEach( name => {			


					classList.forEach( className => {
						rule.push( name + '-' + className )
					})


			})
			rule = '.' + rule.join( ', .' )
			const validProp = nameList[0]
			const validValue = classList[0]
			rule += '\n\t' + validProp + ': ' + validValue
			console.log('------', rule)
			classes += `\n${rule}\n`

		})
	})
})


// const two = ['align', 'justify' ]
// two.forEach( main => {
// 	['items', 'self', 'content'].forEach( type => {
// 		const prop = `${main}-${type}`
// 		const alles = (main == 'align') ? 
// 			[
// 				['center', 'center'],
// 				['start', 'start'],
// 				['end', 'end'],
// 				['flex-start', 'flex-start'],
// 				['flex-end', 'flex-end'], 
// 				['stretch', 'stretch']]
// 		: [['between', 'space-between'],
// 		['evenly', 'space-evenly'],
// 		['around', 'space-around'],
// 		['center', 'center'],
// 		['start', 'start'],
// 		['end', 'end'], 
// 		['stretch', 'stretch'],
// 		['flex-start', 'flex-start'],
// 		['flex-end', 'flex-end']];
// 		const options = alles.map( a => a[0] ).join('|')
// 		alles.forEach( pair => {
// 			const short = pair[0]
// 			const className = `${prop}-${short}`
// 			const val = pair[1]
// 			mixins += `\n=${className}\n\t${prop}: ${val}\n`
// 			classes += `\n\t.${className}\n\t\t${prop}: ${val}\n`
// 		})
// 		table += `\n<tr><td>.${prop}-[${options}]</td><td>${prop}: [option]</td>+${prop}-[${options}]<td></tr>`
// 	})
// })


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

	[ ['p', 'padding'], ['m', 'margin'], ['', ''] ].forEach( two => {
		const short = two[0]
		const prop = two[1]
		const propDash = (short != '') ? prop + '-' : ''
		let text = ''
		text += short != '' ? `

	// main ${short} elements

	.${short}${num}
		${prop}: ${val}em ` : ''

		text += `
	.${short}t${num}
		${propDash}top: ${val}em
	.${short}r${num}
		${propDash}right: ${val}em
	.${short}b${num}
		${propDash}bottom: ${val}em
	.${short}l${num}
		${propDash}left: ${val}em
	.${short}tb${num}, .${short}bt${num}
		${propDash}top: ${val}em
		${propDash}bottom: ${val}em
	.${short}lr${num}, .${short}rl${num}
		${propDash}left: ${val}em
		${propDash}right: ${val}em`

		text += short != '' ? `

	// child ${short} elements

	.c${short}${num}
		> *
			${prop}: ${val}em` : ''

		text += `
	.c${short}t${num}
		> *
			${propDash}top: ${val}em
	.c${short}r${num}
		> *
			${propDash}right: ${val}em
	.c${short}b${num}
		> *
			${propDash}bottom: ${val}em
	.c${short}l${num}
		> *
			${propDash}left: ${val}em
	.c${short}tb${num}, .c${short}bt${num}
		> *
			${propDash}top: ${val}em
			${propDash}bottom: ${val}em
	.c${short}lr${num}, .c${short}rl${num}
		> *
			${propDash}left: ${val}em
			${propDash}right: ${val}em
		`;
		classes += text + '\n'

		if (i == 0) {

			table += `
<tr><td>.${short}[0-80]</td><td>${prop}: [0-80]em</td></tr>
<tr><td>.${short}t[0-80]</td><td>${propDash}top: [0-80]em</td></tr>
<tr><td>.${short}r[0-80]</td><td>${propDash}right: [0-80]em</td></tr>
<tr><td>.${short}b[0-80]</td><td>${propDash}bottom: [0-80]em</td></tr>
<tr><td>.${short}l[0-80]</td><td>${propDash}left: [0-80]em</td></tr>
<tr><td>.${short}tb[0-80]<br />.${short}bt[0-80]</td><td>${propDash}top: [0-80]em<br />${propDash}bottom: [0-80]em</td></tr>
<tr><td>.${short}lr[0-80]<br />.${short}rl[0-80]</td><td>${propDash}left: [0-80]em<br />${propDash}right: [0-80]em</td></tr>

<!-- child elements -->

<tr><td>.c${short}[0-80]</td><td>${prop}: [0-80]em</td></tr>
<tr><td>.c${short}t[0-80]</td><td>${propDash}top: [0-80]em</td></tr>
<tr><td>.c${short}r[0-80]</td><td>${propDash}right: [0-80]em</td></tr>
<tr><td>.c${short}b[0-80]</td><td>${propDash}bottom: [0-80]em</td></tr>
<tr><td>.c${short}l[0-80]</td><td>${propDash}left: [0-80]em</td></tr>
<tr><td>.c${short}tb[0-80]<br />.${short}bt[0-80]</td><td>${propDash}top: [0-80]em<br />${propDash}bottom: [0-80]em</td></tr>
<tr><td>.c${short}lr[0-80]<br />.${short}rl[0-80]</td><td>${propDash}left: [0-80]em<br />${propDash}right: [0-80]em</td></tr>


`

			table += '\n<tr><td>.s[0-80]</td><td>flex-basis: [0-80]em</td></tr>'
			let a = ( short != '' ) ? `\n=${short}( $amount )\n\t${prop}: $amount` : ''
			let b = ( short != '' ) ? `\n=c${short}( $amount )\n\t>*\n\t\t${prop}: $amount` : ''
			const mixin = `

// main ${short} elements

${a}

// ...

=${short}t( $amount )
	${propDash}top: $amount
=${short}r( $amount )
	${propDash}right: $amount
=${short}b( $amount )
	${propDash}bottom: $amount
=${short}l( $amount )
	${propDash}left: $amount
=${short}tb( $amount )
	${propDash}top: $amount
	${propDash}bottom: $amount
=${short}bt( $amount )
	${propDash}top: $amount
	${propDash}bottom: $amount
=${short}lr( $amount )
	${propDash}left: $amount
	${propDash}right: $amount
=${short}rl( $amount )
	${propDash}left: $amount
	${propDash}right: $amount

// child ${short} elements

${b}

// ...

=c${short}t( $amount )
	> *
		${propDash}top: $amount
=c${short}r( $amount )
	> *
		${propDash}right: $amount
=c${short}b( $amount )
	> *
		${propDash}bottom: $amount
=c${short}l( $amount )
	> *
		${propDash}left: $amount
=c${short}tb( $amount )
	> *
		${propDash}top: $amount
		${propDash}bottom: $amount
=c${short}bt( $amount )
	> *
		${propDash}top: $amount
		${propDash}bottom: $amount
=c${short}lr( $amount )
	> *
		${propDash}left: $amount
		${propDash}right: $amount
=c${short}rl( $amount )
	> *
		${propDash}left: $amount
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


		classes += `\n\t.radius${i}\n\t\tborder-radius: ${i}px\n`

	if (i == 0) {
		table += `	
<tr><td>.b[0-8]-[solid|dashed|dotted]</td><td>border-width: [0-8]px<br />border-style: [solid|dashed|dotted]</td></tr>
<tr><td>.btb[0-8]-[solid|dashed|dotted]<br />.bbt[0-8]-[solid|dashed|dotted]</td><td>border-top-width: [0-8]px<br />border-bottom-width: [0-8]px<br />border-style: [solid|dashed|dotted]</td></tr>
<tr><td>.blr[0-8]-[solid|dashed|dotted]<br />.brl[0-8]-[solid|dashed|dotted]</td><td>border-left-width: [0-8]px<br />border-right-width: [0-8]px<br />border-style: [solid|dashed|dotted]</td></tr>
<tr><td>.br[0-8]-[solid|dashed|dotted]</td><td>border-right-width: [0-8]px<br />border-style: [solid|dashed|dotted]</td></tr>
<tr><td>.bt[0-8]-[solid|dashed|dotted]</td><td>border-top-width: [0-8]px<br />border-style: [solid|dashed|dotted]</td></tr>
<tr><td>.bb[0-8]-[solid|dashed|dotted]</td><td>border-bottom-width: [0-8]px<br />border-style: [solid|dashed|dotted]</td></tr>
<tr><td>.bl[0-8]-[solid|dashed|dotted]</td><td>border-left-width: [0-8]px<br />border-style: [solid|dashed|dotted]</td></tr>
<tr><td>.radius[0-8]</td><td>border-radius: [0-8]px</td></tr>
		`
	}
}


// --------------------------------------------------------------------------------

classes += '\n\n\t// ---------- 004 top left bottom right width height origin ----------\n\n'

// --------------------------------------------------------------------------------

classes += '\n\n\t// top left right bottom width height\n\n'

for ( let i = 0; i <= 100; i++ ) {
	const tlrbwh = {
		't': 'top',
		'l': 'left',
		'b': 'bottom',
		'r': 'right',
		'w': 'width',
		'h': 'height',
		'max-width': 'max-width',
		'max-height': 'max-height',
		'min-width': 'min-width',
		'min-height': 'min-height',
		'z': 'z-index'
	}

	Object.keys( tlrbwh ).forEach( letter => {

		const property = tlrbwh[ letter ]

		if (letter == 'z') {
			classes += `\t.${letter}${i}\n\t\t${property}: ${i}\n`
		} else if (letter == 'o' ) {
			classes += `\t.${letter}${i}pc\n\t\t${property}: ${i}% ${i}%\n`
			if (i == 0) table += `\n<tr><td>.${letter}[0-100]pc</td><td>${property}: [0-100]% [0-100]%</td></tr>`
		} else {
			classes += `\t.${letter}${i}em\n\t\t${property}: ${i}em\n`
			classes += `\t.${letter}${i}pc\n\t\t${property}: ${i}%\n`
			classes += `\t.${letter}${i}px\n\t\t${property}: ${i}px\n`
			if (i == 0) table += `\n<tr><td>.${letter}[0-100]pc</td><td>${property}: [0-100]%</td></tr>\n<tr><td>.${letter}[0-100]em</td><td>${property}: [0-100]em</td></tr>`
		}
	})

	classes += `\t.vh${i}\n\t\theight: ${i}vh\n\t.vw${i}\n\t\twidth: ${i}vw\n\t.basis${i}\n\t\tflex-basis: ${i}%\n\t.basis${i}em\n\t\tflex-basis: ${i}em\n`
	if (i == 0) table += `\n<tr><td>.vw[0-100]</td><td>width: [0-100]vw</td></tr>\n<tr><td>.vh[0-100]</td><td>height: [0-100]vh</td></tr>\n<tr><td>.basis[0-100]</td><td>flex-basis: [0-100]%</td></tr>\n<tr><td>.basis[0-100]em</td><td>flex-basis: [0-100]em</td></tr>\n`
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
		if (err) return console.error('❌ 📜', err.message, 'on line: ' + err.line)
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
