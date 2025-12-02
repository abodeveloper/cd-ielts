// ffmpeg.wasm ni dinamik import qilamiz, chunki ayrim bundlerlarda named export bo'lmasligi mumkin
type FfmpegModule = {
  createFFmpeg?: (options?: any) => any;
  fetchFile?: (file: Blob | string | Uint8Array) => Promise<Uint8Array>;
  default?: {
    createFFmpeg?: (options?: any) => any;
    fetchFile?: (file: Blob | string | Uint8Array) => Promise<Uint8Array>;
  };
};

let ffmpegInstance: any | null = null;
let ffmpegLoadingPromise: Promise<void> | null = null;
let ffmpegModulePromise: Promise<FfmpegModule> | null = null;

const getFfmpeg = async () => {
  if (ffmpegInstance) return ffmpegInstance;

  if (!ffmpegModulePromise) {
    ffmpegModulePromise = import("@ffmpeg/ffmpeg") as Promise<FfmpegModule>;
  }

  const mod = await ffmpegModulePromise;
  const createFFmpeg =
    mod.createFFmpeg || mod.default?.createFFmpeg;

  if (!createFFmpeg) {
    throw new Error("createFFmpeg export not found in @ffmpeg/ffmpeg module");
  }

  if (!ffmpegLoadingPromise) {
    ffmpegInstance = createFFmpeg({ log: false });
    ffmpegLoadingPromise = ffmpegInstance.load();
  }

  await ffmpegLoadingPromise;
  return ffmpegInstance;
};

/**
 * Convert WebM/Opus (or other audio) blob to MP3 in the browser using ffmpeg.wasm
 */
export const convertToMp3 = async (inputBlob: Blob): Promise<Blob> => {
  const ffmpeg = await getFfmpeg();

  if (!ffmpeg) {
    throw new Error("FFmpeg instance is not initialized");
  }

  // fetchFile ni ham modul/dafault dan olamiz
  if (!ffmpegModulePromise) {
    ffmpegModulePromise = import("@ffmpeg/ffmpeg") as Promise<FfmpegModule>;
  }
  const mod = await ffmpegModulePromise;
  const fetchFileFn =
    mod.fetchFile || mod.default?.fetchFile;

  if (!fetchFileFn) {
    throw new Error("fetchFile export not found in @ffmpeg/ffmpeg module");
  }

  const inputData = await fetchFileFn(inputBlob);
  const inputName = "input.webm";
  const outputName = "output.mp3";

  // Write input file
  ffmpeg.FS("writeFile", inputName, inputData);

  // Run conversion
  await ffmpeg.run(
    "-i",
    inputName,
    "-vn",
    "-ar",
    "44100",
    "-ac",
    "2",
    "-b:a",
    "192k",
    outputName
  );

  // Read result
  const outputData = ffmpeg.FS("readFile", outputName);

  // Cleanup
  ffmpeg.FS("unlink", inputName);
  ffmpeg.FS("unlink", outputName);

  return new Blob([outputData.buffer], { type: "audio/mpeg" });
};


