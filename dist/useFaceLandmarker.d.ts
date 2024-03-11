import { FaceLandmarker, FaceLandmarkerOptions, FaceLandmarkerResult } from "@mediapipe/tasks-vision";
export { FaceLandmarker, FaceLandmarkerOptions, FaceLandmarkerResult };
export declare const defaultFaceLandmarkerOptions: FaceLandmarkerOptions;
export declare function getFaceLandmarker(options?: FaceLandmarkerOptions): Promise<FaceLandmarker>;
export declare function useFaceLandmarker({ onResults, }: {
    onResults: (result: FaceLandmarkerResult, stream?: MediaStream) => void;
}): ({ stream, faceLandmarkerOptions, userMediaOptions, }?: {
    stream?: MediaStream | undefined;
    faceLandmarkerOptions?: FaceLandmarkerOptions | undefined;
    userMediaOptions?: MediaStreamConstraints | undefined;
}) => Promise<void>;
//# sourceMappingURL=useFaceLandmarker.d.ts.map