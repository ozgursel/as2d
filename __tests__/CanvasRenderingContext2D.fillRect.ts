import { instantiateBuffer, ICanvasSYS } from "../src";
import { readFileSync } from "fs";
import { ASUtil } from "assemblyscript/lib/loader";
import { GlobalCompositeOperation } from "../src/shared/GlobalCompositeOperation";
import { ImageSmoothingQuality } from "../src/shared/ImageSmoothingQuality";

interface ICanvasRenderingContext2DTestSuite {
  arc(x: number, y: number, r: number, startAngle: number, endAngle: number): void;
  createImage(): number;
  createPattern(): number;
  createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): number;
  fillGradient(): void;
  fillPattern(): void;
  init(): void;
  fillStyle(value: number): void;
  fillRect(x: number, y: number, width: number, height: number): void;
  filter(value: number): void;
  globalAlpha(value: number): void;
  globalCompositeOperation(value: GlobalCompositeOperation): void;
  imageSmoothingEnabled(value: 0 | 1): void;
  imageSmoothingQuality(value: ImageSmoothingQuality): void;
  setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void;
  shadowBlur(value: number): void;
  shadowColor(value: number): void;
  shadowOffsetX(value: number): void;
  shadowOffsetY(value: number): void;
  commit(): void;
}

let buff = readFileSync("./build/CanvasRenderingContext2D.test.wasm");
let wasm: ASUtil & ICanvasSYS & ICanvasRenderingContext2DTestSuite;
let ctx: CanvasRenderingContext2D;

beforeEach(() => {
  wasm = instantiateBuffer<ICanvasRenderingContext2DTestSuite>(buff, {
    test: {
      log: console.log.bind(console),
      logStr(ptr: number) {
        console.log(wasm.getString(ptr));
      },
    }
  });
  var canvas: HTMLCanvasElement = document.createElement("canvas");
  ctx = canvas.getContext("2d")!;
  wasm.useContext("main", ctx);
  wasm.init();

  if (!jest.isMockFunction(ctx.setTransform)) {
    ctx.setTransform = jest.fn(ctx.setTransform.bind(ctx));
  }
});

describe("fillRect", () => {
  it("should update the fillStyle when fillRect is called", () => {
    const unchanged: string = ctx.fillStyle as string;
    wasm.arc(0, 1, 2, 3, 4);
    wasm.fillStyle(wasm.newString("blue"));
    wasm.commit();
    expect(ctx.fillStyle).toBe(unchanged);
    wasm.fillRect(1, 2, 3, 4);
    wasm.commit();
    expect(ctx.fillStyle).toBe("#0000ff");
  });

  it("should update the fillStyle when the fillStyle is set to a gradient", () => {
    var id: number = wasm.createRadialGradient(0, 0, 0, 100, 100, 100);
    wasm.fillGradient();
    wasm.fillRect(1, 2, 3, 4);
    wasm.commit();
    expect(wasm.gradients[id]).toBeTruthy();
    expect(ctx.fillStyle).toBe(wasm.gradients[id]);
    expect(ctx.fillRect).toBeCalledWith(1, 2, 3, 4);
  });

  it("should update the fillStyle when the fillStyle is set to a pattern", () => {
    var id: number = wasm.createImage();
    expect(wasm.loading[id]).toBeInstanceOf(Promise);
    return wasm.loading[id].then(() => {
      expect(wasm.images[id]).toBeTruthy();
      id = wasm.createPattern();
      wasm.fillPattern();
      wasm.fillRect(1, 2, 3, 4);
      wasm.commit();
      expect(ctx.fillStyle).toBe(wasm.patterns[id]);
      expect(ctx.fillRect).toBeCalledWith(1, 2, 3, 4);
    });
  });

  it("should update the filter value when fillRect is called", () => {
    wasm.filter(wasm.newString("invert(100%)"));
    wasm.fillRect(1, 2, 3, 4);
    wasm.commit();
    expect(ctx.filter).toBe("invert(100%)");
    expect(ctx.fillRect).toBeCalledWith(1, 2, 3, 4);
  });

  it("should update the globalAlpha value when fillRect is called", () => {
    wasm.globalAlpha(0.5);
    wasm.fillRect(1, 2, 3, 4);
    wasm.commit();
    expect(ctx.globalAlpha).toBe(0.5);
    expect(ctx.fillRect).toBeCalledWith(1, 2, 3, 4);
  });

  it("should update the globalCompositeOperation value when fillRect is called", () => {
    wasm.globalCompositeOperation(GlobalCompositeOperation.color);
    wasm.fillRect(1, 2, 3, 4);
    wasm.commit();
    expect(ctx.globalCompositeOperation).toBe("color");
    expect(ctx.fillRect).toBeCalledWith(1, 2, 3, 4);
  });

  it("should update the imageSmoothingEnabled value when fillRect is called", () => {
    wasm.imageSmoothingEnabled(0);
    wasm.fillRect(1, 2, 3, 4);
    wasm.commit();
    expect(ctx.imageSmoothingEnabled).toBe(false);
    expect(ctx.fillRect).toBeCalledWith(1, 2, 3, 4);
  });

  it("should update the imageSmoothingQuality value to medium when fillRect is called", () => {
    wasm.imageSmoothingQuality(ImageSmoothingQuality.medium);
    wasm.fillRect(1, 2, 3, 4);
    wasm.commit();
    expect(ctx.imageSmoothingQuality).toBe("medium");
    expect(ctx.fillRect).toBeCalledWith(1, 2, 3, 4);
  });

  it("should update the imageSmoothingQuality value to high when fillRect is called", () => {
    wasm.imageSmoothingQuality(ImageSmoothingQuality.high);
    wasm.fillRect(1, 2, 3, 4);
    wasm.commit();
    expect(ctx.imageSmoothingQuality).toBe("high");
    expect(ctx.fillRect).toBeCalledWith(1, 2, 3, 4);
  });

  it("should not update the imageSmoothingQuality value if imageSmoothingEnabled is false when fillRect is called", () => {
    wasm.imageSmoothingQuality(ImageSmoothingQuality.high);
    wasm.imageSmoothingEnabled(0);
    wasm.fillRect(1, 2, 3, 4);
    wasm.commit();
    expect(ctx.imageSmoothingQuality).toBe("low");
    expect(ctx.imageSmoothingEnabled).toBe(false);
    expect(ctx.fillRect).toBeCalledWith(1, 2, 3, 4);
  });

  it("should update the shadowBlur value when fillRect is called", () => {
    wasm.shadowBlur(0.5);
    wasm.fillRect(1, 2, 3, 4);
    wasm.commit();
    expect(ctx.shadowBlur).toBe(0.5);
    expect(ctx.fillRect).toBeCalledWith(1, 2, 3, 4);
  });

  it("should update the shadowColor value when fillRect is called", () => {
    wasm.shadowColor(wasm.newString("green"));
    wasm.fillRect(1, 2, 3, 4);
    wasm.commit();
    expect(ctx.shadowColor).toBe("#008000");
    expect(ctx.fillRect).toBeCalledWith(1, 2, 3, 4);
  });

  it("should update the shadowOffsetX value when fillRect is called", () => {
    wasm.shadowOffsetX(1);
    wasm.fillRect(1, 2, 3, 4);
    wasm.commit();
    expect(ctx.shadowOffsetX).toBe(1);
    expect(ctx.fillRect).toBeCalledWith(1, 2, 3, 4);
  });

  it("should update the shadowOffsetY value when fillRect is called", () => {
    wasm.shadowOffsetY(1);
    wasm.fillRect(1, 2, 3, 4);
    wasm.commit();
    expect(ctx.shadowOffsetY).toBe(1);
    expect(ctx.fillRect).toBeCalledWith(1, 2, 3, 4);
  });

  it("should update the transform value when fillRect is called", () => {
    wasm.setTransform(1, 2, 3, 4, 5, 6);
    wasm.fillRect(1, 2, 3, 4);
    wasm.commit();
    expect(ctx.setTransform).toBeCalledWith(1, 2, 3, 4, 5, 6);
    expect(ctx.fillRect).toBeCalledWith(1, 2, 3, 4);
  });
});