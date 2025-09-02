// src/components/HomepageVideos.tsx
import React, { useEffect, useState, useRef } from "react";
import Loader from "../Loader";

interface HomeVideo {
  id: number;
  video_url: string;
  thumbnail_url: string;
}

const CACHE_KEY = "HomepageVideos_data";
const CACHE_VERSION_KEY = "HomepageVideos_cache_version";

const HomepageVideos: React.FC = () => {
  const [videos, setVideos] = useState<HomeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [playingStates, setPlayingStates] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    // Step 1: Load cached immediately
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      try {
        const parsed: HomeVideo[] = JSON.parse(cachedData);
        setVideos(parsed);
        // initialize all videos as playing
        const initialState: { [key: number]: boolean } = {};
        parsed.forEach((vid) => (initialState[vid.id] = true));
        setPlayingStates(initialState);
        setLoading(false);
      } catch {
        console.warn("Corrupt cache, ignoring...");
      }
    }

    // Step 2: Always fetch fresh version in background
    const fetchVideos = async () => {
      try {
        const res = await fetch(
          "https://wzonllfccvmvoftahudd.supabase.co/functions/v1/get-homepage-video"
        );
        if (!res.ok) throw new Error(`API Error: ${res.status}`);

        const data = await res.json();
        const newVersion = data.version ?? 1;
        const oldVersion = Number(localStorage.getItem(CACHE_VERSION_KEY));

        if (newVersion !== oldVersion) {
          const freshData: HomeVideo[] = data.videos || [];
          localStorage.setItem(CACHE_KEY, JSON.stringify(freshData));
          localStorage.setItem(CACHE_VERSION_KEY, newVersion.toString());
          setVideos(freshData);

          // initialize all videos as playing
          const initialState: { [key: number]: boolean } = {};
          freshData.forEach((vid) => (initialState[vid.id] = true));
          setPlayingStates(initialState);
        }
      } catch (err) {
        console.error("Error fetching homepage videos:", err);
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

  if (loading) return <Loader />;
  if (videos.length === 0)
    return <p className="text-center py-16">No videos available.</p>;

  return (
    <div className="w-full">
      {videos.map((vid, index) => (
        <div
          key={vid.id}
          className="relative w-full h-screen overflow-hidden bg-black group mb-16"
        >
          <video
            ref={(el) => {
              videoRefs.current[index] = el;
            }}
            src={vid.video_url}
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
      ))}
    </div>
  );
};

export default HomepageVideos;
