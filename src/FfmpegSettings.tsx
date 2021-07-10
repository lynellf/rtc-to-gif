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
    key: "args",
    label: "Command Line Args",
    type: "input/string",
  },
  {
    key: "log",
    label: "Enable Logging",
    type: "select",
    options: [
      { label: "True", value: true },
      { label: "False", value: false },
    ],
  },
];

export default function FFmpegSettings({ handleInput, values }: TProps) {
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
