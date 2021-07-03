import { useState } from "react"
import type {MutableRefObject} from 'react'
import { useMediaStream } from "./useMediaStream"

const INITIAL_CTX = {
  state: '',
  recoder: null,
  error: null
}

async function getRTC() {
  const mod = await import("recordrtc")
  return mod.default
}
type TStream = MediaStream | null

/**
 * typedef from S/O by Jon Jaques
 * https://stackoverflow.com/questions/48011353/how-to-unwrap-type-of-a-promise
 */
type Await<T> = T extends {
  then(onfulfilled?: (value: infer U) => unknown): unknown
}
  ? U
  : T

type TRTC = Await<ReturnType<typeof getRTC>>
function getRecorder(RecordRTC: TRTC) {
  return async (stream: TStream) =>
    stream
      ? new RecordRTC(stream, {
          type: "gif",
          frameRate: 60,
          bitrate: 128000,
        })
      : null
}

type TRecorder = Await<ReturnType<ReturnType<typeof getRecorder>>>
type TRecorderRef = MutableRefObject<TRecorder>

function getRecorderSetter(recorderRef: TRecorderRef) {
  return async (recorder: TRecorder) => {
    recorderRef.current = recorder
    return recorder
  
}

async function startRecording(recorder: TRecorder){
  recorder?.startRecording()
  return recorder
}
type TPromptUser = ReturnType<typeof useMediaStream>[1]
type TSetRecorder = ReturnType<typeof getRecorderSetter>
function getStartHandler(setRecorder: TSetRecorder) {
  return (promptUser: TPromptUser) => () => {
    getRTC()
  }
}


export function useRTC() {
  const [{ state: streamState, error: streamError, stream }, promptUser] =
    useMediaStream()
  const [] = useState()
  
}
