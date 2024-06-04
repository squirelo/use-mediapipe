import { HandLandmarker, HandLandmarkerOptions, HandLandmarkerResult } from "@mediapipe/tasks-vision";
export type { HandLandmarker, HandLandmarkerOptions, HandLandmarkerResult };
export declare const defaultHandLandmarkerOptions: HandLandmarkerOptions;
export declare function getHandLandmarker(options?: HandLandmarkerOptions): Promise<HandLandmarker>;
export declare function useHandLandmarker({ onResults, }: {
    onResults: (result: HandLandmarkerResult, stream?: MediaStream) => void;
}): {
    startHandLandmarker: ({ stream, handLandmarkerOptions, userMediaOptions, }?: {
        stream?: MediaStream;
        handLandmarkerOptions?: HandLandmarkerOptions;
        userMediaOptions?: MediaStreamConstraints;
    }) => Promise<void>;
    stopHandLandmarker: () => void;
};
//# sourceMappingURL=useHandLandmarker.d.ts.map