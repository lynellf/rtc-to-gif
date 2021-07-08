import React from "react";
import { applyHandler } from "./utils/applyHandler";
import { applyValues } from "./utils/applyValues";
import Input from "./components/Input";
import Select from "./components/Select";

type TProps = {
  handleInput: (key: string, value: unknown) => void;
  values: Record<string, unknown>;
};
type TRecord = Record<string, unknown>;
const DEFAULT_KEYS: TRecord[] = [
  {
    key: "disableLogs",
    label: "Disable Logs?",
    type: "select",
    options: [
      { label: "True", value: true },
      { label: "False", value: false },
    ],
  },
  {
    key: "timeSlice",
    label: "Time Slice",
    type: "input/number",
  },
  {
    key: "bitsPerSecond",
    label: "Bits Per Second",
    type: "input/number",
  },
];

export default function RTCSettings({ handleInput, values }: TProps) {
  const withHandler = applyHandler(handleInput);
  const keys = DEFAULT_KEYS.map((item) => ({
    ...item,
    keyname: item.key as string,
    value: applyValues(item.key as string, values),
    handler: withHandler(item),
  }));
  return (
    <div>
      {keys.map((item) =>
        ((item as TRecord).type as string).includes("select") ? (
          <Select key={item.keyname} {...{ ...item }} />
        ) : (
          <Input key={item.keyname} {...{ ...item }} />
        )
      )}
    </div>
  );
}
