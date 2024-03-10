
A set of React hooks to use MediaPipe.

## Install
`yarn add use-mediapipe` or `npm install use-mediapipe --save`.

## useFaceLandmarker
```
import { useFaceLandmarker } from "use-mediapipe";

function ReactComponent() {
    const startFaceLandmarker = useFaceLandmarker({
        onResults: (results) => {
            console.log('FaceLandmarker results', results); 
        }
    });
    return (
        <button onClick={ () => startFaceLandmarker() }>
            enable face analysis
        </button>
    );
}
```

## useGestureRecognizer
```
import { useGestureRecognizer } from "use-mediapipe";

function ReactComponent() {
    const startGestureRecognizer = useGestureRecognizer({
        onResults: (results) => {
            console.log('GestureRecognizer results', results); 
        }
    });
    return (
        <button onClick={ () => startGestureRecognizer() }>
            enable gesture analysis
        </button>
    );
}
```