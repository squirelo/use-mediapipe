import React from "react";
import deepmerge from "deepmerge";
import { HandLandmarker, HandLandmarkerOptions, HandLandmarkerResult, FilesetResolver } from "@mediapipe/tasks-vision";
import { RunningMode } from "./types";
import canPlayStream from "./canPlayStream";
import { defaultUserMediaOptions } from "./utils";
import { tasksVisionVersion } from "./const";

export { HandLandmarker, HandLandmarkerOptions, HandLandmarkerResult };

export const defaultHandLandmarkerOptions: HandLandmarkerOptions = {
    baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: "GPU"
    },
    runningMode: 'VIDEO' as RunningMode,
    numHands: 2,
    // minHandDetectionConfidence: 0.2,
    // minHandPresenceConfidence: 0.2,
    // minTrackingConfidence: 0.2,
};

export async function getHandLandmarker(options: HandLandmarkerOptions = {}) {
    const vision = await FilesetResolver.forVisionTasks(
        `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${tasksVisionVersion}/wasm`
    );
    const handLandmarkerOptions: HandLandmarkerOptions = deepmerge(defaultHandLandmarkerOptions, options);
    const handLandmarker = await HandLandmarker.createFromOptions(vision, handLandmarkerOptions);
    return handLandmarker;
}

export function useHandLandmarker({
    onResults,
}: {
    onResults: (result: HandLandmarkerResult, stream?: MediaStream) => void;
}) {
    const videoRef = React.useRef<HTMLVideoElement | null>(null);
    const handLandmarkerRef = React.useRef<HandLandmarker>();
    const lastVideoTimeRef = React.useRef<number>(-1);

    async function predictHandLandmarks(time: number, stream?: MediaStream, handLandmarkerOptions: HandLandmarkerOptions = defaultHandLandmarkerOptions) {
        if (!videoRef.current || !handLandmarkerRef.current) return;
        const currentTime = videoRef.current.currentTime;
        if (canPlayStream(stream) && currentTime > lastVideoTimeRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
            lastVideoTimeRef.current = currentTime;
            if (handLandmarkerOptions.runningMode === 'IMAGE') {
                const results = await handLandmarkerRef.current?.detect(videoRef.current);
                onResults?.(results, stream);
            } else {
                const results = await handLandmarkerRef.current?.detectForVideo(videoRef.current, currentTime + 1);
                onResults?.(results, stream);
            }
        }
        videoRef.current?.requestVideoFrameCallback((time) => predictHandLandmarks(time, stream, handLandmarkerOptions));
    }

    async function startHandLandmarker({
        stream,
        handLandmarkerOptions,
        userMediaOptions,
    }: {
        stream?: MediaStream;
        handLandmarkerOptions?: HandLandmarkerOptions;
        userMediaOptions?: MediaStreamConstraints;
    } = {
            stream: undefined,
            handLandmarkerOptions: undefined,
            userMediaOptions: undefined,
        }) {
        handLandmarkerRef.current = await getHandLandmarker(handLandmarkerOptions);
        videoRef.current = document.createElement("video");
        videoRef.current.muted = true;
        videoRef.current.autoplay = true;
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
        videoRef.current.requestVideoFrameCallback((time) => predictHandLandmarks(time, _stream, handLandmarkerOptions));

    }

    return startHandLandmarker;

}