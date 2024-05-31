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
exports.useImageSegmenter = exports.getImageSegmenter = exports.defaultImageSegmenterOptions = exports.ImageSegmenterResult = exports.ImageSegmenter = void 0;
const react_1 = __importDefault(require("react"));
const deepmerge_1 = __importDefault(require("deepmerge"));
const tasks_vision_1 = require("@mediapipe/tasks-vision");
Object.defineProperty(exports, "ImageSegmenter", { enumerable: true, get: function () { return tasks_vision_1.ImageSegmenter; } });
Object.defineProperty(exports, "ImageSegmenterResult", { enumerable: true, get: function () { return tasks_vision_1.ImageSegmenterResult; } });
const canPlayStream_1 = __importDefault(require("./canPlayStream"));
const const_1 = require("./const");
const canReadVideo_1 = __importDefault(require("./canReadVideo"));
const stopVideo_1 = __importDefault(require("./stopVideo"));
exports.defaultImageSegmenterOptions = {
    baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-assets/deeplabv3.tflite?generation=1661875711618421",
    },
    outputCategoryMask: true,
    outputConfidenceMasks: false,
    runningMode: 'VIDEO',
};
function getImageSegmenter() {
    return __awaiter(this, arguments, void 0, function* (options = {}) {
        const vision = yield tasks_vision_1.FilesetResolver.forVisionTasks(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${const_1.tasksVisionVersion}/wasm`);
        const imageSegmenterOptions = (0, deepmerge_1.default)(exports.defaultImageSegmenterOptions, options);
        const imageSegmenter = yield tasks_vision_1.ImageSegmenter.createFromOptions(vision, imageSegmenterOptions);
        return imageSegmenter;
    });
}
exports.getImageSegmenter = getImageSegmenter;
function useImageSegmenter({ onResults, }) {
    const videoRef = react_1.default.useRef(null);
    const imageSegmenterRef = react_1.default.useRef();
    const isImageSegmenterRunningRef = react_1.default.useRef(false);
    function predictImageSegmentations(time_1, stream_1) {
        return __awaiter(this, arguments, void 0, function* (time, stream, imageSegmenterOptions = exports.defaultImageSegmenterOptions) {
            var _a, _b;
            if (!isImageSegmenterRunningRef.current)
                return;
            if ((0, canPlayStream_1.default)(stream) && (0, canReadVideo_1.default)(videoRef.current) && imageSegmenterRef.current) {
                const video = videoRef.current;
                if (imageSegmenterOptions.runningMode === 'IMAGE') {
                    (_a = imageSegmenterRef.current) === null || _a === void 0 ? void 0 : _a.segment(video, (results) => onResults(results, stream));
                }
                else {
                    (_b = imageSegmenterRef.current) === null || _b === void 0 ? void 0 : _b.segmentForVideo(video, time, (results) => {
                        var _a;
                        onResults(results, stream);
                        (_a = videoRef.current) === null || _a === void 0 ? void 0 : _a.requestVideoFrameCallback((time) => predictImageSegmentations(time, stream, imageSegmenterOptions));
                    });
                }
            }
        });
    }
    function startImageSegmenter() {
        return __awaiter(this, arguments, void 0, function* ({ stream, imageSegmenterOptions, userMediaOptions, } = {
            stream: undefined,
            imageSegmenterOptions: undefined,
            userMediaOptions: undefined,
        }) {
            isImageSegmenterRunningRef.current = true;
            imageSegmenterRef.current = yield getImageSegmenter(imageSegmenterOptions);
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
            videoRef.current.requestVideoFrameCallback((time) => predictImageSegmentations(time, _stream, imageSegmenterOptions));
        });
    }
    function stopImageSegmenter() {
        (0, stopVideo_1.default)(videoRef.current);
        isImageSegmenterRunningRef.current = false;
    }
    react_1.default.useEffect(() => {
        return () => {
            stopImageSegmenter();
        };
    }, []);
    return { startImageSegmenter, stopImageSegmenter };
}
exports.useImageSegmenter = useImageSegmenter;
