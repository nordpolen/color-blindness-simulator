// Full app.js content for Color Blindness Simulator

const filters = {
  protanopia: {
    matrix: [[0.567, 0.433, 0], [0.558, 0.442, 0], [0, 0.242, 0.758]],
    description: "Protanopia simulates red-blindness. Difficulty distinguishing red and green hues."
  },
  protanomaly: {
    matrix: [[0.817, 0.183, 0], [0.333, 0.667, 0], [0, 0.125, 0.875]],
    description: "Protanomaly simulates weak red perception. Less severe than protanopia."
  },
  deuteranopia: {
    matrix: [[0.625, 0.375, 0], [0.7, 0.3, 0], [0, 0.3, 0.7]],
    description: "Deuteranopia simulates green-blindness. Difficulty distinguishing red and green hues."
  },
  deuteranomaly: {
    matrix: [[0.8, 0.2, 0], [0.258, 0.742, 0], [0, 0.142, 0.858]],
    description: "Deuteranomaly simulates weak green perception. Most common type of color blindness."
  },
  tritanopia: {
    matrix: [[0.95, 0.05, 0], [0, 0.433, 0.567], [0, 0.475, 0.525]],
    description: "Tritanopia simulates blue-blindness. Affects blue-yellow perception."
  },
  tritanomaly: {
    matrix: [[0.967, 0.033, 0], [0, 0.733, 0.267], [0, 0.183, 0.817]],
    description: "Tritanomaly simulates weak blue perception. Rare form of color blindness."
  },
  achromatopsia: {
    matrix: [[0.299, 0.587, 0.114], [0.299, 0.587, 0.114], [0.299, 0.587, 0.114]],
    description: "Achromatopsia simulates total color blindness. All colors appear grayscale."
  }
};

const elements = {
  imageInput: document.getElementById("imageInput"),
  dropZone: document.getElementById("dropZone"),
  canvas: document.getElementById("canvas"),
  originalCanvas: document.getElementById("originalCanvas"),
  filterSelect: document.getElementById("filterSelect"),
  downloadBtn: document.getElementById("downloadBtn"),
  resetBtn: document.getElementById("resetBtn"),
  description: document.getElementById("description"),
  modal: document.getElementById("modal"),
  modalCanvas: document.getElementById("modalCanvas"),
  modalClose: document.querySelector(".modal-close"),
  loading: document.getElementById("loading"),
  originalPlaceholder: document.getElementById("originalPlaceholder"),
  simulatedPlaceholder: document.getElementById("simulatedPlaceholder")
};

const ctx = elements.canvas.getContext("2d");
const ctxOriginal = elements.originalCanvas.getContext("2d");
const modalCtx = elements.modalCanvas.getContext("2d");
let image = new Image();

function isValidImageFile(file) {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024;
  if (!validTypes.includes(file.type)) throw new Error('Please upload a valid image file (JPG, PNG, or GIF)');
  if (file.size > maxSize) throw new Error('Image size should be less than 5MB');
  return true;
}

function showLoading() { elements.loading.classList.remove('hidden'); }
function hideLoading() { elements.loading.classList.add('hidden'); }

function handleFile(file) {
  try {
    if (!isValidImageFile(file)) return;
    showLoading();
    const reader = new FileReader();
    reader.onload = event => {
      image = new Image();
      image.onload = () => {
        elements.originalPlaceholder.classList.add('hidden');
        elements.simulatedPlaceholder.classList.add('hidden');

        const width = image.width;
        const height = image.height;

        [elements.canvas, elements.originalCanvas].forEach(canvas => {
          canvas.width = width;
          canvas.height = height;
        });

        ctxOriginal.drawImage(image, 0, 0, width, height);
        elements.downloadBtn.disabled = false;
        elements.resetBtn.disabled = false;
        applyFilter();
        hideLoading();
      };
      image.onerror = () => {
        hideLoading();
        alert('Failed to load image. Please try another file.');
      };
      image.src = event.target.result;
    };
    reader.onerror = () => {
      hideLoading();
      alert('Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
  } catch (error) {
    hideLoading();
    alert(error.message);
  }
}

function applyFilter() {
  if (!image.src) return;
  const type = elements.filterSelect.value;
  const filter = filters[type];

  ctxOriginal.drawImage(image, 0, 0);
  ctx.drawImage(image, 0, 0);
  if (!filter) {
    elements.description.textContent = "";
    return;
  }
  elements.description.textContent = filter.description;

  try {
    const imageData = ctx.getImageData(0, 0, elements.canvas.width, elements.canvas.height);
    const data = imageData.data;
    const m = filter.matrix;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      data[i]     = r * m[0][0] + g * m[0][1] + b * m[0][2];
      data[i + 1] = r * m[1][0] + g * m[1][1] + b * m[1][2];
      data[i + 2] = r * m[2][0] + g * m[2][1] + b * m[2][2];
    }
    ctx.putImageData(imageData, 0, 0);
  } catch (error) {
    console.error('Error applying filter:', error);
    alert('Error applying filter. Please try again.');
  }
}

elements.dropZone.addEventListener("click", () => elements.imageInput.click());
elements.dropZone.addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    elements.imageInput.click();
  }
});
elements.dropZone.addEventListener("dragover", e => {
  e.preventDefault();
  elements.dropZone.classList.add("border-blue-400");
});
elements.dropZone.addEventListener("dragleave", () => {
  elements.dropZone.classList.remove("border-blue-400");
});
elements.dropZone.addEventListener("drop", e => {
  e.preventDefault();
  elements.dropZone.classList.remove("border-blue-400");
  if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});
elements.imageInput.addEventListener("change", e => {
  if (e.target.files.length) handleFile(e.target.files[0]);
});
elements.filterSelect.addEventListener("change", applyFilter);
elements.downloadBtn.addEventListener("click", () => {
  try {
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().replace(/[:]/g, '-').split('.')[0];
    const filterType = elements.filterSelect.value || 'original';
    link.download = `color-blind-simulation-${filterType}-${timestamp}.png`;
    link.href = elements.canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Error downloading image:', error);
    alert('Error downloading image. Please try again.');
  }
});
elements.resetBtn.addEventListener("click", () => {
  image = new Image();
  elements.filterSelect.value = "";
  elements.description.textContent = "";
  elements.downloadBtn.disabled = true;
  elements.resetBtn.disabled = true;
  elements.originalPlaceholder.classList.remove('hidden');
  elements.simulatedPlaceholder.classList.remove('hidden');
  [elements.canvas, elements.originalCanvas].forEach(canvas => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
});

// Modal handling
function openModal(sourceCanvas) {
  elements.modal.classList.remove("hidden");
  elements.modalCanvas.width = image.width;
  elements.modalCanvas.height = image.height;
  modalCtx.imageSmoothingEnabled = false;

  if (sourceCanvas === elements.canvas && elements.filterSelect.value) {
    modalCtx.drawImage(image, 0, 0);
    const imageData = modalCtx.getImageData(0, 0, image.width, image.height);
    const data = imageData.data;
    const m = filters[elements.filterSelect.value].matrix;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      data[i]     = r * m[0][0] + g * m[0][1] + b * m[0][2];
      data[i + 1] = r * m[1][0] + g * m[1][1] + b * m[1][2];
      data[i + 2] = r * m[2][0] + g * m[2][1] + b * m[2][2];
    }
    modalCtx.putImageData(imageData, 0, 0);
  } else {
    modalCtx.drawImage(image, 0, 0);
  }
}

function closeModal() {
  elements.modal.classList.add("hidden");
}

[elements.originalCanvas, elements.canvas].forEach(canvas => {
  canvas.addEventListener("click", () => {
    if (image.src) openModal(canvas);
  });
});
elements.modal.addEventListener("click", closeModal);
elements.modalCanvas.addEventListener("click", closeModal);
elements.modalClose.addEventListener("click", closeModal);
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !elements.modal.classList.contains("hidden")) {
    closeModal();
  }
});
