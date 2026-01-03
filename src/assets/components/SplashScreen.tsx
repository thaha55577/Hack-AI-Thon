import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import introVideo from '../intro.mov';

import secondVideo from '../final with sound.mp4';

const SplashScreen = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const secondVideoRef = useRef<HTMLVideoElement>(null);
  const [stage, setStage] = useState<'video' | 'secondVideo'>('video');
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (stage === 'video') {
      const video = videoRef.current;
      if (!video) return;

      // Attempt autoplay
      video.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.log("Autoplay blocked:", err));

      const handleEnded = () => {
        setStage('secondVideo');
      };

      video.addEventListener('ended', handleEnded);
      return () => video.removeEventListener('ended', handleEnded);
    }
  }, [stage]);

  useEffect(() => {
    if (stage === 'secondVideo') {
      const video = secondVideoRef.current;
      if (!video) return;

      video.play().catch(err => console.log("Second video autoplay blocked:", err));

      const handleEnded = () => {
        navigate('/login');
      };

      video.addEventListener('ended', handleEnded);
      return () => video.removeEventListener('ended', handleEnded);
    }
  }, [stage, navigate]);

  const startExperience = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = false;
      video.currentTime = 0;
      video.play();
      setIsPlaying(true);
    }
  };

  const skipToSecondVideo = () => {
    setStage('secondVideo');
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden">

      {/* STAGE: FIRST VIDEO */}
      <AnimatePresence>
        {stage === 'video' && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <video
              ref={videoRef}
              className={`w-full h-full object-contain ${isPlaying ? 'opacity-100' : 'opacity-50'}`}
              muted={false}
              playsInline
              preload="auto"
            >
              <source src={introVideo} type="video/quicktime" />
              <source src={introVideo} type="video/mp4" />
            </video>

            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center z-50">
                <button
                  onClick={startExperience}
                  className="glow-btn text-xl md:text-2xl px-8 py-4 animate-pulse"
                  style={{ border: '2px solid #00d4ff', boxShadow: '0 0 30px #00d4ff' }}
                >
                  INITIALIZE SYSTEM
                </button>
              </div>
            )}

            {isPlaying && (
              <button
                onClick={skipToSecondVideo}
                className="absolute bottom-8 right-8 z-40 text-cyan-500 hover:text-white border border-cyan-500 px-4 py-2 rounded font-orbitron text-sm opacity-50 hover:opacity-100 transition-all"
              >
                SKIP INTRO
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* STAGE: SECOND VIDEO */}
      <AnimatePresence>
        {stage === 'secondVideo' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <video
              ref={secondVideoRef}
              className="w-full h-full object-contain"
              muted={false}
              playsInline
              preload="auto"
            >
              <source src={secondVideo} type="video/mp4" />
            </video>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};


export default SplashScreen;
