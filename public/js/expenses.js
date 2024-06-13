$(document).ready(function () {
    function fetchExpenses() {
        $.ajax({
            url: '/api/expenses',
            method: 'GET',
            success: function (data) {
                const tbody = $('#expensesTableBody');
                tbody.empty();
                data.forEach(expense => {
                    const rowClass = expense.amount < 0 ? 'table-danger' : 'table-success';
                    tbody.append(`
                        <tr class="${rowClass}">
                            <td>${expense.description}</td>
                            <td>${expense.amount.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</td>
                            <td>${new Date(expense.date).toLocaleDateString()}</td>
                            <td>${expense.category}</td>
                            <td>
                                <button class="btn btn-danger btn-sm deleteExpense" data-id="${expense._id}" data-bs-toggle="modal" data-bs-target="#confirmDeleteModal">Deletar</button>
                            </td>
                        </tr>
                    `);
                });
            }
        });
    }

    fetchExpenses();

    $('#addExpenseForm').on('submit', function (e) {
        e.preventDefault();
        const formData = $(this).serialize();
        $.ajax({
            url: '/api/expenses',
            method: 'POST',
            data: formData,
            success: function () {
                location.reload();
            }
        });
    });

    let deleteExpenseId;
    
    $('.deleteExpense').on('click', function () {
        deleteExpenseId = $(this).attr('data-id');
    });

    $('#confirmDeleteButton').on('click', function () {
        $.ajax({
            url: `/api/expenses/${deleteExpenseId}`,
            method: 'DELETE',
            success: function () {
                location.reload();
            }
        });
    });

    $('#exportCsvButton').on('click', function () {
        window.location.href = '/api/expenses/export/csv';
    });

    $('#exportExcelButton').on('click', function () {
        window.location.href = '/api/expenses/export/excel';
    });

    $('#addExpenseModal').on('show.bs.modal', function () {
        $('#date').val(new Date().toISOString().split('T')[0]);
    });
});
