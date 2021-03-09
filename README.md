# SASSIS

TODO / WIP

## basic 

<table>
<tr>
<td>absolute<br />abs</td><td>position: absolute</td></tr>
<tr>
<td>relative<br />rel</td><td>position: relative</td></tr>
<tr>
<td>fixed</td><td>position: fixed</td></tr>
<tr>
<td>sticky</td><td>position: sticky</td></tr>
<tr>
<td>table</td><td>display: table</td></tr>
<tr>
<td>inline</td><td>display: inline</td></tr>
<tr>
<td>inline-block</td><td>display: inline-block</td></tr>
<tr>
<td>block</td><td>display: block</td></tr>
<tr>
<td>flex</td><td>display: flex</td></tr>
<tr>
<td>none</td><td>display: none</td></tr>
<tr>
<td>column<br />col<br />flex-column</td><td>flex-direction: column</td></tr>
<tr>
<td>row<br />flex-row</td><td>flex-direction: row</td></tr>
<tr>
<td>grow</td><td>flex-grow: 1</td></tr>
<tr>
<td>no-grow<br />nogrow</td><td>flex-grow: 0</td></tr>
<tr>
<td>cgrow > *<br />c-grow > *</td><td>flex-grow: 1</td></tr>
<tr>
<td>cnogrow > *<br />cno-grow > *<br />c-no-grow > *</td><td>flex-grow: 0</td></tr>
<tr>
<td>shrink</td><td>flex-shrink: 1</td></tr>
<tr>
<td>no-shrink</td><td>flex-shrink: 0</td></tr>
<tr>
<td>no-basis</td><td>flex-basis: 0</td></tr>
<tr>
<td>wrap</td><td>flex-wrap: wrap</td></tr>
<tr>
<td>nowrap<br />no-wrap</td><td>flex-wrap: nowrap</td></tr>
<tr>
<td>auto-space > *</td><td>margin-left: var(--column-spacing)<br />&:first-child<br />	margin-left: 0</td></tr>
<tr>
<td>border-box</td><td>box-sizing: border-box</td></tr>
<tr>
<td>italic</td><td>font-style: italic</td></tr>
<tr>
<td>bold<br />strong</td><td>font-weight: bold</td></tr>
<tr>
<td>bolder<br />stronger</td><td>font-weight: bold</td></tr>
<tr>
<td>normal</td><td>font-weight: normal</td></tr>
<tr>
<td>light</td><td>font-weight: light</td></tr>
<tr>
<td>lighter</td><td>font-weight: lighter</td></tr>
<tr>
<td>text-left</td><td>text-align: left</td></tr>
<tr>
<td>text-center</td><td>text-align: center</td></tr>
<tr>
<td>text-right</td><td>text-align: right</td></tr>
<tr>
<td>pointer</td><td>cursor: pointer</td></tr>
<tr>
<td>visible</td><td>opacity: 1</td></tr>
<tr>
<td>invisible<br />hidden</td><td>opacity: 0</td></tr>
<tr>
<td>no-bg</td><td>background: transparent</td></tr>
<tr>
<td>overflow-hidden</td><td>overflow: hidden</td></tr>
<tr>
<td>overflow-auto</td><td>overflow: auto</td></tr>
<tr>
<td>margin-auto</td><td>margin: 0 auto</td></tr>
<tr>
<td>whitespace-pre<br />newlines</td><td>white-space: pre</td></tr>
<tr>
<td>whitespace-nowrap</td><td>white-space: nowrap</td></tr>
<tr>
<td>fill</td><td>position: absolute<br />width: 100%<br />height: 100%<br />top: 0<br />left: 0</td></tr>
<tr>
<td>no-webkit</td><td>-webkit-appearance: none</td></tr>
<tr>
<td>user-select-none</td><td>user-select: none</td></tr>
</table>

## layout 

<table>
<tr>
<td>flex</td><td>display: flex</td></tr>
<tr>
<td>grow</td><td>flex-grow: 1</td></tr>
<tr>
<td>cgrow > *<br />c-grow > *</td><td>flex-grow: 1</td></tr>
<tr>
<td>cnogrow > *<br />cno-grow > *<br />c-no-grow > *</td><td>flex-grow: 0</td></tr>
<tr>
<td>shrink</td><td>flex-shrink: 1</td></tr>
<tr>
<td>no-shrink</td><td>flex-shrink: 0</td></tr>
<tr>
<td>no-basis</td><td>flex-basis: 0</td></tr>
<tr>
<td>wrap</td><td>flex-wrap: wrap</td></tr>
<tr>
<td>nowrap<br />no-wrap</td><td>flex-wrap: nowrap</td></tr>
<tr>
<td>auto-space > *</td><td>margin-left: var(--column-spacing)<br />&:first-child<br />	margin-left: 0</td></tr>
</table>

## alignments 

<table>
<tr>
<td>row-{alert}[content]{end}-{alert}[items]{end}<br />+row({info}$x, $y{end})</td><td>justify-content: {alert}[content]{end}<br />align-items: {alert}[items]{end}<br />flex-direction: row</td></tr>
<tr>
<td>row-x-{alert}[content]{end}<br />+row-x({info}$val{end})</td><td>justify-content: {alert}[content]{end}</td></tr>
<tr>
<td>row-y-{alert}[items]{end}<br />+row-y({info}$val{end})</td><td>align-items: {alert}[items]{end}</td></tr>
<tr>
<td>row > .y-{alert}[items]{end}</td><td>align-self: {alert}[items]{end}</td></tr>
<tr>
<td>column-{alert}[items]{end}-{alert}[content]{end}<br />+column({info}$x, $y{end})</td><td>align-items: {alert}[items]{end}<br />justify-content: {alert}[content]{end}<br />flex-direction: column</td></tr>
<tr>
<td>column-x-{alert}[items]{end}<br />+column-x({info}$val{end})</td><td>align-items: {alert}[items]{end}</td></tr>
<tr>
<td>column > .x-{alert}[items]{end}</td><td>align-self: {alert}[items]{end}</td></tr>
<tr>
<td>column-y-{alert}[content]{end}<br />+column-y({info}$val{end})</td><td>justify-content: {alert}[content]{end}</td></tr>
</table>

## items 

<table>
<tr>
<td>align-self-center<br />a-s-c</td><td>align-self: center</td></tr>
<tr>
<td>align-self-end<br />a-s-e</td><td>align-self: end</td></tr>
<tr>
<td>align-self-flex-end<br />a-s-fe</td><td>align-self: flex-end</td></tr>
<tr>
<td>align-self-start<br />a-s-s</td><td>align-self: start</td></tr>
<tr>
<td>align-self-flex-start<br />a-s-fs</td><td>align-self: flex-start</td></tr>
<tr>
<td>align-self-stretch<br />a-s-str</td><td>align-self: stretch</td></tr>
<tr>
<td>align-self-baseline<br />a-s-b</td><td>align-self: baseline</td></tr>
<tr>
<td>align-items-center<br />a-i-c</td><td>align-items: center</td></tr>
<tr>
<td>align-items-end<br />a-i-e</td><td>align-items: end</td></tr>
<tr>
<td>align-items-flex-end<br />a-i-fe</td><td>align-items: flex-end</td></tr>
<tr>
<td>align-items-start<br />a-i-s</td><td>align-items: start</td></tr>
<tr>
<td>align-items-flex-start<br />a-i-fs</td><td>align-items: flex-start</td></tr>
<tr>
<td>align-items-stretch<br />a-i-str</td><td>align-items: stretch</td></tr>
<tr>
<td>align-items-baseline<br />a-i-b</td><td>align-items: baseline</td></tr>
<tr>
<td>justify-self-center<br />j-s-c</td><td>justify-self: center</td></tr>
<tr>
<td>justify-self-end<br />j-s-e</td><td>justify-self: end</td></tr>
<tr>
<td>justify-self-flex-end<br />j-s-fe</td><td>justify-self: flex-end</td></tr>
<tr>
<td>justify-self-start<br />j-s-s</td><td>justify-self: start</td></tr>
<tr>
<td>justify-self-flex-start<br />j-s-fs</td><td>justify-self: flex-start</td></tr>
<tr>
<td>justify-self-stretch<br />j-s-str</td><td>justify-self: stretch</td></tr>
<tr>
<td>justify-self-baseline<br />j-s-b</td><td>justify-self: baseline</td></tr>
<tr>
<td>justify-items-center<br />j-i-c</td><td>justify-items: center</td></tr>
<tr>
<td>justify-items-end<br />j-i-e</td><td>justify-items: end</td></tr>
<tr>
<td>justify-items-flex-end<br />j-i-fe</td><td>justify-items: flex-end</td></tr>
<tr>
<td>justify-items-start<br />j-i-s</td><td>justify-items: start</td></tr>
<tr>
<td>justify-items-flex-start<br />j-i-fs</td><td>justify-items: flex-start</td></tr>
<tr>
<td>justify-items-stretch<br />j-i-str</td><td>justify-items: stretch</td></tr>
<tr>
<td>justify-items-baseline<br />j-i-b</td><td>justify-items: baseline</td></tr>
</table>

## content 

<table>
<tr>
<td>align-content-space-between<br />align-content-between<br />a-c-b</td><td>align-content: space-between</td></tr>
<tr>
<td>align-content-space-evenly<br />align-content-evenly<br />a-c-e</td><td>align-content: space-evenly</td></tr>
<tr>
<td>align-content-space-around<br />align-content-around<br />a-c-a</td><td>align-content: space-around</td></tr>
<tr>
<td>align-content-left<br />a-c-l</td><td>align-content: left</td></tr>
<tr>
<td>align-content-right<br />a-c-r</td><td>align-content: right</td></tr>
<tr>
<td>align-content-center<br />a-c-c</td><td>align-content: center</td></tr>
<tr>
<td>align-content-end<br />a-c-e</td><td>align-content: end</td></tr>
<tr>
<td>align-content-flex-end<br />a-c-fe</td><td>align-content: flex-end</td></tr>
<tr>
<td>align-content-start<br />a-c-s</td><td>align-content: start</td></tr>
<tr>
<td>align-content-flex-start<br />a-c-fs</td><td>align-content: flex-start</td></tr>
<tr>
<td>align-content-stretch<br />a-c-str</td><td>align-content: stretch</td></tr>
<tr>
<td>justify-content-space-between<br />justify-content-between<br />j-c-b</td><td>justify-content: space-between</td></tr>
<tr>
<td>justify-content-space-evenly<br />justify-content-evenly<br />j-c-e</td><td>justify-content: space-evenly</td></tr>
<tr>
<td>justify-content-space-around<br />justify-content-around<br />j-c-a</td><td>justify-content: space-around</td></tr>
<tr>
<td>justify-content-left<br />j-c-l</td><td>justify-content: left</td></tr>
<tr>
<td>justify-content-right<br />j-c-r</td><td>justify-content: right</td></tr>
<tr>
<td>justify-content-center<br />j-c-c</td><td>justify-content: center</td></tr>
<tr>
<td>justify-content-end<br />j-c-e</td><td>justify-content: end</td></tr>
<tr>
<td>justify-content-flex-end<br />j-c-fe</td><td>justify-content: flex-end</td></tr>
<tr>
<td>justify-content-start<br />j-c-s</td><td>justify-content: start</td></tr>
<tr>
<td>justify-content-flex-start<br />j-c-fs</td><td>justify-content: flex-start</td></tr>
<tr>
<td>justify-content-stretch<br />j-c-str</td><td>justify-content: stretch</td></tr>
</table>

## padding 

<table>
<tr>
<td>pt{alert}[num]{end}{info}[~|px|pc]{end}<br />+pt({alert}$val{end})</td><td>padding-top: {alert}[num]{end}{info}[em|px|pc]{end}</td></tr>
<tr>
<td>pr{alert}[num]{end}{info}[~|px|pc]{end}<br />+pr({alert}$val{end})</td><td>padding-right: {alert}[num]{end}{info}[em|px|pc]{end}</td></tr>
<tr>
<td>pl{alert}[num]{end}{info}[~|px|pc]{end}<br />+pl({alert}$val{end})</td><td>padding-left: {alert}[num]{end}{info}[em|px|pc]{end}</td></tr>
<tr>
<td>pb{alert}[num]{end}{info}[~|px|pc]{end}<br />+pb({alert}$val{end})</td><td>padding-bottom: {alert}[num]{end}{info}[em|px|pc]{end}</td></tr>
<tr>
<td>plr{alert}[num]{end}{info}[~|px|pc]{end}<br />+plr({alert}$val{end})</td><td>padding-left: {alert}[num]{end}{info}[em|px|pc]{end} <br />padding-right: {alert}[num]{end}{info}[em|px|pc]{end}</td></tr>
<tr>
<td>ptb{alert}[num]{end}{info}[~|px|pc]{end}<br />+ptb({alert}$val{end})</td><td>padding-top: {alert}[num]{end}{info}[em|px|pc]{end} <br />padding-bottom: {alert}[num]{end}{info}[em|px|pc]{end}</td></tr>
<tr>
<td>p{alert}[num]{end}{info}[~|px|pc]{end}<br />+p({alert}$val{end})</td><td>padding: {alert}[num]{end}{info}[em|px|pc]{end} </td></tr>
<tr>
<td>cp{succ}[rule]{end}<br />+cp{succ}[rule]{end}</td><td>> *<br />{succ}[rule]{end}</td></tr>
</table>

## margin 

<table>
<tr>
<td>mt{alert}[num]{end}{info}[~|px|pc]{end}<br />+mt({alert}$val{end})</td><td>margin-top: {alert}[num]{end}{info}[em|px|pc]{end}</td></tr>
<tr>
<td>mr{alert}[num]{end}{info}[~|px|pc]{end}<br />+mr({alert}$val{end})</td><td>margin-right: {alert}[num]{end}{info}[em|px|pc]{end}</td></tr>
<tr>
<td>ml{alert}[num]{end}{info}[~|px|pc]{end}<br />+ml({alert}$val{end})</td><td>margin-left: {alert}[num]{end}{info}[em|px|pc]{end}</td></tr>
<tr>
<td>mb{alert}[num]{end}{info}[~|px|pc]{end}<br />+mb({alert}$val{end})</td><td>margin-bottom: {alert}[num]{end}{info}[em|px|pc]{end}</td></tr>
<tr>
<td>mlr{alert}[num]{end}{info}[~|px|pc]{end}<br />+mlr({alert}$val{end})</td><td>margin-left: {alert}[num]{end}{info}[em|px|pc]{end} <br />margin-right: {alert}[num]{end}{info}[em|px|pc]{end}</td></tr>
<tr>
<td>mtb{alert}[num]{end}{info}[~|px|pc]{end}<br />+mtb({alert}$val{end})</td><td>margin-top: {alert}[num]{end}{info}[em|px|pc]{end} <br />margin-bottom: {alert}[num]{end}{info}[em|px|pc]{end}</td></tr>
<tr>
<td>m{alert}[num]{end}{info}[~|px|pc]{end}<br />+m({alert}$val{end})</td><td>margin: {alert}[num]{end}{info}[em|px|pc]{end} </td></tr>
<tr>
<td>cm{succ}[rule]{end}<br />+cm{succ}[rule]{end}</td><td>> *<br />{succ}[rule]{end}</td></tr>
</table>

## border 

<table>
<tr>
<td>bt{alert}[0-10]{end}-{info}[solid|dashed|dotted]{end}<br />+bt({alert}$val{end}, {info}$type{end})</td><td>border-top-width: {alert}[0-10]{end}px <br />border-top-style: {info}[solid|dashed|dotted]{end}</td></tr>
<tr>
<td>br{alert}[0-10]{end}-{info}[solid|dashed|dotted]{end}<br />+br({alert}$val{end}, {info}$type{end})</td><td>border-right-width: {alert}[0-10]{end}px <br />border-right-style: {info}[solid|dashed|dotted]{end}</td></tr>
<tr>
<td>bl{alert}[0-10]{end}-{info}[solid|dashed|dotted]{end}<br />+bl({alert}$val{end}, {info}$type{end})</td><td>border-left-width: {alert}[0-10]{end}px <br />border-left-style: {info}[solid|dashed|dotted]{end}</td></tr>
<tr>
<td>bb{alert}[0-10]{end}-{info}[solid|dashed|dotted]{end}<br />+bb({alert}$val{end}, {info}$type{end})</td><td>border-bottom-width: {alert}[0-10]{end}px <br />border-bottom-style: {info}[solid|dashed|dotted]{end}</td></tr>
<tr>
<td>blr{alert}[0-10]{end}-{info}[solid|dashed|dotted]{end}<br />+blr({alert}$val{end}, {info}$type{end})</td><td>border-left-width: {alert}[0-10]{end}px <br />border-right-width: {alert}[0-10]{end}px <br />border-right-style: {info}[solid|dashed|dotted]{end} <br />border-left-style: {info}[solid|dashed|dotted]{end}</td></tr>
<tr>
<td>btb{alert}[0-10]{end}-{info}[solid|dashed|dotted]{end}<br />+btb({alert}$val{end}, {info}$type{end})</td><td>border-top-width: {alert}[0-10]{end}px <br />border-bottom-width: {alert}[0-10]{end}px <br />border-top-style: {info}[solid|dashed|dotted]{end} <br />border-bottom-style: {info}[solid|dashed|dotted]{end}</td></tr>
<tr>
<td>b{alert}[0-10]{end}-{info}[solid|dashed|dotted]{end}<br />+b({alert}$val{end}, {info}$type{end})</td><td>border: {alert}[0-10]{end}px {info}[solid|dashed|dotted]{end}</td></tr>
<tr>
<td>cb{succ}[rule]{end}<br />+cb{succ}[rule]{end}</td><td>> *<br />{succ}[rule]{end}</td></tr>
</table>

## flex-basis 

<table>
<tr>
<td>s{alert}[num]{end}{info}[~|px|pc]{end}<br />+s({alert}$val{end})</td><td>flex-basis: {alert}[num]{end}{info}[em|px|pc]{end}</td></tr>
<tr>
<td>cs{succ}[rule]{end}<br />+cs{succ}[rule]{end}</td><td>> .spacer<br />{succ}[rule]{end}</td></tr>
</table>

## position 

<table>
<tr>
<td>t{alert}[num]{end}{info}[~|px|pc]{end}<br />+t({alert}$val{end})</td><td>top: {alert}[num]{end}{info}[em|px|pc]{end}</td></tr>
<tr>
<td>r{alert}[num]{end}{info}[~|px|pc]{end}<br />+r({alert}$val{end})</td><td>right: {alert}[num]{end}{info}[em|px|pc]{end}</td></tr>
<tr>
<td>l{alert}[num]{end}{info}[~|px|pc]{end}<br />+l({alert}$val{end})</td><td>left: {alert}[num]{end}{info}[em|px|pc]{end}</td></tr>
<tr>
<td>b{alert}[num]{end}{info}[~|px|pc]{end}<br />+b({alert}$val{end})</td><td>bottom: {alert}[num]{end}{info}[em|px|pc]{end}</td></tr>
<tr>
<td>lr{alert}[num]{end}{info}[~|px|pc]{end}<br />+lr({alert}$val{end})</td><td>left: {alert}[num]{end}{info}[em|px|pc]{end} <br />right: {alert}[num]{end}{info}[em|px|pc]{end}</td></tr>
<tr>
<td>tb{alert}[num]{end}{info}[~|px|pc]{end}<br />+tb({alert}$val{end})</td><td>top: {alert}[num]{end}{info}[em|px|pc]{end} <br />bottom: {alert}[num]{end}{info}[em|px|pc]{end}</td></tr>
<tr>
<td>c{succ}[rule]{end}<br />+c{succ}[rule]{end}</td><td>> *<br />{succ}[rule]{end}</td></tr>
</table>

## width 

<table>
<tr>
<td>w{alert}[0-100]{end}em<br />+w({info}$val{end})</td><td>width: {alert}[0-100]{end}em</td></tr>
<tr>
<td>w{alert}[0-1000]{end}px<br />+w({info}$val{end})</td><td>width: {alert}[0-1000]{end}px</td></tr>
<tr>
<td>w{alert}[0-100]{end}pc<br />+w({info}$val{end})</td><td>width: {alert}[0-100]{end}%</td></tr>
<tr>
<td>w{alert}[0-100]{end}vw<br />+w({info}$val{end})</td><td>width: {alert}[0-100]{end}vw</td></tr>
<tr>
<td>w-auto<br />+w-auto</td><td>width: auto</td></tr>
</table>

## height 

<table>
<tr>
<td>h{alert}[0-100]{end}em<br />+h({info}$val{end})</td><td>height: {alert}[0-100]{end}em</td></tr>
<tr>
<td>h{alert}[0-1000]{end}px<br />+h({info}$val{end})</td><td>height: {alert}[0-1000]{end}px</td></tr>
<tr>
<td>h{alert}[0-100]{end}pc<br />+h({info}$val{end})</td><td>height: {alert}[0-100]{end}%</td></tr>
<tr>
<td>h{alert}[0-100]{end}vh<br />+h({info}$val{end})</td><td>height: {alert}[0-100]{end}vh</td></tr>
<tr>
<td>h-auto<br />+h-auto</td><td>height: auto</td></tr>
</table>

## min-width 

<table>
<tr>
<td>minw{alert}[0-100]{end}em<br />+minw({info}$val{end})</td><td>min-width: {alert}[0-100]{end}em</td></tr>
<tr>
<td>minw{alert}[0-1000]{end}px<br />+minw({info}$val{end})</td><td>min-width: {alert}[0-1000]{end}px</td></tr>
<tr>
<td>minw{alert}[0-100]{end}pc<br />+minw({info}$val{end})</td><td>min-width: {alert}[0-100]{end}%</td></tr>
<tr>
<td>minw{alert}[0-100]{end}vw<br />+minw({info}$val{end})</td><td>min-width: {alert}[0-100]{end}vw</td></tr>
<tr>
<td>minw-auto<br />+minw-auto</td><td>min-width: auto</td></tr>
</table>

## min-height 

<table>
<tr>
<td>minh{alert}[0-100]{end}em<br />+minh({info}$val{end})</td><td>min-height: {alert}[0-100]{end}em</td></tr>
<tr>
<td>minh{alert}[0-1000]{end}px<br />+minh({info}$val{end})</td><td>min-height: {alert}[0-1000]{end}px</td></tr>
<tr>
<td>minh{alert}[0-100]{end}pc<br />+minh({info}$val{end})</td><td>min-height: {alert}[0-100]{end}%</td></tr>
<tr>
<td>minh{alert}[0-100]{end}vh<br />+minh({info}$val{end})</td><td>min-height: {alert}[0-100]{end}vh</td></tr>
<tr>
<td>minh-auto<br />+minh-auto</td><td>min-height: auto</td></tr>
</table>

## max-width 

<table>
<tr>
<td>maxw{alert}[0-100]{end}em<br />+maxw({info}$val{end})</td><td>max-width: {alert}[0-100]{end}em</td></tr>
<tr>
<td>maxw{alert}[0-1000]{end}px<br />+maxw({info}$val{end})</td><td>max-width: {alert}[0-1000]{end}px</td></tr>
<tr>
<td>maxw{alert}[0-100]{end}pc<br />+maxw({info}$val{end})</td><td>max-width: {alert}[0-100]{end}%</td></tr>
<tr>
<td>maxw{alert}[0-100]{end}vw<br />+maxw({info}$val{end})</td><td>max-width: {alert}[0-100]{end}vw</td></tr>
<tr>
<td>maxw-auto<br />+maxw-auto</td><td>max-width: auto</td></tr>
</table>

## max-height 

<table>
<tr>
<td>maxh{alert}[0-100]{end}em<br />+maxh({info}$val{end})</td><td>max-height: {alert}[0-100]{end}em</td></tr>
<tr>
<td>maxh{alert}[0-1000]{end}px<br />+maxh({info}$val{end})</td><td>max-height: {alert}[0-1000]{end}px</td></tr>
<tr>
<td>maxh{alert}[0-100]{end}pc<br />+maxh({info}$val{end})</td><td>max-height: {alert}[0-100]{end}%</td></tr>
<tr>
<td>maxh{alert}[0-100]{end}vh<br />+maxh({info}$val{end})</td><td>max-height: {alert}[0-100]{end}vh</td></tr>
<tr>
<td>maxh-auto<br />+maxh-auto</td><td>max-height: auto</td></tr>
</table>

## flex-basis 

<table>
<tr>
<td>basis{alert}[0-100]{end}em<br />+basis({info}$val{end})</td><td>flex-basis: {alert}[0-100]{end}em</td></tr>
<tr>
<td>basis{alert}[0-1000]{end}px<br />+basis({info}$val{end})</td><td>flex-basis: {alert}[0-1000]{end}px</td></tr>
<tr>
<td>basis{alert}[0-100]{end}pc<br />+basis({info}$val{end})</td><td>flex-basis: {alert}[0-100]{end}%</td></tr>
<tr>
<td>basis-auto<br />+basis-auto</td><td>flex-basis: auto</td></tr>
</table>

## border-radius 

<table>
<tr>
<td>radius{alert}[0-100]{end}{info}[em|pc|px]{end}<br />+radius($val)</td><td>border-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}</td></tr>
<tr>
<td>radius{alert}[0-100]{end}{info}[em|pc|px]{end}-top<br />+radius-top($val)</td><td>border-top-left-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}<br />border-top-right-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}</td></tr>
<tr>
<td>radius{alert}[0-100]{end}{info}[em|pc|px]{end}-bottom<br />+radius-bottom($val)</td><td>border-bottom-left-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}<br />border-bottom-right-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}</td></tr>
<tr>
<td>radius{alert}[0-100]{end}{info}[em|pc|px]{end}-left<br />+radius-left($val)</td><td>border-top-left-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}<br />border-bottom-left-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}</td></tr>
<tr>
<td>radius{alert}[0-100]{end}{info}[em|pc|px]{end}-right<br />+radius-right($val)</td><td>border-top-right-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}<br />border-bottom-right-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}</td></tr>
<tr>
<td>radius{alert}[0-1000]{end}{info}[em|pc|px]{end}-top<br />+radius-top($val)</td><td>border-top-left-radius: {alert}[0-1000]{end}{info}[em|pc|px]{end}<br />border-top-right-radius: {alert}[0-1000]{end}{info}[em|pc|px]{end}</td></tr>
<tr>
<td>radius{alert}[0-1000]{end}{info}[em|pc|px]{end}-bottom<br />+radius-bottom($val)</td><td>border-bottom-left-radius: {alert}[0-1000]{end}{info}[em|pc|px]{end}<br />border-bottom-right-radius: {alert}[0-1000]{end}{info}[em|pc|px]{end}</td></tr>
<tr>
<td>radius{alert}[0-1000]{end}{info}[em|pc|px]{end}-left<br />+radius-left($val)</td><td>border-top-left-radius: {alert}[0-1000]{end}{info}[em|pc|px]{end}<br />border-bottom-left-radius: {alert}[0-1000]{end}{info}[em|pc|px]{end}</td></tr>
<tr>
<td>radius{alert}[0-1000]{end}{info}[em|pc|px]{end}-right<br />+radius-right($val)</td><td>border-top-right-radius: {alert}[0-1000]{end}{info}[em|pc|px]{end}<br />border-bottom-right-radius: {alert}[0-1000]{end}{info}[em|pc|px]{end}</td></tr>
<tr>
<td>radius{alert}[0-100]{end}{info}[em|pc|px]{end}-top<br />+radius-top($val)</td><td>border-top-left-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}<br />border-top-right-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}</td></tr>
<tr>
<td>radius{alert}[0-100]{end}{info}[em|pc|px]{end}-bottom<br />+radius-bottom($val)</td><td>border-bottom-left-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}<br />border-bottom-right-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}</td></tr>
<tr>
<td>radius{alert}[0-100]{end}{info}[em|pc|px]{end}-left<br />+radius-left($val)</td><td>border-top-left-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}<br />border-bottom-left-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}</td></tr>
<tr>
<td>radius{alert}[0-100]{end}{info}[em|pc|px]{end}-right<br />+radius-right($val)</td><td>border-top-right-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}<br />border-bottom-right-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}</td></tr>
<tr>
<td>radius-auto<br />+radius-auto</td><td>border-radius: auto</td></tr>
</table>

## transform 

<table>
<tr>
<td>translate{alert}00{end}</td><td>transform: translate( {alert}0%, 0%{end})</td></tr>
<tr>
<td>origin{alert}00{end}</td><td>transform-origin: {alert}0% 0%{end}</td></tr>
<tr>
<td>translate{alert}0-50{end}</td><td>transform: translate( {alert}0%, -50%{end})</td></tr>
<tr>
<td>origin{alert}0-50{end}</td><td>transform-origin: {alert}0% -50%{end}</td></tr>
<tr>
<td>translate{alert}050{end}</td><td>transform: translate( {alert}0%, 50%{end})</td></tr>
<tr>
<td>origin{alert}050{end}</td><td>transform-origin: {alert}0% 50%{end}</td></tr>
<tr>
<td>translate{alert}0100{end}</td><td>transform: translate( {alert}0%, 100%{end})</td></tr>
<tr>
<td>origin{alert}0100{end}</td><td>transform-origin: {alert}0% 100%{end}</td></tr>
<tr>
<td>translate{alert}0-100{end}</td><td>transform: translate( {alert}0%, -100%{end})</td></tr>
<tr>
<td>origin{alert}0-100{end}</td><td>transform-origin: {alert}0% -100%{end}</td></tr>
<tr>
<td>translate{alert}-500{end}</td><td>transform: translate( {alert}-50%, 0%{end})</td></tr>
<tr>
<td>origin{alert}-500{end}</td><td>transform-origin: {alert}-50% 0%{end}</td></tr>
<tr>
<td>translate{alert}-50-50{end}</td><td>transform: translate( {alert}-50%, -50%{end})</td></tr>
<tr>
<td>origin{alert}-50-50{end}</td><td>transform-origin: {alert}-50% -50%{end}</td></tr>
<tr>
<td>translate{alert}-5050{end}</td><td>transform: translate( {alert}-50%, 50%{end})</td></tr>
<tr>
<td>origin{alert}-5050{end}</td><td>transform-origin: {alert}-50% 50%{end}</td></tr>
<tr>
<td>translate{alert}-50100{end}</td><td>transform: translate( {alert}-50%, 100%{end})</td></tr>
<tr>
<td>origin{alert}-50100{end}</td><td>transform-origin: {alert}-50% 100%{end}</td></tr>
<tr>
<td>translate{alert}-50-100{end}</td><td>transform: translate( {alert}-50%, -100%{end})</td></tr>
<tr>
<td>origin{alert}-50-100{end}</td><td>transform-origin: {alert}-50% -100%{end}</td></tr>
<tr>
<td>translate{alert}500{end}</td><td>transform: translate( {alert}50%, 0%{end})</td></tr>
<tr>
<td>origin{alert}500{end}</td><td>transform-origin: {alert}50% 0%{end}</td></tr>
<tr>
<td>translate{alert}50-50{end}</td><td>transform: translate( {alert}50%, -50%{end})</td></tr>
<tr>
<td>origin{alert}50-50{end}</td><td>transform-origin: {alert}50% -50%{end}</td></tr>
<tr>
<td>translate{alert}5050{end}</td><td>transform: translate( {alert}50%, 50%{end})</td></tr>
<tr>
<td>origin{alert}5050{end}</td><td>transform-origin: {alert}50% 50%{end}</td></tr>
<tr>
<td>translate{alert}50100{end}</td><td>transform: translate( {alert}50%, 100%{end})</td></tr>
<tr>
<td>origin{alert}50100{end}</td><td>transform-origin: {alert}50% 100%{end}</td></tr>
<tr>
<td>translate{alert}50-100{end}</td><td>transform: translate( {alert}50%, -100%{end})</td></tr>
<tr>
<td>origin{alert}50-100{end}</td><td>transform-origin: {alert}50% -100%{end}</td></tr>
<tr>
<td>translate{alert}1000{end}</td><td>transform: translate( {alert}100%, 0%{end})</td></tr>
<tr>
<td>origin{alert}1000{end}</td><td>transform-origin: {alert}100% 0%{end}</td></tr>
<tr>
<td>translate{alert}100-50{end}</td><td>transform: translate( {alert}100%, -50%{end})</td></tr>
<tr>
<td>origin{alert}100-50{end}</td><td>transform-origin: {alert}100% -50%{end}</td></tr>
<tr>
<td>translate{alert}10050{end}</td><td>transform: translate( {alert}100%, 50%{end})</td></tr>
<tr>
<td>origin{alert}10050{end}</td><td>transform-origin: {alert}100% 50%{end}</td></tr>
<tr>
<td>translate{alert}100100{end}</td><td>transform: translate( {alert}100%, 100%{end})</td></tr>
<tr>
<td>origin{alert}100100{end}</td><td>transform-origin: {alert}100% 100%{end}</td></tr>
<tr>
<td>translate{alert}100-100{end}</td><td>transform: translate( {alert}100%, -100%{end})</td></tr>
<tr>
<td>origin{alert}100-100{end}</td><td>transform-origin: {alert}100% -100%{end}</td></tr>
<tr>
<td>translate{alert}-1000{end}</td><td>transform: translate( {alert}-100%, 0%{end})</td></tr>
<tr>
<td>origin{alert}-1000{end}</td><td>transform-origin: {alert}-100% 0%{end}</td></tr>
<tr>
<td>translate{alert}-100-50{end}</td><td>transform: translate( {alert}-100%, -50%{end})</td></tr>
<tr>
<td>origin{alert}-100-50{end}</td><td>transform-origin: {alert}-100% -50%{end}</td></tr>
<tr>
<td>translate{alert}-10050{end}</td><td>transform: translate( {alert}-100%, 50%{end})</td></tr>
<tr>
<td>origin{alert}-10050{end}</td><td>transform-origin: {alert}-100% 50%{end}</td></tr>
<tr>
<td>translate{alert}-100100{end}</td><td>transform: translate( {alert}-100%, 100%{end})</td></tr>
<tr>
<td>origin{alert}-100100{end}</td><td>transform-origin: {alert}-100% 100%{end}</td></tr>
<tr>
<td>translate{alert}-100-100{end}</td><td>transform: translate( {alert}-100%, -100%{end})</td></tr>
<tr>
<td>origin{alert}-100-100{end}</td><td>transform-origin: {alert}-100% -100%{end}</td></tr>
</table>

## font-size 

<table>
<tr>
<td>f0, h6, .h6<br />+f0</td><td>font-size: {alert}0.785714rem{end}</td></tr>
<tr>
<td>f1, h5, .h5<br />+f1</td><td>font-size: {alert}1rem{end}</td></tr>
<tr>
<td>f2, h4, .h4<br />+f2</td><td>font-size: {alert}1.2857rem{end}</td></tr>
<tr>
<td>f3, h3, .h3<br />+f3</td><td>font-size: {alert}1.64285rem{end}</td></tr>
<tr>
<td>f4, h2, .h2<br />+f4</td><td>font-size: {alert}2.071428rem{end}</td></tr>
<tr>
<td>f5, h1, .h1<br />+f5</td><td>font-size: {alert}2.642857rem{end}</td></tr>
</table>

## z-index 

<table>
<tr>
<td>z-index{alert}0-99{end}<br />+z-index( {alert}$z{end} )</td><td>z-index: {alert}0-99{end}</td></tr>
</table>

## font-family 

<table>
<tr>
<td>monospace<br />+monospace</td><td>font-family: {info}var(--font-monospace){end}</td></tr>
<tr>
<td>serif<br />+serif</td><td>font-family: {info}var(--font-serif){end}</td></tr>
<tr>
<td>sans-serif<br />+sans-serif</td><td>font-family: {info}var(--font-sans-serif){end}</td></tr>
<tr>
<td>cursive<br />+cursive</td><td>font-family: {info}var(--font-cursive){end}</td></tr>
<tr>
<td>slab<br />+slab</td><td>font-family: {info}var(--font-slab){end}</td></tr>
<tr>
<td>grotesque<br />+grotesque</td><td>font-family: {info}var(--font-grotesque){end}</td></tr>
</table>

