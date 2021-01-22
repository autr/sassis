let api = [], mixins = '', classes = '=shorthand\n', file = ''

const aliases = [

    [ ['absolute', 'abs'], ['position: absolute' ] ],
    [ ['relative', 'rel'], ['position: relative' ] ],
    [ ['fixed'], ['position: fixed' ] ],
    [ ['sticky'], ['position: sticky' ] ],
    [ ['table'], ['display: table' ] ],
    [ ['inline-block'], ['display: inline-block' ] ],
    [ ['block'], ['display: block' ] ],
    [ ['flex'], ['display: flex' ] ],
    [ ['none'], ['display: none' ] ],

    [ ['column', 'col', 'flex-column'], ['flex-direction: column' ] ],
    [ ['row', 'flex-row'], ['flex-direction: row' ] ],

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

    [ ['italic'], ['font-style: italic' ] ],
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
    [ ['invisible', 'hidden'], ['opacity: 0' ] ],
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
            [ 'flex-end', 'fe' ], 
            [ 'start', 's' ], 
            [ 'flex-start', 'fs' ], 
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
    const which = (idx == 0) ? 'align items / self' : 'align content'

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

        if (i == 0) {
            api.push( {
                type: 'h3',
                id: pair[1] == '' ? 'positions' : pair[1]
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

                    // em --------------

                    const em = (num+'').replace('-','.')
                    str += `\n\t${ a }${ run( propDash, em, 'em', '\n\t\t') }` // add rule
                    str += `\n\t${ b }\n\t\t> *${ run( propDash, em, 'em', '\n\t\t\t') }`

                    // px --------------

                    str += `\n\t${ pxA }${ run( propDash, i * 10, 'px', '\n\t\t') }` // add rule
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
                        second = `${ run( propDash, i/10, 'px', '\n\t\t', tt) }` // add rule
                        bs += first + second

                    })

                    str += bs

                }

                // --------->

                _classes += str


                if ( i == 0 ) {

                    const wang = `<span>[0-100(0)]</span>`
                    const stroke = '<span>[solid|dashed|dotted]</span>'
                    const unit = `<span class="second">${ isBorder ? 'px' : '[em|px|pc]'}</span>`
                    let aa = [ classList.map( c => name + c + `${wang}${isBorder ? '-<span class="second">[solid|dashed|dotted]</span>' : unit.replaceAll('em', '~')}` ), run( propDash, wang, unit, '$', stroke ) ]
                    let bb = [ c, run( propDash, wang, unit, '$', stroke ) ]

                    aa[1] = aa[1].split('$').filter(e => e.length != 0)
                    bb[1] = bb[1].split('$').filter(e => e.length != 0)

                    apiTable.push( aa )

                } 

            })

        } else {

            // normal --------------------------------------------

            const name = names[0]


            let types = [ ['em', 'em', '[0-100]'], ['px', 'px', '[0-1000]'], ['pc', '%', '[0-100]']]
            if (name == 'h' || name == 'minh' || name == 'maxh') types.push( ['vh', 'vh', '[0-100]'])
            if (name == 'w' || name == 'minw' || name == 'maxw') types.push( ['vw', 'vw', '[0-100]'])

            types.forEach( pair => {
                let str = '\n\t'
                names.forEach( (n, iiii) => str += `.${n}${i}${pair[0]}${iiii == names.length - 1 ? '' : ', '}`)
                str += `\n\t\t${prop}: ${i}${pair[1]}`
                const wang = `<span>${pair[2]}</span>`
                const nnn = names.map( n => `${n}${wang}${pair[0]}`)
                if ( i == 0) apiTable.push( [ nnn, [ `${prop}: ${wang}${pair[1]}` ] ] )
                _classes += str
            })


            if ( i == 0 ) {
                _classes += `\n\t.${names[0]}-auto\n\t\t${prop}: auto`
                mixins += `\n=${names[0]}( $v )\n\t${prop}: $v`
                mixins += `\n=${names[0]}-auto()\n\t${prop}: auto`
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

const fs = require('fs')
const sass = require('node-sass')
const clean = require('clean-css')
const { Compress } = require('gzipper')


async function render( name, data ) {

    const sas = await fs.writeFileSync(`dist/${name}.sass`, data)
    console.log(`✅ 🚨  successfully written dist/${name}.sass`, sas)
    const css = await (await sass.renderSync({ file: `dist/${name}.sass`, indentedSyntax: true })).css.toString()
    const min = (await (new clean()).minify( css )).styles
    const wrtA = await fs.writeFileSync(`dist/${name}.css`, css )
    const wrtB = await fs.writeFileSync(`dist/${name}.min.css`, min )
    const rm = await fs.unlinkSync(`dist/${name}.sass`)
    console.log(`✅ 📜  successfully compiled dist/${name}.sass to  dist/${name}.css`)
    const gzip = new Compress(`dist/${name}.min.css`, 'dist', { verbose: true })
    const zippd = await gzip.run()
    console.log('✅ 🤐  successfully gzipped dist', zippd)
}

async function run() {

    const mix = await fs.writeFileSync('src/_shorthand.sass', file)
    console.log('✅ 💅  successfully written src/_shorthand.sass', mix)

    await render( 'shorthand', `@import '../src/sassis' 
html
    +shorthand `)
    await render( 'layout', `@import '../src/sassis' 
html
    +layout`)
    await render( 'all', `@import '../src/sassis' 
html
    +sassis
    +shorthand
    +layout`)

    api = `export default ${ JSON.stringify( api, null, 2 ) }`
    const js = await fs.writeFileSync('docs/src/data.js', api )
    console.log('✅ 🧩  successfully written Table.svelte', js)
}


run()
