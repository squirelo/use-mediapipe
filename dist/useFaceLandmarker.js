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
exports.useFaceLandmarker = exports.getFaceLandmarker = exports.defaultFaceLandmarkerOptions = void 0;
const react_1 = __importDefault(require("react"));
const deepmerge_1 = __importDefault(require("deepmerge"));
const tasks_vision_1 = require("@mediapipe/tasks-vision");
const canPlayStream_1 = __importDefault(require("./canPlayStream"));
const const_1 = require("./const");
const canReadVideo_1 = __importDefault(require("./canReadVideo"));
const stopVideo_1 = __importDefault(require("./stopVideo"));
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
    const isFaceLandmarkerRunningRef = react_1.default.useRef(false);
    function predictFaceLandmarks(time_1, stream_1) {
        return __awaiter(this, arguments, void 0, function* (time, stream, faceLandmarkerOptions = exports.defaultFaceLandmarkerOptions) {
            var _a, _b, _c;
            if (!isFaceLandmarkerRunningRef.current)
                return;
            if ((0, canPlayStream_1.default)(stream) && (0, canReadVideo_1.default)(videoRef.current) && faceLandmarkerRef.current) {
                const video = videoRef.current;
                if (faceLandmarkerOptions.runningMode === 'IMAGE') {
                    const results = yield ((_a = faceLandmarkerRef.current) === null || _a === void 0 ? void 0 : _a.detect(video));
                    onResults === null || onResults === void 0 ? void 0 : onResults(results, stream);
                }
                else {
                    const results = yield ((_b = faceLandmarkerRef.current) === null || _b === void 0 ? void 0 : _b.detectForVideo(video, time));
                    onResults === null || onResults === void 0 ? void 0 : onResults(results, stream);
                }
            }
            if (videoRef.current && faceLandmarkerOptions.runningMode === 'VIDEO') {
                (_c = videoRef.current) === null || _c === void 0 ? void 0 : _c.requestVideoFrameCallback((time) => predictFaceLandmarks(time, stream, faceLandmarkerOptions));
            }
        });
    }
    function startFaceLandmarker() {
        return __awaiter(this, arguments, void 0, function* ({ stream, faceLandmarkerOptions, userMediaOptions, } = {
            stream: undefined,
            faceLandmarkerOptions: undefined,
            userMediaOptions: undefined,
        }) {
            isFaceLandmarkerRunningRef.current = true;
            faceLandmarkerRef.current = yield getFaceLandmarker(faceLandmarkerOptions);
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
            videoRef.current.requestVideoFrameCallback((time) => predictFaceLandmarks(time, _stream, faceLandmarkerOptions));
        });
    }
    function stopFaceLandmarker() {
        (0, stopVideo_1.default)(videoRef.current);
        isFaceLandmarkerRunningRef.current = false;
    }
    react_1.default.useEffect(() => {
        return () => {
            stopFaceLandmarker();
        };
    }, []);
    return { startFaceLandmarker, stopFaceLandmarker };
}
exports.useFaceLandmarker = useFaceLandmarker;
