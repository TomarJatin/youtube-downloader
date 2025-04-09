"use client";

import axios from "axios";
import { useState, ChangeEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { Loader2, Download } from "lucide-react";

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: number;
  format: {
    format_id: string;
    ext: string;
    resolution: string;
    filesize: number;
    format_note: string;
  };
}

export default function Home() {
  const [videoLink, setVideoLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleProcessVideo = async () => {
    if (!videoLink) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/downloader?url=${encodeURIComponent(videoLink)}`);
      setVideoInfo(response.data);
      toast.success("Video processed successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to process video. Please check the URL and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!videoInfo || !videoLink) return;
    
    setIsDownloading(true);
    try {
      const response = await axios.post('/api/download', {
        url: videoLink,
        format: videoInfo.format.format_id
      });
      
      // Create a temporary link to trigger the download
      const link = document.createElement('a');
      link.href = `/downloads/${response.data.filePath.split('/').pop()}`;
      link.download = '';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Download started!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download video. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setVideoLink(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <Toaster position="top-center" />
      
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            YouTube Video Downloader
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Download your favorite YouTube videos in high quality
          </p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Enter Video URL</CardTitle>
            <CardDescription>
              Paste the YouTube video URL below to start downloading
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoLink}
                onChange={handleInputChange}
                className="flex-1"
              />
              <Button 
                onClick={handleProcessVideo} 
                disabled={!videoLink || isLoading}
                className="w-full md:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Process Video
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {videoInfo && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Video Ready</CardTitle>
              <CardDescription>Your video is ready to download</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="aspect-video relative rounded-lg overflow-hidden">
                  <img
                    src={videoInfo.thumbnail}
                    alt={videoInfo.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="text-lg font-semibold">{videoInfo.title}</h3>
                <div className="text-sm text-gray-500">
                  <p>Format: {videoInfo.format.format_note}</p>
                  <p>Resolution: {videoInfo.format.resolution}</p>
                  <p>Duration: {Math.floor(videoInfo.duration / 60)}:{(videoInfo.duration % 60).toString().padStart(2, '0')}</p>
                </div>
                <Button 
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download Video
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
