import { GestureRecognizer, GestureRecognizerOptions, GestureRecognizerResult } from "@mediapipe/tasks-vision";
export { GestureRecognizer, GestureRecognizerOptions, GestureRecognizerResult };
export declare const defaultGestureRecognizerOptions: {
    runningMode: any;
    numHands: number;
};
export declare function getGestureRecognizer(options?: GestureRecognizerOptions): Promise<GestureRecognizer>;
export default function useGestureRecognizer({ onResults, }: {
    onResults: (result?: GestureRecognizerResult) => void;
}): ({ stream, gestureRecognizerOptions, }?: {
    stream?: MediaStream | undefined;
    gestureRecognizerOptions?: GestureRecognizerOptions | undefined;
}) => Promise<void>;
//# sourceMappingURL=useGestureRecognizer.d.ts.map