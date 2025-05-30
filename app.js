const filters = {
  protanopia: [[0.567, 0.433, 0], [0.558, 0.442, 0], [0, 0.242, 0.758]],
  protanomaly: [[0.817, 0.183, 0], [0.333, 0.667, 0], [0, 0.125, 0.875]],
  deuteranopia: [[0.625, 0.375, 0], [0.7, 0.3, 0], [0, 0.3, 0.7]],
  deuteranomaly: [[0.8, 0.2, 0], [0.258, 0.742, 0], [0, 0.142, 0.858]],
  tritanopia: [[0.95, 0.05, 0], [0, 0.433, 0.567], [0, 0.475, 0.525]],
  tritanomaly: [[0.967, 0.033, 0], [0, 0.733, 0.267], [0, 0.183, 0.817]],
  achromatopsia: [[0.299, 0.587, 0.114], [0.299, 0.587, 0.114], [0.299, 0.587, 0.114]],
};

let originalFileName = "image";
let image = new Image();

const dropZone = document.getElementById("dropZone");
const imageInput = document.getElementById("imageInput");
const originalCanvas = document.getElementById("originalCanvas");
const simulatedCanvas = document.getElementById("simulatedCanvas");
const filterSelect = document.getElementById("filterSelect");
const downloadBtn = document.getElementById("downloadBtn");
const downloadAllBtn = document.getElementById("downloadAllBtn");
const zoomModal = document.getElementById("zoomModal");
const zoomImage = document.getElementById("zoomImage");

const originalCtx = originalCanvas.getContext("2d");
const simulatedCtx = simulatedCanvas.getContext("2d");

dropZone.addEventListener("click", () => imageInput.click());
dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.classList.add("bg-gray-200"); });
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("bg-gray-200"));
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("bg-gray-200");
  handleFile(e.dataTransfer.files[0]);
});
imageInput.addEventListener("change", (e) => handleFile(e.target.files[0]));

function handleFile(file) {
  if (!file || !file.type.startsWith("image")) return;
  originalFileName = file.name.split(".")[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    image.onload = () => {
      originalCanvas.width = simulatedCanvas.width = image.width;
      originalCanvas.height = simulatedCanvas.height = image.height;
      originalCtx.drawImage(image, 0, 0);
      applyFilter();
    };
    image.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

filterSelect.addEventListener("change", applyFilter);

function applyFilter() {
  if (!image.src) return;
  simulatedCtx.drawImage(image, 0, 0);
  const imageData = simulatedCtx.getImageData(0, 0, simulatedCanvas.width, simulatedCanvas.height);
  const data = imageData.data;
  const matrix = filters[filterSelect.value];
  if (!matrix) return;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    data[i] = r * matrix[0][0] + g * matrix[0][1] + b * matrix[0][2];
    data[i + 1] = r * matrix[1][0] + g * matrix[1][1] + b * matrix[1][2];
    data[i + 2] = r * matrix[2][0] + g * matrix[2][1] + b * matrix[2][2];
  }
  simulatedCtx.putImageData(imageData, 0, 0);
}

document.querySelectorAll("[data-zoom]").forEach(btn => {
  btn.addEventListener("click", () => {
    const canvas = btn.dataset.zoom === "original" ? originalCanvas : simulatedCanvas;
    zoomImage.src = canvas.toDataURL();
    zoomModal.classList.remove("hidden");
  });
});
zoomModal.addEventListener("click", () => zoomModal.classList.add("hidden"));

downloadBtn.addEventListener("click", () => {
  const type = filterSelect.value || "original";
  const link = document.createElement("a");
  link.download = `${originalFileName}-${type}.png`;
  link.href = simulatedCanvas.toDataURL();
  link.click();
});

downloadAllBtn.addEventListener("click", () => {
  if (!image.src) return;
  const zip = new JSZip();
  const metadata = {};
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  tempCanvas.width = image.width;
  tempCanvas.height = image.height;

  const applyMatrix = (matrix) => {
    tempCtx.drawImage(image, 0, 0);
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      data[i] = r * matrix[0][0] + g * matrix[0][1] + b * matrix[0][2];
      data[i + 1] = r * matrix[1][0] + g * matrix[1][1] + b * matrix[1][2];
      data[i + 2] = r * matrix[2][0] + g * matrix[2][1] + b * matrix[2][2];
    }
    tempCtx.putImageData(imageData, 0, 0);
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

const filterDescription = document.getElementById("filterDescription");

filterSelect.addEventListener("change", () => {
  applyFilter();
  const desc = filterDescriptions[filterSelect.value] || "Select a filter to see its description here.";
  filterDescription.textContent = desc;
});
