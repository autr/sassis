const fs = require('fs')
const sass = require('node-sass');



let api = []

let mixins, classes, file

mixins = ''
classes = '=shorthand\n'

const aliases = [

	[ ['absolute', 'abs', 'a'], ['position: absolute' ] ],
	[ ['relative', 'rel', 'r'], ['position: relative' ] ],
	[ ['fixed', 'fix'], ['position: fixed' ] ],
	[ ['sticky', 'stick'], ['position: sticky' ] ],
	[ ['table'], ['display: table' ] ],
	[ ['inline-block', 'ib'], ['display: inline-block' ] ],
	[ ['block', 'bk'], ['display: block' ] ],
	[ ['flex', 'fx'], ['display: flex' ] ],
	[ ['none', 'hidden', 'n'], ['display: none' ] ],

	[ ['column', 'col', 'flex-column','fx-c'], ['flex-direction: column' ] ],
	[ ['row', 'flex-row', 'fx-r'], ['flex-direction: row' ] ],

	[ ['grow'], ['flex-grow: 1' ] ],
	[ ['no-grow'], ['flex-grow: 0' ] ],
	[ ['shrink'], ['flex-shrink: 1' ] ],
	[ ['no-shrink'], ['flex-shrink: 0' ] ],
	[ ['no-basis'], ['flex-basis: 0' ] ],
	[ ['wrap'], ['flex-wrap: wrap' ] ],
	[ ['no-wrap'], ['flex-wrap: nowrap' ] ],
	[ ['border-box'], ['box-sizing: border-box' ] ],
	[ ['wrap'], ['flex-wrap: wrap' ] ],
	[ ['no-wrap'], ['flex-wrap: nowrap' ] ],

	[ ['italic', 'i'], ['font-style: italic' ] ],
	[ ['bold', 'strong'], ['font-weight: bold' ] ],
	[ ['bolder', 'stronger'], ['font-weight: bold' ] ],
	[ ['normal'], ['font-weight: normal' ] ],
	[ ['light'], ['font-weight: light' ] ],
	[ ['lighter'], ['font-weight: lighter' ] ],

	[ ['text-left'], ['text-align: left' ] ],
	[ ['text-center'], ['text-align: center' ] ],
	[ ['text-right'], ['text-align: right' ] ],

	[ ['pointer'], ['cursor: pointer' ] ],

	[ ['visible'], ['opacity: 1' ] ],
	[ ['invisible'], ['opacity: 0' ] ],
	[ ['no-bg'], ['background: transparent' ] ],
	[ ['overflow-hidden', ], ['overflow: hidden' ] ],
	[ ['overflow-auto'], ['overflow: auto' ] ]
]

api.push({
	type: 'h2',
	id: 'basic'
})

api.push( {
	type: 'table',
	id: 'basic',
	data: aliases
})

aliases.forEach( pair => {
	const names = pair[0]
	const rule = pair[1].join('')
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
			[ 'flex-end', 'fxe', 'fe' ], 
			[ 'start', 's' ], 
			[ 'flex-start', 'fxs', 'fs' ], 
			[ 'stretch', 'str' ]
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
			[ 'flex-end', 'fxe', 'fe' ], 
			[ 'start', 's' ], 
			[ 'flex-start', 'fxs', 'fs' ], 
			[ 'stretch', 'str' ]
		]
	]
]



api.push({
	type: 'h2',
	id: 'alignments'
})


alignments.forEach( (a, idx)  => {
	const nameMega = a[0]
	const values = a[1]
	const which = (idx == 0) ? 'items-self' : 'content'

	api.push({
		type: 'h3',
		id: which
	})

	let apiTable = []
	nameMega.forEach( nameList => {
		values.forEach( classList => {
			let rule = []
			nameList.forEach( ( name, _i ) => {			

					classList.forEach( (className, _ii) => {

						const beginner = _i == 0 && _ii < classList.length - 1
						const end = _i == nameList.length -1 && _ii == classList.length - 1

						// console.log( name, _i, className, _ii )
						if (beginner || end) rule.push( name + '-' + className )
					})

			})

			const ruleArray = rule
			rule = '\t.' + rule.join( ', .' ) // convert
			const validProp = nameList[0]
			const validValue = classList[0]
			const validRule = validProp + ': ' + validValue
			apiTable.push( [ ruleArray, [validRule] ] )
			rule += '\n\t\t' + validRule
			classes += `\n${rule}\n`

			mixins += `\n=${nameList[0]}-${validValue}\n\t${classList[0]}`
			mixins += `\n=${nameList[nameList.length-1]}-${classList[classList.length-1]}\n\t${validRule}`

		})

	})

	api.push( {
		type: 'table',
		id: which,
		data: apiTable
	})
})


api.push( {
	type: 'h2',
	id: 'ems'
})


for ( let i = 0; i <= 100; i ++ ) {

	let num = ( i < 10 && i > 0 ) ? '0' + i : i;
	const val = num / 10;
	num = (num%10 == 0) ? num / 10 : Math.floor( num / 10 ) + '-' + num%10;


	let _classes = ''
	const types = [ 
		[ ['p'], 'padding', true], 
		[ ['m'], 'margin', true], 
		[ ['b'], 'border', true], 
		[ [''], '', true], 
		[ ['w', 'width'], 'width', false],
		[ ['h', 'height'], 'height', false],
		[ ['basis', 'flex', 'fx'], 'flex-basis', false],
		[ ['radius', 'round'], 'border-radius', false],
		[ ['bgpos'], 'background-position', false]
	]


	types.forEach( pair => {

		if (i == 0) {
			api.push( {
				type: 'h3',
				id: pair[1]
			})
		}

		let apiTable = []

		const names = pair[0]
		const prop = pair[1]
		const max = pair[2] || 100
		const doDirections = pair[2]

		// top left right bottom versions
		// directions --------------------------------------------

		if ( doDirections ) {

			const name = names[0]

			let directions = [ 
				[ ['t'], (p, n, t, indent) => `${indent}${p}top: ${n}${t}`], 
				[ ['r'], (p, n, t, indent) => `${indent}${p}right: ${n}${t}`],  
				[ ['l'], (p, n, t, indent) => `${indent}${p}left: ${n}${t}`],  
				[ ['b'], (p, n, t, indent) => `${indent}${p}bottom: ${n}${t}`],  
				[ ['lr'], (p, n, t, indent) => `${indent}${p}left: ${n}${t} ${indent}${p}right: ${n}${t}`],  
				[ ['tb'], (p, n, t, indent) => `${indent}${p}top: ${n}${t} ${indent}${p}bottom: ${n}${t}`],  
			]

			const isBorder = name == 'b'

			if ( isBorder ) {
				directions = [ 
					[ ['t'], (p, n, t, indent) => `${indent}${p}top-width: ${n}${t} ${indent}${p}top-style: solid`], 
					[ ['r'], (p, n, t, indent) => `${indent}${p}right-width: ${n}${t} ${indent}${p}right-style: solid`],  
					[ ['l'], (p, n, t, indent) => `${indent}${p}left-width: ${n}${t} ${indent}${p}left-style: solid`],  
					[ ['b'], (p, n, t, indent) => `${indent}${p}bottom-width: ${n}${t} ${indent}${p}bottom-style: solid`],  
					[ ['lr'], (p, n, t, indent) => `${indent}${p}left-width: ${n}${t} ${indent}${p}right-width: ${n}${t} ${indent}${p}right-style: solid ${indent}${p}left-style: solid`],  
					[ ['tb'], (p, n, t, indent) => `${indent}${p}top-width: ${n}${t} ${indent}${p}bottom-width: ${n}${t} ${indent}${p}top-style: solid ${indent}${p}bottom-style: solid`],  
				]
			}
			if ( name != '' ) directions.push( 
				[ [''], (p, n, t, indent) => `${indent}${p}: ${n}${t}`] 
			)
			directions.forEach( (direct, ii) => {
				const classList = direct[0]
				const run = direct[1]
				let a = ''
				let b = ''
				let c = []
				let pxA, pxB = ''
				let pcA, pcB = ''

				const blank = direct[0][0] == '' || name == ''
				const blankC = ( direct[0][0].length == 2 && blank)
				const propDash = blank ? prop : prop + '-'

				classList.forEach( (d, iii) => {
					const comma = iii == direct[0].length - 1 ? '' : ', '
					a += `.${name}${d}${num}${comma}`
					b += `.c${name}${d}${num}${comma}`
					c.push( 'c' + d )
					pxA += `.${name}${d}${i}px${comma}`
					pxB += `.${name}${d}${i}px${comma}`
					pcA += `.${name}${d}${i}pc${comma}`
					pcB += `.${name}${d}${i}pc${comma}`

					if ( i == 0 && d != '' ) {
						mixins += `\n=${name}${d}( $v )`
						mixins += `${ run( propDash, '$v', '', '\n\t') }` // add rule
					}

				})

				let str = ''

				if ( !blankC && !isBorder ) {

					// em --------------

					const em = (num+'').replace('-','.')
					str += `\n\t${ a }${ run( propDash, em, 'em', '\n\t\t') }` // add rule
					str += `\n\t${ b }\n\t\t> *${ run( propDash, em, 'em', '\n\t\t\t') }`

					// px --------------

					str += `\n\t${ pxA }${ run( propDash, i, 'px', '\n\t\t') }` // add rule
					str += `\n\t${ pxB }\n\t\t> *${ run( propDash, i, 'px', '\n\t\t\t') }`

					// pc --------------

					str += `\n\t${ pcA }${ run( propDash, i, '%', '\n\t\t') }` // add rule
					str += `\n\t${ pcB }\n\t\t> *${ run( propDash, i, '%', '\n\t\t\t') }`

				}

				if ( isBorder && i%10 == 0 ) {

					let bs = '';
					['solid', 'dashed', 'dotted'].forEach( tt => {
						bs += `\n\t`
						let first = ''
						let second = ''
						classList.forEach( (c, iiii) => {
							first += `.${name}${classList[0]}${i/10}-${tt}`
							if (iiii < classList.length - 1) first += ', '
						})
						second = `${ run( propDash, i/10, 'px', '\n\t\t') }` // add rule
						bs += first + second

					})

					str += bs

				}

				// --------->

				_classes += str


				if ( i == 0 ) {

					let aa = [ classList.map( c => name + c + '[n]em' ), run( propDash, '[n]', 'em', '$' ) ]
					let bb = [ c, run( propDash, '[n]', 'em', '$' ) ]

					aa[1] = aa[1].split('$').filter(e => e.length != 0)
					bb[1] = bb[1].split('$').filter(e => e.length != 0)

					apiTable.push( aa )
					// if (!blankC) api.push( bb )
				}

			})

		} else {

			// normal --------------------------------------------

			const name = names[0]

			if ( name == 'bgpos' ) {

				_classes += `\n\t.${name}${i}\n\t\t${prop}: ${i}% ${i}%`
				for (let y = 0; y < 100; y++ ) {

					_classes += `\n\t.${name}${i}\n\t\t${prop}: ${i}% ${y}%`
				}

				if ( i == 0) apiTable.push( [ names, [ `${prop}: [n1]% [n2]%` ] ] )
				if ( i == 0 ) mixins += `\n=${name}( $a, $b )\n\t${prop}: $a $b`

			} else {


				[ ['', 'em'], ['px', 'px'], ['pc', '%']].forEach( pair => {
					let str = '\n\t'
					names.forEach( (n, iiii) => str += `.${n}${i}${pair[0]}${iiii == names.length - 1 ? '' : ', '}`)
					str += `\n\t\t${prop}: ${i}${pair[1]}`

					if ( i == 0) apiTable.push( [ names, [ `${prop}: [n]${pair[1]}` ] ] )
					_classes += str
				})


				if ( i == 0 ) mixins += `\n=${names[0]}( $v )\n\t${prop}: $v`
			}

		}

		if (i == 0) {
			api.push( {
				type: 'table',
				id: pair[1],
				data: apiTable
			})
		}
	})

	classes += _classes
}



file += mixins + '\n\n'
file += classes + '\n\n'


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

api = `export default ${ JSON.stringify( api, null, 2 ) }`


fs.writeFile('../docs/src/api.js', api, function(err) {
	if (err) return console.error('❌ 🧩', err.message)
	console.log('✅ 🧩  successfully written Table.svelte')

})
