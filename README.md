# 🎨 Color Blindness Simulator

A web-based accessibility tool that simulates how images appear to people with various types of color vision deficiencies. Upload an image, apply filters, compare side-by-side, zoom in, and download the results — individually or as a complete ZIP package with metadata.

## 🚀 Features

- Click or drag-and-drop to upload an image
- Real-time color blindness simulation:
  - **Protanopia** (Red-Blind)
  - **Protanomaly** (Red-Weak)
  - **Deuteranopia** (Green-Blind)
  - **Deuteranomaly** (Green-Weak)
  - **Tritanopia** (Blue-Blind)
  - **Tritanomaly** (Blue-Weak)
  - **Achromatopsia** (Grayscale / Total Color Blindness)
- Filter descriptions for better understanding
- Side-by-side view of original and simulated image
- Zoom functionality for detailed inspection
- Download filtered image (PNG)
- Download all filtered versions and metadata as a ZIP archive

## 🖼️ Live Demo

Upload an image and select a filter from the dropdown to instantly preview how it looks for someone with that type of color vision deficiency.

## 🛠️ Built With

- HTML5
- Tailwind CSS
- Vanilla JavaScript
- HTML `<canvas>` API
- [JSZip](https://stuk.github.io/jszip/) for ZIP downloads

## 📁 Project Structure

├── index.html # Main application page
├── app.js # Image processing and interaction logic
├── styles.css # Custom styling on top of Tailwind


## 🎯 Purpose

This project was built to raise awareness about color accessibility and help designers test their visual content for inclusivity.

## 📜 License

MIT License

---

*Accessibility is not a feature. It’s a fundamental right.*
