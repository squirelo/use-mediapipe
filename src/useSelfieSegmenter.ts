import React from "react";
import { SelfieSegmentation, InputImage, Options as SelfieSegmentationOptions, Results as SelfieSegmentationResult } from "@mediapipe/selfie_segmentation";
import deepmerge from "deepmerge";
import canPlayStream from "./canPlayStream";
import canReadVideo from "./canReadVideo";
import { defaultUserMediaOptions } from "./const";
import stopVideo from "./stopVideo";

export type { SelfieSegmentation, SelfieSegmentationOptions, SelfieSegmentationResult };

const defaultSelfieSegmentationOptions: SelfieSegmentationOptions = {
    modelSelection: 1,
    selfieMode: true,
}

function getSelfieSegmenter(options: SelfieSegmentationOptions = defaultSelfieSegmentationOptions) {
    const selfieSegmentation = new SelfieSegmentation({
        locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
    });
    const selfieSegmenterOptions = deepmerge(defaultSelfieSegmentationOptions, options);
    selfieSegmentation.setOptions(selfieSegmenterOptions);
    return selfieSegmentation;
}


export function useSelfieSegmenter({
    onResults,
}: {
    onResults: (result: SelfieSegmentationResult, stream?: MediaStream) => void;
}) {
    const videoRef = React.useRef<HTMLVideoElement | null>(null);
    const selfieSegmentationRef = React.useRef<SelfieSegmentation>();
    const isSelfieSegmentationRunningRef = React.useRef<boolean>(false);

    async function predictSelfieSegmentation(time: number, stream?: MediaStream) {
        if (!isSelfieSegmentationRunningRef.current) return;
        if (canPlayStream(stream) && canReadVideo(videoRef.current) && selfieSegmentationRef.current) {
            await selfieSegmentationRef.current?.send({ image: videoRef.current as InputImage });
            videoRef.current?.requestVideoFrameCallback((time) => predictSelfieSegmentation(time, stream));
        }
    }

    async function startSelfieSegmenter({
        stream,
        selfieSegmentationOptions,
        userMediaOptions,
    }: {
        stream?: MediaStream;
        selfieSegmentationOptions?: SelfieSegmentationOptions;
        userMediaOptions?: MediaStreamConstraints;
    } = {
            stream: undefined,
            selfieSegmentationOptions: undefined,
            userMediaOptions: undefined,
        }) {
        isSelfieSegmentationRunningRef.current = true;
        selfieSegmentationRef.current = await getSelfieSegmenter(selfieSegmentationOptions);
        selfieSegmentationRef.current?.onResults((res) => onResults?.(res, stream));
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
        videoRef.current.requestVideoFrameCallback((time) => predictSelfieSegmentation(time, _stream));

    }

    function stopSelfieSegmenter() {
        stopVideo(videoRef.current);
        isSelfieSegmentationRunningRef.current = false;
    }

    React.useEffect(() => {
        return () => {
            stopSelfieSegmenter();
        }
    }, []);

    return { startSelfieSegmenter, stopSelfieSegmenter };

}