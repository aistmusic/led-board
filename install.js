const toast = document.getElementById("toast");
const toastText = document.getElementById("toastText");
const toastInstall = document.getElementById("toastInstall");
const toastClose = document.getElementById("toastClose");
let deferredInstall = null;

const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
const ua = navigator.userAgent || "";
const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

function showToast(text, canInstall) {
  if (!toast || sessionStorage.getItem("led-toast-hide")) return;
  toastText.textContent = text;
  toastInstall.hidden = !canInstall;
  toast.hidden = false;
}
function hideToast() {
  if (toast) toast.hidden = true;
  try { sessionStorage.setItem("led-toast-hide", "1"); } catch (err) {}
}

if (!standalone && ios) {
  showToast("Safari: Udostepnij, potem Do ekranu poczatkowego.", false);
}

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstall = e;
  showToast("Dodaj LED Board na pulpit.", true);
});

toastInstall?.addEventListener("click", async () => {
  if (!deferredInstall) return;
  deferredInstall.prompt();
  await deferredInstall.userChoice;
  deferredInstall = null;
  hideToast();
});
toastClose?.addEventListener("click", hideToast);
window.addEventListener("appinstalled", hideToast);
