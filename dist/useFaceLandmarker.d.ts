import { FaceLandmarker, FaceLandmarkerOptions, FaceLandmarkerResult } from "@mediapipe/tasks-vision";
export type { FaceLandmarker, FaceLandmarkerOptions, FaceLandmarkerResult };
export declare const defaultFaceLandmarkerOptions: FaceLandmarkerOptions;
export declare function getFaceLandmarker(options?: FaceLandmarkerOptions): Promise<FaceLandmarker>;
export declare function useFaceLandmarker({ onResults, }: {
    onResults: (result: FaceLandmarkerResult, stream?: MediaStream) => void;
}): {
    startFaceLandmarker: ({ stream, faceLandmarkerOptions, userMediaOptions, }?: {
        stream?: MediaStream;
        faceLandmarkerOptions?: FaceLandmarkerOptions;
        userMediaOptions?: MediaStreamConstraints;
    }) => Promise<void>;
    stopFaceLandmarker: () => void;
};
//# sourceMappingURL=useFaceLandmarker.d.ts.map