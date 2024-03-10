import React from "react";
import { FaceLandmarker, FaceLandmarkerOptions, FaceLandmarkerResult, FilesetResolver } from "@mediapipe/tasks-vision";
import { RunningMode } from "./types";
import canPlayStream from "./canPlayStream";

export { FaceLandmarker, FaceLandmarkerOptions, FaceLandmarkerResult };

export const defaultFaceLandmarkerOptions: FaceLandmarkerOptions = {
    runningMode: 'VIDEO' as RunningMode,
    numFaces: 10,
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
};

export async function getFaceLandmarker(options: FaceLandmarkerOptions = {}) {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );
    const faceLandmarkerOptions: FaceLandmarkerOptions = {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
        },
        ...defaultFaceLandmarkerOptions,
        ...options,
    };
    const faceLandmarker = await FaceLandmarker.createFromOptions(vision, faceLandmarkerOptions);
    return faceLandmarker;
}

export function useFaceLandmarker({
    onResults,
}: {
    onResults: (result: FaceLandmarkerResult, stream?: MediaStream) => void;
}) {
    const videoRef = React.useRef<HTMLVideoElement | null>(null);
    const faceLandmarkerRef = React.useRef<FaceLandmarker>();
    const lastVideoTimeRef = React.useRef<number>(-1);

    async function predictFaceLandmarks(time: number, stream?: MediaStream) {
        if (!videoRef.current || !faceLandmarkerRef.current) return;
        const startTimeMs = performance.now();
        const currentTime = videoRef.current.currentTime;
        if (canPlayStream(stream) && currentTime !== lastVideoTimeRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
            lastVideoTimeRef.current = currentTime;
            const results = await faceLandmarkerRef.current?.detectForVideo(videoRef.current, startTimeMs);
            onResults?.(results, stream);
        }
        videoRef.current?.requestVideoFrameCallback((time) => predictFaceLandmarks(time, stream));
    }
    async function startFaceTracking({
        stream,
        faceLandmarkerOptions,
    }: {
        stream?: MediaStream;
        faceLandmarkerOptions?: FaceLandmarkerOptions;
    } = {
            stream: undefined,
            faceLandmarkerOptions: undefined,
        }) {
        faceLandmarkerRef.current = await getFaceLandmarker(faceLandmarkerOptions);
        videoRef.current = document.createElement("video");
        videoRef.current.muted = true;
        videoRef.current.autoplay = true;
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
        const _stream = videoRef.current.srcObject as MediaStream;
        videoRef.current.requestVideoFrameCallback((time) => predictFaceLandmarks(time, _stream));

    }
    return startFaceTracking;
}