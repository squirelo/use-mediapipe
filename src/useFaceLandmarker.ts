import React from "react";
import deepmerge from "deepmerge";
import { FaceLandmarker, FaceLandmarkerOptions, FaceLandmarkerResult, FilesetResolver } from "@mediapipe/tasks-vision";
import { RunningMode } from "./types";
import canPlayStream from "./canPlayStream";
import { defaultUserMediaOptions } from "./utils";
import { tasksVisionVersion } from "./const";

export { FaceLandmarker, FaceLandmarkerOptions, FaceLandmarkerResult };

export const defaultFaceLandmarkerOptions: FaceLandmarkerOptions = {
    baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
        delegate: "GPU"
    },
    runningMode: 'VIDEO' as RunningMode,
    numFaces: 1,
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
};

export async function getFaceLandmarker(options: FaceLandmarkerOptions = {}) {
    const vision = await FilesetResolver.forVisionTasks(
        `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${tasksVisionVersion}/wasm`
    );
    const faceLandmarkerOptions: FaceLandmarkerOptions = deepmerge(defaultFaceLandmarkerOptions, options);
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

    async function predictFaceLandmarks(time: number, stream?: MediaStream, faceLandmarkerOptions: FaceLandmarkerOptions = defaultFaceLandmarkerOptions) {
        if (!videoRef.current || !faceLandmarkerRef.current) return;
        const currentTime = videoRef.current.currentTime;
        if (canPlayStream(stream) && currentTime > lastVideoTimeRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
            lastVideoTimeRef.current = currentTime;
            if (faceLandmarkerOptions.runningMode === 'IMAGE') {
                const results = await faceLandmarkerRef.current?.detect(videoRef.current);
                onResults?.(results, stream);
            } else {
                const results = await faceLandmarkerRef.current?.detectForVideo(videoRef.current, currentTime + 1);
                onResults?.(results, stream);
            }
        }
        videoRef.current?.requestVideoFrameCallback((time) => predictFaceLandmarks(time, stream, faceLandmarkerOptions));
    }

    async function startFaceLandmarker({
        stream,
        faceLandmarkerOptions,
        userMediaOptions,
    }: {
        stream?: MediaStream;
        faceLandmarkerOptions?: FaceLandmarkerOptions;
        userMediaOptions?: MediaStreamConstraints;
    } = {
            stream: undefined,
            faceLandmarkerOptions: undefined,
            userMediaOptions: undefined,
        }) {
        faceLandmarkerRef.current = await getFaceLandmarker(faceLandmarkerOptions);
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
        videoRef.current.requestVideoFrameCallback((time) => predictFaceLandmarks(time, _stream, faceLandmarkerOptions));

    }

    return startFaceLandmarker;

}