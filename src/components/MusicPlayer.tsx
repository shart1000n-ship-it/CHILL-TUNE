import React, { useState, useRef, useEffect } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration?: number;
}

interface MusicPlayerProps {
  track?: Track;
  autoPlay?: boolean;
  showControls?: boolean;
  className?: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ 
  track, 
  autoPlay = false, 
  showControls = true,
  className = '' 
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    // Auto-play if enabled
    if (autoPlay) {
      audio.play().then(() => setIsPlaying(true)).catch(console.error);
    }

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [track, autoPlay]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = (parseFloat(e.target.value) / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!track) {
    return (
      <div className={`bg-white/10 backdrop-blur-md rounded-lg p-4 ${className}`}>
        <div className="text-center text-white/60">
          <span className="text-2xl mb-2 block">🎵</span>
          <p className="text-sm">No music selected</p>
          <p className="text-xs mt-1">Add a song to your profile!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-md rounded-lg p-4 border border-white/20 ${className}`}>
      <audio ref={audioRef} src={track.url} preload="metadata" />
      
      {/* Track Info */}
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-xl">🎵</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium truncate">{track.title}</h4>
          <p className="text-white/60 text-sm truncate">{track.artist}</p>
        </div>
        <div className="text-white/60 text-xs">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {showControls && (
        <>
          {/* Progress Bar */}
          <div className="mb-3">
            <input
              type="range"
              min="0"
              max="100"
              value={progressPercentage}
              onChange={handleSeek}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer progress-bar"
              style={{
                background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${progressPercentage}%, rgba(255,255,255,0.2) ${progressPercentage}%, rgba(255,255,255,0.2) 100%)`
              }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={togglePlay}
                className="w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center transition-colors"
              >
                <span className="text-white text-lg">
                  {isPlaying ? '⏸️' : '▶️'}
                </span>
              </button>
              
              <button
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    setCurrentTime(0);
                  }
                }}
                className="text-white/60 hover:text-white transition-colors"
                title="Restart"
              >
                ⏮️
              </button>
            </div>

            {/* Volume Control */}
            <div className="relative">
              <button
                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                className="text-white/60 hover:text-white transition-colors"
                title="Volume"
              >
                {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
              </button>
              
              {showVolumeSlider && (
                <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg p-2 border border-white/20">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-20 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Auto-play Notice */}
      {autoPlay && (
        <div className="mt-2 text-center">
          <span className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded-full">
            🎶 Auto-playing
          </span>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
