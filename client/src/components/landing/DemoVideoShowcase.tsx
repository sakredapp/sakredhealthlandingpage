import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useRef, useCallback, useEffect } from "react";
import type { DemoVideo } from "@shared/schema";

interface DemoVideoShowcaseProps {
  videos: DemoVideo[];
  isLoading?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getOrCreateSessionId(): string {
  const storageKey = 'video_analytics_session';
  let sessionId = sessionStorage.getItem(storageKey);
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(storageKey, sessionId);
  }
  return sessionId;
}

async function trackVideoEvent(
  videoId: string,
  eventType: string,
  watchTime?: number,
  progressPercent?: number
) {
  try {
    const sessionId = getOrCreateSessionId();
    await fetch('/api/video-analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoId,
        eventType,
        sessionId,
        watchTime: watchTime ? Math.floor(watchTime) : 0,
        progressPercent: progressPercent ? Math.floor(progressPercent) : 0,
      }),
    });
  } catch (error) {
    console.error('Failed to track video event:', error);
  }
}

interface VideoPlayerProps {
  video: DemoVideo;
}

function VideoPlayer({ video }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastProgressRef = useRef(0);
  const trackedMilestonesRef = useRef<Set<number>>(new Set());

  const resetMilestones = useCallback(() => {
    lastProgressRef.current = 0;
    trackedMilestonesRef.current.clear();
  }, []);

  const handlePlay = useCallback(() => {
    const videoEl = videoRef.current;
    const currentTime = videoEl?.currentTime || 0;
    trackVideoEvent(video.id, 'play', currentTime, 0);
  }, [video.id]);

  const handlePause = useCallback(() => {
    const videoEl = videoRef.current;
    if (videoEl && !videoEl.ended) {
      const watchTime = videoEl.currentTime;
      const progressPercent = videoEl.duration ? (watchTime / videoEl.duration) * 100 : 0;
      trackVideoEvent(video.id, 'pause', watchTime, progressPercent);
    }
  }, [video.id]);

  const handleEnded = useCallback(() => {
    const videoEl = videoRef.current;
    if (videoEl) {
      trackVideoEvent(video.id, 'complete', videoEl.duration, 100);
    }
    resetMilestones();
  }, [video.id, resetMilestones]);

  const handleSeeked = useCallback(() => {
    const videoEl = videoRef.current;
    if (videoEl && videoEl.duration) {
      const currentProgress = (videoEl.currentTime / videoEl.duration) * 100;
      trackVideoEvent(video.id, 'seek', videoEl.currentTime, currentProgress);
      
      if (currentProgress < lastProgressRef.current) {
        const milestonesToReset = [25, 50, 75].filter(m => m > currentProgress);
        milestonesToReset.forEach(m => trackedMilestonesRef.current.delete(m));
      }
      lastProgressRef.current = currentProgress;
    }
  }, [video.id]);

  const handleTimeUpdate = useCallback(() => {
    const videoEl = videoRef.current;
    if (videoEl && videoEl.duration) {
      const progressPercent = (videoEl.currentTime / videoEl.duration) * 100;
      const progressMilestones = [25, 50, 75];
      
      for (const milestone of progressMilestones) {
        if (progressPercent >= milestone && !trackedMilestonesRef.current.has(milestone)) {
          trackVideoEvent(video.id, 'progress', videoEl.currentTime, milestone);
          trackedMilestonesRef.current.add(milestone);
        }
      }
      lastProgressRef.current = progressPercent;
    }
  }, [video.id]);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    videoEl.addEventListener('play', handlePlay);
    videoEl.addEventListener('pause', handlePause);
    videoEl.addEventListener('ended', handleEnded);
    videoEl.addEventListener('seeked', handleSeeked);
    videoEl.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      videoEl.removeEventListener('play', handlePlay);
      videoEl.removeEventListener('pause', handlePause);
      videoEl.removeEventListener('ended', handleEnded);
      videoEl.removeEventListener('seeked', handleSeeked);
      videoEl.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [handlePlay, handlePause, handleEnded, handleSeeked, handleTimeUpdate]);

  return (
    <video
      ref={videoRef}
      src={video.videoUrl}
      poster={video.thumbnailUrl || undefined}
      controls
      className="w-full h-full object-cover"
      data-testid={`video-demo-${video.id}`}
    >
      Your browser does not support the video tag.
    </video>
  );
}

export function DemoVideoShowcase({ videos, isLoading }: DemoVideoShowcaseProps) {
  if (isLoading) {
    return (
      <section className="py-20 lg:py-32 bg-[#F9F9F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-10 w-64 bg-stone-200 rounded-lg mx-auto mb-4 animate-pulse" />
            <div className="h-6 w-96 bg-stone-200 rounded-lg mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="aspect-video bg-stone-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <section className="py-20 lg:py-32 bg-[#F9F9F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="w-12 h-1 bg-gradient-to-r from-[#C5A059] to-[#EBD598] mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-display font-normal text-[#0F172A] mb-4">
              See Sakred Health{" "}
              <span className="bg-gradient-to-r from-[#C5A059] to-[#EBD598] bg-clip-text text-transparent">
                In Action
              </span>
            </h2>
            <p className="text-lg text-[#0F172A]/70 max-w-2xl mx-auto">
              Watch how our app transforms daily wellness routines
            </p>
          </motion.div>

          <Card className="bg-white rounded-2xl p-12 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border-0">
            <div className="text-center">
              <h3 className="text-xl font-display font-normal text-[#0F172A] mb-2">Demo Videos Coming Soon</h3>
              <p className="text-[#0F172A]/70">We're preparing inspiring demos to showcase the Sakred Health experience.</p>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 lg:py-32 bg-[#F9F9F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="w-12 h-1 bg-gradient-to-r from-[#C5A059] to-[#EBD598] mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-display font-normal text-[#0F172A] mb-4">
            See Sakred Health{" "}
            <span className="bg-gradient-to-r from-[#C5A059] to-[#EBD598] bg-clip-text text-transparent">
              In Action
            </span>
          </h2>
          <p className="text-lg text-[#0F172A]/70 max-w-2xl mx-auto">
            Watch how our app transforms daily wellness routines
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {videos.map((video) => (
            <motion.div key={video.id} variants={itemVariants}>
              <Card className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_-4px_rgba(197,160,89,0.25)] transition-all duration-300 border-0">
                <div className="aspect-video relative bg-stone-100">
                  {video.videoUrl ? (
                    <VideoPlayer video={video} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#C5A059]/10 to-[#EBD598]/20">
                      <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
                        <span className="text-[#C5A059] text-2xl font-bold ml-1">▶</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-display font-normal text-[#0F172A] mb-2" data-testid={`text-video-title-${video.id}`}>
                    {video.title}
                  </h3>
                  <p className="text-[#0F172A]/70 text-sm leading-relaxed" data-testid={`text-video-desc-${video.id}`}>
                    {video.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
