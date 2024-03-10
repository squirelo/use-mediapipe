import React from "react";
import { FilesetResolver, GestureRecognizer, GestureRecognizerOptions, GestureRecognizerResult } from "@mediapipe/tasks-vision";
import { RunningMode } from "./types";

export const defaultGestureRecognizerOptions = {
    runningMode: 'VIDEO' as RunningMode,
    numHands: 2,
}

export async function getGestureRecognizer(options: GestureRecognizerOptions = {}): Promise<GestureRecognizer> {
    const tasksVision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );
    const gestureRecognizer = await GestureRecognizer.createFromOptions(tasksVision, {
        baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
            delegate: "GPU",
        },
        ...defaultGestureRecognizerOptions,
        ...options,
    });
    return gestureRecognizer;
}

export default function useGestureRecognizer({
    onResults,
}: {
    onResults: (result?: GestureRecognizerResult) => void;
}) {
    const videoRef = React.useRef<HTMLVideoElement | null>(null);
    const gestureRecognizerRef = React.useRef<GestureRecognizer>();

    async function predictGesture(time: number) {
        if (!videoRef.current || !gestureRecognizerRef.current) return;
        const result = await gestureRecognizerRef.current?.recognizeForVideo(videoRef.current, time);
        onResults?.(result);
        videoRef.current?.requestVideoFrameCallback(predictGesture);
    }

    async function startGestureTracking({
        stream,
        gestureRecognizerOptions,
    }: {
        stream?: MediaStream;
        gestureRecognizerOptions?: GestureRecognizerOptions;
    } = {
            stream: undefined,
            gestureRecognizerOptions: undefined,
        }) {
        gestureRecognizerRef.current = await getGestureRecognizer(gestureRecognizerOptions);
        videoRef.current = document.createElement("video");
        videoRef.current.playsInline = true;
        videoRef.current.crossOrigin = "anonymous";
        videoRef.current.srcObject = stream || await navigator.mediaDevices
            .getUserMedia({
                audio: false,
                video: {
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    facingMode: "user",
                },
            });
        videoRef.current.onloadedmetadata = () => {
            videoRef.current!.play();
        };
        videoRef.current.requestVideoFrameCallback(predictGesture);
    }

    return startGestureTracking;
}