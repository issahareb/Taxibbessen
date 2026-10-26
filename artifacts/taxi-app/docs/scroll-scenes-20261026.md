# TaxiBB scroll scenes, 26 October 2026

The two scenes below the hero are replaced with Higgsfield Seedance 2.5 footage: a cream Mercedes taxi on an evening city street, followed by arrival at an airport terminal. Both use the existing hero vehicle image as their visual reference. The hero assets, markup and mobile animation logic are unchanged.

## Sources and output

- City job: `1dcd6507-cbc0-406f-abde-213c854a6083`
- Airport job: `e8dcefa6-8758-496f-a1a0-c5aa8fecf0ae`
- Reference media: `2ef28be7-2656-4f01-9913-36fcd6e7658d`
- Generated master: 1440 x 1080, approximately 5 seconds, silent.
- Mobile: 120 WebP frames per scene, 540 x 960, 24 fps, quality 68. Center crop for the city; crop position 32% for the airport. Approximately 1.9 MB per complete sequence. The existing bounded decoder loads only a window around the playhead.
- Desktop: H.264, 1200 x 900, CRF 25, keyframe interval 6, faststart, no audio, separate WebP posters. Approximately 1.3 MB per clip.
- Versioned paths prevent cached old scenes from appearing after release.

Desktop now has its own city clip. Both background layers update opacity on desktop as well as mobile. Reduced-motion visitors receive still posters. Portrait frames are not requested by the desktop animation effect.

## Validation before publication

- All 240 WebP files decoded and dimensions verified.
- Both desktop MP4 files checked with ffprobe.
- TypeScript check passed after building the API client declarations.
- Existing frame-scrubber tests: 3 passed.
- Production compilation, prerendering of 20 routes, metadata and schema validation passed. In this runtime the tsx CLI cannot create its IPC socket; the same build stages ran with `node --import tsx` instead.
- Hero source segments compared byte-for-byte with the parent revision.
- Generated clips visually inspected at the start, middle and end.

## Registration correction

Higgsfield edits standardize foreground plates to E BB 203E. City edit: b2bc4e1f-4f19-46ee-a9a9-2759f9b3130a. Airport edit: 7088bcf5-8a8a-4424-ae04-073f6de4d01a. Desktop hero edit: e5d6f19f-e19b-493a-a0b1-4646b2e37d57. The first 0.85 seconds of the desktop hero edit were removed because the lettering had not yet stabilized; the matching poster uses the corrected start. The mobile hero sequence already has the correct plate and remains unchanged. The request panel now has a 62% opaque background, retaining the control contrast.
