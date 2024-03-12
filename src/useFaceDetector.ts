import React from "react";
import { FilesetResolver, FaceDetector, FaceDetectorOptions, FaceDetectorResult } from "@mediapipe/tasks-vision";
import { RunningMode } from "./types";
import canPlayStream from "./canPlayStream";
import deepmerge from "deepmerge";
import { tasksVisionVersion, defaultUserMediaOptions } from "./const";
import canReadVideo from "./canReadVideo";
import stopVideo from "./stopVideo";

export type { FaceDetector, FaceDetectorOptions, FaceDetectorResult };

export const defaultFaceDetectorOptions: FaceDetectorOptions = {
    baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
        delegate: "GPU"
    },
    runningMode: 'VIDEO' as RunningMode,
};

export async function getFaceDetector(options: FaceDetectorOptions = defaultFaceDetectorOptions) {
    const vision = await FilesetResolver.forVisionTasks(
        `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${tasksVisionVersion}/wasm`
    );
    const faceDetectorOptions = deepmerge(defaultFaceDetectorOptions, options);
    const faceDetector = await FaceDetector.createFromOptions(vision, faceDetectorOptions);
    return faceDetector;
}

export function useFaceDetector({
    onResults,
}: {
    onResults: (result: FaceDetectorResult, stream?: MediaStream) => void;
}) {
    const videoRef = React.useRef<HTMLVideoElement | null>(null);
    const faceDetectorRef = React.useRef<FaceDetector>();
    const isFaceDetectionRunningRef = React.useRef<boolean>(false);

    async function predictFaceDetections(time: number, stream?: MediaStream, faceDetectorOptions: FaceDetectorOptions = defaultFaceDetectorOptions) {
        if (!isFaceDetectionRunningRef.current) return;
        if (canPlayStream(stream) && canReadVideo(videoRef.current) && faceDetectorRef.current) {
            const video = videoRef.current as HTMLVideoElement;
            if (faceDetectorOptions.runningMode === 'IMAGE') {
                const results = await faceDetectorRef.current?.detect(video);
                onResults?.(results, stream);
            } else {
                const results = await faceDetectorRef.current?.detectForVideo(video, time);
                onResults?.(results, stream);
            }
        }
        if (videoRef.current && faceDetectorOptions.runningMode === 'VIDEO') {
            videoRef.current?.requestVideoFrameCallback((time) => predictFaceDetections(time, stream, faceDetectorOptions));
        }
    }

    async function startFaceDetection({
        stream,
        faceDetectorOptions,
        userMediaOptions,
    }: {
        stream?: MediaStream;
        faceDetectorOptions?: FaceDetectorOptions;
        userMediaOptions?: MediaStreamConstraints;
    } = {
            stream: undefined,
            faceDetectorOptions: undefined,
        }) {
        isFaceDetectionRunningRef.current = true;
        faceDetectorRef.current = await getFaceDetector(faceDetectorOptions);
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
        videoRef.current.requestVideoFrameCallback((time) => predictFaceDetections(time, _stream, faceDetectorOptions));

    }

    function stopFaceDetection() {
        stopVideo(videoRef.current);
        isFaceDetectionRunningRef.current = false;
    }

    React.useEffect(() => {
        return () => {
            stopFaceDetection();
        }
    }, []);

    return { startFaceDetection, stopFaceDetection };

}