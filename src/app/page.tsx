"use client";

import axios from "axios";
import { useState, ChangeEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { Loader2, Download } from "lucide-react";

export default function Home() {
  const [videoLink, setVideoLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!videoLink) return;
    
    setIsLoading(true);
    try {
      // First get video info to determine the best format
      const infoResponse = await axios.get(`/api/downloader?url=${encodeURIComponent(videoLink)}`);
      const format = infoResponse.data.format.format_id;

      // Then download and upload to S3
      const downloadResponse = await axios.post('/api/download', {
        url: videoLink,
        format
      });

      setVideoUrl(downloadResponse.data.videoUrl);
      toast.success("Video processed successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to process video. Please check the URL and try again.");
    } finally {
      setIsLoading(false);
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
                onClick={handleDownload} 
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
                    Download
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {videoUrl && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Video Ready</CardTitle>
              <CardDescription>Your video is ready to watch</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <video 
                  src={videoUrl} 
                  controls 
                  className="w-full rounded-lg"
                />
                <Button 
                  asChild 
                  className="w-full"
                >
                  <a href={videoUrl} download target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Download Video
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
