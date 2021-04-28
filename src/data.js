export default [
  {
    "type": "h2",
    "id": "basic"
  },
  {
    "type": "table",
    "id": "basic",
    "data": [
      [
        [
          "absolute",
          "abs"
        ],
        [
          "position: absolute"
        ]
      ],
      [
        [
          "relative",
          "rel"
        ],
        [
          "position: relative"
        ]
      ],
      [
        [
          "fixed"
        ],
        [
          "position: fixed"
        ]
      ],
      [
        [
          "sticky"
        ],
        [
          "position: sticky"
        ]
      ],
      [
        [
          "table"
        ],
        [
          "display: table"
        ]
      ],
      [
        [
          "inline"
        ],
        [
          "display: inline"
        ]
      ],
      [
        [
          "inline-block"
        ],
        [
          "display: inline-block"
        ]
      ],
      [
        [
          "block"
        ],
        [
          "display: block"
        ]
      ],
      [
        [
          "flex"
        ],
        [
          "display: flex"
        ],
        false,
        true
      ],
      [
        [
          "none"
        ],
        [
          "display: none"
        ]
      ],
      [
        [
          "column",
          "col",
          "flex-column"
        ],
        [
          "flex-direction: column"
        ]
      ],
      [
        [
          "row",
          "flex-row"
        ],
        [
          "flex-direction: row"
        ]
      ],
      [
        [
          "grow"
        ],
        [
          "flex-grow: 1"
        ],
        false,
        true
      ],
      [
        [
          "no-grow",
          "nogrow"
        ],
        [
          "flex-grow: 0"
        ]
      ],
      [
        [
          "cgrow > *",
          "c-grow > *"
        ],
        [
          "flex-grow: 1"
        ],
        false,
        true,
        true
      ],
      [
        [
          "cnogrow > *",
          "cno-grow > *",
          "c-no-grow > *"
        ],
        [
          "flex-grow: 0"
        ],
        false,
        true,
        true
      ],
      [
        [
          "shrink"
        ],
        [
          "flex-shrink: 1"
        ],
        false,
        true
      ],
      [
        [
          "no-shrink"
        ],
        [
          "flex-shrink: 0"
        ],
        false,
        true
      ],
      [
        [
          "no-basis"
        ],
        [
          "flex-basis: 0"
        ],
        false,
        true
      ],
      [
        [
          "wrap"
        ],
        [
          "flex-wrap: wrap"
        ],
        false,
        true
      ],
      [
        [
          "nowrap",
          "no-wrap"
        ],
        [
          "flex-wrap: nowrap"
        ],
        false,
        true,
        true
      ],
      [
        [
          "auto-space > *"
        ],
        [
          "margin-left: var(--column-spacing)",
          "&:first-child",
          "\tmargin-left: 0"
        ],
        false,
        true,
        true
      ],
      [
        [
          "border-box"
        ],
        [
          "box-sizing: border-box"
        ]
      ],
      [
        [
          "italic"
        ],
        [
          "font-style: italic"
        ]
      ],
      [
        [
          "bold",
          "strong"
        ],
        [
          "font-weight: bold"
        ]
      ],
      [
        [
          "bolder",
          "stronger"
        ],
        [
          "font-weight: bold"
        ]
      ],
      [
        [
          "normal"
        ],
        [
          "font-weight: normal"
        ]
      ],
      [
        [
          "light"
        ],
        [
          "font-weight: light"
        ]
      ],
      [
        [
          "lighter"
        ],
        [
          "font-weight: lighter"
        ]
      ],
      [
        [
          "text-left"
        ],
        [
          "text-align: left"
        ]
      ],
      [
        [
          "text-center"
        ],
        [
          "text-align: center"
        ]
      ],
      [
        [
          "text-right"
        ],
        [
          "text-align: right"
        ]
      ],
      [
        [
          "capitalize"
        ],
        [
          "text-transform: capitalize"
        ]
      ],
      [
        [
          "uppercase"
        ],
        [
          "text-transform: uppercase"
        ]
      ],
      [
        [
          "lowercase"
        ],
        [
          "text-transform: lowercase"
        ]
      ],
      [
        [
          "pointer"
        ],
        [
          "cursor: pointer"
        ]
      ],
      [
        [
          "visible"
        ],
        [
          "opacity: 1"
        ]
      ],
      [
        [
          "invisible",
          "hidden"
        ],
        [
          "opacity: 0"
        ]
      ],
      [
        [
          "no-bg"
        ],
        [
          "background: transparent"
        ]
      ],
      [
        [
          "overflow-hidden"
        ],
        [
          "overflow: hidden"
        ]
      ],
      [
        [
          "overflow-auto"
        ],
        [
          "overflow: auto"
        ]
      ],
      [
        [
          "margin-auto"
        ],
        [
          "margin: 0 auto"
        ]
      ],
      [
        [
          "whitespace-pre",
          "newlines"
        ],
        [
          "white-space: pre"
        ]
      ],
      [
        [
          "whitespace-nowrap"
        ],
        [
          "white-space: nowrap"
        ]
      ],
      [
        [
          "fill"
        ],
        [
          "position: absolute",
          "width: 100%",
          "height: 100%",
          "top: 0",
          "left: 0"
        ]
      ],
      [
        [
          "no-webkit"
        ],
        [
          "-webkit-appearance: none"
        ]
      ],
      [
        [
          "user-select-none"
        ],
        [
          "user-select: none"
        ]
      ]
    ],
    "mixins": "."
  },
  {
    "type": "h2",
    "id": "layout"
  },
  {
    "type": "table",
    "id": "layout",
    "data": [
      [
        [
          "flex"
        ],
        [
          "display: flex"
        ],
        false,
        true
      ],
      [
        [
          "grow"
        ],
        [
          "flex-grow: 1"
        ],
        false,
        true
      ],
      [
        [
          "cgrow > *",
          "c-grow > *"
        ],
        [
          "flex-grow: 1"
        ],
        false,
        true,
        true
      ],
      [
        [
          "cnogrow > *",
          "cno-grow > *",
          "c-no-grow > *"
        ],
        [
          "flex-grow: 0"
        ],
        false,
        true,
        true
      ],
      [
        [
          "shrink"
        ],
        [
          "flex-shrink: 1"
        ],
        false,
        true
      ],
      [
        [
          "no-shrink"
        ],
        [
          "flex-shrink: 0"
        ],
        false,
        true
      ],
      [
        [
          "no-basis"
        ],
        [
          "flex-basis: 0"
        ],
        false,
        true
      ],
      [
        [
          "wrap"
        ],
        [
          "flex-wrap: wrap"
        ],
        false,
        true
      ],
      [
        [
          "nowrap",
          "no-wrap"
        ],
        [
          "flex-wrap: nowrap"
        ],
        false,
        true,
        true
      ],
      [
        [
          "auto-space > *"
        ],
        [
          "margin-left: var(--column-spacing)",
          "&:first-child",
          "\tmargin-left: 0"
        ],
        false,
        true,
        true
      ]
    ]
  },
  {
    "type": "h2",
    "id": "alignments"
  },
  {
    "type": "table",
    "id": "alignments",
    "data": [
      [
        [
          "row-{alert}[content]{end}-{alert}[items]{end}",
          "+row({info}$x, $y{end})"
        ],
        [
          "justify-content: {alert}[content]{end}",
          "align-items: {alert}[items]{end}",
          "flex-direction: row"
        ]
      ],
      [
        [
          "row-x-{alert}[content]{end}",
          "+row-x({info}$val{end})"
        ],
        [
          "justify-content: {alert}[content]{end}"
        ]
      ],
      [
        [
          "row-y-{alert}[items]{end}",
          "+row-y({info}$val{end})"
        ],
        [
          "align-items: {alert}[items]{end}"
        ]
      ],
      [
        [
          "row > .y-{alert}[items]{end}"
        ],
        [
          "align-self: {alert}[items]{end}"
        ]
      ],
      [
        [
          "column-{alert}[items]{end}-{alert}[content]{end}",
          "+column({info}$x, $y{end})"
        ],
        [
          "align-items: {alert}[items]{end}",
          "justify-content: {alert}[content]{end}",
          "flex-direction: column"
        ]
      ],
      [
        [
          "column-x-{alert}[items]{end}",
          "+column-x({info}$val{end})"
        ],
        [
          "align-items: {alert}[items]{end}"
        ]
      ],
      [
        [
          "column > .x-{alert}[items]{end}"
        ],
        [
          "align-self: {alert}[items]{end}"
        ]
      ],
      [
        [
          "column-y-{alert}[content]{end}",
          "+column-y({info}$val{end})"
        ],
        [
          "justify-content: {alert}[content]{end}"
        ]
      ]
    ]
  },
  {
    "type": "h3",
    "id": "items"
  },
  {
    "type": "table",
    "id": "items",
    "data": [
      [
        [
          "align-self-center",
          "a-s-c"
        ],
        [
          "align-self: center"
        ]
      ],
      [
        [
          "align-self-end",
          "a-s-e"
        ],
        [
          "align-self: end"
        ]
      ],
      [
        [
          "align-self-flex-end",
          "a-s-fe"
        ],
        [
          "align-self: flex-end"
        ]
      ],
      [
        [
          "align-self-start",
          "a-s-s"
        ],
        [
          "align-self: start"
        ]
      ],
      [
        [
          "align-self-flex-start",
          "a-s-fs"
        ],
        [
          "align-self: flex-start"
        ]
      ],
      [
        [
          "align-self-stretch",
          "a-s-str"
        ],
        [
          "align-self: stretch"
        ]
      ],
      [
        [
          "align-self-baseline",
          "a-s-b"
        ],
        [
          "align-self: baseline"
        ]
      ],
      [
        [
          "align-items-center",
          "a-i-c"
        ],
        [
          "align-items: center"
        ]
      ],
      [
        [
          "align-items-end",
          "a-i-e"
        ],
        [
          "align-items: end"
        ]
      ],
      [
        [
          "align-items-flex-end",
          "a-i-fe"
        ],
        [
          "align-items: flex-end"
        ]
      ],
      [
        [
          "align-items-start",
          "a-i-s"
        ],
        [
          "align-items: start"
        ]
      ],
      [
        [
          "align-items-flex-start",
          "a-i-fs"
        ],
        [
          "align-items: flex-start"
        ]
      ],
      [
        [
          "align-items-stretch",
          "a-i-str"
        ],
        [
          "align-items: stretch"
        ]
      ],
      [
        [
          "align-items-baseline",
          "a-i-b"
        ],
        [
          "align-items: baseline"
        ]
      ],
      [
        [
          "justify-self-center",
          "j-s-c"
        ],
        [
          "justify-self: center"
        ]
      ],
      [
        [
          "justify-self-end",
          "j-s-e"
        ],
        [
          "justify-self: end"
        ]
      ],
      [
        [
          "justify-self-flex-end",
          "j-s-fe"
        ],
        [
          "justify-self: flex-end"
        ]
      ],
      [
        [
          "justify-self-start",
          "j-s-s"
        ],
        [
          "justify-self: start"
        ]
      ],
      [
        [
          "justify-self-flex-start",
          "j-s-fs"
        ],
        [
          "justify-self: flex-start"
        ]
      ],
      [
        [
          "justify-self-stretch",
          "j-s-str"
        ],
        [
          "justify-self: stretch"
        ]
      ],
      [
        [
          "justify-self-baseline",
          "j-s-b"
        ],
        [
          "justify-self: baseline"
        ]
      ],
      [
        [
          "justify-items-center",
          "j-i-c"
        ],
        [
          "justify-items: center"
        ]
      ],
      [
        [
          "justify-items-end",
          "j-i-e"
        ],
        [
          "justify-items: end"
        ]
      ],
      [
        [
          "justify-items-flex-end",
          "j-i-fe"
        ],
        [
          "justify-items: flex-end"
        ]
      ],
      [
        [
          "justify-items-start",
          "j-i-s"
        ],
        [
          "justify-items: start"
        ]
      ],
      [
        [
          "justify-items-flex-start",
          "j-i-fs"
        ],
        [
          "justify-items: flex-start"
        ]
      ],
      [
        [
          "justify-items-stretch",
          "j-i-str"
        ],
        [
          "justify-items: stretch"
        ]
      ],
      [
        [
          "justify-items-baseline",
          "j-i-b"
        ],
        [
          "justify-items: baseline"
        ]
      ]
    ],
    "mixins": "."
  },
  {
    "type": "h3",
    "id": "content"
  },
  {
    "type": "table",
    "id": "content",
    "data": [
      [
        [
          "align-content-space-between",
          "align-content-between",
          "a-c-b"
        ],
        [
          "align-content: space-between"
        ]
      ],
      [
        [
          "align-content-space-evenly",
          "align-content-evenly",
          "a-c-e"
        ],
        [
          "align-content: space-evenly"
        ]
      ],
      [
        [
          "align-content-space-around",
          "align-content-around",
          "a-c-a"
        ],
        [
          "align-content: space-around"
        ]
      ],
      [
        [
          "align-content-left",
          "a-c-l"
        ],
        [
          "align-content: left"
        ]
      ],
      [
        [
          "align-content-right",
          "a-c-r"
        ],
        [
          "align-content: right"
        ]
      ],
      [
        [
          "align-content-center",
          "a-c-c"
        ],
        [
          "align-content: center"
        ]
      ],
      [
        [
          "align-content-end",
          "a-c-e"
        ],
        [
          "align-content: end"
        ]
      ],
      [
        [
          "align-content-flex-end",
          "a-c-fe"
        ],
        [
          "align-content: flex-end"
        ]
      ],
      [
        [
          "align-content-start",
          "a-c-s"
        ],
        [
          "align-content: start"
        ]
      ],
      [
        [
          "align-content-flex-start",
          "a-c-fs"
        ],
        [
          "align-content: flex-start"
        ]
      ],
      [
        [
          "align-content-stretch",
          "a-c-str"
        ],
        [
          "align-content: stretch"
        ]
      ],
      [
        [
          "justify-content-space-between",
          "justify-content-between",
          "j-c-b"
        ],
        [
          "justify-content: space-between"
        ]
      ],
      [
        [
          "justify-content-space-evenly",
          "justify-content-evenly",
          "j-c-e"
        ],
        [
          "justify-content: space-evenly"
        ]
      ],
      [
        [
          "justify-content-space-around",
          "justify-content-around",
          "j-c-a"
        ],
        [
          "justify-content: space-around"
        ]
      ],
      [
        [
          "justify-content-left",
          "j-c-l"
        ],
        [
          "justify-content: left"
        ]
      ],
      [
        [
          "justify-content-right",
          "j-c-r"
        ],
        [
          "justify-content: right"
        ]
      ],
      [
        [
          "justify-content-center",
          "j-c-c"
        ],
        [
          "justify-content: center"
        ]
      ],
      [
        [
          "justify-content-end",
          "j-c-e"
        ],
        [
          "justify-content: end"
        ]
      ],
      [
        [
          "justify-content-flex-end",
          "j-c-fe"
        ],
        [
          "justify-content: flex-end"
        ]
      ],
      [
        [
          "justify-content-start",
          "j-c-s"
        ],
        [
          "justify-content: start"
        ]
      ],
      [
        [
          "justify-content-flex-start",
          "j-c-fs"
        ],
        [
          "justify-content: flex-start"
        ]
      ],
      [
        [
          "justify-content-stretch",
          "j-c-str"
        ],
        [
          "justify-content: stretch"
        ]
      ]
    ],
    "mixins": "."
  },
  {
    "type": "h3",
    "id": "padding"
  },
  {
    "type": "table",
    "id": "padding",
    "data": [
      [
        [
          "pt{alert}[num]{end}{info}[~|px|pc]{end}",
          "+pt({alert}$val{end})"
        ],
        [
          "padding-top: {alert}[num]{end}{info}[em|px|pc]{end}"
        ]
      ],
      [
        [
          "pr{alert}[num]{end}{info}[~|px|pc]{end}",
          "+pr({alert}$val{end})"
        ],
        [
          "padding-right: {alert}[num]{end}{info}[em|px|pc]{end}"
        ]
      ],
      [
        [
          "pl{alert}[num]{end}{info}[~|px|pc]{end}",
          "+pl({alert}$val{end})"
        ],
        [
          "padding-left: {alert}[num]{end}{info}[em|px|pc]{end}"
        ]
      ],
      [
        [
          "pb{alert}[num]{end}{info}[~|px|pc]{end}",
          "+pb({alert}$val{end})"
        ],
        [
          "padding-bottom: {alert}[num]{end}{info}[em|px|pc]{end}"
        ]
      ],
      [
        [
          "plr{alert}[num]{end}{info}[~|px|pc]{end}",
          "+plr({alert}$val{end})"
        ],
        [
          "padding-left: {alert}[num]{end}{info}[em|px|pc]{end} ",
          "padding-right: {alert}[num]{end}{info}[em|px|pc]{end}"
        ]
      ],
      [
        [
          "ptb{alert}[num]{end}{info}[~|px|pc]{end}",
          "+ptb({alert}$val{end})"
        ],
        [
          "padding-top: {alert}[num]{end}{info}[em|px|pc]{end} ",
          "padding-bottom: {alert}[num]{end}{info}[em|px|pc]{end}"
        ]
      ],
      [
        [
          "p{alert}[num]{end}{info}[~|px|pc]{end}",
          "+p({alert}$val{end})"
        ],
        [
          "padding: {alert}[num]{end}{info}[em|px|pc]{end} "
        ]
      ],
      [
        [
          "cp{succ}[rule]{end}",
          "+cp{succ}[rule]{end}"
        ],
        [
          "> *",
          "{succ}[rule]{end}"
        ]
      ]
    ]
  },
  {
    "type": "h3",
    "id": "margin"
  },
  {
    "type": "table",
    "id": "margin",
    "data": [
      [
        [
          "mt{alert}[num]{end}{info}[~|px|pc]{end}",
          "+mt({alert}$val{end})"
        ],
        [
          "margin-top: {alert}[num]{end}{info}[em|px|pc]{end}"
        ]
      ],
      [
        [
          "mr{alert}[num]{end}{info}[~|px|pc]{end}",
          "+mr({alert}$val{end})"
        ],
        [
          "margin-right: {alert}[num]{end}{info}[em|px|pc]{end}"
        ]
      ],
      [
        [
          "ml{alert}[num]{end}{info}[~|px|pc]{end}",
          "+ml({alert}$val{end})"
        ],
        [
          "margin-left: {alert}[num]{end}{info}[em|px|pc]{end}"
        ]
      ],
      [
        [
          "mb{alert}[num]{end}{info}[~|px|pc]{end}",
          "+mb({alert}$val{end})"
        ],
        [
          "margin-bottom: {alert}[num]{end}{info}[em|px|pc]{end}"
        ]
      ],
      [
        [
          "mlr{alert}[num]{end}{info}[~|px|pc]{end}",
          "+mlr({alert}$val{end})"
        ],
        [
          "margin-left: {alert}[num]{end}{info}[em|px|pc]{end} ",
          "margin-right: {alert}[num]{end}{info}[em|px|pc]{end}"
        ]
      ],
      [
        [
          "mtb{alert}[num]{end}{info}[~|px|pc]{end}",
          "+mtb({alert}$val{end})"
        ],
        [
          "margin-top: {alert}[num]{end}{info}[em|px|pc]{end} ",
          "margin-bottom: {alert}[num]{end}{info}[em|px|pc]{end}"
        ]
      ],
      [
        [
          "m{alert}[num]{end}{info}[~|px|pc]{end}",
          "+m({alert}$val{end})"
        ],
        [
          "margin: {alert}[num]{end}{info}[em|px|pc]{end} "
        ]
      ],
      [
        [
          "cm{succ}[rule]{end}",
          "+cm{succ}[rule]{end}"
        ],
        [
          "> *",
          "{succ}[rule]{end}"
        ]
      ]
    ]
  },
  {
    "type": "h3",
    "id": "border"
  },
  {
    "type": "table",
    "id": "border",
    "data": [
      [
        [
          "bt{alert}[0-10]{end}-{info}[solid|dashed|dotted]{end}",
          "+bt({alert}$val{end}, {info}$type{end})"
        ],
        [
          "border-top-width: {alert}[0-10]{end}px ",
          "border-top-style: {info}[solid|dashed|dotted]{end}"
        ]
      ],
      [
        [
          "br{alert}[0-10]{end}-{info}[solid|dashed|dotted]{end}",
          "+br({alert}$val{end}, {info}$type{end})"
        ],
        [
          "border-right-width: {alert}[0-10]{end}px ",
          "border-right-style: {info}[solid|dashed|dotted]{end}"
        ]
      ],
      [
        [
          "bl{alert}[0-10]{end}-{info}[solid|dashed|dotted]{end}",
          "+bl({alert}$val{end}, {info}$type{end})"
        ],
        [
          "border-left-width: {alert}[0-10]{end}px ",
          "border-left-style: {info}[solid|dashed|dotted]{end}"
        ]
      ],
      [
        [
          "bb{alert}[0-10]{end}-{info}[solid|dashed|dotted]{end}",
          "+bb({alert}$val{end}, {info}$type{end})"
        ],
        [
          "border-bottom-width: {alert}[0-10]{end}px ",
          "border-bottom-style: {info}[solid|dashed|dotted]{end}"
        ]
      ],
      [
        [
          "blr{alert}[0-10]{end}-{info}[solid|dashed|dotted]{end}",
          "+blr({alert}$val{end}, {info}$type{end})"
        ],
        [
          "border-left-width: {alert}[0-10]{end}px ",
          "border-right-width: {alert}[0-10]{end}px ",
          "border-right-style: {info}[solid|dashed|dotted]{end} ",
          "border-left-style: {info}[solid|dashed|dotted]{end}"
        ]
      ],
      [
        [
          "btb{alert}[0-10]{end}-{info}[solid|dashed|dotted]{end}",
          "+btb({alert}$val{end}, {info}$type{end})"
        ],
        [
          "border-top-width: {alert}[0-10]{end}px ",
          "border-bottom-width: {alert}[0-10]{end}px ",
          "border-top-style: {info}[solid|dashed|dotted]{end} ",
          "border-bottom-style: {info}[solid|dashed|dotted]{end}"
        ]
      ],
      [
        [
          "b{alert}[0-10]{end}-{info}[solid|dashed|dotted]{end}",
          "+b({alert}$val{end}, {info}$type{end})"
        ],
        [
          "border: {alert}[0-10]{end}px {info}[solid|dashed|dotted]{end}"
        ]
      ],
      [
        [
          "cb{succ}[rule]{end}",
          "+cb{succ}[rule]{end}"
        ],
        [
          "> *",
          "{succ}[rule]{end}"
        ]
      ]
    ]
  },
  {
    "type": "h3",
    "id": "spacer"
  },
  {
    "type": "table",
    "id": "flex-basis",
    "data": [
      [
        [
          "s{alert}[num]{end}{info}[~|px|pc]{end}",
          "+s({alert}$val{end})"
        ],
        [
          "flex-basis: {alert}[num]{end}{info}[em|px|pc]{end}"
        ]
      ],
      [
        [
          "cs{succ}[rule]{end}",
          "+cs{succ}[rule]{end}"
        ],
        [
          "> .spacer",
          "{succ}[rule]{end}"
        ]
      ]
    ]
  },
  {
    "type": "h3",
    "id": "position"
  },
  {
    "type": "table",
    "id": "position",
    "data": [
      [
        [
          "t{alert}[num]{end}{info}[~|px|pc]{end}",
          "+t({alert}$val{end})"
        ],
        [
          "top: {alert}[num]{end}{info}[em|px|pc]{end}"
        ]
      ],
      [
        [
          "r{alert}[num]{end}{info}[~|px|pc]{end}",
          "+r({alert}$val{end})"
        ],
        [
          "right: {alert}[num]{end}{info}[em|px|pc]{end}"
        ]
      ],
      [
        [
          "l{alert}[num]{end}{info}[~|px|pc]{end}",
          "+l({alert}$val{end})"
        ],
        [
          "left: {alert}[num]{end}{info}[em|px|pc]{end}"
        ]
      ],
      [
        [
          "b{alert}[num]{end}{info}[~|px|pc]{end}",
          "+b({alert}$val{end})"
        ],
        [
          "bottom: {alert}[num]{end}{info}[em|px|pc]{end}"
        ]
      ],
      [
        [
          "lr{alert}[num]{end}{info}[~|px|pc]{end}",
          "+lr({alert}$val{end})"
        ],
        [
          "left: {alert}[num]{end}{info}[em|px|pc]{end} ",
          "right: {alert}[num]{end}{info}[em|px|pc]{end}"
        ]
      ],
      [
        [
          "tb{alert}[num]{end}{info}[~|px|pc]{end}",
          "+tb({alert}$val{end})"
        ],
        [
          "top: {alert}[num]{end}{info}[em|px|pc]{end} ",
          "bottom: {alert}[num]{end}{info}[em|px|pc]{end}"
        ]
      ],
      [
        [
          "c{succ}[rule]{end}",
          "+c{succ}[rule]{end}"
        ],
        [
          "> *",
          "{succ}[rule]{end}"
        ]
      ]
    ]
  },
  {
    "type": "h3",
    "id": "width"
  },
  {
    "type": "table",
    "id": "width",
    "data": [
      [
        [
          "w{alert}[0-100]{end}em",
          "+w({info}$val{end})"
        ],
        [
          "width: {alert}[0-100]{end}em"
        ]
      ],
      [
        [
          "w{alert}[0-1000]{end}px",
          "+w({info}$val{end})"
        ],
        [
          "width: {alert}[0-1000]{end}px"
        ]
      ],
      [
        [
          "w{alert}[0-100]{end}pc",
          "+w({info}$val{end})"
        ],
        [
          "width: {alert}[0-100]{end}%"
        ]
      ],
      [
        [
          "w{alert}[0-100]{end}vw",
          "+w({info}$val{end})"
        ],
        [
          "width: {alert}[0-100]{end}vw"
        ]
      ],
      [
        [
          "w-auto",
          "+w-auto"
        ],
        [
          "width: auto"
        ]
      ]
    ]
  },
  {
    "type": "h3",
    "id": "height"
  },
  {
    "type": "table",
    "id": "height",
    "data": [
      [
        [
          "h{alert}[0-100]{end}em",
          "+h({info}$val{end})"
        ],
        [
          "height: {alert}[0-100]{end}em"
        ]
      ],
      [
        [
          "h{alert}[0-1000]{end}px",
          "+h({info}$val{end})"
        ],
        [
          "height: {alert}[0-1000]{end}px"
        ]
      ],
      [
        [
          "h{alert}[0-100]{end}pc",
          "+h({info}$val{end})"
        ],
        [
          "height: {alert}[0-100]{end}%"
        ]
      ],
      [
        [
          "h{alert}[0-100]{end}vh",
          "+h({info}$val{end})"
        ],
        [
          "height: {alert}[0-100]{end}vh"
        ]
      ],
      [
        [
          "h-auto",
          "+h-auto"
        ],
        [
          "height: auto"
        ]
      ]
    ]
  },
  {
    "type": "h3",
    "id": "min-width"
  },
  {
    "type": "table",
    "id": "min-width",
    "data": [
      [
        [
          "minw{alert}[0-100]{end}em",
          "+minw({info}$val{end})"
        ],
        [
          "min-width: {alert}[0-100]{end}em"
        ]
      ],
      [
        [
          "minw{alert}[0-1000]{end}px",
          "+minw({info}$val{end})"
        ],
        [
          "min-width: {alert}[0-1000]{end}px"
        ]
      ],
      [
        [
          "minw{alert}[0-100]{end}pc",
          "+minw({info}$val{end})"
        ],
        [
          "min-width: {alert}[0-100]{end}%"
        ]
      ],
      [
        [
          "minw{alert}[0-100]{end}vw",
          "+minw({info}$val{end})"
        ],
        [
          "min-width: {alert}[0-100]{end}vw"
        ]
      ],
      [
        [
          "minw-auto",
          "+minw-auto"
        ],
        [
          "min-width: auto"
        ]
      ]
    ]
  },
  {
    "type": "h3",
    "id": "min-height"
  },
  {
    "type": "table",
    "id": "min-height",
    "data": [
      [
        [
          "minh{alert}[0-100]{end}em",
          "+minh({info}$val{end})"
        ],
        [
          "min-height: {alert}[0-100]{end}em"
        ]
      ],
      [
        [
          "minh{alert}[0-1000]{end}px",
          "+minh({info}$val{end})"
        ],
        [
          "min-height: {alert}[0-1000]{end}px"
        ]
      ],
      [
        [
          "minh{alert}[0-100]{end}pc",
          "+minh({info}$val{end})"
        ],
        [
          "min-height: {alert}[0-100]{end}%"
        ]
      ],
      [
        [
          "minh{alert}[0-100]{end}vh",
          "+minh({info}$val{end})"
        ],
        [
          "min-height: {alert}[0-100]{end}vh"
        ]
      ],
      [
        [
          "minh-auto",
          "+minh-auto"
        ],
        [
          "min-height: auto"
        ]
      ]
    ]
  },
  {
    "type": "h3",
    "id": "max-width"
  },
  {
    "type": "table",
    "id": "max-width",
    "data": [
      [
        [
          "maxw{alert}[0-100]{end}em",
          "+maxw({info}$val{end})"
        ],
        [
          "max-width: {alert}[0-100]{end}em"
        ]
      ],
      [
        [
          "maxw{alert}[0-1000]{end}px",
          "+maxw({info}$val{end})"
        ],
        [
          "max-width: {alert}[0-1000]{end}px"
        ]
      ],
      [
        [
          "maxw{alert}[0-100]{end}pc",
          "+maxw({info}$val{end})"
        ],
        [
          "max-width: {alert}[0-100]{end}%"
        ]
      ],
      [
        [
          "maxw{alert}[0-100]{end}vw",
          "+maxw({info}$val{end})"
        ],
        [
          "max-width: {alert}[0-100]{end}vw"
        ]
      ],
      [
        [
          "maxw-auto",
          "+maxw-auto"
        ],
        [
          "max-width: auto"
        ]
      ]
    ]
  },
  {
    "type": "h3",
    "id": "max-height"
  },
  {
    "type": "table",
    "id": "max-height",
    "data": [
      [
        [
          "maxh{alert}[0-100]{end}em",
          "+maxh({info}$val{end})"
        ],
        [
          "max-height: {alert}[0-100]{end}em"
        ]
      ],
      [
        [
          "maxh{alert}[0-1000]{end}px",
          "+maxh({info}$val{end})"
        ],
        [
          "max-height: {alert}[0-1000]{end}px"
        ]
      ],
      [
        [
          "maxh{alert}[0-100]{end}pc",
          "+maxh({info}$val{end})"
        ],
        [
          "max-height: {alert}[0-100]{end}%"
        ]
      ],
      [
        [
          "maxh{alert}[0-100]{end}vh",
          "+maxh({info}$val{end})"
        ],
        [
          "max-height: {alert}[0-100]{end}vh"
        ]
      ],
      [
        [
          "maxh-auto",
          "+maxh-auto"
        ],
        [
          "max-height: auto"
        ]
      ]
    ]
  },
  {
    "type": "h3",
    "id": "flex-basis"
  },
  {
    "type": "table",
    "id": "flex-basis",
    "data": [
      [
        [
          "basis{alert}[0-100]{end}em",
          "+basis({info}$val{end})"
        ],
        [
          "flex-basis: {alert}[0-100]{end}em"
        ]
      ],
      [
        [
          "basis{alert}[0-1000]{end}px",
          "+basis({info}$val{end})"
        ],
        [
          "flex-basis: {alert}[0-1000]{end}px"
        ]
      ],
      [
        [
          "basis{alert}[0-100]{end}pc",
          "+basis({info}$val{end})"
        ],
        [
          "flex-basis: {alert}[0-100]{end}%"
        ]
      ],
      [
        [
          "basis-auto",
          "+basis-auto"
        ],
        [
          "flex-basis: auto"
        ]
      ]
    ]
  },
  {
    "type": "h3",
    "id": "border-radius"
  },
  {
    "type": "table",
    "id": "border-radius",
    "data": [
      [
        [
          "radius{alert}[0-100]{end}{info}[em|pc|px]{end}",
          "+radius($val)"
        ],
        [
          "border-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}"
        ]
      ],
      [
        [
          "radius{alert}[0-100]{end}{info}[em|pc|px]{end}-top",
          "+radius-top($val)"
        ],
        [
          "border-top-left-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}",
          "border-top-right-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}"
        ]
      ],
      [
        [
          "radius{alert}[0-100]{end}{info}[em|pc|px]{end}-bottom",
          "+radius-bottom($val)"
        ],
        [
          "border-bottom-left-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}",
          "border-bottom-right-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}"
        ]
      ],
      [
        [
          "radius{alert}[0-100]{end}{info}[em|pc|px]{end}-left",
          "+radius-left($val)"
        ],
        [
          "border-top-left-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}",
          "border-bottom-left-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}"
        ]
      ],
      [
        [
          "radius{alert}[0-100]{end}{info}[em|pc|px]{end}-right",
          "+radius-right($val)"
        ],
        [
          "border-top-right-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}",
          "border-bottom-right-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}"
        ]
      ],
      [
        [
          "radius{alert}[0-1000]{end}{info}[em|pc|px]{end}-top",
          "+radius-top($val)"
        ],
        [
          "border-top-left-radius: {alert}[0-1000]{end}{info}[em|pc|px]{end}",
          "border-top-right-radius: {alert}[0-1000]{end}{info}[em|pc|px]{end}"
        ]
      ],
      [
        [
          "radius{alert}[0-1000]{end}{info}[em|pc|px]{end}-bottom",
          "+radius-bottom($val)"
        ],
        [
          "border-bottom-left-radius: {alert}[0-1000]{end}{info}[em|pc|px]{end}",
          "border-bottom-right-radius: {alert}[0-1000]{end}{info}[em|pc|px]{end}"
        ]
      ],
      [
        [
          "radius{alert}[0-1000]{end}{info}[em|pc|px]{end}-left",
          "+radius-left($val)"
        ],
        [
          "border-top-left-radius: {alert}[0-1000]{end}{info}[em|pc|px]{end}",
          "border-bottom-left-radius: {alert}[0-1000]{end}{info}[em|pc|px]{end}"
        ]
      ],
      [
        [
          "radius{alert}[0-1000]{end}{info}[em|pc|px]{end}-right",
          "+radius-right($val)"
        ],
        [
          "border-top-right-radius: {alert}[0-1000]{end}{info}[em|pc|px]{end}",
          "border-bottom-right-radius: {alert}[0-1000]{end}{info}[em|pc|px]{end}"
        ]
      ],
      [
        [
          "radius{alert}[0-100]{end}{info}[em|pc|px]{end}-top",
          "+radius-top($val)"
        ],
        [
          "border-top-left-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}",
          "border-top-right-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}"
        ]
      ],
      [
        [
          "radius{alert}[0-100]{end}{info}[em|pc|px]{end}-bottom",
          "+radius-bottom($val)"
        ],
        [
          "border-bottom-left-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}",
          "border-bottom-right-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}"
        ]
      ],
      [
        [
          "radius{alert}[0-100]{end}{info}[em|pc|px]{end}-left",
          "+radius-left($val)"
        ],
        [
          "border-top-left-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}",
          "border-bottom-left-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}"
        ]
      ],
      [
        [
          "radius{alert}[0-100]{end}{info}[em|pc|px]{end}-right",
          "+radius-right($val)"
        ],
        [
          "border-top-right-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}",
          "border-bottom-right-radius: {alert}[0-100]{end}{info}[em|pc|px]{end}"
        ]
      ],
      [
        [
          "radius-auto",
          "+radius-auto"
        ],
        [
          "border-radius: auto"
        ]
      ]
    ]
  },
  {
    "type": "h2",
    "id": "transform"
  },
  {
    "type": "table",
    "id": "transform",
    "data": [
      [
        [
          "translate{alert}00{end}"
        ],
        [
          "transform: translate( {alert}0%, 0%{end})"
        ]
      ],
      [
        [
          "origin{alert}00{end}"
        ],
        [
          "transform-origin: {alert}0% 0%{end}"
        ]
      ],
      [
        [
          "translate{alert}0-50{end}"
        ],
        [
          "transform: translate( {alert}0%, -50%{end})"
        ]
      ],
      [
        [
          "origin{alert}0-50{end}"
        ],
        [
          "transform-origin: {alert}0% -50%{end}"
        ]
      ],
      [
        [
          "translate{alert}050{end}"
        ],
        [
          "transform: translate( {alert}0%, 50%{end})"
        ]
      ],
      [
        [
          "origin{alert}050{end}"
        ],
        [
          "transform-origin: {alert}0% 50%{end}"
        ]
      ],
      [
        [
          "translate{alert}0100{end}"
        ],
        [
          "transform: translate( {alert}0%, 100%{end})"
        ]
      ],
      [
        [
          "origin{alert}0100{end}"
        ],
        [
          "transform-origin: {alert}0% 100%{end}"
        ]
      ],
      [
        [
          "translate{alert}0-100{end}"
        ],
        [
          "transform: translate( {alert}0%, -100%{end})"
        ]
      ],
      [
        [
          "origin{alert}0-100{end}"
        ],
        [
          "transform-origin: {alert}0% -100%{end}"
        ]
      ],
      [
        [
          "translate{alert}-500{end}"
        ],
        [
          "transform: translate( {alert}-50%, 0%{end})"
        ]
      ],
      [
        [
          "origin{alert}-500{end}"
        ],
        [
          "transform-origin: {alert}-50% 0%{end}"
        ]
      ],
      [
        [
          "translate{alert}-50-50{end}"
        ],
        [
          "transform: translate( {alert}-50%, -50%{end})"
        ]
      ],
      [
        [
          "origin{alert}-50-50{end}"
        ],
        [
          "transform-origin: {alert}-50% -50%{end}"
        ]
      ],
      [
        [
          "translate{alert}-5050{end}"
        ],
        [
          "transform: translate( {alert}-50%, 50%{end})"
        ]
      ],
      [
        [
          "origin{alert}-5050{end}"
        ],
        [
          "transform-origin: {alert}-50% 50%{end}"
        ]
      ],
      [
        [
          "translate{alert}-50100{end}"
        ],
        [
          "transform: translate( {alert}-50%, 100%{end})"
        ]
      ],
      [
        [
          "origin{alert}-50100{end}"
        ],
        [
          "transform-origin: {alert}-50% 100%{end}"
        ]
      ],
      [
        [
          "translate{alert}-50-100{end}"
        ],
        [
          "transform: translate( {alert}-50%, -100%{end})"
        ]
      ],
      [
        [
          "origin{alert}-50-100{end}"
        ],
        [
          "transform-origin: {alert}-50% -100%{end}"
        ]
      ],
      [
        [
          "translate{alert}500{end}"
        ],
        [
          "transform: translate( {alert}50%, 0%{end})"
        ]
      ],
      [
        [
          "origin{alert}500{end}"
        ],
        [
          "transform-origin: {alert}50% 0%{end}"
        ]
      ],
      [
        [
          "translate{alert}50-50{end}"
        ],
        [
          "transform: translate( {alert}50%, -50%{end})"
        ]
      ],
      [
        [
          "origin{alert}50-50{end}"
        ],
        [
          "transform-origin: {alert}50% -50%{end}"
        ]
      ],
      [
        [
          "translate{alert}5050{end}"
        ],
        [
          "transform: translate( {alert}50%, 50%{end})"
        ]
      ],
      [
        [
          "origin{alert}5050{end}"
        ],
        [
          "transform-origin: {alert}50% 50%{end}"
        ]
      ],
      [
        [
          "translate{alert}50100{end}"
        ],
        [
          "transform: translate( {alert}50%, 100%{end})"
        ]
      ],
      [
        [
          "origin{alert}50100{end}"
        ],
        [
          "transform-origin: {alert}50% 100%{end}"
        ]
      ],
      [
        [
          "translate{alert}50-100{end}"
        ],
        [
          "transform: translate( {alert}50%, -100%{end})"
        ]
      ],
      [
        [
          "origin{alert}50-100{end}"
        ],
        [
          "transform-origin: {alert}50% -100%{end}"
        ]
      ],
      [
        [
          "translate{alert}1000{end}"
        ],
        [
          "transform: translate( {alert}100%, 0%{end})"
        ]
      ],
      [
        [
          "origin{alert}1000{end}"
        ],
        [
          "transform-origin: {alert}100% 0%{end}"
        ]
      ],
      [
        [
          "translate{alert}100-50{end}"
        ],
        [
          "transform: translate( {alert}100%, -50%{end})"
        ]
      ],
      [
        [
          "origin{alert}100-50{end}"
        ],
        [
          "transform-origin: {alert}100% -50%{end}"
        ]
      ],
      [
        [
          "translate{alert}10050{end}"
        ],
        [
          "transform: translate( {alert}100%, 50%{end})"
        ]
      ],
      [
        [
          "origin{alert}10050{end}"
        ],
        [
          "transform-origin: {alert}100% 50%{end}"
        ]
      ],
      [
        [
          "translate{alert}100100{end}"
        ],
        [
          "transform: translate( {alert}100%, 100%{end})"
        ]
      ],
      [
        [
          "origin{alert}100100{end}"
        ],
        [
          "transform-origin: {alert}100% 100%{end}"
        ]
      ],
      [
        [
          "translate{alert}100-100{end}"
        ],
        [
          "transform: translate( {alert}100%, -100%{end})"
        ]
      ],
      [
        [
          "origin{alert}100-100{end}"
        ],
        [
          "transform-origin: {alert}100% -100%{end}"
        ]
      ],
      [
        [
          "translate{alert}-1000{end}"
        ],
        [
          "transform: translate( {alert}-100%, 0%{end})"
        ]
      ],
      [
        [
          "origin{alert}-1000{end}"
        ],
        [
          "transform-origin: {alert}-100% 0%{end}"
        ]
      ],
      [
        [
          "translate{alert}-100-50{end}"
        ],
        [
          "transform: translate( {alert}-100%, -50%{end})"
        ]
      ],
      [
        [
          "origin{alert}-100-50{end}"
        ],
        [
          "transform-origin: {alert}-100% -50%{end}"
        ]
      ],
      [
        [
          "translate{alert}-10050{end}"
        ],
        [
          "transform: translate( {alert}-100%, 50%{end})"
        ]
      ],
      [
        [
          "origin{alert}-10050{end}"
        ],
        [
          "transform-origin: {alert}-100% 50%{end}"
        ]
      ],
      [
        [
          "translate{alert}-100100{end}"
        ],
        [
          "transform: translate( {alert}-100%, 100%{end})"
        ]
      ],
      [
        [
          "origin{alert}-100100{end}"
        ],
        [
          "transform-origin: {alert}-100% 100%{end}"
        ]
      ],
      [
        [
          "translate{alert}-100-100{end}"
        ],
        [
          "transform: translate( {alert}-100%, -100%{end})"
        ]
      ],
      [
        [
          "origin{alert}-100-100{end}"
        ],
        [
          "transform-origin: {alert}-100% -100%{end}"
        ]
      ]
    ]
  },
  {
    "type": "h2",
    "id": "font-size"
  },
  {
    "type": "table",
    "id": "font-size",
    "data": [
      [
        [
          "f0, h6, .h6",
          "+f0"
        ],
        [
          "font-size: {alert}0.785714rem{end}"
        ]
      ],
      [
        [
          "f1, h5, .h5",
          "+f1"
        ],
        [
          "font-size: {alert}1rem{end}"
        ]
      ],
      [
        [
          "f2, h4, .h4",
          "+f2"
        ],
        [
          "font-size: {alert}1.2857rem{end}"
        ]
      ],
      [
        [
          "f3, h3, .h3",
          "+f3"
        ],
        [
          "font-size: {alert}1.64285rem{end}"
        ]
      ],
      [
        [
          "f4, h2, .h2",
          "+f4"
        ],
        [
          "font-size: {alert}2.071428rem{end}"
        ]
      ],
      [
        [
          "f5, h1, .h1",
          "+f5"
        ],
        [
          "font-size: {alert}2.642857rem{end}"
        ]
      ]
    ]
  },
  {
    "type": "h2",
    "id": "z-index"
  },
  {
    "type": "table",
    "id": "z-index",
    "data": [
      [
        [
          "z-index{alert}0-99{end}",
          "+z-index( {alert}$z{end} )"
        ],
        [
          "z-index: {alert}0-99{end}"
        ]
      ]
    ]
  },
  {
    "type": "h2",
    "id": "opacity"
  },
  {
    "type": "table",
    "id": "opacity",
    "data": [
      [
        [
          "opacity{alert}0-99{end}",
          "+opacity( {alert}$z{end} )"
        ],
        [
          "opacity: {alert}0-99{end}"
        ]
      ]
    ]
  },
  {
    "type": "h2",
    "id": "font-family"
  },
  {
    "type": "table",
    "id": "font-family",
    "data": [
      [
        [
          "monospace",
          "+monospace"
        ],
        [
          "font-family: {info}var(--font-monospace){end}"
        ]
      ],
      [
        [
          "serif",
          "+serif"
        ],
        [
          "font-family: {info}var(--font-serif){end}"
        ]
      ],
      [
        [
          "sans-serif",
          "+sans-serif"
        ],
        [
          "font-family: {info}var(--font-sans-serif){end}"
        ]
      ],
      [
        [
          "cursive",
          "+cursive"
        ],
        [
          "font-family: {info}var(--font-cursive){end}"
        ]
      ],
      [
        [
          "slab",
          "+slab"
        ],
        [
          "font-family: {info}var(--font-slab){end}"
        ]
      ],
      [
        [
          "grotesque",
          "+grotesque"
        ],
        [
          "font-family: {info}var(--font-grotesque){end}"
        ]
      ]
    ]
  }
]