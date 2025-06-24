// Updated Finance Page Script - Clean & Scoped

window.initFinancialPage = async function () {
    let currentPayment = null;
    let sortDirection = {};

    setupSorting();
    setupPaymentButtons();
    setupModal();
    updateTotalAmount();

    function setupSorting() {
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', () => {
                const column = header.dataset.column;
                const table = header.closest('table');
                sortTable(table, column, header);
            });
        });
    }

    function sortTable(table, column, header) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const index = Array.from(header.parentNode.children).indexOf(header);
        const direction = sortDirection[column] === 'asc' ? 'desc' : 'asc';
        sortDirection[column] = direction;

        updateSortIcons(table, header, direction);

        rows.sort((a, b) => {
            const aVal = parseCell(a.children[index].textContent.trim(), column);
            const bVal = parseCell(b.children[index].textContent.trim(), column);
            return direction === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
        });

        rows.forEach(row => tbody.appendChild(row));
    }

    function parseCell(value, column) {
        if (column === 'amount') return parseFloat(value.replace(/,/g, '')) || 0;
        if (column === 'dueDate') return parseDate(value);
        return value.toLowerCase();
    }

    function parseDate(str) {
        const parts = str.split('/');
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }

    function updateSortIcons(table, activeHeader, dir) {
        table.querySelectorAll('.sort-icon').forEach(icon => {
            icon.textContent = '▲';
            icon.style.opacity = '0.5';
        });
        const icon = activeHeader.querySelector('.sort-icon');
        if (icon) {
            icon.textContent = dir === 'asc' ? '▲' : '▼';
            icon.style.opacity = '1';
        }
    }

    function setupPaymentButtons() {
        document.querySelectorAll('.pay-now-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const feeType = btn.dataset.fee;
                const amount = parseInt(btn.dataset.amount);
                handlePayment(feeType, amount);
            });
        });
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
        }
    }

    function confirmPayment() {
        if (!currentPayment) return;
        const reference = Math.floor(Math.random() * 900000000) + 100000000;
        const date = new Date().toLocaleString('en-IN');
        addToPaymentHistory(currentPayment.feeType, currentPayment.amount, reference, date);
        removeFromDueList(currentPayment.feeType);
        updateTotalAmount();
        showNotification('Payment successful!', 'success');
        closeModal();
        currentPayment = null;
    }

    window.confirmPayment = confirmPayment; // expose to global so it can be used by button if needed

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
            <td><button class="print-btn" onclick="printReceipt('${ref}', '${feeType}', ${amount})">Print</button></td>`;
        tbody.insertBefore(row, tbody.firstChild);
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

    window.printReceipt = function (ref, feeType, amount) {
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
        win.print();
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
