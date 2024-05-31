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
exports.useGestureRecognizer = exports.getGestureRecognizer = exports.defaultGestureRecognizerOptions = void 0;
const react_1 = __importDefault(require("react"));
const tasks_vision_1 = require("@mediapipe/tasks-vision");
const canPlayStream_1 = __importDefault(require("./canPlayStream"));
const deepmerge_1 = __importDefault(require("deepmerge"));
const const_1 = require("./const");
const canReadVideo_1 = __importDefault(require("./canReadVideo"));
const stopVideo_1 = __importDefault(require("./stopVideo"));
exports.defaultGestureRecognizerOptions = {
    baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
        delegate: "GPU",
    },
    runningMode: 'VIDEO',
    numHands: 2,
};
function getGestureRecognizer() {
    return __awaiter(this, arguments, void 0, function* (options = {}) {
        const tasksVision = yield tasks_vision_1.FilesetResolver.forVisionTasks(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${const_1.tasksVisionVersion}/wasm`);
        const gestureRecognizerOptions = (0, deepmerge_1.default)(exports.defaultGestureRecognizerOptions, options);
        const gestureRecognizer = yield tasks_vision_1.GestureRecognizer.createFromOptions(tasksVision, gestureRecognizerOptions);
        return gestureRecognizer;
    });
}
exports.getGestureRecognizer = getGestureRecognizer;
function useGestureRecognizer({ onResults, }) {
    const videoRef = react_1.default.useRef(null);
    const gestureRecognizerRef = react_1.default.useRef();
    const isGestureRecognizerRunningRef = react_1.default.useRef(false);
    function predictGesture(time, stream) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!isGestureRecognizerRunningRef.current)
                return;
            if ((0, canPlayStream_1.default)(stream) && (0, canReadVideo_1.default)(videoRef.current) && gestureRecognizerRef.current) {
                const video = videoRef.current;
                const results = yield ((_a = gestureRecognizerRef.current) === null || _a === void 0 ? void 0 : _a.recognizeForVideo(video, time));
                onResults === null || onResults === void 0 ? void 0 : onResults(results, stream);
            }
            (_b = videoRef.current) === null || _b === void 0 ? void 0 : _b.requestVideoFrameCallback((time) => predictGesture(time, stream));
        });
    }
    function startGestureTracking() {
        return __awaiter(this, arguments, void 0, function* ({ stream, gestureRecognizerOptions, userMediaOptions, } = {
            stream: undefined,
            gestureRecognizerOptions: undefined,
        }) {
            isGestureRecognizerRunningRef.current = true;
            gestureRecognizerRef.current = yield getGestureRecognizer(gestureRecognizerOptions);
            videoRef.current = document.createElement("video");
            videoRef.current.playsInline = true;
            videoRef.current.crossOrigin = "anonymous";
            videoRef.current.srcObject = stream || (yield navigator.mediaDevices
                .getUserMedia((0, deepmerge_1.default)(const_1.defaultUserMediaOptions, userMediaOptions || {})));
            videoRef.current.onloadedmetadata = () => {
                videoRef.current.play();
            };
            const _stream = videoRef.current.srcObject;
            videoRef.current.requestVideoFrameCallback((time) => predictGesture(time, _stream));
        });
    }
    function stopGestureTracking() {
        (0, stopVideo_1.default)(videoRef.current);
        isGestureRecognizerRunningRef.current = false;
    }
    react_1.default.useEffect(() => {
        return () => {
            stopGestureTracking();
        };
    }, []);
    return { startGestureTracking, stopGestureTracking };
}
exports.useGestureRecognizer = useGestureRecognizer;
