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
    }>;
}

export async function getVideoInfo(url: string): Promise<VideoInfo> {
    try {
        // Get video info in JSON format
        const { stdout } = await execAsync(`yt-dlp -j "${url}"`);
        const info = JSON.parse(stdout);
        
        return {
            title: info.title,
            duration: info.duration,
            thumbnail: info.thumbnail,
            formats: info.formats.map((format: any) => ({
                format_id: format.format_id,
                ext: format.ext,
                resolution: format.resolution,
                filesize: format.filesize,
                format_note: format.format_note,
                vcodec: format.vcodec,
                acodec: format.acodec
            }))
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

        // Download video with specified format
        const command = format 
            ? `yt-dlp -f "${format}" "${url}"`
            : `yt-dlp "${url}"`;
            
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