import { useState, useEffect } from "react";
import type { FFmpeg, CreateFFmpegOptions } from "@ffmpeg/ffmpeg";
import type { Dispatch, SetStateAction } from "react";

/**
 * How to unwrap a promise via S/O by Jon Jaques
 * https://stackoverflow.com/questions/48011353/how-to-unwrap-type-of-a-promise
 */
type Await<T> = T extends {
  then(onfulfilled?: (value: infer U) => unknown): unknown;
}
  ? U
  : T;

type TInit = "init";
type TError = "error";
type TReady = "ready";
type TState = TInit | TError | TReady;

type TCtx = {
  state: TState;
  error: Error | null;
  ffmpeg: FFmpeg | null;
};

const INITIAL_CTX: TCtx = {
  state: "init",
  error: null,
  ffmpeg: null,
};

export const DEFAULT_OPTIONS: CreateFFmpegOptions = {
  log: false,
};

function getFfmpegModule() {
  return import("@ffmpeg/ffmpeg");
}

type TMod = Await<ReturnType<typeof getFfmpegModule>>;
async function getFfmpegCoreUrl(ffmpegModule: TMod) {
  const submod = await import("@ffmpeg/core/dist/ffmpeg-core.js?url");
  return [ffmpegModule, submod] as const;
}

type TModules = Await<ReturnType<typeof getFfmpegCoreUrl>>;
type TOptions = CreateFFmpegOptions | undefined;
function getStartFfmpeg(options: TOptions) {
  return ([ffmpegModule, submod]: TModules) => {
    return ffmpegModule.createFFmpeg({
      ...options,
      corePath: submod.default,
    });
  };
}

type TDispatch = Dispatch<SetStateAction<TCtx>>;
function getSetFfmpeg(dispatch: TDispatch) {
  return (ffmpeg: FFmpeg) => dispatch({ state: "ready", error: null, ffmpeg });
}

function getSetError(dispatch: TDispatch) {
  return (error: Error) => dispatch({ state: "error", error, ffmpeg: null });
}

type TStartFfmpeg = ReturnType<typeof getStartFfmpeg>;
type TSetFfmpeg = ReturnType<typeof getSetFfmpeg>;
type TSetError = ReturnType<typeof getSetError>;
type TInitParam = {
  startFfmpeg: TStartFfmpeg;
  setFfmpeg: TSetFfmpeg;
  setError: TSetError;
};
function getInit({ startFfmpeg, setFfmpeg, setError }: TInitParam) {
  return () => {
    getFfmpegModule()
      .then(getFfmpegCoreUrl)
      .then(startFfmpeg)
      .then(setFfmpeg)
      .catch(setError);
  };
}

function getCleanup(dispatch: TDispatch) {
  return () => dispatch(INITIAL_CTX);
}

export function useFfmpeg(options: TOptions = DEFAULT_OPTIONS) {
  const [ctx, dispatch] = useState(INITIAL_CTX);
  const startFfmpeg = getStartFfmpeg(options);
  const setFfmpeg = getSetFfmpeg(dispatch);
  const setError = getSetError(dispatch);
  const init = getInit({ startFfmpeg, setFfmpeg, setError });
  const cleanup = getCleanup(dispatch);

  useEffect(() => {
    init();
    return () => cleanup();
  }, []);

  return ctx;
}
