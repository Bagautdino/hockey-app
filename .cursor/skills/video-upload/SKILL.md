# Video Upload Skill

## Description
Handles video upload, validation, storage, and thumbnail generation
for hockey player technique analysis.

## Instructions
1. Validate before upload: size ≤ 500MB, format in [mp4, mov, avi]
2. Generate thumbnail via ffmpeg at 1-second mark
3. Store original in `s3://hockey-videos/raw/{player_id}/{uuid}.mp4`
4. Store thumbnail in `s3://hockey-videos/thumbs/{player_id}/{uuid}.jpg`
5. Return presigned URL valid for 1 hour for playback
6. Use background tasks for processing, never block the request
7. Update player profile status: pending → processing → ready

## Examples
- Upload endpoint: POST /api/v1/players/{id}/videos
- Thumbnail endpoint: GET /api/v1/players/{id}/videos/{vid_id}/thumb