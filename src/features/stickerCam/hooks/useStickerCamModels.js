import { useCallback, useEffect, useState } from 'react';
import {
  BG_MODES,
  FACE_MODEL,
  HAND_MODEL,
  MAX_TRACKED_HANDS,
  SEG_MODEL,
  WASM_CDN,
} from '../stickerCamConstants';

function useStickerCamModels({
  bgMode,
  faceLmRef,
  landmarkerRef,
  segmenterRef,
  setShowFaceMesh,
}) {
  const [handStatus, setHandStatus] = useState('idle');
  const [segStatus, setSegStatus] = useState('idle');
  const [faceStatus, setFaceStatus] = useState('idle');

  const loadHands = useCallback(async () => {
    if (landmarkerRef.current || handStatus === 'loading') return;
    setHandStatus('loading');
    try {
      const { HandLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
      const vis = await FilesetResolver.forVisionTasks(WASM_CDN);
      landmarkerRef.current = await HandLandmarker.createFromOptions(vis, {
        baseOptions: { modelAssetPath: HAND_MODEL, delegate: 'GPU' },
        minHandDetectionConfidence: 0.72,
        minHandPresenceConfidence: 0.72,
        minTrackingConfidence: 0.78,
        numHands: MAX_TRACKED_HANDS,
        runningMode: 'VIDEO',
      });
      setHandStatus('ready');
    } catch {
      setHandStatus('error');
    }
  }, [handStatus, landmarkerRef]);

  const loadSegmenter = useCallback(async () => {
    if (segmenterRef.current || segStatus === 'loading') return;
    setSegStatus('loading');
    try {
      const { ImageSegmenter, FilesetResolver } = await import('@mediapipe/tasks-vision');
      const vis = await FilesetResolver.forVisionTasks(WASM_CDN);
      segmenterRef.current = await ImageSegmenter.createFromOptions(vis, {
        baseOptions: { modelAssetPath: SEG_MODEL, delegate: 'GPU' },
        outputCategoryMask: true,
        outputConfidenceMasks: false,
        runningMode: 'VIDEO',
      });
      setSegStatus('ready');
    } catch {
      setSegStatus('error');
    }
  }, [segStatus, segmenterRef]);

  const loadFace = useCallback(async () => {
    if (faceLmRef.current || faceStatus === 'loading') return;
    setFaceStatus('loading');
    try {
      const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
      const vis = await FilesetResolver.forVisionTasks(WASM_CDN);
      faceLmRef.current = await FaceLandmarker.createFromOptions(vis, {
        baseOptions: { modelAssetPath: FACE_MODEL, delegate: 'GPU' },
        numFaces: 1,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
        runningMode: 'VIDEO',
      });
      setFaceStatus('ready');
      setShowFaceMesh(true);
    } catch {
      setFaceStatus('error');
    }
  }, [faceLmRef, faceStatus, setShowFaceMesh]);

  useEffect(() => {
    const mode = BG_MODES.find(b => b.id === bgMode);
    if (mode?.needsSeg && !segmenterRef.current) loadSegmenter();
  }, [bgMode, loadSegmenter, segmenterRef]);

  useEffect(() => () => {
    landmarkerRef.current?.close();
    segmenterRef.current?.close();
    faceLmRef.current?.close();
  }, [faceLmRef, landmarkerRef, segmenterRef]);

  return {
    faceStatus,
    handStatus,
    loadFace,
    loadHands,
    segStatus,
  };
}

export { useStickerCamModels };
