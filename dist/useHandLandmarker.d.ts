import { HandLandmarker, HandLandmarkerOptions, HandLandmarkerResult } from "@mediapipe/tasks-vision";
export type { HandLandmarker, HandLandmarkerOptions, HandLandmarkerResult };
export declare const defaultHandLandmarkerOptions: HandLandmarkerOptions;
export declare function getHandLandmarker(options?: HandLandmarkerOptions): Promise<HandLandmarker>;
export declare function useHandLandmarker({ onResults, }: {
    onResults: (result: HandLandmarkerResult, stream?: MediaStream) => void;
}): {
    startHandLandmarker: ({ stream, handLandmarkerOptions, userMediaOptions, }?: {
        stream?: MediaStream | undefined;
        handLandmarkerOptions?: HandLandmarkerOptions | undefined;
        userMediaOptions?: MediaStreamConstraints | undefined;
    }) => Promise<void>;
    stopHandLandmarker: () => void;
};
//# sourceMappingURL=useHandLandmarker.d.ts.map