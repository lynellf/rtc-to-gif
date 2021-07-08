import { useState, useEffect } from "react";
import { useMediaStream } from "./useMediaStream";
import type { Options } from "recordrtc";

type TIsRecording = "recording";
type TNotRecording = "notRecording";
type TError = "error";
type TCTX = {
  state: TIsRecording | TNotRecording | TError;
  recorder: TRecorder | null;
  error: Error | null;
};
const INITIAL_CTX: TCTX = {
  state: "notRecording",
  recorder: null,
  error: null,
};

export const DEFAULT_FILENAME = "recording";
export const DEFAULT_OPTIONS: Options = {
  type: "video",
  mimeType: "video/webm",
  disableLogs: true,
  timeSlice: 1_000,
  bitsPerSecond: 128_000,
  videoBitsPerSecond: 128_000,
};

type TStream = MediaStream | void;
async function getRecorder(stream: TStream) {
  if (!stream) throw new Error("No Media Stream!");
  const mod = await import("recordrtc");
  const recorderType = mod.GifRecorder;
  return [stream, mod.default, recorderType] as const;
}

/**
 * How to unwrap a promise via S/O by Jon Jaques
 * https://stackoverflow.com/questions/48011353/how-to-unwrap-type-of-a-promise
 */
type Await<T> = T extends {
  then(onfulfilled?: (value: infer U) => unknown): unknown;
}
  ? U
  : T;

type TRecordRTC = Await<ReturnType<typeof getRecorder>>;
function getRecorderInit(options = DEFAULT_OPTIONS) {
  return async ([stream, RecordRTC]: TRecordRTC) => {
    return new RecordRTC(stream, {
      ...options,
    });
  };
}

type TRecorder = Await<ReturnType<ReturnType<typeof getRecorderInit>>>;
type TDispatch = React.Dispatch<React.SetStateAction<TCTX>>;

function getRecorderSetter(dispatch: TDispatch) {
  return async (recorder: TRecorder) => {
    dispatch({ state: "recording", recorder, error: null });
    return recorder;
  };
}

function getErrorSetter(dispatch: TDispatch) {
  return (error: Error) => dispatch({ state: "error", recorder: null, error });
}

function getCleanup(dispatch: TDispatch) {
  return () => dispatch(INITIAL_CTX);
}

async function startRecording(recorder: TRecorder) {
  recorder.startRecording();
  return recorder;
}

type TPromptUser = ReturnType<typeof useMediaStream>[1];
type TSetRecorder = ReturnType<typeof getRecorderSetter>;
type TSetError = ReturnType<typeof getErrorSetter>;
type TInitRecorder = ReturnType<typeof getRecorderInit>;

type TStartParam = {
  setError: TSetError;
  setRecorder: TSetRecorder;
  promptUser: TPromptUser;
  initRecorder: TInitRecorder;
};
function getStartHandler({
  setError,
  setRecorder,
  promptUser,
  initRecorder,
}: TStartParam) {
  return () => {
    promptUser()
      .then(getRecorder)
      .then(initRecorder)
      .then(setRecorder)
      .then(startRecording)
      .catch(setError);
  };
}

export function useRTCRecorder(
  options = DEFAULT_OPTIONS,
  promptUser: TPromptUser
) {
  const [recorderCtx, dispatch] = useState(INITIAL_CTX);
  const initRecorder = getRecorderInit(options);
  const setRecorder = getRecorderSetter(dispatch);
  const setError = getErrorSetter(dispatch);
  const handleStart = getStartHandler({
    setRecorder,
    promptUser,
    initRecorder,
    setError,
  });
  const cleanup = getCleanup(dispatch);
  useEffect(() => {
    return () => cleanup();
  }, []);

  return [recorderCtx, handleStart] as const;
}
