import { ImageSegmenter, ImageSegmenterOptions, ImageSegmenterResult } from "@mediapipe/tasks-vision";
export type { ImageSegmenter, ImageSegmenterOptions, ImageSegmenterResult };
export declare const defaultImageSegmenterOptions: ImageSegmenterOptions;
export declare function getImageSegmenter(options?: ImageSegmenterOptions): Promise<ImageSegmenter>;
export declare function useImageSegmenter({ onResults, }: {
    onResults: (result: ImageSegmenterResult, stream?: MediaStream) => void;
}): {
    startImageSegmenter: ({ stream, imageSegmenterOptions, userMediaOptions, }?: {
        stream?: MediaStream;
        imageSegmenterOptions?: ImageSegmenterOptions;
        userMediaOptions?: MediaStreamConstraints;
    }) => Promise<void>;
    stopImageSegmenter: () => void;
};
//# sourceMappingURL=useImageSegmenter.d.ts.map