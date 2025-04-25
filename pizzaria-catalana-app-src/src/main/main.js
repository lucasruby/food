const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
  // Criar a janela do navegador
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, '../assets/icon.png')
  });

  // Carregar o arquivo index.html do aplicativo
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../../build/index.html'),
    protocol: 'file:',
    slashes: true
  });
  
  mainWindow.loadURL(startUrl);

  // Abrir o DevTools em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Quando a janela for fechada
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Este método será chamado quando o Electron terminar de inicializar
app.on('ready', createWindow);

// Sair quando todas as janelas estiverem fechadas
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

// Manipuladores de eventos IPC para comunicação com o processo de renderização
ipcMain.on('start-bot', (event) => {
  // Aqui seria a lógica para iniciar o bot
  console.log('Iniciando o bot...');
  event.reply('bot-status', { status: 'running' });
});

ipcMain.on('stop-bot', (event) => {
  // Aqui seria a lógica para parar o bot
  console.log('Parando o bot...');
  event.reply('bot-status', { status: 'stopped' });
});

ipcMain.on('show-qr-code', (event) => {
  // Simulação de QR code sendo gerado
  setTimeout(() => {
    event.reply('qr-code-generated', { 
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=WhatsAppConnection' 
    });
  }, 2000);
});

ipcMain.on('get-orders', (event) => {
  // Simulação de pedidos
  const orders = [
    { 
      id: '001', 
      customer: 'João Silva', 
      items: '1 Pizza Grande Calabresa, 1 Coca-Cola 2L', 
      total: 'R$ 64,99',
      status: 'Novo',
      time: '19:30'
    },
    { 
      id: '002', 
      customer: 'Maria Oliveira', 
      items: '1 Pizza Grande A Moda, 1 Guaraná 2L', 
      total: 'R$ 64,99',
      status: 'Em preparo',
      time: '19:15'
    }
  ];
  
  event.reply('orders-list', { orders });
});
