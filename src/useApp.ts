import { useState, useEffect } from "react";
import { useFfmpeg } from "./useFfmpeg";
import { useMediaStream } from "./useMediaStream";
import { useRTCRecorder } from "./useRTCRecorder";
import type { Dispatch, SetStateAction } from "react";
import type { CreateFFmpegOptions, FFmpeg } from "@ffmpeg/ffmpeg";
import type { Options } from "recordrtc";

type TReady = "app/ready";
type TError = "app/error";
type TRecording = "app/recording";
type TProcessing = "app/processing";
type TCtx = {
  state: TReady | TError | TRecording | TProcessing;
  error: Error | null;
};

const INITIAL_CTX: TCtx = {
  state: "app/ready",
  error: null,
};

type TOptions = {
  ffmpegArgs: string;
  filename: string;
  enableLogging: boolean;
  ffmpegOptions: CreateFFmpegOptions;
  recorderOptions: Options;
};

const DEFAULT_OPTIONS: TOptions = {
  ffmpegArgs: "",
  filename: "recording",
  enableLogging: false,
  recorderOptions: {},
  ffmpegOptions: {},
};

type TErrorObj = Error | null;
type TDispatch = Dispatch<SetStateAction<TCtx>>;
function getSendErrStatus(dispatch: TDispatch) {
  return (error: TErrorObj) => dispatch({ state: "app/error", error });
}

function getSendRecStatus(dispatch: TDispatch) {
  return () => dispatch({ state: "app/recording", error: null });
}

type TAnonFn = () => void;
function getStartHandler(sendRecStatus: TAnonFn) {
  return (startFn: TAnonFn) => () => {
    startFn();
    sendRecStatus();
  };
}

function getClearCtx(dispatch: TDispatch) {
  return () => dispatch({ state: "app/ready", error: null });
}

type TTranscodeParam = {
  blob?: Blob;
  filename: string;
  args?: string;
  ffmpeg: FFmpeg | null;
};
async function transcode({ blob, filename, ffmpeg, args }: TTranscodeParam) {
  if (!blob) return null;
  const blobBuffer = await new Response(blob).arrayBuffer();
  const uInt8Arr = new Uint8Array(blobBuffer);
  const isLoaded = ffmpeg?.isLoaded();
  if (!isLoaded) {
    await ffmpeg?.load();
  }
  ffmpeg?.FS("writeFile", `${filename}.webm`, uInt8Arr);
  const _args = args?.split(",") ?? ([] as string[]);
  await ffmpeg?.run("-i", `${filename}.webm`, ..._args, "recording.gif");
  const data = ffmpeg?.FS("readFile", "recording.gif");
  return new Blob([data?.buffer ?? ""], { type: "image/gif" });
}

type TGetSaveBlobParam = {
  recorder: TRecorder | null;
  filename: string;
  args?: string;
  ffmpeg: FFmpeg | null;
};
function getSaveBlob({ recorder, filename, args, ffmpeg }: TGetSaveBlobParam) {
  return async () => {
    const mod = await import("save-as");
    const saveAs = mod.saveAs;
    const blob = recorder?.getBlob();
    const gif = await transcode({ blob, filename, args, ffmpeg });
    gif ? saveAs(gif, `${filename}.gif`) : undefined;
  };
}

type TRecorder = ReturnType<typeof useRTCRecorder>[0]["recorder"];
type TAnonProm = () => Promise<void>;
type TGetStopParam = {
  recorder: TRecorder;
  clearCtx: TAnonFn;
  saveBlob: TAnonProm;
};
function getStopHandler({ recorder, clearCtx, saveBlob }: TGetStopParam) {
  return () => {
    recorder?.stopRecording(saveBlob);
    clearCtx();
  };
}

function getPrinter() {
  const cache: string[] = [];
  const printer = <M>(msg: M) =>  {
    const asStr = `${msg}`;
    const hasMsg = cache.includes(asStr);
    cache.push(asStr);
    if (hasMsg) return;
    console.log(msg)
  }

  return printer
}

const print = getPrinter();

export function useApp({
  ffmpegArgs,
  filename,
  enableLogging,
  ffmpegOptions,
  recorderOptions,
} = DEFAULT_OPTIONS) {
  const [ctx, dispatch] = useState(INITIAL_CTX);
  const [mediaStreamCtx, promptUser] = useMediaStream();
  const [rtcRecorderCtx, startRecorder] = useRTCRecorder(
    recorderOptions,
    promptUser
  );
  const ffmpegCtx = useFfmpeg(ffmpegOptions);

  // Hook contexts
  const { state, error } = ctx;
  const { state: ffmpegState, ffmpeg, error: ffmpegError } = ffmpegCtx;
  const { state: streamState, stream, error: streamError } = mediaStreamCtx;
  const {
    state: recorderState,
    recorder,
    error: recorderError,
  } = rtcRecorderCtx;
  const states = [streamState, ffmpegState, recorderState, state];
  const errors = [streamError, ffmpegError, recorderError];

  // context dispatchers
  const sendErrStatus = getSendErrStatus(dispatch);
  const sendRecStatus = getSendRecStatus(dispatch);
  const clearCtx = getClearCtx(dispatch);
  const saveBlob = getSaveBlob({
    recorder,
    filename,
    args: ffmpegArgs,
    ffmpeg,
  });

  // user controls
  const handleStart = getStartHandler(sendRecStatus)(startRecorder);
  const handleStop = getStopHandler({ recorder, clearCtx, saveBlob });

  // log state changes
  useEffect(() => {
    enableLogging ? print(states) : null;
  }, [enableLogging, states]);

  // bubble up errors to dispatch
  useEffect(() => {
    if (ctx.state === "app/error") {
      errors.forEach(sendErrStatus);
    }
  }, [errors, ctx]);

  return {
    ffmpeg,
    stream,
    recorder,
    state,
    error,
    handleStart,
    handleStop,
  };
}
