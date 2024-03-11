import React from "react";
import { FilesetResolver, GestureRecognizer, GestureRecognizerOptions, GestureRecognizerResult } from "@mediapipe/tasks-vision";
import { RunningMode } from "./types";
import canPlayStream from "./canPlayStream";
import deepmerge from "deepmerge";
import { tasksVisionVersion, defaultUserMediaOptions } from "./const";
import canReadVideo from "./canReadVideo";

export { GestureRecognizer, GestureRecognizerOptions, GestureRecognizerResult };

export const defaultGestureRecognizerOptions = {
    baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
        delegate: "GPU" as "GPU" | "CPU",
    },
    runningMode: 'VIDEO' as RunningMode,
    numHands: 2,
}

export async function getGestureRecognizer(options: GestureRecognizerOptions = {}): Promise<GestureRecognizer> {
    const tasksVision = await FilesetResolver.forVisionTasks(
        `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${tasksVisionVersion}/wasm`
    );
    const gestureRecognizerOptions: GestureRecognizerOptions = deepmerge(defaultGestureRecognizerOptions, options);
    const gestureRecognizer = await GestureRecognizer.createFromOptions(tasksVision, gestureRecognizerOptions);
    return gestureRecognizer;
}

export function useGestureRecognizer({
    onResults,
}: {
    onResults: (result: GestureRecognizerResult, stream?: MediaStream) => void;
}) {
    const videoRef = React.useRef<HTMLVideoElement | null>(null);
    const gestureRecognizerRef = React.useRef<GestureRecognizer>();

    async function predictGesture(time: number, stream?: MediaStream, gestureRecognizerOptions: GestureRecognizerOptions = defaultGestureRecognizerOptions) {
        if (canPlayStream(stream) && canReadVideo(videoRef.current) && gestureRecognizerRef.current) {
            const video = videoRef.current as HTMLVideoElement;
            if (gestureRecognizerOptions.runningMode === 'IMAGE') {
                const results = await gestureRecognizerRef.current?.recognize(video);
                onResults?.(results, stream);
            } else {
                const results = await gestureRecognizerRef.current?.recognizeForVideo(video, time);
                onResults?.(results, stream);
            }
        }
        videoRef.current?.requestVideoFrameCallback((time) => predictGesture(time, stream, gestureRecognizerOptions));
    }

    async function startGestureTracking({
        stream,
        gestureRecognizerOptions,
        userMediaOptions,
    }: {
        stream?: MediaStream;
        gestureRecognizerOptions?: GestureRecognizerOptions;
        userMediaOptions?: MediaStreamConstraints;
    } = {
            stream: undefined,
            gestureRecognizerOptions: undefined,
        }) {
        gestureRecognizerRef.current = await getGestureRecognizer(gestureRecognizerOptions);
        videoRef.current = document.createElement("video");
        videoRef.current.playsInline = true;
        videoRef.current.crossOrigin = "anonymous";
        videoRef.current.srcObject = stream || await navigator.mediaDevices
            .getUserMedia(
                deepmerge(defaultUserMediaOptions, userMediaOptions || {}),
            );
        videoRef.current.onloadedmetadata = () => {
            videoRef.current!.play();
        };
        const _stream = videoRef.current.srcObject as MediaStream;
        videoRef.current.requestVideoFrameCallback((time) => predictGesture(time, _stream, gestureRecognizerOptions));
    }

    return startGestureTracking;
}