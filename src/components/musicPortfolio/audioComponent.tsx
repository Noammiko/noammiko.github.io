"use client"

import { playing } from "./utils.ts"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Play, Pause, Volume2, Volume1, VolumeX, Rewind, FastForward } from "lucide-react"
import type { Song } from "./types"

interface AudioComponentProps {
}

export function AudioComponent({ }: AudioComponentProps) {
  const [playingCurrent, setPlayingCurrent] = useState<Song | null>(null)

  useEffect(() => {
    return playing.subscribe((value) => setPlayingCurrent(value))
  }, [])

  return (playingCurrent &&
    <AudioPlayer
      title={playingCurrent?.title ?? ""}
      src={playingCurrent?.file ?? ""}
      artist={playingCurrent?.client ?? ""}
      playOnStart={playingCurrent !== null}
      onClose={() => playing.set(null)}
    />
  )
}

interface AudioPlayerProps {
  src: string
  title: string
  artist: string
  playOnStart?: boolean
  onClose: () => void
}

export function AudioPlayer({ src, title, artist, playOnStart = false, onClose }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const abortController = new AbortController()
    const signal = abortController.signal

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      updatePositionState();
    }
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener("timeupdate", updateTime, { signal })
    // audio.addEventListener("loadedmetadata", updateDuration, { signal })
    audio.addEventListener("durationchange", updateDuration, { signal })
    audio.addEventListener("ended", handleEnded, { signal })


    return () => {
      abortController.abort()
    }
  }, [])

  function updatePositionState() {
    const audio = audioRef.current;
    if (!audio) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    navigator.mediaSession.setPositionState({
      duration: isNaN(duration) ? 0 : audio.duration,
      playbackRate: audio.playbackRate,
      position: audio.currentTime
    });
  }

  function stopPlayback() {
    if (audioRef.current) {
      audioRef.current.pause();
      handleSeek([0]);
      setIsPlaying(false);
      audioRef.current.src = '';
    }
    updatePositionState();

    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = "none";
      navigator.mediaSession.metadata = new MediaMetadata({
        title: '',
        artist: '',
        album: '',
        artwork: []
      });
      actionsAndHandlers.forEach(([action]) => navigator.mediaSession.setActionHandler(action, null));
    }
    onClose()
  }

  const actionsAndHandlers: Array<[MediaSessionAction, MediaSessionActionHandler | null]> = [
    ['play', () => {
      togglePlayPause();
      updatePositionState();
    }],
    ['pause', () => {
      togglePlayPause();
      updatePositionState();
    }],
    ['seekbackward', (details) => {
      if (audioRef.current) {
        audioRef.current.currentTime = Math.max(audioRef.current.currentTime - (details.seekOffset || 10), 0)
      }
      updatePositionState();
    }],
    ['seekforward', (details) => {
      if (audioRef.current) {
        audioRef.current.currentTime = Math.max(audioRef.current.currentTime + (details.seekOffset || 10), 0)
      }
      updatePositionState();
    }],
    ['seekto', (details) => {
      if (audioRef.current && details.fastSeek && 'fastSeek' in audioRef.current) {
        audioRef.current.fastSeek(details.seekTime);
        setCurrentTime(details.seekTime);
        updatePositionState();
        return;
      }
      handleSeek([details.seekTime]);
      updatePositionState();
    }],
    ['stop', () => {
      stopPlayback();
    }],
  ]

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title,
        artist: artist,
        album: "Miko Recording Studio",
        artwork: [
          { src: 'https://miko-recordingstudio.ca/logo/96.png', sizes: '96x96', type: 'image/png' },
          { src: 'https://miko-recordingstudio.ca/logo/128.png', sizes: '128x128', type: 'image/png' },
          { src: 'https://miko-recordingstudio.ca/logo/192.png', sizes: '192x192', type: 'image/png' },
          { src: 'https://miko-recordingstudio.ca/logo/256.png', sizes: '256x256', type: 'image/png' },
          { src: 'https://miko-recordingstudio.ca/logo/384.png', sizes: '384x384', type: 'image/png' },
          { src: 'https://miko-recordingstudio.ca/logo/500.png', sizes: '500x500', type: 'image/png' },
        ]
      });

      for (const [action, handler] of actionsAndHandlers) {
        try {
          navigator.mediaSession.setActionHandler(action, handler);
        } catch (error) {
          console.log(`The media session action, ${action}, is not supported`);
        }
      }
    }
  }, [isPlaying, src])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    setIsPlaying(playOnStart);
    setCurrentTime(0);
    setDuration(0);

    if (playOnStart) {
      audio.play()
    }
  }, [playOnStart, src]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (newVolume === 0) {
      setIsMuted(true)
    } else {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const seekForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, duration)
    }
  }

  const seekBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  return (
    <Card className="w-full md:max-w-md bg-black/30 backdrop-blur-md rounded-lg group border border-red-500/30 hover:border-red-500/50 transition">
      <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium truncate pr-2">{title}</CardTitle>
        <Button variant="ghost" size="icon" onClick={stopPlayback} className="h-8 w-8">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <audio ref={audioRef} src={src} />

        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleMute} className="h-8 w-8">
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : volume < 0.5 ? (
                  <Volume1 className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
                <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-20"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={seekBackward} className="h-9 w-9">
                <Rewind className="h-5 w-5" />
                <span className="sr-only">Rewind 10 seconds</span>
              </Button>

              <Button variant="default" size="icon" onClick={togglePlayPause} className="h-10 w-10 rounded-full">
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
              </Button>

              <Button variant="ghost" size="icon" onClick={seekForward} className="h-9 w-9">
                <FastForward className="h-5 w-5" />
                <span className="sr-only">Forward 10 seconds</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

