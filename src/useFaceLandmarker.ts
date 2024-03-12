import React from "react";
import deepmerge from "deepmerge";
import { FilesetResolver, FaceLandmarker, FaceLandmarkerOptions, FaceLandmarkerResult } from "@mediapipe/tasks-vision";
import { RunningMode } from "./types";
import canPlayStream from "./canPlayStream";
import { tasksVisionVersion, defaultUserMediaOptions } from "./const";
import canReadVideo from "./canReadVideo";
import stopVideo from "./stopVideo";

export type { FaceLandmarker, FaceLandmarkerOptions, FaceLandmarkerResult };

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
    const isFaceLandmarkerRunningRef = React.useRef<boolean>(false);

    async function predictFaceLandmarks(time: number, stream?: MediaStream, faceLandmarkerOptions: FaceLandmarkerOptions = defaultFaceLandmarkerOptions) {
        if (!isFaceLandmarkerRunningRef.current) return;
        if (canPlayStream(stream) && canReadVideo(videoRef.current) && faceLandmarkerRef.current) {
            const video = videoRef.current as HTMLVideoElement;
            if (faceLandmarkerOptions.runningMode === 'IMAGE') {
                const results = await faceLandmarkerRef.current?.detect(video);
                onResults?.(results, stream);
            } else {
                const results = await faceLandmarkerRef.current?.detectForVideo(video, time);
                onResults?.(results, stream);
            }
        }
        if (videoRef.current && faceLandmarkerOptions.runningMode === 'VIDEO') {
            videoRef.current?.requestVideoFrameCallback((time) => predictFaceLandmarks(time, stream, faceLandmarkerOptions));
        }
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
        isFaceLandmarkerRunningRef.current = true;
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

    function stopFaceLandmarker() {
        stopVideo(videoRef.current);
        isFaceLandmarkerRunningRef.current = false;
    }

    React.useEffect(() => {
        return () => {
            stopFaceLandmarker();
        }
    }, []);

    return { startFaceLandmarker, stopFaceLandmarker };

}