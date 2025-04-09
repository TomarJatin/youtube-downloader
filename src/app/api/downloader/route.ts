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
        
        // Get the best format that has both video and audio
        const bestFormat = info.formats.find(format => 
            format.vcodec !== 'none' && format.acodec !== 'none'
        );

        if (!bestFormat) {
            return NextResponse.json({ 
                error: "No suitable format found" 
            }, { status: 400 });
        }

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