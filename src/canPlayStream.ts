export default function canPlayStream(stream?: MediaStream) {
    if (!stream) return false;
    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length === 0 || videoTracks[0].readyState !== 'live') {
        return false;
    }
    return true;
}