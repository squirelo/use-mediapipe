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
exports.useSelfieSegmenter = void 0;
const react_1 = __importDefault(require("react"));
const selfie_segmentation_1 = require("@mediapipe/selfie_segmentation");
const deepmerge_1 = __importDefault(require("deepmerge"));
const canPlayStream_1 = __importDefault(require("./canPlayStream"));
const canReadVideo_1 = __importDefault(require("./canReadVideo"));
const const_1 = require("./const");
const stopVideo_1 = __importDefault(require("./stopVideo"));
const defaultSelfieSegmentationOptions = {
    modelSelection: 1,
    selfieMode: true,
};
function getSelfieSegmenter(options = defaultSelfieSegmentationOptions) {
    const selfieSegmentation = new selfie_segmentation_1.SelfieSegmentation({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
    });
    const selfieSegmenterOptions = (0, deepmerge_1.default)(defaultSelfieSegmentationOptions, options);
    selfieSegmentation.setOptions(selfieSegmenterOptions);
    return selfieSegmentation;
}
function useSelfieSegmenter({ onResults, }) {
    const videoRef = react_1.default.useRef(null);
    const selfieSegmentationRef = react_1.default.useRef();
    const isSelfieSegmentationRunningRef = react_1.default.useRef(false);
    function predictSelfieSegmentation(time, stream) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!isSelfieSegmentationRunningRef.current)
                return;
            if ((0, canPlayStream_1.default)(stream) && (0, canReadVideo_1.default)(videoRef.current) && selfieSegmentationRef.current) {
                yield ((_a = selfieSegmentationRef.current) === null || _a === void 0 ? void 0 : _a.send({ image: videoRef.current }));
                (_b = videoRef.current) === null || _b === void 0 ? void 0 : _b.requestVideoFrameCallback((time) => predictSelfieSegmentation(time, stream));
            }
        });
    }
    function startSelfieSegmenter() {
        return __awaiter(this, arguments, void 0, function* ({ stream, selfieSegmentationOptions, userMediaOptions, } = {
            stream: undefined,
            selfieSegmentationOptions: undefined,
            userMediaOptions: undefined,
        }) {
            var _a;
            isSelfieSegmentationRunningRef.current = true;
            selfieSegmentationRef.current = yield getSelfieSegmenter(selfieSegmentationOptions);
            (_a = selfieSegmentationRef.current) === null || _a === void 0 ? void 0 : _a.onResults((res) => onResults === null || onResults === void 0 ? void 0 : onResults(res, stream));
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
            videoRef.current.requestVideoFrameCallback((time) => predictSelfieSegmentation(time, _stream));
        });
    }
    function stopSelfieSegmenter() {
        (0, stopVideo_1.default)(videoRef.current);
        isSelfieSegmentationRunningRef.current = false;
    }
    react_1.default.useEffect(() => {
        return () => {
            stopSelfieSegmenter();
        };
    }, []);
    return { startSelfieSegmenter, stopSelfieSegmenter };
}
exports.useSelfieSegmenter = useSelfieSegmenter;
