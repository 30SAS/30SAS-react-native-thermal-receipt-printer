import { NativeModules, Platform } from "react-native";

import * as EPToolkit from "./utils/EPToolkit";
import { processColumnText } from "./utils/print-column";
import { COMMANDS } from "./utils/printer-commands";

const RNUSBPrinter = NativeModules.RNUSBPrinter;
const RNBLEPrinter = NativeModules.RNBLEPrinter;

export interface PrinterOptions {
  beep?: boolean;
  cut?: boolean;
  tailingLine?: boolean;
  encoding?: string;
}

export enum PrinterWidth {
  "58mm" = 58,
  "80mm" = 80,
}

export interface PrinterImageOptions {
  beep?: boolean;
  cut?: boolean;
  tailingLine?: boolean;
  encoding?: string;
  imageWidth?: number;
  imageHeight?: number;
  printerWidthType?: PrinterWidth;
  // only ios
  paddingX?: number;
}

export interface IUSBPrinter {
  device_name: string;
  vendor_id: string;
  product_id: string;
}

export interface IBLEPrinter {
  device_name: string;
  inner_mac_address: string;
}

export interface INetPrinter {
  host: string;
  port: number;
}

export enum ColumnAliment {
  LEFT,
  CENTER,
  RIGHT,
}

const textTo64Buffer = (text: string, opts: PrinterOptions) => {
  const defaultOptions = {
    beep: false,
    cut: false,
    tailingLine: false,
    encoding: "UTF8",
  };

  const options = {
    ...defaultOptions,
    ...opts,
  };

  const fixAndroid = "\n";
  const buffer = EPToolkit.exchange_text(text + fixAndroid, options);
  return buffer.toString("base64");
};

const billTo64Buffer = (text: string, opts: PrinterOptions) => {
  const defaultOptions = {
    beep: true,
    cut: true,
    encoding: "UTF8",
    tailingLine: true,
  };
  const options = {
    ...defaultOptions,
    ...opts,
  };
  const buffer = EPToolkit.exchange_text(text, options);
  return buffer.toString("base64");
};

const textPreprocessingIOS = (text: string, canCut = true, beep = true) => {
  let options = {
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

const USBPrinter = {
  init: (): Promise<void> =>
    new Promise((resolve, reject) =>
      RNUSBPrinter.init(
        () => resolve(),
        (error: Error) => reject({ error, hasError: true })
      )
    ),

  getDeviceList: (): Promise<IUSBPrinter[]> =>
    new Promise((resolve, reject) =>
      RNUSBPrinter.getDeviceList(
        (printers: IUSBPrinter[]) => resolve(printers),
        (error: Error) => reject({ error, hasError: true })
      )
    ),

  connectPrinter: (vendorId: string, productId: string): Promise<IUSBPrinter> =>
    new Promise((resolve, reject) =>
      RNUSBPrinter.connectPrinter(
        vendorId,
        productId,
        (printer: IUSBPrinter) => resolve(printer),
        (error: Error) => reject({ error, hasError: true })
      )
    ),

  closeConn: (): Promise<void> =>
    new Promise((resolve) => {
      RNUSBPrinter.closeConn();
      resolve();
    }),

  printText: (
    text: string,
    opts: PrinterOptions = {},
    callbackError?: (error: any) => void
  ): Promise<void> =>
    RNUSBPrinter.printRawData(textTo64Buffer(text, opts), callbackError),

  printBill: (
    text: string,
    opts: PrinterOptions = {},
    callbackError?: (error: any) => void
  ): void =>
    RNUSBPrinter.printRawData(billTo64Buffer(text, opts), callbackError),
  /**
   * image url
   * @param imgUrl
   * @param opts
   */
  printImage: function (
    imgUrl: string,
    opts: PrinterImageOptions = {},
    callbackError?: (error: any) => void
  ) {
    if (Platform.OS === "ios") {
      RNUSBPrinter.printImageData(imgUrl, opts, callbackError);
    } else {
      RNUSBPrinter.printImageData(
        imgUrl,
        opts?.imageWidth ?? 0,
        opts?.imageHeight ?? 0,
        callbackError
      );
    }
  },
  /**
   * base 64 string
   * @param Base64
   * @param opts
   */
  printImageBase64: function (
    Base64: string,
    opts: PrinterImageOptions = {},
    callbackError?: (error: any) => void
  ) {
    if (Platform.OS === "ios") {
      RNUSBPrinter.printImageBase64(Base64, opts, callbackError);
    } else {
      RNUSBPrinter.printImageBase64(
        Base64,
        opts?.imageWidth ?? 0,
        opts?.imageHeight ?? 0,
        callbackError
      );
    }
  },
  /**
   * android print with encoder
   * @param text
   */
  printRaw: (text: string, callbackError?: (error: any) => void): void => {
    if (Platform.OS === "ios") {
    } else {
      RNUSBPrinter.printRawData(text, callbackError);
    }
  },
  /**
   * `columnWidth`
   * 80mm => 46 character
   * 58mm => 30 character
   */
  printColumnsText: (
    texts: string[],
    columnWidth: number[],
    columnAliment: ColumnAliment[],
    columnStyle: string[],
    opts: PrinterOptions = {},
    callbackError?: (error: any) => void
  ): void => {
    const result = processColumnText(
      texts,
      columnWidth,
      columnAliment,
      columnStyle
    );
    RNUSBPrinter.printRawData(textTo64Buffer(result, opts), callbackError);
  },
};

const BLEPrinter = {
  init: (): Promise<void> =>
    new Promise((resolve, reject) =>
      RNBLEPrinter.init(
        () => resolve(),
        (error: Error) => reject({ error, hasError: true })
      )
    ),

  getDeviceList: (): Promise<IBLEPrinter[]> =>
    new Promise((resolve, reject) =>
      RNBLEPrinter.getDeviceList(
        (printers: IBLEPrinter[]) => resolve(printers),
        (error: Error) => reject({ error, hasError: true })
      )
    ),

  connectPrinter: (inner_mac_address: string): Promise<IBLEPrinter> =>
    new Promise((resolve, reject) =>
      RNBLEPrinter.connectPrinter(
        inner_mac_address,
        (printer: IBLEPrinter) => resolve(printer),
        (error: Error) => reject({ error, hasError: true })
      )
    ),

  closeConn: (): Promise<void> =>
    new Promise((resolve) => {
      RNBLEPrinter.closeConn();
      resolve();
    }),

  printText: (
    text: string,
    opts: PrinterOptions = {},
    callbackError?: (error: any) => void
  ): void => {
    if (Platform.OS === "ios") {
      const processedText = textPreprocessingIOS(text, false, false);
      RNBLEPrinter.printRawData(
        processedText.text,
        processedText.opts,
        callbackError
      );
    } else {
      RNBLEPrinter.printRawData(textTo64Buffer(text, opts), callbackError);
    }
  },

  printBill: (
    text: string,
    opts: PrinterOptions = {},
    callbackError?: (error: any) => void
  ): void => {
    if (Platform.OS === "ios") {
      const processedText = textPreprocessingIOS(
        text,
        opts?.cut ?? true,
        opts.beep ?? true
      );
      RNBLEPrinter.printRawData(
        processedText.text,
        processedText.opts,
        callbackError
      );
    } else {
      RNBLEPrinter.printRawData(billTo64Buffer(text, opts), callbackError);
    }
  },
  /**
   * image url
   * @param imgUrl
   * @param opts
   */
  printImage: function (
    imgUrl: string,
    opts: PrinterImageOptions = {},
    callbackError?: (error: any) => void
  ) {
    if (Platform.OS === "ios") {
      /**
       * just development
       */
      RNBLEPrinter.printImageData(imgUrl, opts, callbackError);
    } else {
      RNBLEPrinter.printImageData(
        imgUrl,
        opts?.imageWidth ?? 0,
        opts?.imageHeight ?? 0,
        callbackError
      );
    }
  },
  /**
   * base 64 string
   * @param Base64
   * @param opts
   */
  printImageBase64: function (
    Base64: string,
    opts: PrinterImageOptions = {},
    callbackError?: (error: any) => void
  ) {
    if (Platform.OS === "ios") {
      /**
       * just development
       */
      RNBLEPrinter.printImageBase64(Base64, opts, callbackError);
    } else {
      /**
       * just development
       */
      RNBLEPrinter.printImageBase64(
        Base64,
        opts?.imageWidth ?? 0,
        opts?.imageHeight ?? 0,
        callbackError
      );
    }
  },
  /**
   * android print with encoder
   * @param text
   */
  printRaw: (text: string, callbackError?: (error: any) => void): void => {
    if (Platform.OS === "ios") {
    } else {
      RNBLEPrinter.printRawData(text, callbackError);
    }
  },
  /**
   * `columnWidth`
   * 80mm => 46 character
   * 58mm => 30 character
   */
  printColumnsText: (
    texts: string[],
    columnWidth: number[],
    columnAliment: ColumnAliment[],
    columnStyle: string[],
    opts: PrinterOptions = {},
    callbackError?: (error: any) => void
  ): void => {
    const result = processColumnText(
      texts,
      columnWidth,
      columnAliment,
      columnStyle
    );
    if (Platform.OS === "ios") {
      const processedText = textPreprocessingIOS(result, false, false);
      RNBLEPrinter.printRawData(
        processedText.text,
        processedText.opts,
        callbackError
      );
    } else {
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

export enum RN_THERMAL_RECEIPT_PRINTER_EVENTS {
  EVENT_NET_PRINTER_SCANNED_SUCCESS = "scannerResolved",
  EVENT_NET_PRINTER_SCANNING = "scannerRunning",
  EVENT_NET_PRINTER_SCANNED_ERROR = "registerError",
}
