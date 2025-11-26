console.log("signup.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("video");
  const captureBtn = document.getElementById("captureFace");
  const faceStatus = document.getElementById("faceStatus");
  const signupForm = document.getElementById("signupForm");

  let capturedEmbedding = null;

  const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";

  // Load face-api models from CDN
  async function loadModels() {
    faceStatus.innerText = "Loading face recognition models...";
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

      faceStatus.innerText = "Models loaded ✔";
      console.log("Models successfully loaded");
    } catch (err) {
      faceStatus.innerText = "Model loading failed ❌";
      console.error("Model load error:", err);
    }
  }

  // Start user camera
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      console.log("Camera started");
    } catch (err) {
      console.error("Camera access error:", err);
      faceStatus.innerText = "Camera blocked or no camera detected";
    }
  }

  // Capture face embedding
async function captureEmbedding() {
  try {
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks(true)  // 🔥 FORCE tiny model
      .withFaceDescriptor();

    if (!detection) return null;
    return Array.from(detection.descriptor);

  } catch (err) {
    console.error("Face detection error:", err);
    return null;
  }
}

  // Capture button logic
  captureBtn.addEventListener("click", async () => {
    faceStatus.innerText = "Detecting face...";
    const embedding = await captureEmbedding();

    if (!embedding) {
      faceStatus.innerText = "No face detected — try again";
      capturedEmbedding = null;
      return;
    }

    capturedEmbedding = embedding;
    faceStatus.innerText = "Face captured ✔";
    console.log("Embedding captured", embedding.length);
  });

  // Submit signup form with embedding
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!capturedEmbedding) {
      alert("Please capture your face before signing up.");
      return;
    }

    const payload = {
      fullName: document.getElementById("fullName").value.trim(),
      email: document.getElementById("email").value.trim(),
      mobile: document.getElementById("mobile").value.trim(),
      password: document.getElementById("password").value,
      confirmPassword: document.getElementById("confirmPassword").value,
      faceEmbedding: capturedEmbedding
    };

    console.log("Sending signup request", payload);

    try {
      const res = await fetch("/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      alert(data.message);

      if (res.ok) {
        window.location.href = "/index.html";
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("Signup failed — network error");
    }
  });

  document.querySelectorAll(".toggle-password").forEach(icon => {
  icon.addEventListener("click", () => {
    const input = document.getElementById(icon.dataset.target);

    if (input.type === "password") {
      input.type = "text";
      icon.innerHTML = `<i class="fas fa-eye-slash"></i>`;
    } else {
      input.type = "password";
      icon.innerHTML = `<i class="fas fa-eye"></i>`;
    }
  });
});

  // Init
  (async () => {
    await loadModels();
    await startCamera();
  })();
});
