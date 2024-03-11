import React from "react";
import { FaceDetector, FilesetResolver, FaceDetectorResult, FaceDetectorOptions } from "@mediapipe/tasks-vision";
import { RunningMode } from "./types";
import canPlayStream from "./canPlayStream";
import deepmerge from "deepmerge";
import { defaultUserMediaOptions } from "./utils";
import { tasksVisionVersion } from "./const";

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
    const lastVideoTimeRef = React.useRef<number>(-1);

    async function predictFaceDetections(time: number, stream?: MediaStream, faceDetectorOptions: FaceDetectorOptions = defaultFaceDetectorOptions) {
        if (!videoRef.current || !faceDetectorRef.current) return;
        const currentTime = videoRef.current.currentTime;
        if (canPlayStream(stream) && currentTime > lastVideoTimeRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
            lastVideoTimeRef.current = currentTime;
            if (faceDetectorOptions.runningMode === 'IMAGE') {
                const results = await faceDetectorRef.current?.detect(videoRef.current);
                onResults?.(results, stream);
            } else {
                const results = await faceDetectorRef.current?.detectForVideo(videoRef.current, currentTime + 1);
                onResults?.(results, stream);
            }
        }
        videoRef.current?.requestVideoFrameCallback((time) => predictFaceDetections(time, stream, faceDetectorOptions));
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

    return startFaceDetection;

}

/*
// import { get } from "lodash";
// import useWindowSize from "~/hooks/useWindowSize";
// import { Face } from "../types";
// import useCamStore from "./useCamStore";
// import getUserMedia from "../utils/getUserMedia";
// import { RunningMode } from "../types";
// import getDistanceBetweenPoints from "../utils/getDistanceBetweenPoints";

function calculateFaceRoll(leftTragion: [number, number], rightTragion: [number, number]): number {
    // Extract the x and y coordinates
    const [leftX, leftY] = leftTragion;
    const [rightX, rightY] = rightTragion;

    // Calculate differences in the x and y coordinates
    const deltaY = rightY - leftY;
    const deltaX = rightX - leftX;

    // Calculate the angle in radians
    const angleRadians = Math.atan2(deltaY, deltaX);

    // Convert radians to degrees
    const angleDegrees = angleRadians * (180 / Math.PI);

    // Return the calculated angle
    return angleDegrees;
}

    const [faces, setFaces] = React.useState<Face[]>([]);
    const requestRef = React.useRef<number>(0);
    const setFacingMode = useCamStore((state) => state.setFacingMode);
    const windowSize = useWindowSize();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const emaKeypointsRef = React.useRef<any>({});
    const leftEyeTragionIndex = 4;
    const rightEyeTragionIndex = 5;
    const noseTipIndex = 2;
    const alpha = 0.2;

    async function setupFaceDetector() {
        const faceDetector = await getFaceDetector1();
        faceDetectorRef.current = faceDetector;
        setFaces([]);
    }

    const lastVideoTimeRef = React.useRef<number>(-1);
    async function predictFacePositions() {
        let nowInMs = Date.now();
        if (videoRef.current && lastVideoTimeRef.current !== videoRef.current.currentTime) {
            lastVideoTimeRef.current = videoRef.current.currentTime;
            // 1. FACE DETECTOR
            const faceDetectorResult = await (faceDetectorRef.current as FaceDetector)?.detectForVideo(videoRef.current, nowInMs);
            const updatedFaces: Face[] = get(faceDetectorResult, 'detections', []).map((detection: Detection, index) => {
                const faceId = `face-${index}`;

                // Initialize EMA keypoints for the face if it doesn't exist
                if (!emaKeypointsRef.current[faceId]) {
                    emaKeypointsRef.current[faceId] = detection.keypoints.map((kp) => ({ x: kp.x, y: kp.y }));
                }

                const updatedKeypoints = detection.keypoints.map((keypoint, keypointIndex) => {
                    // Ensure there's a corresponding EMA point to update
                    if (!emaKeypointsRef.current[faceId][keypointIndex]) {
                        emaKeypointsRef.current[faceId][keypointIndex] = { x: keypoint.x, y: keypoint.y };
                    }

                    const currentEma = emaKeypointsRef.current[faceId][keypointIndex];
                    const emaX = currentEma.x * (1 - alpha) + keypoint.x * alpha;
                    const emaY = currentEma.y * (1 - alpha) + keypoint.y * alpha;

                    // Update the EMA value for the current face and keypoint
                    emaKeypointsRef.current[faceId][keypointIndex] = { x: emaX, y: emaY };

                    return { x: emaX, y: emaY };
                });

                // Your existing code to calculate face roll, width, height, etc., using updatedKeypoints
                const leftEyeTragion = updatedKeypoints[leftEyeTragionIndex];
                const rightEyeTragion = updatedKeypoints[rightEyeTragionIndex];
                const faceRoll = calculateFaceRoll(
                    [leftEyeTragion?.x, leftEyeTragion?.y],
                    [rightEyeTragion?.x, rightEyeTragion?.y]
                );
                const width = getDistanceBetweenPoints(leftEyeTragion, rightEyeTragion) * windowSize.width;
                const height = width;
                const videoHeight = videoRef.current?.videoHeight || 0;
                const videoWidth = videoRef.current?.videoWidth || 0;
                const boundingBox = {
                    left: 0,
                    top: 0,
                    rotation: faceRoll,
                    center: updatedKeypoints[noseTipIndex],
                    width,
                    height: width,
                };
                const normalizedWidth = width / videoWidth;
                const normalizedHeight = height / videoHeight;
                const normalizedBoundingBox = {
                    top: updatedKeypoints[noseTipIndex]?.y - normalizedHeight / 2,
                    left: (1 - updatedKeypoints[noseTipIndex]?.x) - normalizedWidth / 2,
                    width: normalizedWidth,
                    height: normalizedHeight,
                    rotation: faceRoll,
                };
                return {
                    id: index + '',
                    boundingBox,
                    normalizedBoundingBox,
                    absentFrames: 0,
                    avatarUrl,
                };
            });
            setFaces(updatedFaces);

        }
        requestRef.current = window.requestAnimationFrame(predictFacePositions);
    };

    React.useEffect(() => {
        return () => {
            cancelAnimationFrame(requestRef.current);
        };
    }, []);

    async function startFaceDetection() {
        await setupFaceDetector();
        await getUserMedia({
            facingMode: 'user',
            videoElement: videoRef.current as HTMLVideoElement,
            onLoaded: () => {
                console.log('User media loaded');
            }
        });
        setFacingMode('user');
        setFaces([]);
        videoRef.current?.addEventListener("loadeddata", predictFacePositions);
    };

    return {
        startFaceDetection,
        faces,
        predictFacePositions,
        setupFaceDetector
    };
    */