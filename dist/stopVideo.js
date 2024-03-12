"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function stopVideo(video) {
    var _a;
    if (!(video === null || video === void 0 ? void 0 : video.srcObject))
        return;
    (_a = video.srcObject) === null || _a === void 0 ? void 0 : _a.getTracks().forEach((track) => {
        track.stop();
    });
    video.srcObject = null;
}
exports.default = stopVideo;
