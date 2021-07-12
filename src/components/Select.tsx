import React from "react";
type TRecord = Record<string, unknown>;
export default function Select({
  keyname,
  label,
  handler,
  value,
  options,
}: TRecord) {
  return (
    <fieldset>
      <label htmlFor={keyname as string}>{label as string}</label>
      <select
        name={keyname as string}
        id={keyname as string}
        onChange={handler as (e: unknown) => void}
        value={value as number | string}
      >
        {(options as TRecord[]).map((item) => (
          <option key={item.value as string} value={item.value as string}>
            {item.label as string}
          </option>
        ))}
      </select>
    </fieldset>
  );
}
