import React, { useState, useEffect } from "react";
import { TRecorder } from "../useRTCRecorder";
import type { FFmpeg } from "@ffmpeg/ffmpeg";
import type { Dispatch, SetStateAction } from "react";

// typedef for props
type PrinterProps = {
  ffmpeg: FFmpeg | null;
  rtcRecorder: TRecorder | null;
};

type TCtx = {
  state: "printer/init" | "printer/ready" | "printer/error";
  error: Error | null;
};

type TLog = Array<string>;
type TDispatchLog = Dispatch<SetStateAction<TLog>>;
type TDispatchCtx = Dispatch<SetStateAction<TCtx>>;

const INITIAL_CTX: TCtx = {
  state: "printer/init",
  error: null,
};

const INITIAL_LOG: TLog = [];

function getSetLog(dispatchLog: TDispatchLog) {
  const setLog = (str: string) => {
    dispatchLog((log) => [...log, str]);
  };
  return setLog;
}

// fire callback if all conditions are true
function whenAllAreTrue(bools: Array<boolean>, callback: Function) {
  const areTrue = bools.every((item) => item);
  if (areTrue) {
    callback();
  }
}

type TEvent = { type: string; message: string };
function getFfmpegLogHandler(dispatchLog: TDispatchLog) {
  const logHandler = (event: TEvent) => {
    dispatchLog((log) => [...log, `${event.type}/${event.message}`]);
  };
  return logHandler;
}

function getSetError(dispatchCtx: TDispatchCtx) {
  const setError = (error: Error) => {
    dispatchCtx((ctx) => ({ ...ctx, state: "printer/error", error }));
  };
  return setError;
}

function getSetReady(dispatchCtx: TDispatchCtx) {
  const setReady = () => {
    dispatchCtx((ctx) => ({ ...ctx, state: "printer/ready" }));
  };
  return setReady;
}

type TInitLogParam = {
  ffmpeg: FFmpeg | null;
  rtcRecorder: TRecorder | null;
  setReady: () => void;
  setError: (error: Error) => void;
  setLog: (str: string) => void;
  handleFfmpegLog: (event: TEvent) => void;
};

function getInitLog({
  ffmpeg,
  rtcRecorder,
  setReady,
  setError,
  handleFfmpegLog,
  setLog,
}: TInitLogParam) {
  const initLog = () => {
    try {
      ffmpeg?.setLogger(handleFfmpegLog);
      rtcRecorder?.onStateChanged(setLog);
      setReady();
    } catch (error) {
      setError(error);
    }
  };
  return initLog;
}

function usePrinter({ ffmpeg, rtcRecorder }: PrinterProps) {
  const [ctx, dispatchCtx] = useState(INITIAL_CTX);
  const [log, dispatchLog] = useState(INITIAL_LOG);
  const setLog = getSetLog(dispatchLog);
  const handleFfmpegLog = getFfmpegLogHandler(dispatchLog);
  const setError = getSetError(dispatchCtx);
  const setReady = getSetReady(dispatchCtx);
  const initLog = getInitLog({
    ffmpeg,
    rtcRecorder,
    setReady,
    setError,
    handleFfmpegLog,
    setLog,
  });
  const hasFfmpeg = ffmpeg !== null;
  const hasRecoder = rtcRecorder !== null;
  const isInit = ctx.state === "printer/init";
  const startingConditons = [hasFfmpeg, hasRecoder, isInit];

  useEffect(() => {
    whenAllAreTrue(startingConditons, initLog);
  }, [ctx, initLog, startingConditons]);

  return [ctx, log] as const;
}

export default function Printer({ ffmpeg, rtcRecorder }: PrinterProps) {
  const [{ state, error }, log] = usePrinter({ ffmpeg, rtcRecorder });

  if (state === 'printer/error') {
    return <section>{error?.message} {error?.stack}</section>;
  }

  return <section>{log.join("\n")}</section>;
}
