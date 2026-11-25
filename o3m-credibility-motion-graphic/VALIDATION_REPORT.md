# Validation report: o3m_credibility_strip.mp4

Checked 29 Oct 2026 on Windows 10 with HyperFrames 0.8.151, Chrome (hardware GPU) and ffmpeg/ffprobe.

## Output metadata (ffprobe on the rendered file)
| Property | Value |
|---|---|
| Streams | 1 (video only; **no audio stream**) |
| Codec | H.264, High profile, yuv420p |
| Resolution | 1920 × 320 |
| Frame rate | 30 fps, 300 frames |
| Duration | 10.000 s |
| Size | 1.67 MB |
| Fast-start | Yes (moov atom before mdat) |

## Checklist
| Check | Result | How it was checked |
|---|---|---|
| Five statements exact | Pass | Text read back from the composition DOM, then compared with the brief character by character: 5 of 5 identical |
| All five visible for the full 10 s | Pass | Frames from the rendered MP4 at 0, 1, 3, 5, 7, 9 s and the last frame (299), all inspected |
| Sharp, readable, unclipped | Pass | Every column sits inside 1920 × 320. Plus Jakarta Sans confirmed loaded (`document.fonts.check`). Frames inspected at full size |
| No icons, logos, badges, charts, arrows or extra claims | Pass | Source contains only text, ribbons and gradients; confirmed in the inspected frames |
| O3M colours; yellow restrained | Pass | #2563EB, #16A34A, a teal accent, and #EAB308 only as one small spark (8.6–9.75 s) |
| Shallow banner, no excess padding | Pass | Text band y 99–221; ribbons fill the bands above and below; no empty margins |
| Camera and layout fixed | Pass | No transforms on the layout; columns at identical positions in every frame |
| No moving element crosses text | Pass | Top ribbons max y ≈ 51 (+7 px breathing), bottom ribbons min y ≈ 264 (−7 px), text band 99–221 |
| No watermark, glitch or audio | Pass | Frames inspected; ffprobe shows a single video stream |
| Loop seam | Pass (see below) | Lossless frames compared across the wrap; MP4 frames compared |
| MP4 opened and inspected after rendering | Pass | Frames decoded from the MP4 with ffmpeg and viewed |

## Loop seam
| Mean absolute pixel difference (0–255) | Value |
|---|---|
| Lossless frames: last (9.967 s) → first (0 s) | **0.191** |
| Lossless frames: ordinary step 0 → 1/30 s | 0.210 |
| Lossless frames: ordinary step 5 → 5 + 1/30 s | 0.236 |
| MP4: frame 299 → frame 0 | 1.17 |
| MP4: ordinary steps | 0.29–0.44 |

At the animation level the wrap is smaller than an ordinary frame step, so it is seamless. In the MP4, frame 0 is the encoder's keyframe and is compressed a little differently from the frame before it. That leaves a faint edge-level difference of about 1/200 of full brightness, which shouldn't be noticeable in playback.

## Defects found and fixed during the build
- The underline under "Boonze Media Solutions," touched "est. 2005", and the "10,000+" underline sat too close to "Google Ads accounts". Spacing was added and the video re-rendered.

## References
- **Opened:** `O3M Credibility Strip Animation Pack-2.png`, `Boonze Media Animation Design Kit-3.png`, `REFERENCE_full_storyboard.png`, `REFERENCE_final_strip_crop.png`, a frame from each of `O3M_Credibility_Strip_Reference_Matched_10s.mp4`, `O3M_Credibility_Loop_Refined.mp4` and `O3M_Credibility_Strip_Storyboard_Match_10s.mp4`, and the earlier Gemini video `WhatsApp Video 2026-10-29 at 12.59.03 PM.mp4`, inspected frame by frame.
- **Not found on this machine:** `O3M_Chennai_Heritage_Landmark_Cutout.png`, `O3M_Credibility_Strip_Brand_Motion_Prompt.md`, `O3M_Trust_Strip_Motion_Only.md`, `O3M_Credibility_Strip_Storyboard_Match_README.md`, `O3M_Credibility_Loop_Refined_README.md`. The `/mnt/data` path doesn't exist here.
- **Web inspiration links:** not opened, because they were optional.

## Not verified
- Playback inside the website: integration is a separate step.
- Appearance on physical displays other than this machine.
