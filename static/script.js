// ===============================================================
// GLOBAL ELEMENTS
// ===============================================================
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const loader = document.getElementById("loader");
const predictBtn = document.getElementById("predictBtn");

const camera = document.getElementById("camera");
const openCamera = document.getElementById("openCamera");
const captureBtn = document.getElementById("captureBtn");

const voiceBtn = document.getElementById("voiceBtn");
const listeningIndicator = document.getElementById("listeningIndicator");
const languageSelect = document.getElementById("languageSelect");


// ===============================================================
// DRAG & DROP
// ===============================================================
dropzone.addEventListener("click", () => fileInput.click());

dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.style.background = "rgba(56,189,248,0.15)";
});

dropzone.addEventListener("dragleave", () => {
    dropzone.style.background = "transparent";
});

dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    fileInput.files = e.dataTransfer.files;

    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
    dropzone.style.display = "none";
});

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
    dropzone.style.display = "none";
});


// ===============================================================
// CAMERA CAPTURE
// ===============================================================
openCamera.addEventListener("click", async () => {
    dropzone.style.display = "none";
    preview.style.display = "none";
    camera.style.display = "block";
    captureBtn.style.display = "block";

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    camera.srcObject = stream;
});

captureBtn.addEventListener("click", () => {
    const canvas = document.createElement("canvas");
    canvas.width = camera.videoWidth;
    canvas.height = camera.videoHeight;
    canvas.getContext("2d").drawImage(camera, 0, 0);

    canvas.toBlob((blob) => {
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;

        preview.src = URL.createObjectURL(file);
        preview.style.display = "block";
    });

    camera.style.display = "none";
    captureBtn.style.display = "none";
});


// ===============================================================
// PREDICTION LOADER
// ===============================================================
document.getElementById("uploadForm").addEventListener("submit", () => {
    loader.style.display = "block";
    predictBtn.style.display = "none";
});


// ===============================================================
// MULTILINGUAL VOICE ASSISTANT
// ===============================================================
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = "en-US"; // default
recognition.interimResults = false;
recognition.continuous = false;

voiceBtn.addEventListener("click", () => {
    recognition.lang = languageSelect.value;
    recognition.start();
    listeningIndicator.style.display = "block";
});

recognition.onend = () => {
    listeningIndicator.style.display = "none";
};

recognition.onresult = (event) => {
    const command = event.results[0][0].transcript.toLowerCase();
    console.log("User said:", command);

    function speak(text) {
        let msg = new SpeechSynthesisUtterance(text);
        msg.lang = languageSelect.value;
        msg.rate = 1;
        msg.pitch = 1;
        window.speechSynthesis.speak(msg);
    }

    if (command.includes("camera") || command.includes("open camera")) {
        openCamera.click();
        speak("Opening camera.");
    }
    else if (command.includes("upload") || command.includes("choose image")) {
        fileInput.click();
        speak("Please select an image.");
    }
    else if (command.includes("predict") || command.includes("classify")) {
        speak("Predicting now.");
        document.getElementById("uploadForm").submit();
    }
    else if (command.includes("language")) {
        speak("Please choose a language from the menu above.");
    }
    else {
        speak("I did not understand. You can say open camera, upload image, or predict.");
    }
};
// =============================================
// PWA INSTALLATION
// =============================================
let deferredPrompt;
const installBtn = document.getElementById("installBtn");

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = "block";
});

installBtn.addEventListener("click", () => {
    installBtn.style.display = "none";
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
            console.log("App installed");
        }
        deferredPrompt = null;
    });
});
