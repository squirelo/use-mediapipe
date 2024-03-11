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
exports.useFaceLandmarker = exports.getFaceLandmarker = exports.defaultFaceLandmarkerOptions = exports.FaceLandmarker = void 0;
const react_1 = __importDefault(require("react"));
const deepmerge_1 = __importDefault(require("deepmerge"));
const tasks_vision_1 = require("@mediapipe/tasks-vision");
Object.defineProperty(exports, "FaceLandmarker", { enumerable: true, get: function () { return tasks_vision_1.FaceLandmarker; } });
const canPlayStream_1 = __importDefault(require("./canPlayStream"));
const utils_1 = require("./utils");
const const_1 = require("./const");
exports.defaultFaceLandmarkerOptions = {
    baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
        delegate: "GPU"
    },
    runningMode: 'VIDEO',
    numFaces: 1,
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
};
function getFaceLandmarker() {
    return __awaiter(this, arguments, void 0, function* (options = {}) {
        const vision = yield tasks_vision_1.FilesetResolver.forVisionTasks(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${const_1.tasksVisionVersion}/wasm`);
        const faceLandmarkerOptions = (0, deepmerge_1.default)(exports.defaultFaceLandmarkerOptions, options);
        const faceLandmarker = yield tasks_vision_1.FaceLandmarker.createFromOptions(vision, faceLandmarkerOptions);
        return faceLandmarker;
    });
}
exports.getFaceLandmarker = getFaceLandmarker;
function useFaceLandmarker({ onResults, }) {
    const videoRef = react_1.default.useRef(null);
    const faceLandmarkerRef = react_1.default.useRef();
    const lastVideoTimeRef = react_1.default.useRef(-1);
    function predictFaceLandmarks(time_1, stream_1) {
        return __awaiter(this, arguments, void 0, function* (time, stream, faceLandmarkerOptions = exports.defaultFaceLandmarkerOptions) {
            var _a, _b, _c;
            if (!videoRef.current || !faceLandmarkerRef.current)
                return;
            const currentTime = videoRef.current.currentTime;
            if ((0, canPlayStream_1.default)(stream) && currentTime > lastVideoTimeRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
                lastVideoTimeRef.current = currentTime;
                if (faceLandmarkerOptions.runningMode === 'IMAGE') {
                    const results = yield ((_a = faceLandmarkerRef.current) === null || _a === void 0 ? void 0 : _a.detect(videoRef.current));
                    onResults === null || onResults === void 0 ? void 0 : onResults(results, stream);
                }
                else {
                    const results = yield ((_b = faceLandmarkerRef.current) === null || _b === void 0 ? void 0 : _b.detectForVideo(videoRef.current, currentTime + 1));
                    onResults === null || onResults === void 0 ? void 0 : onResults(results, stream);
                }
            }
            (_c = videoRef.current) === null || _c === void 0 ? void 0 : _c.requestVideoFrameCallback((time) => predictFaceLandmarks(time, stream, faceLandmarkerOptions));
        });
    }
    function startFaceLandmarker() {
        return __awaiter(this, arguments, void 0, function* ({ stream, faceLandmarkerOptions, userMediaOptions, } = {
            stream: undefined,
            faceLandmarkerOptions: undefined,
            userMediaOptions: undefined,
        }) {
            faceLandmarkerRef.current = yield getFaceLandmarker(faceLandmarkerOptions);
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
            videoRef.current.requestVideoFrameCallback((time) => predictFaceLandmarks(time, _stream, faceLandmarkerOptions));
        });
    }
    return startFaceLandmarker;
}
exports.useFaceLandmarker = useFaceLandmarker;
