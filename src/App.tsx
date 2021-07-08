import React from "react";
import "./App.css";
import { DEFAULT_OPTIONS as RTC_OPTIONS } from "./useRTCRecorder";
import { DEFAULT_OPTIONS as FFMPEG_OPTIONS } from "./useFfmpeg";
import { useInput } from "./useInput";
import RTCSettings from "./RTCSettings";
import FfmpegSettings from "./FfmpegSettings";
import { useApp } from "./useApp";
import Input from "./components/Input";

type TRecord = Record<string, unknown>;
const DEFAULT_FILENAME = {
  filename: "recording",
};

type TInputHandler = (key: string, value: unknown) => void;
function getHandleFilename(handleInput: TInputHandler) {
  return (event: React.ChangeEvent<HTMLInputElement>) =>
    handleInput("filename", event.target.value);
}
function App() {
  const [recorderOptions, dispatchRecorderEv] = useInput(
    RTC_OPTIONS as TRecord
  );
  const [ffmpegOptions, dispatchFfmpegEv] = useInput({
    ...FFMPEG_OPTIONS,
    args: "",
  } as TRecord);
  const [filenameOption, dispatchFilenameEv] = useInput(DEFAULT_FILENAME);

  const { state, error, handleStart, handleStop } = useApp({
    recorderOptions,
    ffmpegOptions,
    ffmpegArgs: ffmpegOptions.args as string,
    filename: filenameOption.filename as string,
    enableLogging: true,
  });
  const handleFilenameChange = getHandleFilename(dispatchFilenameEv);
  if (state === "app/error") {
    return (
      <main>
        <h1>{error?.message}</h1>
      </main>
    );
  }

  if (state === "app/processing") {
    return (
      <main>
        <h1>Processing Media...</h1>
      </main>
    );
  }

  return (
    <main className="App">
      <Input
        label="File Name"
        type="input/string"
        handler={handleFilenameChange}
        value={filenameOption?.filename ?? ""}
        keyname="filename"
      />
      <RTCSettings handleInput={dispatchRecorderEv} values={recorderOptions} />
      <FfmpegSettings handleInput={dispatchFfmpegEv} values={ffmpegOptions} />
      <section>
        <button onClick={handleStart}>Start Recording</button>
        <button onClick={handleStop}>Stop Recording</button>
      </section>
    </main>
  );
}

export default App;
