const imageInput = document.getElementById('imageInput');
const uploadButton = document.getElementById('uploadButton');
const dropZone = document.getElementById('dropZone');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const aspectRatioToggle = document.getElementById('aspectRatioToggle');
const formatSelect = document.getElementById('formatSelect');
const qualityInput = document.getElementById('qualityInput');
const qualityValue = document.getElementById('qualityValue');
const resizeButton = document.getElementById('resizeButton');
const downloadButton = document.getElementById('downloadButton');
const previewCanvas = document.getElementById('previewCanvas');
const emptyState = document.getElementById('emptyState');
const imageMeta = document.getElementById('imageMeta');

let originalImage = null;
let originalWidth = 0;
let originalHeight = 0;
let currentBlob = null;

const ctx = previewCanvas.getContext('2d');

function setQualityLabel() {
  qualityValue.textContent = `${Math.round(Number(qualityInput.value) * 100)}%`;
}

function showPreview() {
  if (!originalImage) return;
  previewCanvas.style.display = 'block';
  emptyState.style.display = 'none';
}

function updateMeta(width, height, type, sizeKB) {
  imageMeta.textContent = `Output: ${width} x ${height} · ${type.replace('image/', '').toUpperCase()} · ${sizeKB} KB`;
}

function resetPreview() {
  previewCanvas.style.display = 'none';
  emptyState.style.display = 'block';
  imageMeta.textContent = '';
  downloadButton.disabled = true;
  currentBlob = null;
}

function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    alert('Please select a valid image file.');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      originalImage = image;
      originalWidth = image.naturalWidth;
      originalHeight = image.naturalHeight;
      widthInput.value = originalWidth;
      heightInput.value = originalHeight;
      resetPreview();
      showPreview();
      previewCanvas.width = originalWidth;
      previewCanvas.height = originalHeight;
      ctx.clearRect(0, 0, originalWidth, originalHeight);
      ctx.drawImage(originalImage, 0, 0);
      previewCanvas.style.display = 'block';
      imageMeta.textContent = `Original: ${originalWidth} x ${originalHeight}`;
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
}

uploadButton.addEventListener('click', () => imageInput.click());
imageInput.addEventListener('change', () => handleFile(imageInput.files[0]));

['dragenter', 'dragover'].forEach(eventName => {
  dropZone.addEventListener(eventName, event => {
    event.preventDefault();
    dropZone.classList.add('drag-over');
  });
});

['dragleave', 'dragend', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, event => {
    event.preventDefault();
    dropZone.classList.remove('drag-over');
  });
});

dropZone.addEventListener('drop', event => {
  const files = event.dataTransfer.files;
  if (files.length) {
    handleFile(files[0]);
  }
});

aspectRatioToggle.addEventListener('change', () => {
  if (!originalImage) return;
  if (aspectRatioToggle.checked) {
    const ratio = originalHeight / originalWidth;
    if (widthInput.value) {
      heightInput.value = Math.round(widthInput.value * ratio);
    }
  }
});

widthInput.addEventListener('input', () => {
  if (!originalImage || !aspectRatioToggle.checked) return;
  const width = Number(widthInput.value);
  if (!width || width <= 0) return;
  const ratio = originalHeight / originalWidth;
  heightInput.value = Math.max(1, Math.round(width * ratio));
});

heightInput.addEventListener('input', () => {
  if (!originalImage || !aspectRatioToggle.checked) return;
  const height = Number(heightInput.value);
  if (!height || height <= 0) return;
  const ratio = originalWidth / originalHeight;
  widthInput.value = Math.max(1, Math.round(height * ratio));
});

qualityInput.addEventListener('input', () => {
  setQualityLabel();
});

function resizeImage() {
  if (!originalImage) {
    alert('Upload an image first.');
    return;
  }

  const width = Number(widthInput.value);
  const height = Number(heightInput.value);
  if (!width || !height || width <= 0 || height <= 0) {
    alert('Please enter valid width and height values.');
    return;
  }

  const format = formatSelect.value;
  const quality = Number(qualityInput.value);

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = width;
  outputCanvas.height = height;
  const outputCtx = outputCanvas.getContext('2d');
  outputCtx.clearRect(0, 0, width, height);
  outputCtx.drawImage(originalImage, 0, 0, width, height);

  outputCanvas.toBlob(blob => {
    if (!blob) {
      alert('Could not resize the image.');
      return;
    }
    currentBlob = blob;
    const url = URL.createObjectURL(blob);
    previewCanvas.width = width;
    previewCanvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(outputCanvas, 0, 0);
    showPreview();
    downloadButton.disabled = false;
    const sizeKB = Math.round(blob.size / 1024);
    updateMeta(width, height, format, sizeKB);
    URL.revokeObjectURL(url);
  }, format, quality);
}

resizeButton.addEventListener('click', resizeImage);

downloadButton.addEventListener('click', () => {
  if (!currentBlob) return;
  const format = formatSelect.value;
  const extension = format === 'image/png' ? 'png' : format === 'image/jpeg' ? 'jpg' : 'webp';
  const link = document.createElement('a');
  link.href = URL.createObjectURL(currentBlob);
  link.download = `resized-image.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(link.href), 100);
});

setQualityLabel();
