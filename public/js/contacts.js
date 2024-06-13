$(document).ready(function() {
  // Add Contact
  $('#addContactForm').submit(function(event) {
    event.preventDefault();

    const formData = $(this).serializeArray();
    const formObj = {};
    formData.forEach(item => {
      formObj[item.name] = item.value;
    });

    $.ajax({
      url: '/api/customers',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(formObj),
      success: function(response) {
        window.location.reload();
      },
      error: function(xhr, status, error) {
        console.error('Error:', error);
      }
    });
  });

  // Edit Contact
  $('#editContactModal').on('show.bs.modal', function(event) {
    const button = $(event.relatedTarget);
    const id = button.data('id');
    const name = button.data('name');
    const email = button.data('email');
    const phone = button.data('phone');

    $('#editContactId').val(id);
    $('#editContactName').val(name);
    $('#editContactEmail').val(email);
    $('#editContactPhone').val(phone);
  });

  $('#editContactForm').submit(function(event) {
    event.preventDefault();

    const formData = $(this).serializeArray();
    const formObj = {};
    formData.forEach(item => {
      formObj[item.name] = item.value;
    });

    $.ajax({
      url: `/api/customers/${formObj.id}`,
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(formObj),
      success: function(response) {
        window.location.reload();
      },
      error: function(xhr, status, error) {
        console.error('Error:', error);
      }
    });
  });

  // Delete Contact
  $('#deleteContactModal').on('show.bs.modal', function(event) {
    const button = $(event.relatedTarget);
    const id = button.data('id');
    $('#deleteContactId').val(id);
  });

  $('#deleteContactForm').submit(function(event) {
    event.preventDefault();

    const id = $('#deleteContactId').val();

    $.ajax({
      url: `/api/customers/${id}`,
      type: 'DELETE',
      success: function(response) {
        window.location.reload();
      },
      error: function(xhr, status, error) {
        console.error('Error:', error);
      }
    });
  });

  // Search Functionality
  $('.search').on('input', function() {
    const filter = $(this).val().toLowerCase();
    const contacts = $('.contact-item');
    let visibleCount = 0;

    contacts.each(function() {
      const name = $(this).data('name').toLowerCase();
      if (name.includes(filter)) {
        $(this).show();
        visibleCount++;
      } else {
        $(this).hide();
      }
    });

    const fallback = $('#contact-table-fallback');
    if (visibleCount === 0) {
      fallback.removeClass('d-none');
    } else {
      fallback.addClass('d-none');
    }
  });
  
  $('#exportCsvButton').on('click', function() {
    window.location.href = '/api/customers/export/csv';
  });

  $('#exportExcelButton').on('click', function() {
    window.location.href = '/api/customers/export/excel';
  });
});
