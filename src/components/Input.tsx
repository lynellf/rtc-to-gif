import React from "react";
type TRecord = Record<string, unknown>;
export default function Input({
  label,
  type,
  handler,
  value,
  keyname,
}: TRecord) {
  const inputType = type === "input/number" ? "number" : "text";
  return (
    <fieldset>
      <label htmlFor={keyname as string}>{label as string}</label>
      <input
        id={keyname as string}
        type={inputType}
        onChange={handler as (e: unknown) => void}
        value={(value as React.ReactText) ?? ""}
      />
    </fieldset>
  );
}
