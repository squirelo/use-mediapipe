
A set of React hooks to use MediaPipe.

## Install
`yarn add gwendall/use-mediapipe` or `npm install gwendall/use-mediapipe --save`.

## useFaceLandmarker
```typescript
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
```typescript
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