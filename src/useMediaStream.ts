import { useState } from "react";
type TError = "stream/error";
type TNoStream = "stream/noStream";
type THasStream = "stream/hasStream";
type TState = {
  state: TNoStream | THasStream | TError;
  stream: MediaStream | null;
  error: Error | null;
};

const INITIAL_STATE: TState = {
  state: "stream/noStream",
  stream: null,
  error: null,
};

function getStream() {
  return navigator.mediaDevices.getDisplayMedia({
    video: true,
    frameRate: 60,
    height: 1080,
    width: 1920,
  });
}

type TDispatch = React.Dispatch<React.SetStateAction<TState>>;
type TErrorEvent = {
  error: Error;
  stream: null;
  state: TError;
};
type TSetStreamEvent = {
  error: null;
  stream: MediaStream;
  state: THasStream;
};
type TEvents = TErrorEvent | TSetStreamEvent;
function getEventSender(dispatch: TDispatch) {
  return (event: TEvents) => dispatch(event);
}

type TSendEvent = (event: TEvents) => void;
function getStreamSetter(sendEvent: TSendEvent) {
  return async (stream: MediaStream) => {
    sendEvent({ state: "stream/hasStream", stream, error: null });
    return stream;
  };
}

function getErrorSetter(sendEvent: TSendEvent) {
  return (error: Error) => sendEvent({ state: "stream/error", stream: null, error });
}

type TSetStream = (stream: MediaStream) => Promise<MediaStream>;
type TSetError = (error: Error) => void;
function getStreamPrompter(setStream: TSetStream) {
  return (setError: TSetError) => () =>
    getStream().then(setStream).catch(setError);
}

export function useMediaStream() {
  const [ctx, dispatch] = useState(INITIAL_STATE);
  const sendEvent = getEventSender(dispatch);
  const setStream = getStreamSetter(sendEvent);
  const setError = getErrorSetter(sendEvent);
  const promptStream = getStreamPrompter(setStream)(setError);
  return [ctx, promptStream] as const;
}
