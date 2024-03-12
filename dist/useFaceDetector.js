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
const const_1 = require("./const");
const canReadVideo_1 = __importDefault(require("./canReadVideo"));
const stopVideo_1 = __importDefault(require("./stopVideo"));
exports.defaultFaceDetectorOptions = {
    baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
        delegate: "GPU"
    },
    runningMode: 'VIDEO',
};
function getFaceDetector() {
    return __awaiter(this, arguments, void 0, function* (options = exports.defaultFaceDetectorOptions) {
        const vision = yield tasks_vision_1.FilesetResolver.forVisionTasks(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${const_1.tasksVisionVersion}/wasm`);
        const faceDetectorOptions = (0, deepmerge_1.default)(exports.defaultFaceDetectorOptions, options);
        const faceDetector = yield tasks_vision_1.FaceDetector.createFromOptions(vision, faceDetectorOptions);
        return faceDetector;
    });
}
exports.getFaceDetector = getFaceDetector;
function useFaceDetector({ onResults, }) {
    const videoRef = react_1.default.useRef(null);
    const faceDetectorRef = react_1.default.useRef();
    const isFaceDetectionRunningRef = react_1.default.useRef(false);
    function predictFaceDetections(time_1, stream_1) {
        return __awaiter(this, arguments, void 0, function* (time, stream, faceDetectorOptions = exports.defaultFaceDetectorOptions) {
            var _a, _b, _c;
            if (!isFaceDetectionRunningRef.current)
                return;
            if ((0, canPlayStream_1.default)(stream) && (0, canReadVideo_1.default)(videoRef.current) && faceDetectorRef.current) {
                const video = videoRef.current;
                if (faceDetectorOptions.runningMode === 'IMAGE') {
                    const results = yield ((_a = faceDetectorRef.current) === null || _a === void 0 ? void 0 : _a.detect(video));
                    onResults === null || onResults === void 0 ? void 0 : onResults(results, stream);
                }
                else {
                    const results = yield ((_b = faceDetectorRef.current) === null || _b === void 0 ? void 0 : _b.detectForVideo(video, time));
                    onResults === null || onResults === void 0 ? void 0 : onResults(results, stream);
                }
            }
            if (videoRef.current && faceDetectorOptions.runningMode === 'VIDEO') {
                (_c = videoRef.current) === null || _c === void 0 ? void 0 : _c.requestVideoFrameCallback((time) => predictFaceDetections(time, stream, faceDetectorOptions));
            }
        });
    }
    function startFaceDetection() {
        return __awaiter(this, arguments, void 0, function* ({ stream, faceDetectorOptions, userMediaOptions, } = {
            stream: undefined,
            faceDetectorOptions: undefined,
        }) {
            isFaceDetectionRunningRef.current = true;
            faceDetectorRef.current = yield getFaceDetector(faceDetectorOptions);
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
            videoRef.current.requestVideoFrameCallback((time) => predictFaceDetections(time, _stream, faceDetectorOptions));
        });
    }
    function stopFaceDetection() {
        (0, stopVideo_1.default)(videoRef.current);
        isFaceDetectionRunningRef.current = false;
    }
    react_1.default.useEffect(() => {
        return () => {
            stopFaceDetection();
        };
    }, []);
    return { startFaceDetection, stopFaceDetection };
}
exports.useFaceDetector = useFaceDetector;
