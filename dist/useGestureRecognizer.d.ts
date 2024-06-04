import { GestureRecognizer, GestureRecognizerOptions, GestureRecognizerResult } from "@mediapipe/tasks-vision";
export type { GestureRecognizer, GestureRecognizerOptions, GestureRecognizerResult };
export declare const defaultGestureRecognizerOptions: {
    baseOptions: {
        modelAssetPath: string;
        delegate: "CPU" | "GPU";
    };
    runningMode: any;
    numHands: number;
};
export declare function getGestureRecognizer(options?: GestureRecognizerOptions): Promise<GestureRecognizer>;
export declare function useGestureRecognizer({ onResults, }: {
    onResults: (result: GestureRecognizerResult, stream?: MediaStream) => void;
}): {
    startGestureTracking: ({ stream, gestureRecognizerOptions, userMediaOptions, }?: {
        stream?: MediaStream;
        gestureRecognizerOptions?: GestureRecognizerOptions;
        userMediaOptions?: MediaStreamConstraints;
    }) => Promise<void>;
    stopGestureTracking: () => void;
};
//# sourceMappingURL=useGestureRecognizer.d.ts.map