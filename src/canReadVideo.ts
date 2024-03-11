export default function canReadVideo(video: HTMLVideoElement | null): boolean {
    const { videoWidth = 0, videoHeight = 0 } = video || {};
    return videoWidth > 0 && videoHeight > 0;
}