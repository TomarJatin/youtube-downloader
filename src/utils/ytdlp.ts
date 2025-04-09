/* eslint-disable @typescript-eslint/no-explicit-any */
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

interface VideoInfo {
    title: string;
    duration: number;
    thumbnail: string;
    formats: Array<{
        format_id: string;
        ext: string;
        resolution: string;
        filesize: number;
        format_note: string;
        vcodec: string;
        acodec: string;
        height?: number;
        width?: number;
        fps?: number;
        tbr?: number; // Total bitrate
        vbr?: number; // Video bitrate
        abr?: number; // Audio bitrate
        asr?: number; // Audio sample rate
    }>;
}

export async function getVideoInfo(url: string): Promise<VideoInfo> {
    try {
        // Get video info in JSON format with more details
        const { stdout } = await execAsync(`yt-dlp -j --dump-json "${url}"`);
        const info = JSON.parse(stdout);
        
        // Process formats to extract more information
        const processedFormats = info.formats.map((format: any) => {
            // Extract height and width from resolution string if available
            let height, width;
            if (format.resolution && format.resolution !== 'audio only') {
                const match = format.resolution.match(/(\d+)x(\d+)/);
                if (match) {
                    width = parseInt(match[1]);
                    height = parseInt(match[2]);
                } else {
                    // Try to extract just height from formats like "1080p"
                    const heightMatch = format.resolution.match(/(\d+)p/);
                    if (heightMatch) {
                        height = parseInt(heightMatch[1]);
                        // Approximate width based on 16:9 aspect ratio
                        width = Math.round(height * 16 / 9);
                    }
                }
            }
            
            return {
                format_id: format.format_id,
                ext: format.ext,
                resolution: format.resolution,
                filesize: format.filesize,
                format_note: format.format_note,
                vcodec: format.vcodec,
                acodec: format.acodec,
                height,
                width,
                fps: format.fps,
                tbr: format.tbr,
                vbr: format.vbr,
                abr: format.abr,
                asr: format.asr
            };
        });
        
        return {
            title: info.title,
            duration: info.duration,
            thumbnail: info.thumbnail,
            formats: processedFormats
        };
    } catch (error) {
        console.error('Error getting video info:', error);
        throw error;
    }
}

export async function downloadVideo(url: string, format: string, outputDir: string): Promise<string> {
    try {
        // Create output directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Change to the output directory
        process.chdir(outputDir);

        // Download video with specified format and best quality options
        const command = format 
            ? `yt-dlp -f "${format}" --merge-output-format mp4 "${url}"`
            : `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" --merge-output-format mp4 "${url}"`;
            
        const { stdout } = await execAsync(command);

        // Get the list of files in the directory
        const files = fs.readdirSync(outputDir);
        
        // Find the most recently created file
        const latestFile = files
            .map(file => ({
                name: file,
                time: fs.statSync(path.join(outputDir, file)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time)[0];

        if (!latestFile) {
            throw new Error('No file was downloaded');
        }

        return path.join(outputDir, latestFile.name);
    } catch (error) {
        console.error('Error downloading video:', error);
        throw error;
    }
} 