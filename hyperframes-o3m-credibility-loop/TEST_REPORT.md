# Test report: O3M credibility loop (desktop and mobile)

Tested 29 Oct 2026 on Windows 10, HyperFrames CLI 0.8.151, Chrome (hardware GPU), ffmpeg/ffprobe.

## 1. Composition checks (`npx hyperframes check`)
| Project | Result |
|---|---|
| desktop | Passed: 0 errors, 0 runtime warnings. 2 lint warnings remain: `nested_structure_needs_subcomposition` (all layers sit in one timed `#stage`) and `negative_z_index` (the fact halos use `z-index:-1` inside an isolated parent). Neither affects the render. |
| mobile | Same result |

## 2. Rendered file metadata (`ffprobe` on the delivered MP4s)
| File | Codec | Size | FPS | Frames | Duration | Pixel format | Audio | Fast-start |
|---|---|---|---|---|---|---|---|---|
| O3M_Credibility_Kinetic_Loop_10s.mp4 | H.264 High | 1920×240 | 30 | 300 | 10.000 s | yuv420p | none | yes (moov before mdat) |
| O3M_Credibility_Kinetic_Loop_Mobile_1080x540_10s.mp4 | H.264 High | 1080×540 | 30 | 300 | 10.000 s | yuv420p | none | yes |

## 3. Frames inspected in the rendered MP4s
For both files, frames were extracted at 0.0, 1.5, 3.5, 5.5, 7.5, 9.0 and 9.95 s, with the final frame (299) taken separately. Mid-phase frames were also checked in the Studio snapshots at 0.8, 2.4, 4.3, 6.3, 8.2 and 9.5 s. Results:
- All five statements are on screen and readable in every frame, with exact wording.
- There are no "Needs O3M approval" labels, yellow panels, dashed pills, Google logo, charts or values.
- Each phase shows its emphasis:
  - **0.8 s:** "2010" gradient wipe and lift.
  - **2.4 s:** "Boonze Media Solutions," wipe and underline.
  - **4.3 s:** pin settles, route traces, "Chennai & Coimbatore" wipe, landmark depth and lit windows.
  - **6.3 s:** seal draws on, ring opens, "Premier Partner" wipe.
  - **8.2 s:** account windows lift in sequence, nodes light, "10,000+" wipe, small yellow glint.
- Ribbons stay in the open bands and cross only behind the landmark. An automated probe found no ribbon passing through text.
- The phone version has no clipping. The landmark sits in the middle row, clear of "10,000+".

## 4. Loop seam
| Measure (mean absolute pixel difference, 0–255) | Desktop | Mobile |
|---|---|---|
| Lossless Studio frames: last frame (9.967 s) → first frame (0 s) | 0.254 | 0.123 |
| Lossless Studio frames: an ordinary step (0 → 1/30 s) | 0.239 | 0.132 |
| Lossless Studio frames: an ordinary step (5 → 5 + 1/30 s) | 0.461 | 0.378 |
| Delivered MP4: frame 299 → frame 0 | 1.46 | 1.19 |
| Delivered MP4: ordinary step | 0.20–0.71 | 0.13–0.57 |

The animation is seamless. In lossless frames, the step from the last frame back to the first is the same size as an ordinary one-frame step.
**Residual difference, reported honestly:** in the MP4, frame 0 is the encoder's keyframe. It is compressed slightly differently from the frames before it, which adds a faint edge-level difference (about 1/200 of full brightness) at the wrap. A CRF 12 test encode gave 1.29, so it isn't worth doubling the file size. At normal viewing it shouldn't be perceptible.

## 5. Issues found and fixed during testing
1. Ribbon geometry was measured once, before the web font loaded, so it could differ between render workers. It is now measured from the live layout on every frame.
2. A Studio edit added a 3D tilt to the ribbon layer, which made the ribbons cross the text. It was removed with the user's approval.
3. The landmark glow painted over the illustration during the Offices phase. It now sits behind it.
4. The phone landmark was undersized, then too close to "10,000+". It is now resized and positioned clear of that text.

## 6. Website
No website files were changed by this task. `git status` shows only the earlier, separate strip work, which was already uncommitted before this task began, plus this new folder.

## Not verified
- Playback in a website `<video>` element: integration is a separate step.
- Appearance on physical phone screens.
