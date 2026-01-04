import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import introVideo from '../intro.mov';
import secondVideo from '../final with sound.mp4';

const SplashScreen = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const secondVideoRef = useRef<HTMLVideoElement>(null);
  const [stage, setStage] = useState<'video' | 'secondVideo'>('video');
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Attempt autoplay for the first video
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(err => console.log("Autoplay blocked:", err));
    }

    const handleEnded = () => {
      // Start second video immediately before switching view
      if (secondVideoRef.current) {
        secondVideoRef.current.play().catch(err => console.log("Second video play error:", err));
      }
      setStage('secondVideo');
    };

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, []);

  useEffect(() => {
    const video = secondVideoRef.current;
    if (!video) return;

    const handleEnded = () => {
      navigate('/login');
    };

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, [navigate]);

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
    if (secondVideoRef.current) {
      secondVideoRef.current.play().catch(err => console.log("Skip play error:", err));
    }
    setStage('secondVideo');
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden">

      {/* STAGE: FIRST VIDEO */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${stage === 'video' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
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

        {!isPlaying && stage === 'video' && (
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

        {isPlaying && stage === 'video' && (
          <button
            onClick={skipToSecondVideo}
            className="absolute bottom-8 right-8 z-40 text-cyan-500 hover:text-white border border-cyan-500 px-4 py-2 rounded font-orbitron text-sm opacity-50 hover:opacity-100 transition-all"
          >
            SKIP INTRO
          </button>
        )}
      </div>

      {/* STAGE: SECOND VIDEO */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${stage === 'secondVideo' ? 'opacity-100 z-20' : 'opacity-0 z-0 pointer-events-none'}`}
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
      </div>

    </div>
  );
};

export default SplashScreen;
