import React from 'react'
import FfmpegSettings from '../FfmpegSettings';
import RTCSettings from '../RTCSettings';
import Input from './Input';

type Props = {
  dispatchFfmpegEv: (key: string, value: unknown) => void;
  dispatchRecorderEv: (key: string, value: unknown) => void;
  ffmpegOptions: Record<string, unknown>;
  filenameOption: { filename?: string };
  handleFilenameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleStart: () => void;
  recorderOptions: Record<string, unknown>;
};

export default function ControlPanel({
  dispatchFfmpegEv,
  dispatchRecorderEv,
  ffmpegOptions,
  filenameOption,
  handleFilenameChange,
  handleStart,
  recorderOptions
}: Props) {
  return (
    <section>
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
      </section>
    </section>
  );
}
