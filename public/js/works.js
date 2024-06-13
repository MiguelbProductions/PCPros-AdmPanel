$(document).ready(function() {
    let workIdToDelete = null;

    $('#deleteWorkModal').on('show.bs.modal', function(event) {
      const button = $(event.relatedTarget);
      workIdToDelete = button.data('id');
    });

    $('#confirmDeleteWorkButton').on('click', function() {
      if (workIdToDelete) {
        $.ajax({
          url: `/api/works/${workIdToDelete}`,
          type: 'DELETE',
          success: function(result) {
            window.location.reload();
          },
          error: function(xhr, status, error) {
            console.error('Error:', error);
          }
        });
      }
    });

    $('.search').on('input', function() {
      const filter = $(this).val().toLowerCase();
      let visibleCount = 0;

      $('.work-item').each(function() {
        const customerName = $(this).data('customer').toLowerCase();
        if (customerName.includes(filter)) {
          $(this).show();
          visibleCount++;
        } else {
          $(this).hide();
        }
      });

      if (visibleCount === 0) {
        $('#work-table-fallback').removeClass('d-none');
      } else {
        $('#work-table-fallback').addClass('d-none');
      }
    });
    
    function filterWorks() {
      var priority = $("#priorityFilter").val();
      var status = $("#statusFilter").val();
      
      $(".work-item").show();
      
      if (priority !== "All") {
          $(".priority").each(function() {
              if ($(this).text().trim() !== priority) {
                  $(this).closest(".work-item").hide();
              }
          });
      }
      
      if (status !== "All") {
        $(".status").each(function() {
          if (status === "Auto") {
              if ($(this).text().trim().toLowerCase() == "payed") {
                  $(this).closest(".work-item").hide();
              }
          } else {
              if ($(this).text().trim().toLowerCase() != status.toLowerCase()) {
                  $(this).closest(".work-item").hide();
              }
          }
        });
      }

      var anyVisibleWorks = $(".work-item:visible").length > 0;
      $("#work-table-fallback").toggleClass("d-none", anyVisibleWorks);
  } 
  
  $("#priorityFilter, #statusFilter").change(function() {
      filterWorks();
  });

  $('#exportCsvButton').on('click', function() {
    window.location.href = '/api/works/export/csv';
  });

  $('#exportExcelButton').on('click', function() {
    window.location.href = '/api/works/export/excel';
  });

  filterWorks();
});