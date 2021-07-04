import { useState, useEffect } from "react";
import { useMediaStream } from "./useMediaStream";

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
async function initRecorder([stream, RecordRTC]: TRecordRTC) {
  return new RecordRTC(stream, {
    type: "video",
  });
}

type TRecorder = Await<ReturnType<typeof initRecorder>>;
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

async function startRecording(recorder: TRecorder) {
  recorder.startRecording();
  return recorder;
}

type TPromptUser = ReturnType<typeof useMediaStream>[1];
type TSetRecorder = ReturnType<typeof getRecorderSetter>;
type TSetError = ReturnType<typeof getErrorSetter>;
function getStartHandler(setRecorder: TSetRecorder) {
  return (setError: TSetError) => (promptUser: TPromptUser) => () => {
    promptUser()
      .then(getRecorder)
      .then(initRecorder)
      .then(setRecorder)
      .then(startRecording)
      .catch(setError);
  };
}

function getSaveBlob(recorder: TRecorder | null) {
  return (filename = "recording.webm") =>
    async () => {
      const mod = await import("save-as");
      const saveAs = mod.saveAs;
      const blob = recorder?.getBlob();
      saveAs(blob, filename);
    };
}

function getStopHandler(recorder: TRecorder | null) {
  return (filename = "recording.webm") => {
    const saveBlob = getSaveBlob(recorder)(filename);
    recorder?.stopRecording(saveBlob);
  };
}

export function useRTCRecorder() {
  const [mediaStreamCtx, promptUser] = useMediaStream();
  const [recorderCtx, dispatch] = useState(INITIAL_CTX);
  const { state, recorder, error } = recorderCtx;

  const setRecorder = getRecorderSetter(dispatch);
  const setError = getErrorSetter(dispatch);
  const handleStart = getStartHandler(setRecorder)(setError)(promptUser);
  const handleStop = getStopHandler(recorder);
  const { state: streamState, error: streamError } = mediaStreamCtx;

  // Bubble up any errors from useMediaStream()
  useEffect(() => {
    if (streamState === "error") {
      setError(streamError as Error);
    }

    if (state === "error") {
      console.error(error);
    }
  }, [streamState, streamError, state, error]);

  return {
    state,
    error,
    handleStart,
    handleStop,
  };
}
