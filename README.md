SASSIS is a SASS / CSS library for shorthand frontend styling.

[website documentation](https://autr.github.io/sassis) / [github repository](https://github.com/autr/sassis)



## basic 

<table>
<tr>
<td>.absolute<br />.abs</td><td>position: absolute</td></tr>
<tr>
<td>.relative<br />.rel</td><td>position: relative</td></tr>
<tr>
<td>.fixed</td><td>position: fixed</td></tr>
<tr>
<td>.sticky</td><td>position: sticky</td></tr>
<tr>
<td>.table</td><td>display: table</td></tr>
<tr>
<td>.inline<br />.i</td><td>display: inline</td></tr>
<tr>
<td>.inline-block</td><td>display: inline-block</td></tr>
<tr>
<td>.block</td><td>display: block</td></tr>
<tr>
<td>.flex</td><td>display: flex</td></tr>
<tr>
<td>.none</td><td>display: none</td></tr>
<tr>
<td>.column<br />.col<br />.flex-column</td><td>flex-direction: column</td></tr>
<tr>
<td>.row<br />.flex-row</td><td>flex-direction: row</td></tr>
<tr>
<td>.row-reverse<br />.flex-row-reverse</td><td>flex-direction: row-reverse</td></tr>
<tr>
<td>.column-reverse<br />.flex-column-reverse</td><td>flex-direction: column-reverse</td></tr>
<tr>
<td>.grow</td><td>flex-grow: 1</td></tr>
<tr>
<td>.no-grow<br />.nogrow</td><td>flex-grow: 0</td></tr>
<tr>
<td>.cgrow > *<br />.c-grow > *</td><td>flex-grow: 1</td></tr>
<tr>
<td>.cnogrow > *<br />.cno-grow > *<br />.c-no-grow > *</td><td>flex-grow: 0</td></tr>
<tr>
<td>.shrink</td><td>flex-shrink: 1</td></tr>
<tr>
<td>.no-shrink</td><td>flex-shrink: 0</td></tr>
<tr>
<td>.no-basis</td><td>flex-basis: 0</td></tr>
<tr>
<td>.wrap</td><td>flex-wrap: wrap</td></tr>
<tr>
<td>.nowrap<br />.no-wrap</td><td>flex-wrap: nowrap</td></tr>
<tr>
<td>.auto-space > *</td><td>margin-left: var(--column-spacing)<br />&:first-child<br />	margin-left: 0</td></tr>
<tr>
<td>.border-box</td><td>box-sizing: border-box</td></tr>
<tr>
<td>.italic</td><td>font-style: italic</td></tr>
<tr>
<td>.bold<br />.strong</td><td>font-weight: bold</td></tr>
<tr>
<td>.bolder<br />.stronger</td><td>font-weight: bold</td></tr>
<tr>
<td>.normal</td><td>font-weight: normal</td></tr>
<tr>
<td>.light</td><td>font-weight: light</td></tr>
<tr>
<td>.lighter</td><td>font-weight: lighter</td></tr>
<tr>
<td>.text-left</td><td>text-align: left</td></tr>
<tr>
<td>.text-center</td><td>text-align: center</td></tr>
<tr>
<td>.text-right</td><td>text-align: right</td></tr>
<tr>
<td>.capitalize</td><td>text-transform: capitalize</td></tr>
<tr>
<td>.uppercase</td><td>text-transform: uppercase</td></tr>
<tr>
<td>.lowercase</td><td>text-transform: lowercase</td></tr>
<tr>
<td>.underline</td><td>text-decoration: underline</td></tr>
<tr>
<td>.strike-through<br />.line-through<br />.cross-out</td><td>text-decoration: line-through</td></tr>
<tr>
<td>.pointer</td><td>cursor: pointer</td></tr>
<tr>
<td>.grab</td><td>cursor: grab</td></tr>
<tr>
<td>.grabbing</td><td>cursor: grabbing</td></tr>
<tr>
<td>.visible</td><td>opacity: 1</td></tr>
<tr>
<td>.invisible<br />.hidden</td><td>opacity: 0</td></tr>
<tr>
<td>.no-bg</td><td>background: transparent</td></tr>
<tr>
<td>.overflow-hidden</td><td>overflow: hidden</td></tr>
<tr>
<td>.overflow-auto</td><td>overflow: auto</td></tr>
<tr>
<td>.margin-auto</td><td>margin: auto auto</td></tr>
<tr>
<td>.whitespace-normal</td><td>white-space: normal</td></tr>
<tr>
<td>.whitespace-pre<br />.newlines</td><td>white-space: pre</td></tr>
<tr>
<td>.whitespace-nowrap</td><td>white-space: nowrap</td></tr>
<tr>
<td>.whitespace-prewrap</td><td>white-space: pre-wrap</td></tr>
<tr>
<td>.fill</td><td>position: absolute<br />width: 100%<br />height: 100%<br />top: 0<br />left: 0</td></tr>
<tr>
<td>.no-webkit</td><td>-webkit-appearance: none</td></tr>
<tr>
<td>.user-select-none</td><td>user-select: none</td></tr>
</table>

## layout 

<table>
<tr>
<td>.flex</td><td>display: flex</td></tr>
<tr>
<td>.grow</td><td>flex-grow: 1</td></tr>
<tr>
<td>.cgrow > *<br />.c-grow > *</td><td>flex-grow: 1</td></tr>
<tr>
<td>.cnogrow > *<br />.cno-grow > *<br />.c-no-grow > *</td><td>flex-grow: 0</td></tr>
<tr>
<td>.shrink</td><td>flex-shrink: 1</td></tr>
<tr>
<td>.no-shrink</td><td>flex-shrink: 0</td></tr>
<tr>
<td>.no-basis</td><td>flex-basis: 0</td></tr>
<tr>
<td>.wrap</td><td>flex-wrap: wrap</td></tr>
<tr>
<td>.nowrap<br />.no-wrap</td><td>flex-wrap: nowrap</td></tr>
<tr>
<td>.auto-space > *</td><td>margin-left: var(--column-spacing)<br />&:first-child<br />	margin-left: 0</td></tr>
</table>

## alignments 

<table>
<tr>
<td>.row-<em>[content]</em>-<em>[items]</em><br />.+row(<em>$x, $y</em>)</td><td>justify-content: <em>[content]</em><br />align-items: <em>[items]</em><br />flex-direction: row</td></tr>
<tr>
<td>.row-x-<em>[content]</em><br />.+row-x(<em>$val</em>)</td><td>justify-content: <em>[content]</em></td></tr>
<tr>
<td>.row-y-<em>[items]</em><br />.+row-y(<em>$val</em>)</td><td>align-items: <em>[items]</em></td></tr>
<tr>
<td>.row > .y-<em>[items]</em></td><td>align-self: <em>[items]</em></td></tr>
<tr>
<td>.column-<em>[items]</em>-<em>[content]</em><br />.+column(<em>$x, $y</em>)</td><td>align-items: <em>[items]</em><br />justify-content: <em>[content]</em><br />flex-direction: column</td></tr>
<tr>
<td>.column-x-<em>[items]</em><br />.+column-x(<em>$val</em>)</td><td>align-items: <em>[items]</em></td></tr>
<tr>
<td>.column > .x-<em>[items]</em></td><td>align-self: <em>[items]</em></td></tr>
<tr>
<td>.column-y-<em>[content]</em><br />.+column-y(<em>$val</em>)</td><td>justify-content: <em>[content]</em></td></tr>
</table>

## items 

<table>
<tr>
<td>.align-self-center</td><td>align-self: center</td></tr>
<tr>
<td>.align-self-end</td><td>align-self: end</td></tr>
<tr>
<td>.align-self-flex-end</td><td>align-self: flex-end</td></tr>
<tr>
<td>.align-self-start</td><td>align-self: start</td></tr>
<tr>
<td>.align-self-flex-start</td><td>align-self: flex-start</td></tr>
<tr>
<td>.align-self-stretch</td><td>align-self: stretch</td></tr>
<tr>
<td>.align-self-baseline</td><td>align-self: baseline</td></tr>
<tr>
<td>.align-items-center</td><td>align-items: center</td></tr>
<tr>
<td>.align-items-end</td><td>align-items: end</td></tr>
<tr>
<td>.align-items-flex-end</td><td>align-items: flex-end</td></tr>
<tr>
<td>.align-items-start</td><td>align-items: start</td></tr>
<tr>
<td>.align-items-flex-start</td><td>align-items: flex-start</td></tr>
<tr>
<td>.align-items-stretch</td><td>align-items: stretch</td></tr>
<tr>
<td>.align-items-baseline</td><td>align-items: baseline</td></tr>
<tr>
<td>.justify-self-center</td><td>justify-self: center</td></tr>
<tr>
<td>.justify-self-end</td><td>justify-self: end</td></tr>
<tr>
<td>.justify-self-flex-end</td><td>justify-self: flex-end</td></tr>
<tr>
<td>.justify-self-start</td><td>justify-self: start</td></tr>
<tr>
<td>.justify-self-flex-start</td><td>justify-self: flex-start</td></tr>
<tr>
<td>.justify-self-stretch</td><td>justify-self: stretch</td></tr>
<tr>
<td>.justify-self-baseline</td><td>justify-self: baseline</td></tr>
<tr>
<td>.justify-items-center</td><td>justify-items: center</td></tr>
<tr>
<td>.justify-items-end</td><td>justify-items: end</td></tr>
<tr>
<td>.justify-items-flex-end</td><td>justify-items: flex-end</td></tr>
<tr>
<td>.justify-items-start</td><td>justify-items: start</td></tr>
<tr>
<td>.justify-items-flex-start</td><td>justify-items: flex-start</td></tr>
<tr>
<td>.justify-items-stretch</td><td>justify-items: stretch</td></tr>
<tr>
<td>.justify-items-baseline</td><td>justify-items: baseline</td></tr>
</table>

## content 

<table>
<tr>
<td>.align-content-space-between</td><td>align-content: space-between</td></tr>
<tr>
<td>.align-content-space-evenly</td><td>align-content: space-evenly</td></tr>
<tr>
<td>.align-content-space-around</td><td>align-content: space-around</td></tr>
<tr>
<td>.align-content-left</td><td>align-content: left</td></tr>
<tr>
<td>.align-content-right</td><td>align-content: right</td></tr>
<tr>
<td>.align-content-center</td><td>align-content: center</td></tr>
<tr>
<td>.align-content-end</td><td>align-content: end</td></tr>
<tr>
<td>.align-content-flex-end</td><td>align-content: flex-end</td></tr>
<tr>
<td>.align-content-start</td><td>align-content: start</td></tr>
<tr>
<td>.align-content-flex-start</td><td>align-content: flex-start</td></tr>
<tr>
<td>.align-content-stretch</td><td>align-content: stretch</td></tr>
<tr>
<td>.justify-content-space-between</td><td>justify-content: space-between</td></tr>
<tr>
<td>.justify-content-space-evenly</td><td>justify-content: space-evenly</td></tr>
<tr>
<td>.justify-content-space-around</td><td>justify-content: space-around</td></tr>
<tr>
<td>.justify-content-left</td><td>justify-content: left</td></tr>
<tr>
<td>.justify-content-right</td><td>justify-content: right</td></tr>
<tr>
<td>.justify-content-center</td><td>justify-content: center</td></tr>
<tr>
<td>.justify-content-end</td><td>justify-content: end</td></tr>
<tr>
<td>.justify-content-flex-end</td><td>justify-content: flex-end</td></tr>
<tr>
<td>.justify-content-start</td><td>justify-content: start</td></tr>
<tr>
<td>.justify-content-flex-start</td><td>justify-content: flex-start</td></tr>
<tr>
<td>.justify-content-stretch</td><td>justify-content: stretch</td></tr>
</table>

## padding 

<table>
<tr>
<td>.pt<em>[num]</em><em>[~|px|pc]</em><br />.+pt(<em>$val</em>)</td><td>padding-top: <em>[num]</em><em>[em|px|pc]</em></td></tr>
<tr>
<td>.pr<em>[num]</em><em>[~|px|pc]</em><br />.+pr(<em>$val</em>)</td><td>padding-right: <em>[num]</em><em>[em|px|pc]</em></td></tr>
<tr>
<td>.pl<em>[num]</em><em>[~|px|pc]</em><br />.+pl(<em>$val</em>)</td><td>padding-left: <em>[num]</em><em>[em|px|pc]</em></td></tr>
<tr>
<td>.pb<em>[num]</em><em>[~|px|pc]</em><br />.+pb(<em>$val</em>)</td><td>padding-bottom: <em>[num]</em><em>[em|px|pc]</em></td></tr>
<tr>
<td>.plr<em>[num]</em><em>[~|px|pc]</em><br />.+plr(<em>$val</em>)</td><td>padding-left: <em>[num]</em><em>[em|px|pc]</em> <br />padding-right: <em>[num]</em><em>[em|px|pc]</em></td></tr>
<tr>
<td>.ptb<em>[num]</em><em>[~|px|pc]</em><br />.+ptb(<em>$val</em>)</td><td>padding-top: <em>[num]</em><em>[em|px|pc]</em> <br />padding-bottom: <em>[num]</em><em>[em|px|pc]</em></td></tr>
<tr>
<td>.p<em>[num]</em><em>[~|px|pc]</em><br />.+p(<em>$val</em>)</td><td>padding: <em>[num]</em><em>[em|px|pc]</em> </td></tr>
<tr>
<td>.cp{succ}[rule]</em><br />.+cp{succ}[rule]</em></td><td>> *<br />{succ}[rule]</em></td></tr>
</table>

## margin 

<table>
<tr>
<td>.mt<em>[num]</em><em>[~|px|pc]</em><br />.+mt(<em>$val</em>)</td><td>margin-top: <em>[num]</em><em>[em|px|pc]</em></td></tr>
<tr>
<td>.mr<em>[num]</em><em>[~|px|pc]</em><br />.+mr(<em>$val</em>)</td><td>margin-right: <em>[num]</em><em>[em|px|pc]</em></td></tr>
<tr>
<td>.ml<em>[num]</em><em>[~|px|pc]</em><br />.+ml(<em>$val</em>)</td><td>margin-left: <em>[num]</em><em>[em|px|pc]</em></td></tr>
<tr>
<td>.mb<em>[num]</em><em>[~|px|pc]</em><br />.+mb(<em>$val</em>)</td><td>margin-bottom: <em>[num]</em><em>[em|px|pc]</em></td></tr>
<tr>
<td>.mlr<em>[num]</em><em>[~|px|pc]</em><br />.+mlr(<em>$val</em>)</td><td>margin-left: <em>[num]</em><em>[em|px|pc]</em> <br />margin-right: <em>[num]</em><em>[em|px|pc]</em></td></tr>
<tr>
<td>.mtb<em>[num]</em><em>[~|px|pc]</em><br />.+mtb(<em>$val</em>)</td><td>margin-top: <em>[num]</em><em>[em|px|pc]</em> <br />margin-bottom: <em>[num]</em><em>[em|px|pc]</em></td></tr>
<tr>
<td>.m<em>[num]</em><em>[~|px|pc]</em><br />.+m(<em>$val</em>)</td><td>margin: <em>[num]</em><em>[em|px|pc]</em> </td></tr>
<tr>
<td>.cm{succ}[rule]</em><br />.+cm{succ}[rule]</em></td><td>> *<br />{succ}[rule]</em></td></tr>
</table>

## border 

<table>
<tr>
<td>.bt<em>[0-10]</em>-<em>[solid|dashed|dotted]</em><br />.+bt(<em>$val</em>, <em>$type</em>)</td><td>border-top-width: <em>[0-10]</em>px <br />border-top-style: <em>[solid|dashed|dotted]</em></td></tr>
<tr>
<td>.br<em>[0-10]</em>-<em>[solid|dashed|dotted]</em><br />.+br(<em>$val</em>, <em>$type</em>)</td><td>border-right-width: <em>[0-10]</em>px <br />border-right-style: <em>[solid|dashed|dotted]</em></td></tr>
<tr>
<td>.bl<em>[0-10]</em>-<em>[solid|dashed|dotted]</em><br />.+bl(<em>$val</em>, <em>$type</em>)</td><td>border-left-width: <em>[0-10]</em>px <br />border-left-style: <em>[solid|dashed|dotted]</em></td></tr>
<tr>
<td>.bb<em>[0-10]</em>-<em>[solid|dashed|dotted]</em><br />.+bb(<em>$val</em>, <em>$type</em>)</td><td>border-bottom-width: <em>[0-10]</em>px <br />border-bottom-style: <em>[solid|dashed|dotted]</em></td></tr>
<tr>
<td>.blr<em>[0-10]</em>-<em>[solid|dashed|dotted]</em><br />.+blr(<em>$val</em>, <em>$type</em>)</td><td>border-left-width: <em>[0-10]</em>px <br />border-right-width: <em>[0-10]</em>px <br />border-right-style: <em>[solid|dashed|dotted]</em> <br />border-left-style: <em>[solid|dashed|dotted]</em></td></tr>
<tr>
<td>.btb<em>[0-10]</em>-<em>[solid|dashed|dotted]</em><br />.+btb(<em>$val</em>, <em>$type</em>)</td><td>border-top-width: <em>[0-10]</em>px <br />border-bottom-width: <em>[0-10]</em>px <br />border-top-style: <em>[solid|dashed|dotted]</em> <br />border-bottom-style: <em>[solid|dashed|dotted]</em></td></tr>
<tr>
<td>.b<em>[0-10]</em>-<em>[solid|dashed|dotted]</em><br />.+b(<em>$val</em>, <em>$type</em>)</td><td>border: <em>[0-10]</em>px <em>[solid|dashed|dotted]</em></td></tr>
<tr>
<td>.cb{succ}[rule]</em><br />.+cb{succ}[rule]</em></td><td>> *<br />{succ}[rule]</em></td></tr>
</table>

## flex-basis 

<table>
<tr>
<td>.s<em>[num]</em><em>[~|px|pc]</em><br />.+s(<em>$val</em>)</td><td>flex-basis: <em>[num]</em><em>[em|px|pc]</em></td></tr>
<tr>
<td>.cs{succ}[rule]</em><br />.+cs{succ}[rule]</em></td><td>> .spacer<br />{succ}[rule]</em></td></tr>
</table>

## position 

<table>
<tr>
<td>.t<em>[num]</em><em>[~|px|pc]</em><br />.+t(<em>$val</em>)</td><td>top: <em>[num]</em><em>[em|px|pc]</em></td></tr>
<tr>
<td>.r<em>[num]</em><em>[~|px|pc]</em><br />.+r(<em>$val</em>)</td><td>right: <em>[num]</em><em>[em|px|pc]</em></td></tr>
<tr>
<td>.l<em>[num]</em><em>[~|px|pc]</em><br />.+l(<em>$val</em>)</td><td>left: <em>[num]</em><em>[em|px|pc]</em></td></tr>
<tr>
<td>.b<em>[num]</em><em>[~|px|pc]</em><br />.+b(<em>$val</em>)</td><td>bottom: <em>[num]</em><em>[em|px|pc]</em></td></tr>
<tr>
<td>.lr<em>[num]</em><em>[~|px|pc]</em><br />.+lr(<em>$val</em>)</td><td>left: <em>[num]</em><em>[em|px|pc]</em> <br />right: <em>[num]</em><em>[em|px|pc]</em></td></tr>
<tr>
<td>.tb<em>[num]</em><em>[~|px|pc]</em><br />.+tb(<em>$val</em>)</td><td>top: <em>[num]</em><em>[em|px|pc]</em> <br />bottom: <em>[num]</em><em>[em|px|pc]</em></td></tr>
<tr>
<td>.c{succ}[rule]</em><br />.+c{succ}[rule]</em></td><td>> *<br />{succ}[rule]</em></td></tr>
</table>

## width 

<table>
<tr>
<td>.w<em>[0-100]</em>em<br />.+w(<em>$val</em>)</td><td>width: <em>[0-100]</em>em</td></tr>
<tr>
<td>.w<em>[0-1000]</em>px<br />.+w(<em>$val</em>)</td><td>width: <em>[0-1000]</em>px</td></tr>
<tr>
<td>.w<em>[0-100]</em>pc<br />.+w(<em>$val</em>)</td><td>width: <em>[0-100]</em>%</td></tr>
<tr>
<td>.w<em>[0-100]</em>vw<br />.+w(<em>$val</em>)</td><td>width: <em>[0-100]</em>vw</td></tr>
<tr>
<td>.w-auto<br />.+w-auto</td><td>width: auto</td></tr>
</table>

## height 

<table>
<tr>
<td>.h<em>[0-100]</em>em<br />.+h(<em>$val</em>)</td><td>height: <em>[0-100]</em>em</td></tr>
<tr>
<td>.h<em>[0-1000]</em>px<br />.+h(<em>$val</em>)</td><td>height: <em>[0-1000]</em>px</td></tr>
<tr>
<td>.h<em>[0-100]</em>pc<br />.+h(<em>$val</em>)</td><td>height: <em>[0-100]</em>%</td></tr>
<tr>
<td>.h<em>[0-100]</em>vh<br />.+h(<em>$val</em>)</td><td>height: <em>[0-100]</em>vh</td></tr>
<tr>
<td>.h-auto<br />.+h-auto</td><td>height: auto</td></tr>
</table>

## min-width 

<table>
<tr>
<td>.minw<em>[0-100]</em>em<br />.+minw(<em>$val</em>)</td><td>min-width: <em>[0-100]</em>em</td></tr>
<tr>
<td>.minw<em>[0-1000]</em>px<br />.+minw(<em>$val</em>)</td><td>min-width: <em>[0-1000]</em>px</td></tr>
<tr>
<td>.minw<em>[0-100]</em>pc<br />.+minw(<em>$val</em>)</td><td>min-width: <em>[0-100]</em>%</td></tr>
<tr>
<td>.minw<em>[0-100]</em>vw<br />.+minw(<em>$val</em>)</td><td>min-width: <em>[0-100]</em>vw</td></tr>
<tr>
<td>.minw-auto<br />.+minw-auto</td><td>min-width: auto</td></tr>
</table>

## min-height 

<table>
<tr>
<td>.minh<em>[0-100]</em>em<br />.+minh(<em>$val</em>)</td><td>min-height: <em>[0-100]</em>em</td></tr>
<tr>
<td>.minh<em>[0-1000]</em>px<br />.+minh(<em>$val</em>)</td><td>min-height: <em>[0-1000]</em>px</td></tr>
<tr>
<td>.minh<em>[0-100]</em>pc<br />.+minh(<em>$val</em>)</td><td>min-height: <em>[0-100]</em>%</td></tr>
<tr>
<td>.minh<em>[0-100]</em>vh<br />.+minh(<em>$val</em>)</td><td>min-height: <em>[0-100]</em>vh</td></tr>
<tr>
<td>.minh-auto<br />.+minh-auto</td><td>min-height: auto</td></tr>
</table>

## max-width 

<table>
<tr>
<td>.maxw<em>[0-100]</em>em<br />.+maxw(<em>$val</em>)</td><td>max-width: <em>[0-100]</em>em</td></tr>
<tr>
<td>.maxw<em>[0-1000]</em>px<br />.+maxw(<em>$val</em>)</td><td>max-width: <em>[0-1000]</em>px</td></tr>
<tr>
<td>.maxw<em>[0-100]</em>pc<br />.+maxw(<em>$val</em>)</td><td>max-width: <em>[0-100]</em>%</td></tr>
<tr>
<td>.maxw<em>[0-100]</em>vw<br />.+maxw(<em>$val</em>)</td><td>max-width: <em>[0-100]</em>vw</td></tr>
<tr>
<td>.maxw-auto<br />.+maxw-auto</td><td>max-width: auto</td></tr>
</table>

## max-height 

<table>
<tr>
<td>.maxh<em>[0-100]</em>em<br />.+maxh(<em>$val</em>)</td><td>max-height: <em>[0-100]</em>em</td></tr>
<tr>
<td>.maxh<em>[0-1000]</em>px<br />.+maxh(<em>$val</em>)</td><td>max-height: <em>[0-1000]</em>px</td></tr>
<tr>
<td>.maxh<em>[0-100]</em>pc<br />.+maxh(<em>$val</em>)</td><td>max-height: <em>[0-100]</em>%</td></tr>
<tr>
<td>.maxh<em>[0-100]</em>vh<br />.+maxh(<em>$val</em>)</td><td>max-height: <em>[0-100]</em>vh</td></tr>
<tr>
<td>.maxh-auto<br />.+maxh-auto</td><td>max-height: auto</td></tr>
</table>

## flex-basis 

<table>
<tr>
<td>.basis<em>[0-100]</em>em<br />.+basis(<em>$val</em>)</td><td>flex-basis: <em>[0-100]</em>em</td></tr>
<tr>
<td>.basis<em>[0-1000]</em>px<br />.+basis(<em>$val</em>)</td><td>flex-basis: <em>[0-1000]</em>px</td></tr>
<tr>
<td>.basis<em>[0-100]</em>pc<br />.+basis(<em>$val</em>)</td><td>flex-basis: <em>[0-100]</em>%</td></tr>
<tr>
<td>.basis-auto<br />.+basis-auto</td><td>flex-basis: auto</td></tr>
</table>

## border-radius 

<table>
<tr>
<td>.radius<em>[0-100]</em><em>[em|pc|px]</em><br />.+radius($val)</td><td>border-radius: <em>[0-100]</em><em>[em|pc|px]</em></td></tr>
<tr>
<td>.radius<em>[0-100]</em><em>[em|pc|px]</em>-top<br />.+radius-top($val)</td><td>border-top-left-radius: <em>[0-100]</em><em>[em|pc|px]</em><br />border-top-right-radius: <em>[0-100]</em><em>[em|pc|px]</em></td></tr>
<tr>
<td>.radius<em>[0-100]</em><em>[em|pc|px]</em>-bottom<br />.+radius-bottom($val)</td><td>border-bottom-left-radius: <em>[0-100]</em><em>[em|pc|px]</em><br />border-bottom-right-radius: <em>[0-100]</em><em>[em|pc|px]</em></td></tr>
<tr>
<td>.radius<em>[0-100]</em><em>[em|pc|px]</em>-left<br />.+radius-left($val)</td><td>border-top-left-radius: <em>[0-100]</em><em>[em|pc|px]</em><br />border-bottom-left-radius: <em>[0-100]</em><em>[em|pc|px]</em></td></tr>
<tr>
<td>.radius<em>[0-100]</em><em>[em|pc|px]</em>-right<br />.+radius-right($val)</td><td>border-top-right-radius: <em>[0-100]</em><em>[em|pc|px]</em><br />border-bottom-right-radius: <em>[0-100]</em><em>[em|pc|px]</em></td></tr>
<tr>
<td>.radius<em>[0-1000]</em><em>[em|pc|px]</em>-top<br />.+radius-top($val)</td><td>border-top-left-radius: <em>[0-1000]</em><em>[em|pc|px]</em><br />border-top-right-radius: <em>[0-1000]</em><em>[em|pc|px]</em></td></tr>
<tr>
<td>.radius<em>[0-1000]</em><em>[em|pc|px]</em>-bottom<br />.+radius-bottom($val)</td><td>border-bottom-left-radius: <em>[0-1000]</em><em>[em|pc|px]</em><br />border-bottom-right-radius: <em>[0-1000]</em><em>[em|pc|px]</em></td></tr>
<tr>
<td>.radius<em>[0-1000]</em><em>[em|pc|px]</em>-left<br />.+radius-left($val)</td><td>border-top-left-radius: <em>[0-1000]</em><em>[em|pc|px]</em><br />border-bottom-left-radius: <em>[0-1000]</em><em>[em|pc|px]</em></td></tr>
<tr>
<td>.radius<em>[0-1000]</em><em>[em|pc|px]</em>-right<br />.+radius-right($val)</td><td>border-top-right-radius: <em>[0-1000]</em><em>[em|pc|px]</em><br />border-bottom-right-radius: <em>[0-1000]</em><em>[em|pc|px]</em></td></tr>
<tr>
<td>.radius<em>[0-100]</em><em>[em|pc|px]</em>-top<br />.+radius-top($val)</td><td>border-top-left-radius: <em>[0-100]</em><em>[em|pc|px]</em><br />border-top-right-radius: <em>[0-100]</em><em>[em|pc|px]</em></td></tr>
<tr>
<td>.radius<em>[0-100]</em><em>[em|pc|px]</em>-bottom<br />.+radius-bottom($val)</td><td>border-bottom-left-radius: <em>[0-100]</em><em>[em|pc|px]</em><br />border-bottom-right-radius: <em>[0-100]</em><em>[em|pc|px]</em></td></tr>
<tr>
<td>.radius<em>[0-100]</em><em>[em|pc|px]</em>-left<br />.+radius-left($val)</td><td>border-top-left-radius: <em>[0-100]</em><em>[em|pc|px]</em><br />border-bottom-left-radius: <em>[0-100]</em><em>[em|pc|px]</em></td></tr>
<tr>
<td>.radius<em>[0-100]</em><em>[em|pc|px]</em>-right<br />.+radius-right($val)</td><td>border-top-right-radius: <em>[0-100]</em><em>[em|pc|px]</em><br />border-bottom-right-radius: <em>[0-100]</em><em>[em|pc|px]</em></td></tr>
<tr>
<td>.radius-auto<br />.+radius-auto</td><td>border-radius: auto</td></tr>
</table>

## transform 

<table>
<tr>
<td>.translate<em>00</em></td><td>transform: translate( <em>0%, 0%</em>)</td></tr>
<tr>
<td>.origin<em>00</em></td><td>transform-origin: <em>0% 0%</em></td></tr>
<tr>
<td>.translate<em>0-50</em></td><td>transform: translate( <em>0%, -50%</em>)</td></tr>
<tr>
<td>.origin<em>0-50</em></td><td>transform-origin: <em>0% -50%</em></td></tr>
<tr>
<td>.translate<em>050</em></td><td>transform: translate( <em>0%, 50%</em>)</td></tr>
<tr>
<td>.origin<em>050</em></td><td>transform-origin: <em>0% 50%</em></td></tr>
<tr>
<td>.translate<em>0100</em></td><td>transform: translate( <em>0%, 100%</em>)</td></tr>
<tr>
<td>.origin<em>0100</em></td><td>transform-origin: <em>0% 100%</em></td></tr>
<tr>
<td>.translate<em>0-100</em></td><td>transform: translate( <em>0%, -100%</em>)</td></tr>
<tr>
<td>.origin<em>0-100</em></td><td>transform-origin: <em>0% -100%</em></td></tr>
<tr>
<td>.translate<em>-500</em></td><td>transform: translate( <em>-50%, 0%</em>)</td></tr>
<tr>
<td>.origin<em>-500</em></td><td>transform-origin: <em>-50% 0%</em></td></tr>
<tr>
<td>.translate<em>-50-50</em></td><td>transform: translate( <em>-50%, -50%</em>)</td></tr>
<tr>
<td>.origin<em>-50-50</em></td><td>transform-origin: <em>-50% -50%</em></td></tr>
<tr>
<td>.translate<em>-5050</em></td><td>transform: translate( <em>-50%, 50%</em>)</td></tr>
<tr>
<td>.origin<em>-5050</em></td><td>transform-origin: <em>-50% 50%</em></td></tr>
<tr>
<td>.translate<em>-50100</em></td><td>transform: translate( <em>-50%, 100%</em>)</td></tr>
<tr>
<td>.origin<em>-50100</em></td><td>transform-origin: <em>-50% 100%</em></td></tr>
<tr>
<td>.translate<em>-50-100</em></td><td>transform: translate( <em>-50%, -100%</em>)</td></tr>
<tr>
<td>.origin<em>-50-100</em></td><td>transform-origin: <em>-50% -100%</em></td></tr>
<tr>
<td>.translate<em>500</em></td><td>transform: translate( <em>50%, 0%</em>)</td></tr>
<tr>
<td>.origin<em>500</em></td><td>transform-origin: <em>50% 0%</em></td></tr>
<tr>
<td>.translate<em>50-50</em></td><td>transform: translate( <em>50%, -50%</em>)</td></tr>
<tr>
<td>.origin<em>50-50</em></td><td>transform-origin: <em>50% -50%</em></td></tr>
<tr>
<td>.translate<em>5050</em></td><td>transform: translate( <em>50%, 50%</em>)</td></tr>
<tr>
<td>.origin<em>5050</em></td><td>transform-origin: <em>50% 50%</em></td></tr>
<tr>
<td>.translate<em>50100</em></td><td>transform: translate( <em>50%, 100%</em>)</td></tr>
<tr>
<td>.origin<em>50100</em></td><td>transform-origin: <em>50% 100%</em></td></tr>
<tr>
<td>.translate<em>50-100</em></td><td>transform: translate( <em>50%, -100%</em>)</td></tr>
<tr>
<td>.origin<em>50-100</em></td><td>transform-origin: <em>50% -100%</em></td></tr>
<tr>
<td>.translate<em>1000</em></td><td>transform: translate( <em>100%, 0%</em>)</td></tr>
<tr>
<td>.origin<em>1000</em></td><td>transform-origin: <em>100% 0%</em></td></tr>
<tr>
<td>.translate<em>100-50</em></td><td>transform: translate( <em>100%, -50%</em>)</td></tr>
<tr>
<td>.origin<em>100-50</em></td><td>transform-origin: <em>100% -50%</em></td></tr>
<tr>
<td>.translate<em>10050</em></td><td>transform: translate( <em>100%, 50%</em>)</td></tr>
<tr>
<td>.origin<em>10050</em></td><td>transform-origin: <em>100% 50%</em></td></tr>
<tr>
<td>.translate<em>100100</em></td><td>transform: translate( <em>100%, 100%</em>)</td></tr>
<tr>
<td>.origin<em>100100</em></td><td>transform-origin: <em>100% 100%</em></td></tr>
<tr>
<td>.translate<em>100-100</em></td><td>transform: translate( <em>100%, -100%</em>)</td></tr>
<tr>
<td>.origin<em>100-100</em></td><td>transform-origin: <em>100% -100%</em></td></tr>
<tr>
<td>.translate<em>-1000</em></td><td>transform: translate( <em>-100%, 0%</em>)</td></tr>
<tr>
<td>.origin<em>-1000</em></td><td>transform-origin: <em>-100% 0%</em></td></tr>
<tr>
<td>.translate<em>-100-50</em></td><td>transform: translate( <em>-100%, -50%</em>)</td></tr>
<tr>
<td>.origin<em>-100-50</em></td><td>transform-origin: <em>-100% -50%</em></td></tr>
<tr>
<td>.translate<em>-10050</em></td><td>transform: translate( <em>-100%, 50%</em>)</td></tr>
<tr>
<td>.origin<em>-10050</em></td><td>transform-origin: <em>-100% 50%</em></td></tr>
<tr>
<td>.translate<em>-100100</em></td><td>transform: translate( <em>-100%, 100%</em>)</td></tr>
<tr>
<td>.origin<em>-100100</em></td><td>transform-origin: <em>-100% 100%</em></td></tr>
<tr>
<td>.translate<em>-100-100</em></td><td>transform: translate( <em>-100%, -100%</em>)</td></tr>
<tr>
<td>.origin<em>-100-100</em></td><td>transform-origin: <em>-100% -100%</em></td></tr>
</table>

## cursors 

<table>
<tr>
<td>.cursor-<em>auto</em></td><td>cursor: <em>auto</em></td></tr>
<tr>
<td>.cursor-<em>inherit</em></td><td>cursor: <em>inherit</em></td></tr>
<tr>
<td>.cursor-<em>crosshair</em></td><td>cursor: <em>crosshair</em></td></tr>
<tr>
<td>.cursor-<em>default</em></td><td>cursor: <em>default</em></td></tr>
<tr>
<td>.cursor-<em>help</em></td><td>cursor: <em>help</em></td></tr>
<tr>
<td>.cursor-<em>move</em></td><td>cursor: <em>move</em></td></tr>
<tr>
<td>.cursor-<em>pointer</em></td><td>cursor: <em>pointer</em></td></tr>
<tr>
<td>.cursor-<em>progress</em></td><td>cursor: <em>progress</em></td></tr>
<tr>
<td>.cursor-<em>text</em></td><td>cursor: <em>text</em></td></tr>
<tr>
<td>.cursor-<em>wait</em></td><td>cursor: <em>wait</em></td></tr>
<tr>
<td>.cursor-<em>e-resize</em></td><td>cursor: <em>e-resize</em></td></tr>
<tr>
<td>.cursor-<em>ne-resize</em></td><td>cursor: <em>ne-resize</em></td></tr>
<tr>
<td>.cursor-<em>nw-resize</em></td><td>cursor: <em>nw-resize</em></td></tr>
<tr>
<td>.cursor-<em>n-resize</em></td><td>cursor: <em>n-resize</em></td></tr>
<tr>
<td>.cursor-<em>se-resize</em></td><td>cursor: <em>se-resize</em></td></tr>
<tr>
<td>.cursor-<em>sw-resize</em></td><td>cursor: <em>sw-resize</em></td></tr>
<tr>
<td>.cursor-<em>s-resize</em></td><td>cursor: <em>s-resize</em></td></tr>
<tr>
<td>.cursor-<em>w-resize</em></td><td>cursor: <em>w-resize</em></td></tr>
<tr>
<td>.cursor-<em>grab</em></td><td>cursor: <em>grab</em></td></tr>
<tr>
<td>.cursor-<em>grabbing</em></td><td>cursor: <em>grabbing</em></td></tr>
<tr>
<td>.cursor-<em>zoom-in</em></td><td>cursor: <em>zoom-in</em></td></tr>
<tr>
<td>.cursor-<em>zoom-out</em></td><td>cursor: <em>zoom-out</em></td></tr>
</table>

## font-size 

<table>
<tr>
<td>.f0, h6, .h6<br />.+f0</td><td>font-size: <em>0.785714rem</em></td></tr>
<tr>
<td>.f1, h5, .h5<br />.+f1</td><td>font-size: <em>1rem</em></td></tr>
<tr>
<td>.f2, h4, .h4<br />.+f2</td><td>font-size: <em>1.2857rem</em></td></tr>
<tr>
<td>.f3, h3, .h3<br />.+f3</td><td>font-size: <em>1.64285rem</em></td></tr>
<tr>
<td>.f4, h2, .h2<br />.+f4</td><td>font-size: <em>2.071428rem</em></td></tr>
<tr>
<td>.f5, h1, .h1<br />.+f5</td><td>font-size: <em>2.642857rem</em></td></tr>
</table>

## z-index 

<table>
<tr>
<td>.z-index<em>0-99</em><br />.+z-index( <em>$z</em> )</td><td>z-index: <em>0-99</em></td></tr>
</table>

## opacity 

<table>
<tr>
<td>.opacity<em>0-99</em><br />.+opacity( <em>$z</em> )</td><td>opacity: <em>0-99</em></td></tr>
</table>

## font-family 

<table>
<tr>
<td>.monospace<br />.+monospace</td><td>font-family: <em>var(--font-monospace)</em></td></tr>
<tr>
<td>.serif<br />.+serif</td><td>font-family: <em>var(--font-serif)</em></td></tr>
<tr>
<td>.sans-serif<br />.+sans-serif</td><td>font-family: <em>var(--font-sans-serif)</em></td></tr>
<tr>
<td>.cursive<br />.+cursive</td><td>font-family: <em>var(--font-cursive)</em></td></tr>
<tr>
<td>.slab<br />.+slab</td><td>font-family: <em>var(--font-slab)</em></td></tr>
<tr>
<td>.grotesque<br />.+grotesque</td><td>font-family: <em>var(--font-grotesque)</em></td></tr>
</table>

