import { useState, useRef, useCallback } from 'react';
import { useAudioEngine } from '../../audio/hooks/useAudioEngine';
import { useLatency } from '../../audio/hooks/useLatency';
import { useAppStore } from '../../../shared/store';

export const useCalibration = () => {
  const [step, setStep] = useState(0);
  const [latency, setLatency] = useState(0);
  const soundStartTimeRef = useRef(0);
  const { playNote, stopNote } = useAudioEngine();
  const { completeCalibration } = useLatency();
  const setAudioLatency = useAppStore((s) => s.setAudioLatency);
  const setShowCalibration = useAppStore((s) => s.setShowCalibration);

  const startCalibration = useCallback(() => {
    setStep(1);
  }, []);

  const handleFirstTap = useCallback(() => {
    setStep(2);
    soundStartTimeRef.current = Date.now();
    playNote(440, 0.8);
  }, [playNote]);

  const handleSecondTap = useCallback(async () => {
    const tapTime = Date.now();
    stopNote(440);
    const measuredLatency = tapTime - soundStartTimeRef.current;
    await completeCalibration(tapTime, soundStartTimeRef.current);
    setAudioLatency(measuredLatency);
    setLatency(measuredLatency);
    setStep(3);
  }, [stopNote, completeCalibration, setAudioLatency]);

  const handleCancel = useCallback(() => {
    stopNote(440);
    setStep(0);
    setShowCalibration(false);
  }, [stopNote, setShowCalibration]);

  const handleDone = useCallback(() => {
    setStep(0);
    setShowCalibration(false);
  }, [setShowCalibration]);

  const handleRecalibrate = useCallback(() => {
    setStep(0);
    setLatency(0);
  }, []);

  return {
    step,
    latency,
    startCalibration,
    handleFirstTap,
    handleSecondTap,
    handleCancel,
    handleDone,
    handleRecalibrate,
  };
};
