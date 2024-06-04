import React from "react";
import deepmerge from "deepmerge";
import { FilesetResolver, PoseLandmarker, PoseLandmarkerOptions, PoseLandmarkerResult } from "@mediapipe/tasks-vision";
import { RunningMode } from "./types";
import canPlayStream from "./canPlayStream";
import { tasksVisionVersion, defaultUserMediaOptions } from "./const";
import canReadVideo from "./canReadVideo";
import stopVideo from "./stopVideo";

export type { PoseLandmarker, PoseLandmarkerOptions, PoseLandmarkerResult };

export const defaultPoseLandmarkerOptions: PoseLandmarkerOptions = {
    baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task`,
        delegate: "GPU"
    },
    runningMode: 'VIDEO' as RunningMode,
    numPoses: 1,
    // minPoseDetectionConfidence: 0.2,
    // minPosePresenceConfidence: 0.2,
    // minTrackingConfidence: 0.2,
};

export async function getPoseLandmarker(options: PoseLandmarkerOptions = {}) {
    const vision = await FilesetResolver.forVisionTasks(
        `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${tasksVisionVersion}/wasm`
    );
    const poseLandmarkerOptions: PoseLandmarkerOptions = deepmerge(defaultPoseLandmarkerOptions, options);
    const poseLandmarker = await PoseLandmarker.createFromOptions(vision, poseLandmarkerOptions);
    return poseLandmarker;
}

export function usePoseLandmarker({
    onResults,
}: {
    onResults: (result: PoseLandmarkerResult, stream?: MediaStream) => void;
}) {
    const videoRef = React.useRef<HTMLVideoElement | null>(null);
    const poseLandmarkerRef = React.useRef<PoseLandmarker>();
    const isPoseLandmarkerRunningRef = React.useRef<boolean>(false);

    async function predictPoseLandmarks(time: number, stream?: MediaStream) {
        if (!isPoseLandmarkerRunningRef.current) return;
        if (canPlayStream(stream) && canReadVideo(videoRef.current) && poseLandmarkerRef.current) {
            const video = videoRef.current as HTMLVideoElement;
            const results = await poseLandmarkerRef.current?.detectForVideo(video, time);
            onResults?.(results, stream);
        }
        videoRef.current?.requestVideoFrameCallback((time) => predictPoseLandmarks(time, stream));
    }

    async function startPoseLandmarker({
        stream,
        poseLandmarkerOptions,
        userMediaOptions,
    }: {
        stream?: MediaStream;
        poseLandmarkerOptions?: PoseLandmarkerOptions;
        userMediaOptions?: MediaStreamConstraints;
    } = {
            stream: undefined,
            poseLandmarkerOptions: undefined,
            userMediaOptions: undefined,
        }) {
        isPoseLandmarkerRunningRef.current = true;
        poseLandmarkerRef.current = await getPoseLandmarker(poseLandmarkerOptions);
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
        videoRef.current.requestVideoFrameCallback((time) => predictPoseLandmarks(time, _stream));

    }

    function stopPoseLandmarker() {
        stopVideo(videoRef.current);
        isPoseLandmarkerRunningRef.current = false;
    }

    React.useEffect(() => {
        return () => {
            stopPoseLandmarker();
        }
    }, []);

    return { startPoseLandmarker, stopPoseLandmarker };

}
