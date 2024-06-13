$(document).ready(function() {
  $('#addServiceForm').on('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formObj = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formObj),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        console.error('Error:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });

  $('#deleteServiceModal').on('show.bs.modal', function(event) {
    const button = $(event.relatedTarget);
    serviceIdToDelete = button.data('id');
  });

  $('#confirmDeleteServiceButton').on('click', async function() {
    if (serviceIdToDelete) {
      try {
        const response = await fetch(`/api/services/${serviceIdToDelete}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          window.location.reload();
        } else {
          console.error('Error:', response.statusText);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  });

  $('.search').on('input', function() {
    const filter = $(this).val().toLowerCase();
    const services = $('.service-item');
    let visibleCount = 0;

    services.each(function() {
      const name = $(this).data('name').toLowerCase();
      if (name.includes(filter)) {
        $(this).show();
        visibleCount++;
      } else {
        $(this).hide();
      }
    });

    const fallback = $('#service-table-fallback');
    if (visibleCount === 0) {
      fallback.removeClass('d-none');
    } else {
      fallback.addClass('d-none');
    }
  });

  $('#serviceType').on('change', function() {
    const selectedType = $(this).val();
    const priceInput = $('#priceInput');
    const minMaxPriceInputs = $('#minMaxPriceInputs');

    if (selectedType === 'fixed') {
      priceInput.show();
      minMaxPriceInputs.hide();
    } else if (selectedType === 'range') {
      priceInput.hide();
      minMaxPriceInputs.show();
    }
  });

  $('#editServiceForm').on('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formObj = Object.fromEntries(formData.entries());
    const serviceId = formObj.id;
    delete formObj.id;

    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formObj),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        console.error('Error:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });

  $('#editServiceModal').on('show.bs.modal', function(event) {
    const button = $(event.relatedTarget);
    const id = button.data('id');
    const name = button.data('name');
    const price = button.data('price');
    const minPrice = button.data('minprice');
    const maxPrice = button.data('maxprice');
    const referenceLink = button.data('referencelink');
    const referenceText = button.data('referencetext');

    const modal = $(this);
    modal.find('#editServiceId').val(id);
    modal.find('#editServiceName').val(name);
    modal.find('#editServicePrice').val(price);
    modal.find('#editServiceMinPrice').val(minPrice);
    modal.find('#editServiceMaxPrice').val(maxPrice);
    modal.find('#editServiceReferenceLink').val(referenceLink);
    modal.find('#editServiceReferenceText').val(referenceText);

    const serviceType = price ? 'fixed' : 'range';
    modal.find('#editServiceType').val(serviceType);

    togglePriceInputs(serviceType, modal);
  });

  $('#editServiceType').on('change', function() {
    const selectedType = $(this).val();
    const modal = $('#editServiceModal');
    togglePriceInputs(selectedType, modal);
  });

  function togglePriceInputs(serviceType, modal) {
    const priceInput = modal.find('#editPriceInput');
    const minMaxPriceInputs = modal.find('#editMinMaxPriceInputs');

    if (serviceType === 'fixed') {
      priceInput.show();
      minMaxPriceInputs.hide();
    } else if (serviceType === 'range') {
      priceInput.hide();
      minMaxPriceInputs.show();
    }
  }

  $('#exportCsvButton').on('click', function() {
    window.location.href = '/api/services/export/csv';
  });

  $('#exportExcelButton').on('click', function() {
    window.location.href = '/api/services/export/excel';
  });
});
