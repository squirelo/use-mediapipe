"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFaceDetector = exports.getFaceDetector = exports.defaultFaceDetectorOptions = void 0;
const react_1 = __importDefault(require("react"));
const tasks_vision_1 = require("@mediapipe/tasks-vision");
const canPlayStream_1 = __importDefault(require("./canPlayStream"));
const deepmerge_1 = __importDefault(require("deepmerge"));
const utils_1 = require("./utils");
exports.defaultFaceDetectorOptions = {
    baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
        delegate: "GPU"
    },
    runningMode: 'VIDEO',
};
function getFaceDetector() {
    return __awaiter(this, arguments, void 0, function* (options = exports.defaultFaceDetectorOptions) {
        const vision = yield tasks_vision_1.FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
        const faceDetectorOptions = (0, deepmerge_1.default)(exports.defaultFaceDetectorOptions, options);
        const faceDetector = yield tasks_vision_1.FaceDetector.createFromOptions(vision, faceDetectorOptions);
        return faceDetector;
    });
}
exports.getFaceDetector = getFaceDetector;
function useFaceDetector({ onResults, }) {
    const videoRef = react_1.default.useRef(null);
    const faceDetectorRef = react_1.default.useRef();
    const lastVideoTimeRef = react_1.default.useRef(-1);
    function predictFaceDetections(time_1, stream_1) {
        return __awaiter(this, arguments, void 0, function* (time, stream, faceDetectorOptions = exports.defaultFaceDetectorOptions) {
            var _a, _b, _c;
            if (!videoRef.current || !faceDetectorRef.current)
                return;
            const currentTime = videoRef.current.currentTime;
            if ((0, canPlayStream_1.default)(stream) && currentTime > lastVideoTimeRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
                lastVideoTimeRef.current = currentTime;
                if (faceDetectorOptions.runningMode === 'IMAGE') {
                    const results = yield ((_a = faceDetectorRef.current) === null || _a === void 0 ? void 0 : _a.detect(videoRef.current));
                    onResults === null || onResults === void 0 ? void 0 : onResults(results, stream);
                }
                else {
                    const results = yield ((_b = faceDetectorRef.current) === null || _b === void 0 ? void 0 : _b.detectForVideo(videoRef.current, currentTime + 1));
                    onResults === null || onResults === void 0 ? void 0 : onResults(results, stream);
                }
            }
            (_c = videoRef.current) === null || _c === void 0 ? void 0 : _c.requestVideoFrameCallback((time) => predictFaceDetections(time, stream, faceDetectorOptions));
        });
    }
    function startFaceDetection() {
        return __awaiter(this, arguments, void 0, function* ({ stream, faceDetectorOptions, userMediaOptions, } = {
            stream: undefined,
            faceDetectorOptions: undefined,
        }) {
            faceDetectorRef.current = yield getFaceDetector(faceDetectorOptions);
            videoRef.current = document.createElement("video");
            videoRef.current.muted = true;
            videoRef.current.autoplay = true;
            videoRef.current.playsInline = true;
            videoRef.current.crossOrigin = "anonymous";
            videoRef.current.srcObject = stream || (yield navigator.mediaDevices
                .getUserMedia((0, deepmerge_1.default)(utils_1.defaultUserMediaOptions, userMediaOptions || {})));
            videoRef.current.onloadedmetadata = () => {
                videoRef.current.play();
            };
            const _stream = videoRef.current.srcObject;
            videoRef.current.requestVideoFrameCallback((time) => predictFaceDetections(time, _stream, faceDetectorOptions));
        });
    }
    return startFaceDetection;
}
exports.useFaceDetector = useFaceDetector;
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
