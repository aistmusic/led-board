const installBtn=document.getElementById("install");
let deferredInstall=null;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;if(installBtn)installBtn.hidden=false});
installBtn?.addEventListener("click",async()=>{if(!deferredInstall)return;deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;installBtn.hidden=true});
window.addEventListener("appinstalled",()=>{if(installBtn)installBtn.hidden=true});
