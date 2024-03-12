import React from "react";
import deepmerge from "deepmerge";
import { FilesetResolver, ImageSegmenter, ImageSegmenterOptions, ImageSegmenterResult } from "@mediapipe/tasks-vision";
import { RunningMode } from "./types";
import canPlayStream from "./canPlayStream";
import { tasksVisionVersion, defaultUserMediaOptions } from "./const";
import canReadVideo from "./canReadVideo";
import stopVideo from "./stopVideo";

export { ImageSegmenter, ImageSegmenterOptions, ImageSegmenterResult };

export const defaultImageSegmenterOptions: ImageSegmenterOptions = {
    baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-assets/deeplabv3.tflite?generation=1661875711618421",
    },
    outputCategoryMask: true,
    outputConfidenceMasks: false,
    runningMode: 'VIDEO' as RunningMode,
};

export async function getImageSegmenter(options: ImageSegmenterOptions = {}) {
    const vision = await FilesetResolver.forVisionTasks(
        `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${tasksVisionVersion}/wasm`
    );
    const imageSegmenterOptions: ImageSegmenterOptions = deepmerge(defaultImageSegmenterOptions, options);
    const imageSegmenter = await ImageSegmenter.createFromOptions(vision, imageSegmenterOptions);
    return imageSegmenter;
}

export function useImageSegmenter({
    onResults,
}: {
    onResults: (result: ImageSegmenterResult, stream?: MediaStream) => void;
}) {
    const videoRef = React.useRef<HTMLVideoElement | null>(null);
    const imageSegmenterRef = React.useRef<ImageSegmenter>();
    const isImageSegmenterRunningRef = React.useRef<boolean>(false);

    async function predictImageSegmentations(time: number, stream?: MediaStream, imageSegmenterOptions: ImageSegmenterOptions = defaultImageSegmenterOptions) {
        if (!isImageSegmenterRunningRef.current) return;
        if (canPlayStream(stream) && canReadVideo(videoRef.current) && imageSegmenterRef.current) {
            const video = videoRef.current as HTMLVideoElement;
            if (imageSegmenterOptions.runningMode === 'IMAGE') {
                imageSegmenterRef.current?.segment(video, (results) => onResults(results, stream));
            } else {
                imageSegmenterRef.current?.segmentForVideo(video, time, (results) => onResults(results, stream));
            }
        }
        if (videoRef.current && imageSegmenterOptions.runningMode === 'VIDEO') {
            videoRef.current?.requestVideoFrameCallback((time) => predictImageSegmentations(time, stream, imageSegmenterOptions));
        }
    }

    async function startImageSegmenter({
        stream,
        imageSegmenterOptions,
        userMediaOptions,
    }: {
        stream?: MediaStream;
        imageSegmenterOptions?: ImageSegmenterOptions;
        userMediaOptions?: MediaStreamConstraints;
    } = {
            stream: undefined,
            imageSegmenterOptions: undefined,
            userMediaOptions: undefined,
        }) {
        isImageSegmenterRunningRef.current = true;
        imageSegmenterRef.current = await getImageSegmenter(imageSegmenterOptions);
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
        videoRef.current.requestVideoFrameCallback((time) => predictImageSegmentations(time, _stream, imageSegmenterOptions));

    }

    function stopImageSegmenter() {
        stopVideo(videoRef.current);
        isImageSegmenterRunningRef.current = false;
    }

    React.useEffect(() => {
        return () => {
            stopImageSegmenter();
        }
    }, []);

    return { startImageSegmenter, stopImageSegmenter };

}