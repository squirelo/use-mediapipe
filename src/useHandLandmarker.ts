import React from "react";
import deepmerge from "deepmerge";
import { FilesetResolver, HandLandmarker, HandLandmarkerOptions, HandLandmarkerResult } from "@mediapipe/tasks-vision";
import { RunningMode } from "./types";
import canPlayStream from "./canPlayStream";
import { tasksVisionVersion, defaultUserMediaOptions } from "./const";
import canReadVideo from "./canReadVideo";
import stopVideo from "./stopVideo";

export type { HandLandmarker, HandLandmarkerOptions, HandLandmarkerResult };

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
    const ishHandLandmarkerRunningRef = React.useRef<boolean>(false);

    async function predictHandLandmarks(time: number, stream?: MediaStream, handLandmarkerOptions: HandLandmarkerOptions = defaultHandLandmarkerOptions) {
        if (!ishHandLandmarkerRunningRef.current) return;
        if (canPlayStream(stream) && canReadVideo(videoRef.current) && handLandmarkerRef.current) {
            const video = videoRef.current as HTMLVideoElement;
            if (handLandmarkerOptions.runningMode === 'IMAGE') {
                const results = await handLandmarkerRef.current?.detect(video);
                onResults?.(results, stream);
            } else {
                const results = await handLandmarkerRef.current?.detectForVideo(video, time);
                onResults?.(results, stream);
            }
        }
        if (videoRef.current && handLandmarkerOptions.runningMode === 'VIDEO') {
            videoRef.current?.requestVideoFrameCallback((time) => predictHandLandmarks(time, stream, handLandmarkerOptions));
        }
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
        ishHandLandmarkerRunningRef.current = true;
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

    function stopHandLandmarker() {
        stopVideo(videoRef.current);
        ishHandLandmarkerRunningRef.current = false;
    }

    React.useEffect(() => {
        return () => {
            stopHandLandmarker();
        }
    }, []);

    return { startHandLandmarker, stopHandLandmarker };

}