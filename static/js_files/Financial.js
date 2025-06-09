// Global variables
let currentPayment = null;
let sortDirection = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeSorting();
    initializeModal();
});

// Initialize sorting functionality
function initializeSorting() {
    const sortableHeaders = document.querySelectorAll('.sortable');
    
    sortableHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const column = this.dataset.column;
            const table = this.closest('table');
            sortTable(table, column, this);
        });
    });
}

// Sort table functionality
function sortTable(table, column, headerElement) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const columnIndex = Array.from(headerElement.parentNode.children).indexOf(headerElement);
    
    // Determine sort direction
    const currentDirection = sortDirection[column] || 'asc';
    const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
    sortDirection[column] = newDirection;
    
    // Update sort icons
    updateSortIcons(table, headerElement, newDirection);
    
    // Sort rows
    rows.sort((a, b) => {
        const aValue = a.children[columnIndex].textContent.trim();
        const bValue = b.children[columnIndex].textContent.trim();
        
        // Handle numeric sorting for amount columns
        if (column === 'amount') {
            const aNum = parseFloat(aValue.replace(/,/g, ''));
            const bNum = parseFloat(bValue.replace(/,/g, ''));
            return newDirection === 'asc' ? aNum - bNum : bNum - aNum;
        }
        
        // Handle date sorting
        if (column === 'dueDate') {
            const aDate = parseDate(aValue);
            const bDate = parseDate(bValue);
            return newDirection === 'asc' ? aDate - bDate : bDate - aDate;
        }
        
        // Default string sorting
        const comparison = aValue.localeCompare(bValue);
        return newDirection === 'asc' ? comparison : -comparison;
    });
    
    // Re-append sorted rows
    rows.forEach(row => tbody.appendChild(row));
}

// Update sort icons
function updateSortIcons(table, activeHeader, direction) {
    // Reset all icons in this table
    table.querySelectorAll('.sort-icon').forEach(icon => {
        icon.textContent = '▲';
        icon.style.opacity = '0.5';
    });
    
    // Set active icon
    const activeIcon = activeHeader.querySelector('.sort-icon');
    if (activeIcon) {
        activeIcon.textContent = direction === 'asc' ? '▲' : '▼';
        activeIcon.style.opacity = '1';
    }
}

// Parse date string to Date object
function parseDate(dateString) {
    const parts = dateString.split('/');
    if (parts.length === 3) {
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    return new Date(dateString);
}

// Handle payment button click
function handlePayment(feeType, amount) {
    currentPayment = { feeType, amount };
    const modal = document.getElementById('paymentModal');
    const details = document.getElementById('paymentDetails');
    
    // Check if modal exists
    if (!modal) {
        console.error('Payment modal not found');
        showNotification('Payment modal not available', 'error');
        return;
    }
    
    if (details) {
        details.innerHTML = `
            <strong>Fee Type:</strong> ${feeType}<br>
            <strong>Amount:</strong> ₹${amount.toLocaleString()}<br>
            <strong>Payment Method:</strong> Online
        `;
    }
    
    modal.style.display = 'block';
    
    // Add animation
    setTimeout(() => {
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.transform = 'scale(1)';
            modalContent.style.opacity = '1';
        }
    }, 10);
}

// Confirm payment
function confirmPayment() {
    if (!currentPayment) return;
    
    // Generate reference number
    const referenceNumber = Math.floor(Math.random() * 900000000) + 100000000;
    const currentDate = new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    
    // Add to payment history
    addToPaymentHistory(currentPayment.feeType, currentPayment.amount, referenceNumber, currentDate);
    
    // Remove from due list
    removeFromDueList(currentPayment.feeType);
    
    // Update total amount
    updateTotalAmount();
    
    // Show success message
    showNotification('Payment successful!', 'success');
    
    // Close modal
    closeModal();
    currentPayment = null;
}

// Add payment to history table
function addToPaymentHistory(feeType, amount, reference, date) {
    const historyTable = document.getElementById('historyTable');
    if (!historyTable) {
        console.error('History table not found');
        return;
    }
    
    const tbody = historyTable.querySelector('tbody');
    if (!tbody) {
        console.error('History table tbody not found');
        return;
    }
    
    const newRow = document.createElement('tr');
    
    newRow.innerHTML = `
        <td>${feeType}</td>
        <td>${amount}</td>
        <td>Online</td>
        <td>${reference}</td>
        <td>${date}</td>
        <td><button class="print-btn" onclick="printReceipt('${reference}', '${feeType}', ${amount})">Print</button></td>
    `;
    
    // Add to top of table
    tbody.insertBefore(newRow, tbody.firstChild);
    
    // Add highlight animation
    newRow.style.backgroundColor = '#d4edda';
    setTimeout(() => {
        newRow.style.backgroundColor = '';
        newRow.style.transition = 'background-color 0.5s ease';
    }, 2000);
}

// Remove from due list
function removeFromDueList(feeType) {
    const dueTable = document.getElementById('dueTable');
    if (!dueTable) {
        console.error('Due table not found');
        return;
    }
    
    const tbody = dueTable.querySelector('tbody');
    if (!tbody) {
        console.error('Due table tbody not found');
        return;
    }
    
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
        if (row.cells[0].textContent.trim() === feeType) {
            row.style.transition = 'opacity 0.5s ease';
            row.style.opacity = '0';
            setTimeout(() => {
                row.remove();
            }, 500);
        }
    });
}

// Update total amount
function updateTotalAmount() {
    const dueTable = document.getElementById('dueTable');
    if (!dueTable) {
        console.error('Due table not found');
        return;
    }
    
    const tbody = dueTable.querySelector('tbody');
    if (!tbody) {
        console.error('Due table tbody not found');
        return;
    }
    
    const rows = tbody.querySelectorAll('tr');
    let total = 0;
    
    rows.forEach(row => {
        const amount = parseInt(row.cells[1].textContent.trim());
        total += amount;
    });
    
    const totalAmountElement = document.getElementById('totalAmount');
    if (totalAmountElement) {
        totalAmountElement.textContent = total.toLocaleString();
    }
}

// Print receipt functionality
function printReceipt(reference, feeType, amount) {
    const printContent = `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
            <h2 style="text-align: center; color: #2ecc71;">Payment Receipt</h2>
            <hr>
            <p><strong>Reference Number:</strong> ${reference}</p>
            <p><strong>Fee Type:</strong> ${feeType}</p>
            <p><strong>Amount:</strong> ₹${amount.toLocaleString()}</p>
            <p><strong>Payment Method:</strong> Online</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            <hr>
            <p style="text-align: center; font-size: 12px; color: #666;">
                This is a computer generated receipt.
            </p>
        </div>
    `;
    
    const printWindow = window.open('', '_blank');
    
    // Check if window.open was blocked by pop-up blocker
    if (!printWindow) {
        showNotification('Pop-up blocked! Please allow pop-ups for this site to print receipts.', 'info');
        return;
    }
    
    printWindow.document.write(`
        <html>
            <head><title>Payment Receipt</title></head>
            <body>${printContent}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
    
    showNotification('Receipt generated successfully!', 'success');
}

// Initialize modal functionality
function initializeModal() {
    const modal = document.getElementById('paymentModal');
    
    // Check if modal exists before trying to access its properties
    if (!modal) {
        console.warn('Payment modal not found in DOM');
        return;
    }
    
    const closeBtn = modal.querySelector('.close');
    
    // Add event listener only if close button exists
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    // Add window click event listener
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
}

// Close modal
function closeModal() {
    const modal = document.getElementById('paymentModal');
    
    if (!modal) {
        console.error('Payment modal not found');
        return;
    }
    
    const modalContent = modal.querySelector('.modal-content');
    
    if (modalContent) {
        modalContent.style.transform = 'scale(0.7)';
        modalContent.style.opacity = '0';
    }
    
    setTimeout(() => {
        modal.style.display = 'none';
        if (modalContent) {
            modalContent.style.transform = 'scale(0.7)';
            modalContent.style.opacity = '0';
        }
    }, 200);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    let backgroundColor;
    switch(type) {
        case 'success':
            backgroundColor = '#2ecc71';
            break;
        case 'error':
            backgroundColor = '#e74c3c';
            break;
        default:
            backgroundColor = '#3498db';
    }
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        background-color: ${backgroundColor};
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add some sample data manipulation functions
function addSampleDue() {
    const dueTable = document.getElementById('dueTable');
    if (!dueTable) {
        console.error('Due table not found');
        return;
    }
    
    const tbody = dueTable.querySelector('tbody');
    if (!tbody) {
        console.error('Due table tbody not found');
        return;
    }
    
    const newRow = document.createElement('tr');
    
    newRow.innerHTML = `
        <td>LIBRARY FEE</td>
        <td>500</td>
        <td>15/06/2025</td>
        <td><button class="pay-now-btn" onclick="handlePayment('LIBRARY FEE', 500)">Pay Now</button></td>
    `;
    
    tbody.appendChild(newRow);
    updateTotalAmount();
}