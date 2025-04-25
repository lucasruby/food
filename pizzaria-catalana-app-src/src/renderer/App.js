import React, { useState, useEffect } from 'react';
import './App.css';

const { ipcRenderer } = window.require('electron');

function App() {
  const [botStatus, setBotStatus] = useState('stopped');
  const [qrCode, setQrCode] = useState(null);
  const [orders, setOrders] = useState([]);
  const [currentView, setCurrentView] = useState('home'); // home, orders, qrcode

  useEffect(() => {
    // Ouvir eventos do processo principal
    ipcRenderer.on('bot-status', (event, data) => {
      setBotStatus(data.status);
      if (data.status === 'running') {
        setCurrentView('qrcode');
        ipcRenderer.send('show-qr-code');
      }
    });

    ipcRenderer.on('qr-code-generated', (event, data) => {
      setQrCode(data.qrCodeUrl);
    });

    ipcRenderer.on('orders-list', (event, data) => {
      setOrders(data.orders);
    });

    return () => {
      // Limpar listeners quando o componente for desmontado
      ipcRenderer.removeAllListeners('bot-status');
      ipcRenderer.removeAllListeners('qr-code-generated');
      ipcRenderer.removeAllListeners('orders-list');
    };
  }, []);

  const startBot = () => {
    ipcRenderer.send('start-bot');
  };

  const stopBot = () => {
    ipcRenderer.send('stop-bot');
    setCurrentView('home');
    setQrCode(null);
  };

  const viewOrders = () => {
    ipcRenderer.send('get-orders');
    setCurrentView('orders');
  };

  const goHome = () => {
    setCurrentView('home');
  };

  const markOrderReady = (orderId) => {
    // Simulação de marcar pedido como pronto
    setOrders(orders.map(order => 
      order.id === orderId ? {...order, status: 'Pronto'} : order
    ));
  };

  const markOrderDelivered = (orderId) => {
    // Simulação de marcar pedido como entregue
    setOrders(orders.map(order => 
      order.id === orderId ? {...order, status: 'Entregue'} : order
    ));
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Pizzaria Catalana</h1>
        {currentView !== 'home' && (
          <button className="back-button" onClick={goHome}>
            Voltar para Início
          </button>
        )}
      </header>

      <main className="app-content">
        {currentView === 'home' && (
          <div className="home-screen">
            <div className="status-indicator">
              Status do Bot: <span className={`status-${botStatus}`}>
                {botStatus === 'running' ? 'ATIVO' : 'DESATIVADO'}
              </span>
            </div>
            
            <div className="main-buttons">
              {botStatus !== 'running' ? (
                <button className="big-button start-button" onClick={startBot}>
                  INICIAR BOT
                </button>
              ) : (
                <button className="big-button stop-button" onClick={stopBot}>
                  PARAR BOT
                </button>
              )}
              
              <button className="big-button orders-button" onClick={viewOrders}>
                VER PEDIDOS
              </button>
            </div>
            
            <div className="instructions">
              <h2>Instruções:</h2>
              <p>1. Clique em "INICIAR BOT" para começar a receber pedidos</p>
              <p>2. Escaneie o código QR com o WhatsApp quando aparecer</p>
              <p>3. Clique em "VER PEDIDOS" para ver os pedidos recebidos</p>
              <p>4. Clique em "PARAR BOT" para desativar o atendimento</p>
            </div>
          </div>
        )}

        {currentView === 'qrcode' && (
          <div className="qrcode-screen">
            <h2>Escaneie este código QR com o WhatsApp</h2>
            {qrCode ? (
              <div className="qrcode-container">
                <img src={qrCode} alt="QR Code para WhatsApp" />
              </div>
            ) : (
              <div className="loading">Gerando código QR...</div>
            )}
            <div className="qrcode-instructions">
              <p>1. Abra o WhatsApp no seu celular</p>
              <p>2. Toque em Menu ou Configurações e selecione WhatsApp Web</p>
              <p>3. Aponte a câmera do seu celular para este código</p>
              <p>4. Aguarde a conexão ser estabelecida</p>
            </div>
          </div>
        )}

        {currentView === 'orders' && (
          <div className="orders-screen">
            <h2>Pedidos</h2>
            {orders.length === 0 ? (
              <div className="no-orders">
                Nenhum pedido recebido ainda
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order.id} className={`order-card status-${order.status.toLowerCase()}`}>
                    <div className="order-header">
                      <h3>Pedido #{order.id}</h3>
                      <span className="order-time">{order.time}</span>
                    </div>
                    <div className="order-customer">
                      <strong>Cliente:</strong> {order.customer}
                    </div>
                    <div className="order-items">
                      <strong>Itens:</strong> {order.items}
                    </div>
                    <div className="order-total">
                      <strong>Total:</strong> {order.total}
                    </div>
                    <div className="order-status">
                      <strong>Status:</strong> {order.status}
                    </div>
                    <div className="order-actions">
                      {order.status === 'Novo' && (
                        <button 
                          className="action-button ready-button" 
                          onClick={() => markOrderReady(order.id)}
                        >
                          MARCAR COMO PRONTO
                        </button>
                      )}
                      {order.status === 'Pronto' && (
                        <button 
                          className="action-button delivered-button" 
                          onClick={() => markOrderDelivered(order.id)}
                        >
                          MARCAR COMO ENTREGUE
                        </button>
                      )}
                      <button className="action-button print-button">
                        IMPRIMIR PEDIDO
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Pizzaria Catalana - Sistema de Atendimento</p>
      </footer>
    </div>
  );
}

export default App;
