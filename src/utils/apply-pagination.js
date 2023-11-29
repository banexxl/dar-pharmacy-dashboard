
export function applyPagination(documents, page, rowsPerPage) {
          console.log('apply pagination documents, page, rowsPerPage', documents, page, rowsPerPage);
          if (!Array.isArray(documents) || typeof page !== 'number' || typeof rowsPerPage !== 'number') {
                    return []; // Return an empty array or handle invalid input gracefully
          }

          const startIndex = (page) * rowsPerPage;
          const endIndex = startIndex + rowsPerPage;

          return documents.slice(startIndex, endIndex);
}