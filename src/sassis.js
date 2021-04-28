let api = [], mixins = '', classes = '=shorthand\n', file = ''
 

// fourth argument is add it to layout view

const aliases = [ 

	[ ['absolute', 'abs'], ['position: absolute' ] ],
	[ ['relative', 'rel'], ['position: relative' ] ],
	[ ['fixed'], ['position: fixed' ] ],
	[ ['sticky'], ['position: sticky' ] ],
	[ ['table'], ['display: table' ] ],
	[ ['inline'], ['display: inline' ] ],
	[ ['inline-block'], ['display: inline-block' ] ],
	[ ['block'], ['display: block' ] ],
	[ ['flex'], ['display: flex' ],false, true ], // layout views
	[ ['none'], ['display: none' ] ],

	[ ['column', 'col', 'flex-column'], ['flex-direction: column' ] ],
	[ ['row', 'flex-row'], ['flex-direction: row' ] ],

	[ ['grow'], ['flex-grow: 1' ], false, true ],  // layout views
	[ ['no-grow', 'nogrow'], ['flex-grow: 0' ] ],

	[ ['cgrow > *','c-grow > *'], ['flex-grow: 1'], false, true, true ], // layout views
	[ ['cnogrow > *', 'cno-grow > *', 'c-no-grow > *'], ['flex-grow: 0'], false, true, true ], // layout views


	[ ['shrink'], ['flex-shrink: 1' ], false, true ],  // layout views
	[ ['no-shrink'], ['flex-shrink: 0' ], false, true ],  // layout views
	[ ['no-basis'], ['flex-basis: 0' ], false, true ], // layout views
	[ ['wrap'], ['flex-wrap: wrap' ], false, true ], // layout views
	[ ['nowrap', 'no-wrap'], ['flex-wrap: nowrap' ], false, true, true], // layout views
	[ ['auto-space > *'], [
			'margin-left: var(--column-spacing)',
			'&:first-child',
			'\tmargin-left: 0'
		], false, true, true ], // layout views
	[ ['border-box'], ['box-sizing: border-box' ] ],

	[ ['italic'], ['font-style: italic' ] ],
	[ ['bold', 'strong'], ['font-weight: bold' ] ],
	[ ['bolder', 'stronger'], ['font-weight: bold' ] ],
	[ ['normal'], ['font-weight: normal' ] ],
	[ ['light'], ['font-weight: light' ] ],
	[ ['lighter'], ['font-weight: lighter' ] ],

	[ ['text-left'], ['text-align: left' ] ],
	[ ['text-center'], ['text-align: center' ] ],
	[ ['text-right'], ['text-align: right' ] ],
	[ ['capitalize'], ['text-transform: capitalize' ] ],
	[ ['uppercase'], ['text-transform: uppercase' ] ],
	[ ['lowercase'], ['text-transform: lowercase' ] ],
	[ ['underline'], ['text-decoration: underline' ] ],
	[ ['strike-through', 'line-through', 'cross-out'], ['text-decoration: line-through' ] ],

	[ ['pointer'], ['cursor: pointer' ] ],

	[ ['visible'], ['opacity: 1' ] ],
	[ ['invisible', 'hidden'], ['opacity: 0' ] ],
	[ ['no-bg'], ['background: transparent' ] ],
	[ ['overflow-hidden', ], ['overflow: hidden' ] ],
	[ ['overflow-auto'], ['overflow: auto' ] ],

	[ ['margin-auto'], ['margin: 0 auto' ] ],
	[ ['whitespace-pre', 'newlines'], ['white-space: pre' ] ],
	[ ['whitespace-nowrap'], ['white-space: nowrap' ] ],
	[ ['fill'], ['position: absolute', 'width: 100%', 'height: 100%', 'top: 0', 'left: 0' ] ],
	[ ['no-webkit'], ['-webkit-appearance: none' ] ],
	[ ['user-select-none'], ['user-select: none' ] ]
]

api.push({
	type: 'h2',
	id: 'basic'
})

api.push( {
	type: 'table',
	id: 'basic',
	data: aliases,
	mixins: '.'
})

api.push({
	type: 'h2',
	id: 'layout'
})

api.push( {
	type: 'table',
	id: 'layout',
	data: aliases.filter( a => a[3] )
})

aliases.forEach( pair => {
	const names = pair[0]
	const rule = pair[1].join('')

	if (!pair[2]) {
		if (!pair[4]) mixins += `\n=${names.join(`\n\t${rule}\n=`)}\n\t${pair[1].join('\n\t')}\n`
		const c = `\n\t.${names.join(', .')}\n\t\t${pair[1].join('\n\t\t')}\n`
		classes += c
	}
})

const yep = [
	['row', 'x', 'justify-content'],
	['row', 'y', 'align-items', 'align-self'],
	['column', 'x', 'align-items', 'align-self'],
	['column', 'y', 'justify-content'],
]

let yepyep = []

yep.forEach( (y, ii) => {
	const colrow = y[0]
	const dir = y[1]
	const type = y[2]
	const child = y[3]

	const items = ['center', 'end', 'flex-end', 'start', 'flex-start','stretch','baseline']
	const content = ['space-between', 'space-evenly', 'space-around', 'left', 'right', 'center',  'end',  'flex-end', 'start',  'flex-start', 'stretch']

	const iter = ( type.indexOf( 'content' ) != -1 ) ? content : items
	const style = ( type.indexOf( 'content' ) != -1 ) ? 'content' : 'items'



	if ( ii % 2 == 0) {
		const A = y
		const B = yep[ii+1]

		const Atype = A[2]
		const Btype = B[2]

		const Aitems = ( Atype.indexOf( 'content' ) != -1 ) ? content : items
		const Bitems = ( Btype.indexOf( 'content' ) != -1 ) ? content : items

		const Astyle = ( Atype.indexOf( 'content' ) != -1 ) ? '{alert}[content]{end}' : '{alert}[items]{end}'
		const Bstyle = ( Btype.indexOf( 'content' ) != -1 ) ? '{alert}[content]{end}' : '{alert}[items]{end}'

		Aitems.forEach( Aitem => {
			Bitems.forEach( Bitem => {

				classes += `\n\t.${colrow}-${Aitem}-${Bitem}\n\t\t${Atype}: ${Aitem}\n\t\t${Btype}: ${Bitem}\n\t\tflex-direction: ${colrow}`
				mixins += `\n=${colrow}($x, $y)\n\t${Atype}: $x\n\t${Atype}: $y\n\tflex-direction: ${colrow}`
			})
		})

		yepyep.push([
			[ `${colrow}-${Astyle}-${Bstyle}`, `+${colrow}({info}$x, $y{end})` ],
			[ `${Atype}: ${Astyle}`,`${Btype}: ${Bstyle}`,`flex-direction: ${colrow}` ]
		])
	}


	iter.forEach( (rule, i) => {
		classes += `\n\t.${colrow}-${dir}-${rule}\n\t\t${type}: ${rule}`
		mixins += `\n=${colrow}-${dir}($val)\n\t${type}: $val`

	})

	yepyep.push([
		[ `${colrow}-${dir}-{alert}[${style}]{end}`, `+${colrow}-${dir}({info}$val{end})` ],
		[ `${type}: {alert}[${style}]{end}` ]
	])

	if (child) {
		items.forEach( (rule,i) => {
			classes += `\n\t*[class*="${colrow}"] > .${dir}-${rule}\n\t\t${child}: ${rule}`
		})
		yepyep.push([
			[ `${colrow} > .${dir}-{alert}[items]{end}` ],
			[ `${child}: {alert}[items]{end}` ]
		])
	}

})

api.push({
	type: 'h2',
	id: 'alignments'
})

api.push( {
	type: 'table',
	id: 'alignments',
	data: yepyep
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
			[ 'stretch', 'str' ], 
			[ 'baseline', 'b' ]
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
			[ 'stretch', 'str' ]
		]
	]
]



alignments.forEach( (a, idx)  => {
	const nameMega = a[0]
	const values = a[1]
	const which = (idx == 0) ? 'items' : 'content'

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

			mixins += `\n=${nameList[0]}-${validValue}\n\t${validRule}`
			mixins += `\n=${nameList[nameList.length-1]}-${classList[classList.length-1]}\n\t${validRule}`

		})

	})

	api.push( {
		type: 'table',
		id: which,
		data: apiTable,
		mixins: '.'
	})
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
		[ ['s'], 'flex-basis', true], 
		[ [''], '', true], 
		[ ['w'], 'width', false],
		[ ['h'], 'height', false],
		[ ['minw'], 'min-width', false],
		[ ['minh'], 'min-height', false],
		[ ['maxw'], 'max-width', false],
		[ ['maxh'], 'max-height', false],
		[ ['basis'], 'flex-basis', false],
		[ ['radius'], 'border-radius', false]
	]




	types.forEach( pair => {

		let apiTable = []

		const names = pair[0]
		const prop = pair[1]
		const max = pair[2] || 100
		const doDirections = pair[2]
		const name = names[0]


		if (i == 0) {
			api.push( {
				type: 'h3',
				id: name == 's' ? 'spacer' : name == '' ? 'position' : prop
			})
		}


		// top left right bottom versions
		// directions --------------------------------------------

		if ( doDirections ) {


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
					[ ['t'], (p, n, t, indent, style) => `${indent}${p}top-width: ${n}${t} ${indent}${p}top-style: ${style}`], 
					[ ['r'], (p, n, t, indent, style) => `${indent}${p}right-width: ${n}${t} ${indent}${p}right-style: ${style}`],  
					[ ['l'], (p, n, t, indent, style) => `${indent}${p}left-width: ${n}${t} ${indent}${p}left-style: ${style}`],  
					[ ['b'], (p, n, t, indent, style) => `${indent}${p}bottom-width: ${n}${t} ${indent}${p}bottom-style: ${style}`],  
					[ ['lr'], (p, n, t, indent, style) => `${indent}${p}left-width: ${n}${t} ${indent}${p}right-width: ${n}${t} ${indent}${p}right-style: ${style} ${indent}${p}left-style: ${style}`],  
					[ ['tb'], (p, n, t, indent, style) => `${indent}${p}top-width: ${n}${t} ${indent}${p}bottom-width: ${n}${t} ${indent}${p}top-style: ${style} ${indent}${p}bottom-style: ${style}`],  
				]
			}
			if ( name != '' ) directions.push( 
				[ [''], (p, n, t, indent, style) => `${indent}${p}: ${n}${t} ${ (p == 'border') ? style : ''}`] 
			)

			if ( name == 's' ) {
				directions = [
					[ [''], (p, n, t, indent) => `${indent}${p}: ${n}${t}`]
				]
			}

			directions.forEach( (direct, ii) => {
				const classList = direct[0]
				const run = direct[1]
				let a = ''
				let b = ''
				let c = []
				let pxA = '', pxB = ''
				let pcA = '', pcB = ''

				const blank = direct[0][0] == '' || name == ''
				const blankC = ( direct[0][0].length == 2 && blank)
				const propDash = blank ? prop : prop + '-'

				classList.forEach( (d, iii) => {
					const comma = iii == direct[0].length - 1 ? '' : ', '
					a += `.${name || ''}${d}${num}${comma}`
					b += `.c${name || ''}${d}${num}${comma}`
					c.push( 'c' + d )
					pxA += `.${name || ''}${d}${i}px${comma}`
					pxB += `.${name || ''}${d}${i}px${comma}`
					pcA += `.${name || ''}${d}${i}pc${comma}`
					pcB += `.${name || ''}${d}${i}pc${comma}`

					if ( i == 0 && d != '' ) {
						mixins += `\n=${name}${d}( $v )`
						mixins += `${ run( propDash, '$v', '', '\n\t') }` // add rule
					}

				})

				let str = ''

				if ( !blankC && !isBorder ) {

					const astrx = (name == 's') ? '.spacer' : '*'

					// em --------------

					const em = (num+'').replace('-','.')
					str += `\n\t${ a }${ run( propDash, em, 'em', '\n\t\t') }` // add rule
					str += `\n\t${ b }\n\t\t> ${astrx}${ run( propDash, em, 'em', '\n\t\t\t') }`

					// px --------------

					str += `\n\t${ pxA }${ run( propDash, i * 10, 'px', '\n\t\t') }` // add rule
					str += `\n\t${ pxB }\n\t\t> ${astrx}${ run( propDash, i, 'px', '\n\t\t\t') }`

					// pc --------------

					str += `\n\t${ pcA }${ run( propDash, i, '%', '\n\t\t') }` // add rule
					str += `\n\t${ pcB }\n\t\t> ${astrx}${ run( propDash, i, '%', '\n\t\t\t') }`

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
						second = `${ run( propDash, i/10, 'px', '\n\t\t', tt) }` // add rule
						bs += first + second

					})

					str += bs

				}

				// --------->

				_classes += str


				if ( i == 0 ) {

					const wang = `{alert}[${isBorder ? '0-10' : 'num'}]{end}`
					const stroke = '{info}[solid|dashed|dotted]{end}'
					const unit = isBorder ? 'px' : '{info}[em|px|pc]{end}'
					let aa = [ 
						classList.map( cc => `${name}${cc}${wang}${isBorder ? '-{info}[solid|dashed|dotted]{end}' : unit.replaceAll('em', '~')}` ), 
						run( propDash, wang, unit, '$', stroke ) 
					]
					let bb = [ c, run( propDash, wang, unit, '$', stroke ) ]

					aa[1] = aa[1].split('$').filter(e => e.length != 0)
					aa[0].push( `+${name}${classList[0]}({alert}$val{end}${isBorder ? ', {info}$type{end}' : ''})` )
					apiTable.push( aa )

				} 

			})

		} else {

			// normal --------------------------------------------

			const NAME = names[0]


			let types = [ ['em', 'em', '[0-100]'], ['px', 'px', '[0-1000]'], ['pc', '%', '[0-100]']]
			if (NAME == 'h' || NAME == 'minh' || NAME == 'maxh') types.push( ['vh', 'vh', '[0-100]'])
			if (NAME == 'w' || NAME == 'minw' || NAME == 'maxw') types.push( ['vw', 'vw', '[0-100]'])

			types.forEach( (TYPE, III) => {
				let str = '\n\t'
				let ID = TYPE[0] // px, em, pc
				let EXT = TYPE[1] // %
				let INFO = TYPE[2] // [0-100]
				let VALUE = i
				if (ID == 'px' && NAME != 'radius') VALUE *= 10


				if ( NAME == 'radius' ) {
					const CONF = {
						top: ['border-top-left-radius', 'border-top-right-radius'],
						bottom: ['border-bottom-left-radius', 'border-bottom-right-radius'],
						left: ['border-top-left-radius', 'border-bottom-left-radius'],
						right: ['border-top-right-radius', 'border-bottom-right-radius']
					};

					const ALL = `{alert}${INFO}{end}{info}[em|pc|px]{end}`;
					_classes += `\n\t.${NAME}${VALUE}${ID}\n\t\tborder-radius: ${VALUE}${EXT}`

					if (i == 0 && III == 0) {
						mixins += `\n=${NAME}($val)\n\tborder-radius: $val`
						apiTable.push( [ 
							[ 
								`${NAME}${ALL}`, 
								`+${NAME}($val)` 
							], 
							[ 
								`border-radius: ${ALL}`
							] 
						] )
					}

					for (const [SIDE, ARR] of Object.entries(CONF)) {



						_classes += `
	.${NAME}${VALUE}${ID}-${SIDE}
		${ARR[0]}: ${VALUE}${EXT}
		${ARR[1]}: ${VALUE}${EXT}`
						if (i == 0) {
						mixins += `
=${NAME}-${SIDE}($val)
	${ARR[0]}: $val
	${ARR[1]}: $val`
						apiTable.push( [ 
							[ 
								`${NAME}{alert}${INFO}{end}{info}[em|pc|px]{end}-${SIDE}`, 
								`+${NAME}-${SIDE}($val)` 
							], 
							[ 
								`${ARR[0]}: {alert}${INFO}{end}{info}[em|pc|px]{end}`,
								`${ARR[1]}: {alert}${INFO}{end}{info}[em|pc|px]{end}`
							] 
						] )
						}

					}

				} else {

					names.forEach( (n, iiii) => str += `.${n}${VALUE}${ID}${iiii == names.length - 1 ? '' : ', '}`)
					str += `\n\t\t${prop}: ${VALUE}${EXT}`
					const wang = `{alert}${INFO}{end}`
					const ALLNAMES = names.map( n => `${n}${wang}${ID}`)
					ALLNAMES.push( `+${NAME}({info}$val{end})` )
					if ( i == 0) apiTable.push( [ ALLNAMES, [ `${prop}: ${wang}${EXT}` ] ] )

					_classes += str
				}
			})


			if ( i == 0 ) {
				_classes += `\n\t.${NAME}-auto\n\t\t${prop}: auto`
				mixins += `\n=${NAME}( $v )\n\t${prop}: $v`
				mixins += `\n=${NAME}-auto\n\t${prop}: auto`
			}

		}

		if (i == 0) {


			const astrx = (names[0] == 's') ? '.spacer' : '*'
			let ccc = 'c'+pair[0][0]

			if (doDirections) {
				apiTable.push( [
					[
						'c'+pair[0][0]+'{succ}[rule]{end}',
						'+c'+pair[0][0]+'{succ}[rule]{end}'
					],
					[
						`> ${astrx}`,
						'{succ}[rule]{end}',
					]

				])
			} else {
				apiTable.push( [
					[
						pair[0][0]+'-auto',
						'+'+pair[0][0]+'-auto'
					],
					[
						`${prop}: auto`,
					]

				])

			}

			api.push( {
				type: 'table',
				id: pair[1] == '' ? 'position' : pair[1],
				data: apiTable
			})
		}
	})

	classes += _classes
}


const trans = ['0', '-50', '50', '100', '-100']


let tranData = []
trans.forEach( (tranA, a) => {

	trans.forEach( (tranB, b) => {

		classes += `
	.translate${tranA}${tranB}
		transform: translate( ${tranA}%, ${tranB}%)`
		classes += `
	.origin${tranA}${tranB}
		transform-origin:  ${tranA}% ${tranB}%`

		tranData.push( 
		[
			[
				`translate{alert}${tranA}${tranB}{end}`
			],
			[
				`transform: translate( {alert}${tranA}%, ${tranB}%{end})`
			]
		])
		tranData.push( 
		[
			[
				`origin{alert}${tranA}${tranB}{end}`
			],
			[
				`transform-origin: {alert}${tranA}% ${tranB}%{end}`
			]
		])
	})

})

api.push({
	type: 'h2',
	id: 'transform'
})

api.push( {
	type: 'table',
	id: 'transform',
	data: tranData
})



// font sizes

let fontSizes = []
const ffss = [0.785714, 1, 1.2857, 1.64285, 2.071428, 2.642857]
ffss.forEach( (num, i) => {
	classes += `
	.f${i}, h${6 - i}, .h${6 - i}
		font-size: ${num}rem
		line-height: var(--line-height)
		input, textarea, button, select
			font-size: ${num}rem
			line-height: var(--line-height)
`
	mixins += `
=f${i}
	font-size: ${num}rem
	input, textarea, button, select
		font-size: ${num}rem`
	fontSizes.push(
	[
		[
			`f${i}, h${6 - i}, .h${6 - i}`,
			`+f${i}`
		],
		[
			`font-size: {alert}${num}rem{end}`
		]
	])
})


api.push({
	type: 'h2',
	id: 'font-size'
})

api.push( {
	type: 'table',
	id: 'font-size',
	data: fontSizes
})


// z-index

for( let i = 0; i < 100; i++) {
	classes += `
	.z-index${i}
		z-index: ${i}
`
	classes += `
	.opacity${i}
		opacity: ${i} 
`
}
mixins += `
=z-index( $z )
	z-index: $z`
mixins += `
=opacity( $z )
	opacity: $z`



api.push({
	type: 'h2',
	id: 'z-index'
})

api.push( {
	type: 'table',
	id: 'z-index',
	data: [[
		[
			`z-index{alert}0-99{end}`,
			`+z-index( {alert}$z{end} )`
		],
		[
			`z-index: {alert}0-99{end}`
		]
	]]
})



api.push({
	type: 'h2',
	id: 'opacity'
})

api.push( {
	type: 'table',
	id: 'opacity',
	data: [[
		[
			`opacity{alert}0-99{end}`,
			`+opacity( {alert}$z{end} )`
		],
		[
			`opacity: {alert}0-99{end}`
		]
	]]
})




// font family


let fontFam = []
const ffff = ['monospace', 'serif', 'sans-serif', 'cursive', 'slab', 'grotesque']
ffff.forEach( (fam, i) => {
	classes += `
	.${fam}
		font-family: var(--font-${fam})
		input, textarea, button, select
			font-size: var(--font-${fam})
`
	mixins += `
=${fam}
	font-family: var(--font-${fam})
	input, textarea, button, select
		font-size: var(--font-${fam})
`
	fontFam.push(
	[
		[
			`${fam}`,
			`+${fam}`
		],
		[
			`font-family: {info}var(--font-${fam}){end}`
		]
	])
})

api.push({
	type: 'h2',
	id: 'font-family'
})

api.push( {
	type: 'table',
	id: 'font-family',
	data: fontFam
})


file += mixins + '\n\n'
file += classes + '\n\n'

const fs = require('fs')
const path = require('path')
const sass = require('node-sass')
const clean = require('clean-css')
const { Compress } = require('gzipper')
const markdown = require( "markdown" ).markdown


async function render( name, data ) {

	const full = `dist/${name}.css`
	const min = `dist/${name}.min.css`
	const gz = `dist/${name}.min.css.gz`

	const sas = await fs.writeFileSync(`dist/${name}.sass`, data)
	console.log(`✅ 🚨  successfully written dist/${name}.sass`, sas)
	const css = await (await sass.renderSync({ file: `dist/${name}.sass`, indentedSyntax: true })).css.toString()
	const minified = (await (new clean()).minify( css )).styles
	await fs.writeFileSync(full, css )
	await fs.writeFileSync(min, minified )
	await fs.unlinkSync(`dist/${name}.sass`)
	console.log(`✅ 📜  successfully compiled dist/${name}.sass to  dist/${name}.css`)
	const gzip = new Compress(min, 'dist', { verbose: true })
	await gzip.run()
	console.log('✅ 🤐  successfully gzipped dist')

	const info  = {
		full: { path: full, basename: path.basename( full ), ...(await fs.statSync( full ) ) },
		min: { path: min, basename: path.basename( min ), ...(await fs.statSync( min ) ) },
		gz: { path: gz, basename: path.basename( gz ), ...(await fs.statSync( gz ) ) },
	}
	return info
	
}


async function run() {

	let readme = '\n\n'

	api.forEach( a => {
		if ( a.data ) {
			readme += `## ${a.id} \n\n` 
			readme += '<table>\n'
			a.data.forEach( b => {
				readme += '<tr>\n'
				readme += `<td>${b[0].map( c => {
					if ( c[0] != '.' || c[0] != '+') c = '.' + c
					return c.replaceAll('{alert}', '<em>').replaceAll('{end}', '</em>').replaceAll('{info}', '<em>')
				}).join('<br />')}</td>`
				readme += `<td>${b[1].map( c => {
					return c.replaceAll('{alert}', '<em>').replaceAll('{end}', '</em>').replaceAll('{info}', '<em>')
				}).join('<br />')}</td>`
				readme += '</tr>\n'
			})
			readme += '</table>\n\n'
		}
	})





	const str = await ( await fs.readFileSync('intro.md') ).toString()
	const intro = await markdown.toHTML( str )
	console.log('✅ 📚 received intro...')
	const exp = 'module.exports = `' + intro + '`'
	console.log('✅ 🌐 converted to HTML...')
	await fs.writeFileSync( 'src/intro.js', exp, 'utf8' )
	console.log('✅ ✍️ written to src/intro.js...')


	await fs.writeFileSync('README.md', str + readme ) 

	//...

	const mix = await fs.writeFileSync('src/_shorthand.sass', file)
	console.log('✅ 💅  successfully written src/_shorthand.sass', mix)

	let infos = { downloads: {} }
	infos['downloads']['shorthand'] = await render( 'shorthand', `@import '../src/sassis' 
html
	+shorthand `)
	infos['downloads']['layout'] = await render( 'layout', `@import '../src/sassis' 
html
	+layout`) 
	infos['downloads']['all'] = await render( 'all', `@import '../src/sassis' 
html
	+sassis
	+shorthand
	+layout`) 

	infos['package'] = JSON.parse( await ( await fs.readFileSync( 'package.json' ) ).toString() )

	api = `export default ${ JSON.stringify( api, null, 2 ) }`
	await fs.writeFileSync('src/data.js', api ) 
	console.log('✅ 🧩  successfully written src/data.js')


	infos = `export default ${ JSON.stringify( infos, null, 2 ) }`
	await fs.writeFileSync('src/infos.js', infos ) 

	console.log('✅ 🧠  successfully written src/infos.js')





}


run()
