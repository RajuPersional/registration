// Finance Page Script - Scoped (No Globals)

window.initFinancialPage = async function () {
    let currentPayment = null;

    setupPaymentButtons();
    setupModal();
    updateTotalAmount();
    setupPrintButtons();

    function setupPaymentButtons() {
        document.querySelectorAll('.pay-now-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const row = btn.closest('tr');
                const feeType = row.children[0].textContent.trim();
                const amount = parseInt(row.children[1].textContent.trim());
                handlePayment(feeType, amount);
            });
        });

        const confirmBtn = document.querySelector('.confirm-btn');
        if (confirmBtn) confirmBtn.addEventListener('click', confirmPayment);

        const cancelBtn = document.querySelector('.cancel-btn');
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    }

    function handlePayment(feeType, amount) {
        currentPayment = { feeType, amount };
        const modal = document.getElementById('paymentModal');
        const details = document.getElementById('paymentDetails');
        if (modal && details) {
            details.innerHTML = `
                <strong>Fee Type:</strong> ${feeType}<br>
                <strong>Amount:</strong> ₹${amount.toLocaleString()}<br> 
                <strong>Payment Method:</strong> Online`;
            modal.style.display = 'block';
        }                                                                   // the tolocalString Converst the data number in to "1,50,000" 
    }

    function confirmPayment() {
        if (!currentPayment) return;
        const reference = Math.floor(Math.random() * 900000000) + 100000000;
        const date = new Date().toLocaleString('en-IN');//the Date is the inbuilt class
        addToPaymentHistory(currentPayment.feeType, currentPayment.amount, reference, date);
        removeFromDueList(currentPayment.feeType);
        updateTotalAmount();
        showNotification('Payment successful!', 'success');
        closeModal();
        currentPayment = null;
    }

    function addToPaymentHistory(feeType, amount, ref, date) {
        const tbody = document.querySelector('#historyTable tbody');
        if (!tbody) return;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${feeType}</td>
            <td>${amount}</td>
            <td>Online</td>
            <td>${ref}</td>
            <td>${date}</td>
            <td><button class="print-btn">Print</button></td>`;
        tbody.insertBefore(row, tbody.firstChild);

        const printBtn = row.querySelector('.print-btn');
        if (printBtn) {
            printBtn.addEventListener('click', () => printReceipt(ref, feeType, amount));
        }
    }

    function removeFromDueList(feeType) {
        document.querySelectorAll('#dueTable tbody tr').forEach(row => {
            if (row.cells[0].textContent.trim() === feeType) row.remove();
        });
    }

    function updateTotalAmount() {
        const rows = document.querySelectorAll('#dueTable tbody tr');
        let total = 0;
        rows.forEach(row => {
            total += parseInt(row.cells[1].textContent.trim()) || 0;
        });
        const totalAmount = document.getElementById('totalAmount');
        if (totalAmount) totalAmount.textContent = total.toLocaleString();
    }

    function printReceipt(ref, feeType, amount) {
        const content = `
            <div style="font-family: Arial; max-width: 400px; padding: 20px;">
                <h2 style="text-align:center; color:#2ecc71;">Payment Receipt</h2><hr>
                <p><strong>Reference:</strong> ${ref}</p>
                <p><strong>Fee Type:</strong> ${feeType}</p>
                <p><strong>Amount:</strong> ₹${amount.toLocaleString()}</p>
                <p><strong>Method:</strong> Online</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p><hr>
                <p style="text-align:center; font-size:12px;">This is a computer generated receipt.</p>
            </div>`;
        const win = window.open('', '_blank');
        if (!win) return showNotification('Pop-up blocked!', 'info');
        win.document.write(`<html><head><title>Receipt</title></head><body>${content}</body></html>`);
        win.document.close();
        win.print();// this is the inbuilt Funtion
    }

    function setupPrintButtons() {
        document.querySelectorAll('.print-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const row = btn.closest('tr');
                const feeType = row.children[0].textContent.trim();
                const amount = parseInt(row.children[1].textContent.trim());
                const ref = row.children[3].textContent.trim();
                printReceipt(ref, feeType, amount);
            });
        });
    }

    function setupModal() {
        const modal = document.getElementById('paymentModal');
        if (!modal) return;
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        window.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    }

    function closeModal() {
        const modal = document.getElementById('paymentModal');
        if (modal) modal.style.display = 'none';
    }

    function showNotification(message, type = 'info') {
        const note = document.createElement('div');
        note.className = `notification ${type}`;
        note.textContent = message;
        note.style.cssText = `
            position: fixed; top: 20px; right: 20px;
            padding: 15px 20px; border-radius: 5px;
            color: white; font-weight: 500;
            z-index: 10000; background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
        `;
        document.body.appendChild(note);
        setTimeout(() => note.remove(), 3000);
    }
}
