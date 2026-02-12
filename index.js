const { app, BrowserWindow, screen } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1024,
    minHeight: 768,
    title: "HiTESS WorkBench",
    frame: true,
    
    // [중요] 초기 배경색을 'Trust Blue'로 설정
    backgroundColor: '#002554', 
    
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
    show: false, // 준비될 때까지 숨김
    autoHideMenuBar: true,
  });

  // 개발 환경(localhost) 또는 빌드된 파일 로드
  const startUrl = "http://localhost:5174";
  mainWindow.loadURL(startUrl);

  // 창이 로드될 준비가 끝났을 때 보여줌 (부드러운 실행)
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
