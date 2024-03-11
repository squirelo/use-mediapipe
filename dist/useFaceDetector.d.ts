import { FaceDetector, FaceDetectorResult, FaceDetectorOptions } from "@mediapipe/tasks-vision";
export declare const defaultFaceDetectorOptions: FaceDetectorOptions;
export declare function getFaceDetector(options?: FaceDetectorOptions): Promise<FaceDetector>;
export declare function useFaceDetector({ onResults, }: {
    onResults: (result: FaceDetectorResult, stream?: MediaStream) => void;
}): ({ stream, faceDetectorOptions, userMediaOptions, }?: {
    stream?: MediaStream | undefined;
    faceDetectorOptions?: FaceDetectorOptions | undefined;
    userMediaOptions?: MediaStreamConstraints | undefined;
}) => Promise<void>;
//# sourceMappingURL=useFaceDetector.d.ts.map