/**
 * Using to add space for each row
 * @param text
 * @param restLength
 * @param align
 */
var processAlignText = function (text, restLength, align) {
    if (align === 0) {
        return text + " ".repeat(restLength);
    }
    else if (align === 1) {
        return " ".repeat(Math.floor(restLength / 2)) + text + " ".repeat(Math.ceil(restLength / 2));
    }
    else if (align === 2) {
        return " ".repeat(restLength) + text;
    }
    return '';
};
/**
 * process down line when length of text is bigger than columnWidthAtRow
 * @param text
 * @param maxLength
 */
var processNewLine = function (text, maxLength) {
    var _a;
    var newText;
    var newTextTail;
    var next_char = text.slice(maxLength, maxLength + 1);
    if (next_char === ' ') {
        newText = text.slice(0, maxLength);
        newTextTail = text.slice(maxLength, text.length);
    }
    else {
        var newMaxLength = text.slice(0, maxLength).split('').map(function (e) { return e; }).lastIndexOf(' ');
        if (newMaxLength === -1) {
            newText = text.slice(0, maxLength);
            newTextTail = text.slice(maxLength, text.length);
        }
        else {
            newText = text.slice(0, newMaxLength);
            newTextTail = text.slice(newMaxLength, text.length);
        }
    }
    return {
        text: newText !== null && newText !== void 0 ? newText : '',
        text_tail: (_a = newTextTail.trim()) !== null && _a !== void 0 ? _a : ''
    };
};
export var processColumnText = function (texts, columnWidth, columnAliment, columnStyle) {
    if (columnStyle === void 0) { columnStyle = []; }
    var rest_texts = ['', '', ''];
    var result = '';
    texts.map(function (text, idx) {
        var _a, _b, _c;
        var columnWidthAtRow = Math.round(columnWidth === null || columnWidth === void 0 ? void 0 : columnWidth[idx]);
        if ((text === null || text === void 0 ? void 0 : text.length) >= columnWidth[idx]) {
            var processedText = processNewLine(text, columnWidthAtRow);
            result += ((_a = columnStyle === null || columnStyle === void 0 ? void 0 : columnStyle[idx]) !== null && _a !== void 0 ? _a : '') + processAlignText(processedText.text, columnWidthAtRow - ((_b = processedText === null || processedText === void 0 ? void 0 : processedText.text) === null || _b === void 0 ? void 0 : _b.length), columnAliment[idx]) + (idx !== 2 ? " " : "");
            rest_texts[idx] = processedText === null || processedText === void 0 ? void 0 : processedText.text_tail;
        }
        else {
            result += ((_c = columnStyle === null || columnStyle === void 0 ? void 0 : columnStyle[idx]) !== null && _c !== void 0 ? _c : '') + processAlignText(text === null || text === void 0 ? void 0 : text.trim(), columnWidthAtRow - (text === null || text === void 0 ? void 0 : text.length), columnAliment[idx]) + (idx !== 2 ? " " : "");
        }
    });
    var index_nonEmpty = rest_texts.findIndex(function (rest_text) { return rest_text != ''; });
    if (index_nonEmpty !== -1) {
        result += "\n" + processColumnText(rest_texts, columnWidth, columnAliment, columnStyle);
    }
    return result;
};
