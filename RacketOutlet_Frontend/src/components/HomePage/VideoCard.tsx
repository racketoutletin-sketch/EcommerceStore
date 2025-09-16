// src/components/HomepageVideos.tsx
import React, { useEffect, useRef, useState } from "react";
import Loader from "../Loader";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { fetchHomeData, selectVideos, selectHomeData } from "../../redux/features/home/homeSlice";

const HomepageVideos: React.FC = () => {
  const dispatch = useAppDispatch();

  // Redux state
  const videos = useAppSelector(selectVideos);
  const homeData = useAppSelector(selectHomeData);
  const loading = useAppSelector((state) => state.home.loading);

  // Local state for video refs and playing states
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [playingStates, setPlayingStates] = useState<{ [key: number]: boolean }>({});

  // Initialize playing states whenever videos change
  useEffect(() => {
    const initialState: { [key: number]: boolean } = {};
    videos.forEach((vid) => (initialState[vid.id] = true));
    setPlayingStates(initialState);
  }, [videos]);

  // Fetch home data only if Redux store is empty
  useEffect(() => {
    if (!homeData) {
      dispatch(fetchHomeData());
    }
  }, [dispatch, homeData]);

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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-6 h-6"
              >
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-6 h-6"
              >
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
