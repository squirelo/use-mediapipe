import { SelfieSegmentation, Options as SelfieSegmentationOptions, Results as SelfieSegmentationResult } from "@mediapipe/selfie_segmentation";
export type { SelfieSegmentation, SelfieSegmentationOptions, SelfieSegmentationResult };
export declare function useSelfieSegmenter({ onResults, }: {
    onResults: (result: SelfieSegmentationResult, stream?: MediaStream) => void;
}): {
    startSelfieSegmenter: ({ stream, selfieSegmentationOptions, userMediaOptions, }?: {
        stream?: MediaStream;
        selfieSegmentationOptions?: SelfieSegmentationOptions;
        userMediaOptions?: MediaStreamConstraints;
    }) => Promise<void>;
    stopSelfieSegmenter: () => void;
};
//# sourceMappingURL=useSelfieSegmenter.d.ts.map