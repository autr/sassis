export function withLineNumbers(highlight, options = {}) {
    const opts = Object.assign({ class: "linenumbers", wrapClass: "wrapper", width: "35px", backgroundColor: "rgba(128, 128, 128, 0.15)", color: "" }, options);
    let lineNumbers;
    return function (editor) {
        highlight(editor);
        if (!lineNumbers) {
            lineNumbers = init(editor, opts);
            editor.addEventListener("scroll", () => lineNumbers.style.top = `-${editor.scrollTop}px`);
        }
        const code = editor.textContent || "";
        const linesCount = code.replace(/\n+$/, "\n").split("\n").length + 1;
        let text = "";
        for (let i = 1; i < linesCount; i++) {
            text += `${i}\n`;
        }
        lineNumbers.innerText = text;
    };
}
function init(editor, opts) {
    const css = getComputedStyle(editor);
    const wrap = document.createElement("div");
    wrap.className = opts.wrapClass;
    wrap.style.position = "relative";
    const gutter = document.createElement("div");
    gutter.className = opts.class;
    wrap.appendChild(gutter);
    // Add own styles
    gutter.style.position = "absolute";
    gutter.style.top = "0px";
    gutter.style.left = "0px";
    gutter.style.bottom = "0px";
    gutter.style.width = opts.width;
    gutter.style.overflow = "hidden";
    // Copy editor styles
    gutter.style.paddingTop = css.paddingTop;
    gutter.style.paddingLeft = css.paddingLeft;
    // Add line numbers
    const lineNumbers = document.createElement("div");
    lineNumbers.style.position = "relative";
    lineNumbers.style.top = "0px";
    gutter.appendChild(lineNumbers);
    // Tweak editor styles
    editor.style.paddingLeft = `calc(${opts.width} + ${gutter.style.paddingLeft})`;
    editor.style.whiteSpace = "pre";
    // Swap editor with a wrap
    editor.parentNode.insertBefore(wrap, editor);
    wrap.appendChild(editor);
    return lineNumbers;
}
