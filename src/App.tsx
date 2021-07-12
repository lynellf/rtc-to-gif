import React from "react";
import "./App.css";
import { DEFAULT_OPTIONS as RTC_OPTIONS } from "./useRTCRecorder";
import { DEFAULT_OPTIONS as FFMPEG_OPTIONS } from "./useFfmpeg";
import { useInput } from "./useInput";
import { useApp } from "./useApp";
import ControlPanel from "./components/ControlPanel";
import Main from "./components/Main";
import Printer from "./components/Printer";
import Processing from "./components/Processing";
import Err from './components/Error'
import Recording from './components/Recording'

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

  const { state, error, handleStart, handleStop, ffmpeg, recorder } = useApp({
    recorderOptions,
    ffmpegOptions,
    ffmpegArgs: ffmpegOptions.args as string,
    filename: filenameOption.filename as string,
    enableLogging: true,
  });
  const handleFilenameChange = getHandleFilename(dispatchFilenameEv);
  if (state === "app/error") {
    return (
      <Main>
        <Err error={error} />
        <Printer {...{ rtcRecorder: recorder, ffmpeg }} />
      </Main>
    );
  }

  if (state === "app/processing") {
    return (
      <Main>
        <Processing />
        <Printer {...{ rtcRecorder: recorder, ffmpeg }} />
      </Main>
    );
  }

  if (state === 'app/recording') {
    return (
      <Main>
        <Recording handleStop={handleStop} />
        <Printer {...{ rtcRecorder: recorder, ffmpeg }} />
      </Main>
    );
  }
  

  return (
    <Main>
      <ControlPanel
        {...{
          ffmpegOptions,
          recorderOptions,
          handleFilenameChange,
          handleStart,
          dispatchFfmpegEv,
          dispatchRecorderEv,
          filenameOption,
        }}
      />
      <Printer {...{ rtcRecorder: recorder, ffmpeg }}/>
    </Main>
  );
}

export default App;
