var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { NativeModules, Platform } from "react-native";
import * as EPToolkit from "./utils/EPToolkit";
import { processColumnText } from "./utils/print-column";
import { COMMANDS } from "./utils/printer-commands";
var RNUSBPrinter = NativeModules.RNUSBPrinter;
var RNBLEPrinter = NativeModules.RNBLEPrinter;
export var PrinterWidth;
(function (PrinterWidth) {
    PrinterWidth[PrinterWidth["58mm"] = 58] = "58mm";
    PrinterWidth[PrinterWidth["80mm"] = 80] = "80mm";
})(PrinterWidth || (PrinterWidth = {}));
export var ColumnAliment;
(function (ColumnAliment) {
    ColumnAliment[ColumnAliment["LEFT"] = 0] = "LEFT";
    ColumnAliment[ColumnAliment["CENTER"] = 1] = "CENTER";
    ColumnAliment[ColumnAliment["RIGHT"] = 2] = "RIGHT";
})(ColumnAliment || (ColumnAliment = {}));
var textTo64Buffer = function (text, opts) {
    var defaultOptions = {
        beep: false,
        cut: false,
        tailingLine: false,
        encoding: "UTF8",
    };
    var options = __assign(__assign({}, defaultOptions), opts);
    var fixAndroid = "\n";
    var buffer = EPToolkit.exchange_text(text + fixAndroid, options);
    return buffer.toString("base64");
};
var billTo64Buffer = function (text, opts) {
    var defaultOptions = {
        beep: true,
        cut: true,
        encoding: "UTF8",
        tailingLine: true,
    };
    var options = __assign(__assign({}, defaultOptions), opts);
    var buffer = EPToolkit.exchange_text(text, options);
    return buffer.toString("base64");
};
var textPreprocessingIOS = function (text, canCut, beep) {
    if (canCut === void 0) { canCut = true; }
    if (beep === void 0) { beep = true; }
    var options = {
        beep: beep,
        cut: canCut,
    };
    return {
        text: text
            .replace(/<\/?CB>/g, "")
            .replace(/<\/?CM>/g, "")
            .replace(/<\/?CD>/g, "")
            .replace(/<\/?C>/g, "")
            .replace(/<\/?D>/g, "")
            .replace(/<\/?B>/g, "")
            .replace(/<\/?M>/g, ""),
        opts: options,
    };
};
// const imageToBuffer = async (imagePath: string, threshold: number = 60) => {
//   const buffer = await EPToolkit.exchange_image(imagePath, threshold);
//   return buffer.toString("base64");
// };
var USBPrinter = {
    init: function () {
        return new Promise(function (resolve, reject) {
            return RNUSBPrinter.init(function () { return resolve(); }, function (error) { return reject({ error: error, hasError: true }); });
        });
    },
    getDeviceList: function () {
        return new Promise(function (resolve, reject) {
            return RNUSBPrinter.getDeviceList(function (printers) { return resolve(printers); }, function (error) { return reject({ error: error, hasError: true }); });
        });
    },
    connectPrinter: function (vendorId, productId) {
        return new Promise(function (resolve, reject) {
            return RNUSBPrinter.connectPrinter(vendorId, productId, function (printer) { return resolve(printer); }, function (error) { return reject({ error: error, hasError: true }); });
        });
    },
    closeConn: function () {
        return new Promise(function (resolve) {
            RNUSBPrinter.closeConn();
            resolve();
        });
    },
    printText: function (text, opts, callbackError) {
        if (opts === void 0) { opts = {}; }
        return RNUSBPrinter.printRawData(textTo64Buffer(text, opts), callbackError);
    },
    printBill: function (text, opts, callbackError) {
        if (opts === void 0) { opts = {}; }
        return RNUSBPrinter.printRawData(billTo64Buffer(text, opts), callbackError);
    },
    /**
     * image url
     * @param imgUrl
     * @param opts
     */
    printImage: function (imgUrl, opts, callbackError) {
        var _a, _b;
        if (opts === void 0) { opts = {}; }
        if (Platform.OS === "ios") {
            RNUSBPrinter.printImageData(imgUrl, opts, callbackError);
        }
        else {
            RNUSBPrinter.printImageData(imgUrl, (_a = opts === null || opts === void 0 ? void 0 : opts.imageWidth) !== null && _a !== void 0 ? _a : 0, (_b = opts === null || opts === void 0 ? void 0 : opts.imageHeight) !== null && _b !== void 0 ? _b : 0, callbackError);
        }
    },
    /**
     * base 64 string
     * @param Base64
     * @param opts
     */
    printImageBase64: function (Base64, opts, callbackError) {
        var _a, _b;
        if (opts === void 0) { opts = {}; }
        if (Platform.OS === "ios") {
            RNUSBPrinter.printImageBase64(Base64, opts, callbackError);
        }
        else {
            RNUSBPrinter.printImageBase64(Base64, (_a = opts === null || opts === void 0 ? void 0 : opts.imageWidth) !== null && _a !== void 0 ? _a : 0, (_b = opts === null || opts === void 0 ? void 0 : opts.imageHeight) !== null && _b !== void 0 ? _b : 0, callbackError);
        }
    },
    /**
     * android print with encoder
     * @param text
     */
    printRaw: function (text, callbackError) {
        if (Platform.OS === "ios") {
        }
        else {
            RNUSBPrinter.printRawData(text, callbackError);
        }
    },
    /**
     * `columnWidth`
     * 80mm => 46 character
     * 58mm => 30 character
     */
    printColumnsText: function (texts, columnWidth, columnAliment, columnStyle, opts, callbackError) {
        if (opts === void 0) { opts = {}; }
        var result = processColumnText(texts, columnWidth, columnAliment, columnStyle);
        RNUSBPrinter.printRawData(textTo64Buffer(result, opts), callbackError);
    },
};
var BLEPrinter = {
    init: function () {
        return new Promise(function (resolve, reject) {
            return RNBLEPrinter.init(function () { return resolve(); }, function (error) { return reject({ error: error, hasError: true }); });
        });
    },
    getDeviceList: function () {
        return new Promise(function (resolve, reject) {
            return RNBLEPrinter.getDeviceList(function (printers) { return resolve(printers); }, function (error) { return reject({ error: error, hasError: true }); });
        });
    },
    connectPrinter: function (inner_mac_address) {
        return new Promise(function (resolve, reject) {
            return RNBLEPrinter.connectPrinter(inner_mac_address, function (printer) { return resolve(printer); }, function (error) { return reject({ error: error, hasError: true }); });
        });
    },
    closeConn: function () {
        return new Promise(function (resolve) {
            RNBLEPrinter.closeConn();
            resolve();
        });
    },
    printText: function (text, opts, callbackError) {
        if (opts === void 0) { opts = {}; }
        if (Platform.OS === "ios") {
            var processedText = textPreprocessingIOS(text, false, false);
            RNBLEPrinter.printRawData(processedText.text, processedText.opts, callbackError);
        }
        else {
            RNBLEPrinter.printRawData(textTo64Buffer(text, opts), callbackError);
        }
    },
    printBill: function (text, opts, callbackError) {
        var _a, _b;
        if (opts === void 0) { opts = {}; }
        if (Platform.OS === "ios") {
            var processedText = textPreprocessingIOS(text, (_a = opts === null || opts === void 0 ? void 0 : opts.cut) !== null && _a !== void 0 ? _a : true, (_b = opts.beep) !== null && _b !== void 0 ? _b : true);
            RNBLEPrinter.printRawData(processedText.text, processedText.opts, callbackError);
        }
        else {
            RNBLEPrinter.printRawData(billTo64Buffer(text, opts), callbackError);
        }
    },
    /**
     * image url
     * @param imgUrl
     * @param opts
     */
    printImage: function (imgUrl, opts, callbackError) {
        var _a, _b;
        if (opts === void 0) { opts = {}; }
        if (Platform.OS === "ios") {
            /**
             * just development
             */
            RNBLEPrinter.printImageData(imgUrl, opts, callbackError);
        }
        else {
            RNBLEPrinter.printImageData(imgUrl, (_a = opts === null || opts === void 0 ? void 0 : opts.imageWidth) !== null && _a !== void 0 ? _a : 0, (_b = opts === null || opts === void 0 ? void 0 : opts.imageHeight) !== null && _b !== void 0 ? _b : 0, callbackError);
        }
    },
    /**
     * base 64 string
     * @param Base64
     * @param opts
     */
    printImageBase64: function (Base64, opts, callbackError) {
        var _a, _b;
        if (opts === void 0) { opts = {}; }
        if (Platform.OS === "ios") {
            /**
             * just development
             */
            RNBLEPrinter.printImageBase64(Base64, opts, callbackError);
        }
        else {
            /**
             * just development
             */
            RNBLEPrinter.printImageBase64(Base64, (_a = opts === null || opts === void 0 ? void 0 : opts.imageWidth) !== null && _a !== void 0 ? _a : 0, (_b = opts === null || opts === void 0 ? void 0 : opts.imageHeight) !== null && _b !== void 0 ? _b : 0, callbackError);
        }
    },
    /**
     * android print with encoder
     * @param text
     */
    printRaw: function (text, callbackError) {
        if (Platform.OS === "ios") {
        }
        else {
            RNBLEPrinter.printRawData(text, callbackError);
        }
    },
    /**
     * `columnWidth`
     * 80mm => 46 character
     * 58mm => 30 character
     */
    printColumnsText: function (texts, columnWidth, columnAliment, columnStyle, opts, callbackError) {
        if (opts === void 0) { opts = {}; }
        var result = processColumnText(texts, columnWidth, columnAliment, columnStyle);
        if (Platform.OS === "ios") {
            var processedText = textPreprocessingIOS(result, false, false);
            RNBLEPrinter.printRawData(processedText.text, processedText.opts, callbackError);
        }
        else {
            RNBLEPrinter.printRawData(textTo64Buffer(result, opts), callbackError);
        }
    },
};
// const NetPrinter = {
//   init: (): Promise<void> =>
//     new Promise((resolve, reject) =>
//       RNNetPrinter.init(
//         () => resolve(),
//         (error: Error) => reject(error)
//       )
//     ),
//   getDeviceList: (): Promise<INetPrinter[]> =>
//     new Promise((resolve, reject) =>
//       RNNetPrinter.getDeviceList(
//         (printers: INetPrinter[]) => resolve(printers),
//         (error: Error) => reject(error)
//       )
//     ),
//   connectPrinter: (
//     host: string,
//     port: number,
//     timeout?: number
//   ): Promise<INetPrinter> =>
//     new Promise(async (resolve, reject) => {
//       try {
//         await connectToHost(host, timeout);
//         RNNetPrinter.connectPrinter(
//           host,
//           port,
//           (printer: INetPrinter) => resolve(printer),
//           (error: Error) => reject(error)
//         );
//       } catch (error) {
//         reject(error?.message || `Connect to ${host} fail`);
//       }
//     }),
//   closeConn: (): Promise<void> =>
//     new Promise((resolve) => {
//       RNNetPrinter.closeConn();
//       resolve();
//     }),
//   printText: (text: string, opts = {}): void => {
//     if (Platform.OS === "ios") {
//       const processedText = textPreprocessingIOS(text, false, false);
//       RNNetPrinter.printRawData(
//         processedText.text,
//         processedText.opts,
//         (error: Error) => console.warn(error)
//       );
//     } else {
//       RNNetPrinter.printRawData(textTo64Buffer(text, opts), (error: Error) =>
//         console.warn(error)
//       );
//     }
//   },
//   printBill: (text: string, opts: PrinterOptions = {}): void => {
//     if (Platform.OS === "ios") {
//       const processedText = textPreprocessingIOS(
//         text,
//         opts?.cut ?? true,
//         opts.beep ?? true
//       );
//       RNNetPrinter.printRawData(
//         processedText.text,
//         processedText.opts,
//         (error: Error) => console.warn(error)
//       );
//     } else {
//       RNNetPrinter.printRawData(billTo64Buffer(text, opts), (error: Error) =>
//         console.warn(error)
//       );
//     }
//   },
//   /**
//    * image url
//    * @param imgUrl
//    * @param opts
//    */
//   printImage: function (imgUrl: string, opts: PrinterImageOptions = {}) {
//     if (Platform.OS === "ios") {
//       RNNetPrinter.printImageData(imgUrl, opts, (error: Error) =>
//         console.warn(error)
//       );
//     } else {
//       RNNetPrinter.printImageData(
//         imgUrl,
//         opts?.imageWidth ?? 0,
//         opts?.imageHeight ?? 0,
//         (error: Error) => console.warn(error)
//       );
//     }
//   },
//   /**
//    * base 64 string
//    * @param Base64
//    * @param opts
//    */
//   printImageBase64: function (Base64: string, opts: PrinterImageOptions = {}) {
//     if (Platform.OS === "ios") {
//       RNNetPrinter.printImageBase64(Base64, opts, (error: Error) =>
//         console.warn(error)
//       );
//     } else {
//       RNNetPrinter.printImageBase64(
//         Base64,
//         opts?.imageWidth ?? 0,
//         opts?.imageHeight ?? 0,
//         (error: Error) => console.warn(error)
//       );
//     }
//   },
//   /**
//    * Android print with encoder
//    * @param text
//    */
//   printRaw: (text: string): void => {
//     if (Platform.OS === "ios") {
//     } else {
//       RNNetPrinter.printRawData(text, (error: Error) => console.warn(error));
//     }
//   },
//   /**
//    * `columnWidth`
//    * 80mm => 46 character
//    * 58mm => 30 character
//    */
//   printColumnsText: (
//     texts: string[],
//     columnWidth: number[],
//     columnAliment: ColumnAliment[],
//     columnStyle: string[] = [],
//     opts: PrinterOptions = {}
//   ): void => {
//     const result = processColumnText(
//       texts,
//       columnWidth,
//       columnAliment,
//       columnStyle
//     );
//     if (Platform.OS === "ios") {
//       const processedText = textPreprocessingIOS(result, false, false);
//       RNNetPrinter.printRawData(
//         processedText.text,
//         processedText.opts,
//         (error: Error) => console.warn(error)
//       );
//     } else {
//       RNNetPrinter.printRawData(textTo64Buffer(result, opts), (error: Error) =>
//         console.warn(error)
//       );
//     }
//   },
// };
// const NetPrinterEventEmitter =
//   Platform.OS === "ios"
//     ? new NativeEventEmitter(RNNetPrinter)
//     : new NativeEventEmitter();
// export { COMMANDS, NetPrinter, BLEPrinter, USBPrinter, NetPrinterEventEmitter };
export { COMMANDS, BLEPrinter, USBPrinter };
export var RN_THERMAL_RECEIPT_PRINTER_EVENTS;
(function (RN_THERMAL_RECEIPT_PRINTER_EVENTS) {
    RN_THERMAL_RECEIPT_PRINTER_EVENTS["EVENT_NET_PRINTER_SCANNED_SUCCESS"] = "scannerResolved";
    RN_THERMAL_RECEIPT_PRINTER_EVENTS["EVENT_NET_PRINTER_SCANNING"] = "scannerRunning";
    RN_THERMAL_RECEIPT_PRINTER_EVENTS["EVENT_NET_PRINTER_SCANNED_ERROR"] = "registerError";
})(RN_THERMAL_RECEIPT_PRINTER_EVENTS || (RN_THERMAL_RECEIPT_PRINTER_EVENTS = {}));
