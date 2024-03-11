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
exports.useGestureRecognizer = exports.getGestureRecognizer = exports.defaultGestureRecognizerOptions = exports.GestureRecognizer = void 0;
const react_1 = __importDefault(require("react"));
const tasks_vision_1 = require("@mediapipe/tasks-vision");
Object.defineProperty(exports, "GestureRecognizer", { enumerable: true, get: function () { return tasks_vision_1.GestureRecognizer; } });
const canPlayStream_1 = __importDefault(require("./canPlayStream"));
const deepmerge_1 = __importDefault(require("deepmerge"));
const utils_1 = require("./utils");
const const_1 = require("./const");
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
    const lastVideoTimeRef = react_1.default.useRef(-1);
    function predictGesture(time_1, stream_1) {
        return __awaiter(this, arguments, void 0, function* (time, stream, gestureRecognizerOptions = exports.defaultGestureRecognizerOptions) {
            var _a, _b, _c;
            if (!videoRef.current || !gestureRecognizerRef.current)
                return;
            const currentTime = videoRef.current.currentTime;
            if ((0, canPlayStream_1.default)(stream) && currentTime > lastVideoTimeRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
                lastVideoTimeRef.current = currentTime;
                if (gestureRecognizerOptions.runningMode === 'IMAGE') {
                    const results = yield ((_a = gestureRecognizerRef.current) === null || _a === void 0 ? void 0 : _a.recognize(videoRef.current));
                    onResults === null || onResults === void 0 ? void 0 : onResults(results, stream);
                }
                else {
                    const results = yield ((_b = gestureRecognizerRef.current) === null || _b === void 0 ? void 0 : _b.recognizeForVideo(videoRef.current, currentTime + 1));
                    onResults === null || onResults === void 0 ? void 0 : onResults(results, stream);
                }
            }
            (_c = videoRef.current) === null || _c === void 0 ? void 0 : _c.requestVideoFrameCallback((time) => predictGesture(time, stream, gestureRecognizerOptions));
        });
    }
    function startGestureTracking() {
        return __awaiter(this, arguments, void 0, function* ({ stream, gestureRecognizerOptions, userMediaOptions, } = {
            stream: undefined,
            gestureRecognizerOptions: undefined,
        }) {
            gestureRecognizerRef.current = yield getGestureRecognizer(gestureRecognizerOptions);
            videoRef.current = document.createElement("video");
            videoRef.current.playsInline = true;
            videoRef.current.crossOrigin = "anonymous";
            videoRef.current.srcObject = stream || (yield navigator.mediaDevices
                .getUserMedia((0, deepmerge_1.default)(utils_1.defaultUserMediaOptions, userMediaOptions || {})));
            videoRef.current.onloadedmetadata = () => {
                videoRef.current.play();
            };
            const _stream = videoRef.current.srcObject;
            videoRef.current.requestVideoFrameCallback((time) => predictGesture(time, _stream, gestureRecognizerOptions));
        });
    }
    return startGestureTracking;
}
exports.useGestureRecognizer = useGestureRecognizer;
