# Image Resizer Toolbox

A simple static website for resizing images in the browser.

## Files

- `index.html` — main page
- `styles.css` — layout and design
- `script.js` — resize logic, drag-and-drop support, download

## Usage

Open `index.html` in a browser, upload an image, set width and height, then click `Resize Image`.

## GitHub Actions

The workflow in `.github/workflows/ci.yml` opts into Node.js 24 for JavaScript actions by setting `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true`.
If you need to temporarily opt out after June 16, 2026, use `ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION=true` in your workflow.
