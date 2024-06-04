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
exports.usePoseLandmarker = exports.getPoseLandmarker = exports.defaultPoseLandmarkerOptions = void 0;
const react_1 = __importDefault(require("react"));
const deepmerge_1 = __importDefault(require("deepmerge"));
const tasks_vision_1 = require("@mediapipe/tasks-vision");
const canPlayStream_1 = __importDefault(require("./canPlayStream"));
const const_1 = require("./const");
const canReadVideo_1 = __importDefault(require("./canReadVideo"));
const stopVideo_1 = __importDefault(require("./stopVideo"));
exports.defaultPoseLandmarkerOptions = {
    baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task`,
        delegate: "GPU"
    },
    runningMode: 'VIDEO',
    numPoses: 1,
    // minPoseDetectionConfidence: 0.2,
    // minPosePresenceConfidence: 0.2,
    // minTrackingConfidence: 0.2,
};
function getPoseLandmarker() {
    return __awaiter(this, arguments, void 0, function* (options = {}) {
        const vision = yield tasks_vision_1.FilesetResolver.forVisionTasks(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${const_1.tasksVisionVersion}/wasm`);
        const poseLandmarkerOptions = (0, deepmerge_1.default)(exports.defaultPoseLandmarkerOptions, options);
        const poseLandmarker = yield tasks_vision_1.PoseLandmarker.createFromOptions(vision, poseLandmarkerOptions);
        return poseLandmarker;
    });
}
exports.getPoseLandmarker = getPoseLandmarker;
function usePoseLandmarker({ onResults, }) {
    const videoRef = react_1.default.useRef(null);
    const poseLandmarkerRef = react_1.default.useRef();
    const isPoseLandmarkerRunningRef = react_1.default.useRef(false);
    function predictPoseLandmarks(time, stream) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!isPoseLandmarkerRunningRef.current)
                return;
            if ((0, canPlayStream_1.default)(stream) && (0, canReadVideo_1.default)(videoRef.current) && poseLandmarkerRef.current) {
                const video = videoRef.current;
                const results = yield ((_a = poseLandmarkerRef.current) === null || _a === void 0 ? void 0 : _a.detectForVideo(video, time));
                onResults === null || onResults === void 0 ? void 0 : onResults(results, stream);
            }
            (_b = videoRef.current) === null || _b === void 0 ? void 0 : _b.requestVideoFrameCallback((time) => predictPoseLandmarks(time, stream));
        });
    }
    function startPoseLandmarker() {
        return __awaiter(this, arguments, void 0, function* ({ stream, poseLandmarkerOptions, userMediaOptions, } = {
            stream: undefined,
            poseLandmarkerOptions: undefined,
            userMediaOptions: undefined,
        }) {
            isPoseLandmarkerRunningRef.current = true;
            poseLandmarkerRef.current = yield getPoseLandmarker(poseLandmarkerOptions);
            videoRef.current = document.createElement("video");
            videoRef.current.muted = true;
            videoRef.current.autoplay = true;
            videoRef.current.playsInline = true;
            videoRef.current.crossOrigin = "anonymous";
            videoRef.current.srcObject = stream || (yield navigator.mediaDevices
                .getUserMedia((0, deepmerge_1.default)(const_1.defaultUserMediaOptions, userMediaOptions || {})));
            videoRef.current.onloadedmetadata = () => {
                videoRef.current.play();
            };
            const _stream = videoRef.current.srcObject;
            videoRef.current.requestVideoFrameCallback((time) => predictPoseLandmarks(time, _stream));
        });
    }
    function stopPoseLandmarker() {
        (0, stopVideo_1.default)(videoRef.current);
        isPoseLandmarkerRunningRef.current = false;
    }
    react_1.default.useEffect(() => {
        return () => {
            stopPoseLandmarker();
        };
    }, []);
    return { startPoseLandmarker, stopPoseLandmarker };
}
exports.usePoseLandmarker = usePoseLandmarker;
