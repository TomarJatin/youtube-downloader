import { NextRequest, NextResponse } from "next/server";
import { getVideoInfo } from "@/utils/ytdlp";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get("url");
        
        if (!url) {
            return NextResponse.json({ error: "No URL provided" }, { status: 400 });
        }

        const info = await getVideoInfo(url);
        
        // Get formats with both video and audio
        const formatsWithAudioVideo = info.formats.filter(format => 
            format.vcodec !== 'none' && format.acodec !== 'none'
        );
        console.log("formatsWithAudioVideo", formatsWithAudioVideo);

        if (formatsWithAudioVideo.length === 0) {
            return NextResponse.json({ 
                error: "No suitable format found with both video and audio" 
            }, { status: 400 });
        }

        // Sort formats by resolution (highest first)
        // Extract resolution numbers for comparison
        const sortedFormats = formatsWithAudioVideo.sort((a, b) => {
            // Extract height from resolution (e.g., "1080p" -> 1080)
            const getHeight = (resolution: string) => {
                const match = resolution.match(/(\d+)p/);
                return match ? parseInt(match[1]) : 0;
            };
            
            const heightA = getHeight(a.resolution);
            const heightB = getHeight(b.resolution);
            
            // If resolutions are equal, prefer formats with higher filesize (better quality)
            if (heightA === heightB) {
                return (b.filesize || 0) - (a.filesize || 0);
            }
            
            return heightB - heightA;
        });

        // Get the best format (highest resolution with both audio and video)
        const bestFormat = sortedFormats[0];

        return NextResponse.json({
            format: {
                format_id: bestFormat.format_id,
                ext: bestFormat.ext,
                resolution: bestFormat.resolution,
                filesize: bestFormat.filesize,
                format_note: bestFormat.format_note
            },
            videoDetails: {
                title: info.title,
                thumbnail: info.thumbnail,
                duration: info.duration
            }
        });
    } catch (error) {
        console.error('YouTube download error:', error);
        return NextResponse.json({ 
            error: "Failed to process video",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}