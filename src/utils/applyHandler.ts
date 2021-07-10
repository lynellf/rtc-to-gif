import type { ChangeEvent } from "react";

type THandler = (...args: any[]) => void;
type TInputEvent = ChangeEvent<HTMLInputElement>;
type TSelectEvent = ChangeEvent<HTMLSelectElement>;
type TEvents = TInputEvent | TSelectEvent;
export function applyHandler(handler: THandler) {
  return ({ key, type }: Record<string, unknown>) =>
    (event: TEvents) => {
      const targetVal = event.target.value;
      const isNumber = type === "input/number";
      const isTrue = targetVal === "true";
      const isFalse = targetVal === "false";
      const numericVal = isNaN(parseInt(targetVal)) ? 0 : parseInt(targetVal);
      const value = isNumber
        ? numericVal
        : isTrue
        ? true
        : isFalse
        ? false
        : targetVal;
      handler(key, value);
    };
}
