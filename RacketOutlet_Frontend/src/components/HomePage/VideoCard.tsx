import React, { useEffect, useState, useRef } from "react";
import api from "../../api/axios";

interface HomeVideo {
  id: number;
  video: string;
  video_url: string | null;
  created_at: string;
}

const VideoCard: React.FC = () => {
  const [videos, setVideos] = useState<HomeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [playingStates, setPlayingStates] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await api.get<{ results: HomeVideo[] }>("api/home-videos/");
        setVideos(res.data.results);
        // initialize all videos as playing
        const initialState: { [key: number]: boolean } = {};
        res.data.results.forEach((vid) => (initialState[vid.id] = true));
        setPlayingStates(initialState);
      } catch (err) {
        console.error("Error fetching videos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const handlePlayPause = (id: number, index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;

    if (video.paused) {
      video.play();
      setPlayingStates((prev) => ({ ...prev, [id]: true }));
    } else {
      video.pause();
      setPlayingStates((prev) => ({ ...prev, [id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col space-y-8">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="relative w-full h-screen bg-gray-800 animate-pulse rounded-xl"
          >
            <div className="absolute bottom-4 right-4 w-14 h-14 bg-gray-600 rounded-full"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      {videos.length > 0 ? (
        videos.map((vid, index) => (
          <div
            key={vid.id}
            className="relative w-full h-screen overflow-hidden bg-black group mb-16"
          >
            <video
              ref={(el) => {
  videoRefs.current[index] = el;
}}

              src={vid.video_url || vid.video}
              className="absolute top-1/2 left-1/2 min-w-full min-h-[150vh] w-auto h-auto object-cover transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-500 group-hover:scale-105"
              autoPlay
              muted
              loop
              playsInline
            />
            <button
              onClick={() => handlePlayPause(vid.id, index)}
              className="absolute bottom-4 right-4 bg-white text-black rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-gray-200 transition-opacity duration-300 opacity-70 group-hover:opacity-100"
            >
              {playingStates[vid.id] ? (
                // pause icon
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                // play icon
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                  <path d="M8 5v14l11-7L8 5z" />
                </svg>
              )}
            </button>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 py-10">No videos available</p>
      )}
    </div>
  );
};

export default VideoCard ;
