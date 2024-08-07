import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

const App = () => {
  const videoRef = useRef(null);
  const [qualities, setQualities] = useState([]);
  const [currentQuality, setCurrentQuality] = useState(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const hls = new Hls();
    hls.loadSource('https://s3.ap-south-1.amazonaws.com/s3.knileshh.com/t1Transcode/master.m3u8');
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
      const availableQualities = data.levels.map((level, index) => ({
        index,
        width: level.width,
        height: level.height,
        bitrate: level.bitrate
      }));
      setQualities(availableQualities);
      setCurrentQuality(hls.currentLevel);
    });

    hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
      setCurrentQuality(data.level);
    });

    return () => {
      hls.destroy();
    };
  }, []);

  const handleQualityChange = (event) => {
    const qualityIndex = parseInt(event.target.value, 10);
    if (videoRef.current && videoRef.current.hls) {
      videoRef.current.hls.currentLevel = qualityIndex;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <video 
        ref={videoRef} 
        controls 
        className="w-full rounded-lg shadow-lg"
      />
      <div className="mt-4">
        <label htmlFor="quality-select" className="block text-sm font-medium text-gray-700">
          Quality:
        </label>
        <select
          id="quality-select"
          value={currentQuality}
          onChange={handleQualityChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="-1">Auto</option>
          {qualities.map((quality) => (
            <option key={quality.index} value={quality.index}>
              {quality.height}p ({(quality.bitrate / 1000000).toFixed(2)} Mbps)
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default App;