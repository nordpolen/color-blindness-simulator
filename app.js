const filters = {
  protanopia: [[0.567, 0.433, 0], [0.558, 0.442, 0], [0, 0.242, 0.758]],
  protanomaly: [[0.817, 0.183, 0], [0.333, 0.667, 0], [0, 0.125, 0.875]],
  deuteranopia: [[0.625, 0.375, 0], [0.7, 0.3, 0], [0, 0.3, 0.7]],
  deuteranomaly: [[0.8, 0.2, 0], [0.258, 0.742, 0], [0, 0.142, 0.858]],
  tritanopia: [[0.95, 0.05, 0], [0, 0.433, 0.567], [0, 0.475, 0.525]],
  tritanomaly: [[0.967, 0.033, 0], [0, 0.733, 0.267], [0, 0.183, 0.817]],
  achromatopsia: [[0.299, 0.587, 0.114], [0.299, 0.587, 0.114], [0.299, 0.587, 0.114]],
};

const elements = {
  dropZone: document.getElementById("dropZone"),
  imageInput: document.getElementById("imageInput"),
  originalCanvas: document.getElementById("originalCanvas"),
  simulatedCanvas: document.getElementById("simulatedCanvas"),
  filterSelect: document.getElementById("filterSelect"),
  downloadBtn: document.getElementById("downloadBtn"),
  downloadAllBtn: document.getElementById("downloadAllBtn"),
  zoomModal: document.getElementById("zoomModal"),
  zoomImage: document.getElementById("zoomImage"),
  filterDescription: document.getElementById("filterDescription")
};

let image = new Image();
let originalFileName = "image";

const originalCtx = elements.originalCanvas.getContext("2d");
const simulatedCtx = elements.simulatedCanvas.getContext("2d");

// Image Handling
elements.dropZone.addEventListener("click", () => elements.imageInput.click());
elements.dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  elements.dropZone.classList.add("bg-gray-200");
});
elements.dropZone.addEventListener("dragleave", () => {
  elements.dropZone.classList.remove("bg-gray-200");
});
elements.dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  elements.dropZone.classList.remove("bg-gray-200");
  const file = e.dataTransfer.files[0];
  if (file) handleImageFile(file);
});
elements.imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) handleImageFile(file);
});

function handleImageFile(file) {
  if (!file.type.startsWith("image")) return;
  originalFileName = file.name.split(".")[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    image.onload = () => {
      const { width, height } = image;
      [elements.originalCanvas, elements.simulatedCanvas].forEach((canvas) => {
        canvas.width = width;
        canvas.height = height;
      });
      originalCtx.drawImage(image, 0, 0);
      applyFilter();
    };
    image.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Filter Application
elements.filterSelect.addEventListener("change", applyFilter);

function applyFilter() {
  if (!image.src) return;

  simulatedCtx.drawImage(image, 0, 0);
  const imageData = simulatedCtx.getImageData(0, 0, simulatedCanvas.width, simulatedCanvas.height);
  const data = imageData.data;
  const matrix = filters[elements.filterSelect.value];

  if (!matrix) return;

  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    data[i]     = r * matrix[0][0] + g * matrix[0][1] + b * matrix[0][2];
    data[i + 1] = r * matrix[1][0] + g * matrix[1][1] + b * matrix[1][2];
    data[i + 2] = r * matrix[2][0] + g * matrix[2][1] + b * matrix[2][2];
  }

  simulatedCtx.putImageData(imageData, 0, 0);
}

// Zoom
document.querySelectorAll("[data-zoom]").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.zoom === "original" ? elements.originalCanvas : elements.simulatedCanvas;
    elements.zoomImage.src = target.toDataURL();
    elements.zoomModal.classList.remove("hidden");
  });
});
elements.zoomModal.addEventListener("click", () => {
  elements.zoomModal.classList.add("hidden");
});

// Download Buttons
elements.downloadBtn.addEventListener("click", () => {
  const filter = elements.filterSelect.value || "original";
  const link = document.createElement("a");
  link.download = `${originalFileName}-${filter}.png`;
  link.href = elements.simulatedCanvas.toDataURL();
  link.click();
});

elements.downloadAllBtn.addEventListener("click", () => {
  if (!image.src) return;

  const zip = new JSZip();
  const metadata = {};
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  tempCanvas.width = image.width;
  tempCanvas.height = image.height;

  const applyMatrix = (matrix) => {
    tempCtx.drawImage(image, 0, 0);
    const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      data[i]     = r * matrix[0][0] + g * matrix[0][1] + b * matrix[0][2];
      data[i + 1] = r * matrix[1][0] + g * matrix[1][1] + b * matrix[1][2];
      data[i + 2] = r * matrix[2][0] + g * matrix[2][1] + b * matrix[2][2];
    }

    tempCtx.putImageData(imgData, 0, 0);
    return tempCanvas.toDataURL("image/png");
  };

  Object.entries(filters).forEach(([key, matrix]) => {
    const dataURL = applyMatrix(matrix);
    const base64 = dataURL.split(",")[1];
    const filename = `${originalFileName}-${key}.png`;
    zip.file(filename, base64, { base64: true });
    metadata[filename] = key;
  });

  zip.file("metadata.json", JSON.stringify(metadata, null, 2));
  zip.generateAsync({ type: "blob" }).then(content => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `${originalFileName}-all-filters.zip`;
    link.click();
  });
});

// Filter Descriptions
const filterDescriptions = {
  protanopia: "Protanopia is red-blindness. People with this condition cannot perceive red light correctly.",
  protanomaly: "Protanomaly is red-weakness. Red appears duller and more greenish.",
  deuteranopia: "Deuteranopia is green-blindness. Green light is not perceived properly.",
  deuteranomaly: "Deuteranomaly is green-weakness. Green appears shifted toward red.",
  tritanopia: "Tritanopia is blue-blindness. Blue and yellow are hard to distinguish.",
  tritanomaly: "Tritanomaly is blue-weakness. Blue is perceived as green and it is hard to distinguish yellow and red.",
  achromatopsia: "Achromatopsia is total color blindness. Only grayscale is perceived.",
  "": "No filter selected. Displays the image as it is."
};

elements.filterSelect.addEventListener("change", () => {
  applyFilter();
  const desc = filterDescriptions[elements.filterSelect.value] || "Select a filter to see its description here.";
  elements.filterDescription.textContent = desc;
});
