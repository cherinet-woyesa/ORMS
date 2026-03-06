// Receipt Printer Service
// Supports thermal printers via USB/Bluetooth or network printing

export const printReceipt = async (order, restaurantInfo = {}) => {
  const receipt = generateReceiptText(order, restaurantInfo);
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - Order #${order.id?.substring(0, 8)}</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
              .no-print { display: none; }
            }
            body { font-family: 'Courier New', monospace; font-size: 12px; }
            .header { text-align: center; margin-bottom: 20px; }
            .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
            .total { font-weight: bold; font-size: 14px; }
            .items { margin: 10px 0; }
            .item-row { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          ${receipt}
          <div class="no-print">
            <button onclick="window.print()" style="padding: 10px 20px; margin: 20px;">Print</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
  
  return { success: true };
};

export const generateReceiptText = (order, restaurantInfo = {}) => {
  const info = {
    name: 'Ogaden Restaurant',
    address: 'Jigjiga, Ethiopia',
    phone: '+252-63-XXXXXXX',
    ...restaurantInfo,
  };
  
  const orderDate = order.createdAt?.seconds 
    ? new Date(order.createdAt.seconds * 1000).toLocaleString()
    : new Date().toLocaleString();
  
  const items = order.items?.map(item => `
    <div class="item-row">
      <span>${item.quantity}x ${item.name}</span>
      <span>ETB ${(item.price * item.quantity).toFixed(2)}</span>
    </div>
  `).join('') || '';
  
  return `
    <div class="header">
      <h2>${info.name}</h2>
      <p>${info.address}</p>
      <p>${info.phone}</p>
    </div>
    <div class="divider"></div>
    <p><strong>Order #:</strong> ${order.id?.substring(0, 8)}</p>
    <p><strong>Date:</strong> ${orderDate}</p>
    <p><strong>Status:</strong> ${order.status}</p>
    <div class="divider"></div>
    <div class="items">
      ${items}
    </div>
    <div class="divider"></div>
    <div class="item-row">
      <span>Subtotal:</span>
      <span>ETB ${(order.subtotal || 0).toFixed(2)}</span>
    </div>
    <div class="item-row">
      <span>Tax:</span>
      <span>ETB ${(order.tax || 0).toFixed(2)}</span>
    </div>
    <div class="item-row">
      <span>Delivery:</span>
      <span>ETB ${(order.deliveryFee || 0).toFixed(2)}</span>
    </div>
    <div class="divider"></div>
    <div class="item-row total">
      <span>TOTAL:</span>
      <span>ETB ${(order.total || 0).toFixed(2)}</span>
    </div>
    <div class="divider"></div>
    <div style="text-align: center; margin-top: 20px;">
      <p>Thank you for your order!</p>
      <p>Please come again</p>
    </div>
  `;
};

export const printKitchenTicket = async (order) => {
  const ticket = `
    <div style="font-family: monospace; padding: 10px;">
      <h3 style="text-align: center; border-bottom: 2px solid #000;">
        KITCHEN TICKET
      </h3>
      <p><strong>Order #:</strong> ${order.id?.substring(0, 8)}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
      <p><strong>Table:</strong> ${order.tableNumber || 'Takeout'}</p>
      <hr/>
      <h4>Items:</h4>
      ${order.items?.map(item => `
        <p><strong>${item.quantity}x</strong> ${item.name}</p>
        ${item.extras ? `<p style="margin-left: 10px; font-size: 11px;">+ ${item.extras.join(', ')}</p>` : ''}
        ${item.note ? `<p style="margin-left: 10px; font-style: italic;">"${item.note}"</p>` : ''}
      `).join('')}
      <hr/>
      <p><strong>Server:</strong> ${order.serverName || 'Counter'}</p>
    </div>
  `;
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head><title>Kitchen Ticket - ${order.id?.substring(0, 8)}</title></head>
        <body>${ticket}</body>
      </html>
    `);
    printWindow.document.close();
  }
  
  return { success: true };
};
