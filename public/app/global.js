function pagination(page, totalPages, totalDocs, func) {
  if (totalDocs == 0) {
    return '';
  }
  let start_page = page < 5 ? 1 : page - 3;
  let end_page = 6 + start_page;
  end_page = totalPages < end_page ? totalPages : end_page;
  let diff = start_page - end_page + 6;
  start_page -= start_page - diff > 0 ? diff : 0;
  let paginationHtml = '';
  if (parseInt(page) > 1) {
    paginationHtml += '<li class="page-item">';
    paginationHtml += `<button class="page-link" onclick="${func}(${
      parseInt(page) - 1
    })" aria-label="Previous">`;
    paginationHtml += '<span aria-hidden="true">&lsaquo;</span>';
    paginationHtml += '</button>';
    paginationHtml += '</li>';
  }
  for (let i = start_page; i <= end_page; i++) {
    if (i == page) {
      paginationHtml += `<li class="page-item">`;
      paginationHtml += `<button class="page-link bg-primary text-white">${i}</a>`;
    } else {
      paginationHtml += `<li class="page-item">`;
      paginationHtml += `<button class="page-link" onclick="${func}(${i})">${i}</a>`;
    }
    paginationHtml += '</li>';
  }
  if (parseInt(page) < totalPages) {
    paginationHtml += '<li class="page-item">';
    paginationHtml += `<button class="page-link" onclick="${func}(${
      parseInt(page) + 1
    })" aria-label="Next">`;
    paginationHtml += '<span aria-hidden="true">&rsaquo;</span>';
    paginationHtml += '</button>';
    paginationHtml += '</li>';
  }
  return paginationHtml;
}

function decodeHTML(str) {
  var txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}
