import { HandLandmarker, HandLandmarkerOptions, HandLandmarkerResult } from "@mediapipe/tasks-vision";
export { HandLandmarker, HandLandmarkerOptions, HandLandmarkerResult };
export declare const defaultHandLandmarkerOptions: HandLandmarkerOptions;
export declare function getHandLandmarker(options?: HandLandmarkerOptions): Promise<HandLandmarker>;
export declare function useHandLandmarker({ onResults, }: {
    onResults: (result: HandLandmarkerResult, stream?: MediaStream) => void;
}): ({ stream, handLandmarkerOptions, userMediaOptions, }?: {
    stream?: MediaStream | undefined;
    handLandmarkerOptions?: HandLandmarkerOptions | undefined;
    userMediaOptions?: MediaStreamConstraints | undefined;
}) => Promise<void>;
//# sourceMappingURL=useHandLandmarker.d.ts.map