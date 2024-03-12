import { FaceDetector, FaceDetectorOptions, FaceDetectorResult } from "@mediapipe/tasks-vision";
export type { FaceDetector, FaceDetectorOptions, FaceDetectorResult };
export declare const defaultFaceDetectorOptions: FaceDetectorOptions;
export declare function getFaceDetector(options?: FaceDetectorOptions): Promise<FaceDetector>;
export declare function useFaceDetector({ onResults, }: {
    onResults: (result: FaceDetectorResult, stream?: MediaStream) => void;
}): {
    startFaceDetection: ({ stream, faceDetectorOptions, userMediaOptions, }?: {
        stream?: MediaStream | undefined;
        faceDetectorOptions?: FaceDetectorOptions | undefined;
        userMediaOptions?: MediaStreamConstraints | undefined;
    }) => Promise<void>;
    stopFaceDetection: () => void;
};
//# sourceMappingURL=useFaceDetector.d.ts.map