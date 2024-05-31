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
exports.useHandLandmarker = exports.getHandLandmarker = exports.defaultHandLandmarkerOptions = void 0;
const react_1 = __importDefault(require("react"));
const deepmerge_1 = __importDefault(require("deepmerge"));
const tasks_vision_1 = require("@mediapipe/tasks-vision");
const canPlayStream_1 = __importDefault(require("./canPlayStream"));
const const_1 = require("./const");
const canReadVideo_1 = __importDefault(require("./canReadVideo"));
const stopVideo_1 = __importDefault(require("./stopVideo"));
exports.defaultHandLandmarkerOptions = {
    baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: "GPU"
    },
    runningMode: 'VIDEO',
    numHands: 2,
    // minHandDetectionConfidence: 0.2,
    // minHandPresenceConfidence: 0.2,
    // minTrackingConfidence: 0.2,
};
function getHandLandmarker() {
    return __awaiter(this, arguments, void 0, function* (options = {}) {
        const vision = yield tasks_vision_1.FilesetResolver.forVisionTasks(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${const_1.tasksVisionVersion}/wasm`);
        const handLandmarkerOptions = (0, deepmerge_1.default)(exports.defaultHandLandmarkerOptions, options);
        const handLandmarker = yield tasks_vision_1.HandLandmarker.createFromOptions(vision, handLandmarkerOptions);
        return handLandmarker;
    });
}
exports.getHandLandmarker = getHandLandmarker;
function useHandLandmarker({ onResults, }) {
    const videoRef = react_1.default.useRef(null);
    const handLandmarkerRef = react_1.default.useRef();
    const ishHandLandmarkerRunningRef = react_1.default.useRef(false);
    function predictHandLandmarks(time, stream) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!ishHandLandmarkerRunningRef.current)
                return;
            if ((0, canPlayStream_1.default)(stream) && (0, canReadVideo_1.default)(videoRef.current) && handLandmarkerRef.current) {
                const video = videoRef.current;
                const results = yield ((_a = handLandmarkerRef.current) === null || _a === void 0 ? void 0 : _a.detectForVideo(video, time));
                onResults === null || onResults === void 0 ? void 0 : onResults(results, stream);
            }
            (_b = videoRef.current) === null || _b === void 0 ? void 0 : _b.requestVideoFrameCallback((time) => predictHandLandmarks(time, stream));
        });
    }
    function startHandLandmarker() {
        return __awaiter(this, arguments, void 0, function* ({ stream, handLandmarkerOptions, userMediaOptions, } = {
            stream: undefined,
            handLandmarkerOptions: undefined,
            userMediaOptions: undefined,
        }) {
            ishHandLandmarkerRunningRef.current = true;
            handLandmarkerRef.current = yield getHandLandmarker(handLandmarkerOptions);
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
            videoRef.current.requestVideoFrameCallback((time) => predictHandLandmarks(time, _stream));
        });
    }
    function stopHandLandmarker() {
        (0, stopVideo_1.default)(videoRef.current);
        ishHandLandmarkerRunningRef.current = false;
    }
    react_1.default.useEffect(() => {
        return () => {
            stopHandLandmarker();
        };
    }, []);
    return { startHandLandmarker, stopHandLandmarker };
}
exports.useHandLandmarker = useHandLandmarker;
