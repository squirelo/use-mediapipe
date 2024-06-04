import { PoseLandmarker, PoseLandmarkerOptions, PoseLandmarkerResult } from "@mediapipe/tasks-vision";
export type { PoseLandmarker, PoseLandmarkerOptions, PoseLandmarkerResult };
export declare const defaultPoseLandmarkerOptions: PoseLandmarkerOptions;
export declare function getPoseLandmarker(options?: PoseLandmarkerOptions): Promise<PoseLandmarker>;
export declare function usePoseLandmarker({ onResults, }: {
    onResults: (result: PoseLandmarkerResult, stream?: MediaStream) => void;
}): {
    startPoseLandmarker: ({ stream, poseLandmarkerOptions, userMediaOptions, }?: {
        stream?: MediaStream;
        poseLandmarkerOptions?: PoseLandmarkerOptions;
        userMediaOptions?: MediaStreamConstraints;
    }) => Promise<void>;
    stopPoseLandmarker: () => void;
};
//# sourceMappingURL=usePoseLandmarker.d.ts.map