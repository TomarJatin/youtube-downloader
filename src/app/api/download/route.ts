import { NextRequest, NextResponse } from "next/server";
import { downloadVideo } from "@/utils/ytdlp";
import { uploadToS3 } from "@/utils/s3";
import path from "path";

export async function POST(request: NextRequest) {
    try {
        const { url, format } = await request.json();
        
        if (!url || !format) {
            return NextResponse.json({ 
                error: "URL and format are required" 
            }, { status: 400 });
        }

        // Create downloads directory in the project root
        const outputDir = path.join(process.cwd(), 'downloads');
        
        // Download the video locally
        const outputPath = await downloadVideo(url, format, outputDir);

        // Upload to S3 and get the public URL
        const videoUrl = await uploadToS3(outputPath);

        return NextResponse.json({
            success: true,
            videoUrl
        });
    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json({ 
            error: "Failed to download video",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
} 