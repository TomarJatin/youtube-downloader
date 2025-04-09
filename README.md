# YouTube Video Downloader

A modern web application that allows users to download YouTube videos in high quality. Built with Next.js, TypeScript, and AWS S3 for video storage.

## Features

- 🎥 Download YouTube videos in high quality
- 🚀 Fast and efficient downloads using yt-dlp
- ☁️ Cloud storage using AWS S3
- 🎨 Modern and responsive UI
- 🔒 Secure video handling
- 📱 Works on all devices

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) (for video downloading)
- AWS Account with S3 bucket (for video storage)

### Installing yt-dlp

#### macOS
```bash
# Using Homebrew
brew install yt-dlp

# Using pip
pip install yt-dlp
```

#### Linux
```bash
# Using apt (Ubuntu/Debian)
sudo apt update
sudo apt install yt-dlp

# Using pip
pip install yt-dlp
```

#### Windows
```bash
# Using pip
pip install yt-dlp

# Using Chocolatey
choco install yt-dlp
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/youtube-downloader.git
cd youtube-downloader
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your AWS credentials:
```env
AWS_ACCESS_KEY_ID="your_access_key"
AWS_SECRET_ACCESS_KEY="your_secret_key"
AWS_REGION="your_region"
AWS_BUCKET_NAME="your_bucket_name"
```

4. Create a downloads directory:
```bash
mkdir downloads
```

5. Add the downloads directory to `.gitignore`:
```bash
echo "downloads/" >> .gitignore
```

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

1. **Video Processing**:
   - User enters a YouTube URL
   - Backend fetches video information using yt-dlp
   - System determines the best quality format available

2. **Download Process**:
   - Video is downloaded locally using yt-dlp
   - File is uploaded to AWS S3
   - Local file is automatically deleted after successful upload
   - Public S3 URL is returned to the user

3. **User Interface**:
   - Clean and intuitive design
   - Real-time progress feedback
   - Direct video playback
   - Download option for saved videos

## Project Structure

```
youtube-downloader/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── downloader/
│   │   │   │   └── route.ts    # Video info endpoint
│   │   │   └── download/
│   │   │       └── route.ts    # Download endpoint
│   │   └── page.tsx            # Main UI
│   └── utils/
│       ├── ytdlp.ts           # YouTube download utilities
│       └── s3.ts              # AWS S3 utilities
├── downloads/                  # Temporary download directory
├── .env                       # Environment variables
└── package.json
```

## Security Considerations

- AWS credentials are stored securely in environment variables
- Local files are automatically cleaned up after upload
- S3 bucket should be configured with appropriate CORS settings
- Public access should be restricted to specific video files only

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) for the video downloading functionality
- [Next.js](https://nextjs.org/) for the web framework
- [AWS S3](https://aws.amazon.com/s3/) for cloud storage
- [Tailwind CSS](https://tailwindcss.com/) for styling
