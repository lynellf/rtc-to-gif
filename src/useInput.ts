import { useState, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

type TRecord = Record<string, unknown>;
const INITIAL_CTX: TRecord = {};

type TDispatch = Dispatch<SetStateAction<TRecord>>;
function getInputHandler(dispatch: TDispatch) {
  return (key: string, value: unknown): void => {
    dispatch((currentCtx) => ({
      ...currentCtx,
      [key]: value,
    }));
  };
}

export function useInput(initialValues: TRecord = {}) {
  const [status, setStatus] = useState("init"); // init /ready
  const [ctx, dispatch] = useState(INITIAL_CTX);
  const handleInput = getInputHandler(dispatch);

  useEffect(() => {
    if (status === "init") {
      dispatch(initialValues);
      setStatus("ready");
    }
  }, [initialValues, status]);

  return [ctx, handleInput] as const;
}
