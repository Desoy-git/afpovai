console.log("Login JS Loaded");

const loginForm = document.getElementById("loginForm");
const faceLoginBtn = document.getElementById("faceLoginBtn");
const faceLoginStatus = document.getElementById("faceLoginStatus");
const video = document.getElementById("video");

// Password toggle
const togglePassword = document.getElementById("togglePassword");
const passwordField = document.getElementById("password");

togglePassword.addEventListener("click", () => {
  const type = passwordField.type === "password" ? "text" : "password";
  passwordField.type = type;
  togglePassword.classList.toggle("fa-eye-slash");
});

// Load face-api models from CDN
const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";

async function loadModels() {
  faceLoginStatus.innerText = "Loading face recognition models...";
  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    console.log("Face models loaded");
    faceLoginStatus.innerText = "Models loaded ✓";
  } catch (err) {
    console.error("Model loading error:", err);
    faceLoginStatus.innerText = "Model load failed ❌";
  }
}

// Start webcam
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    console.error("Camera error:", err);
    faceLoginStatus.innerText = "Camera access blocked ❌";
  }
}

// Capture face descriptor
async function captureEmbedding() {
  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks(true)
    .withFaceDescriptor();

  return detection ? Array.from(detection.descriptor) : null;
}

// Password login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = passwordField.value.trim();

  const res = await fetch("/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  alert(data.message);

  if (data.success) window.location.href = "/dashboard.html";
});

// Face login
faceLoginBtn.addEventListener("click", async () => {
  faceLoginStatus.innerText = "Detecting face...";

  const embedding = await captureEmbedding();
  if (!embedding) {
    faceLoginStatus.innerText = "Face not detected ❌";
    return;
  }

  faceLoginStatus.innerText = "Verifying...";

  const res = await fetch("/api/users/face-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ faceEmbedding: embedding })
  });

  const data = await res.json();
  alert(data.message);

  if (data.success) {
    faceLoginStatus.innerText = "Logged in ✔";
    window.location.href = "/dashboard.html";
  } else {
    faceLoginStatus.innerText = "Face not recognized ❌";
  }
});

// Load and start camera when ready
(async () => {
  await loadModels();
  await startCamera();
})();
