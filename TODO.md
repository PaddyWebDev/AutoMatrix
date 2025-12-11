# Invoice Modal Design and PDF Download Task

## Steps to Complete

1. **Install jsPDF library** for PDF generation functionality.
2. **Create Invoice Modal Component** (`components/customer/invoice-modal.tsx`):
   - Design modal using shadcn components (Dialog, Card, etc.).
   - Display bill details: parts used, quantities, labor charges, total cost (replicate calculation logic from service center appointments page).
   - Include PDF download button.
3. **Update Customer Invoices Page** (`app/customer/invoices/page.tsx`):
   - Add modal trigger (e.g., button on each invoice card).
   - Pass selected invoice data to the modal.
4. **Implement PDF Download Feature**:
   - Use jsPDF to generate PDF with invoice details.
   - Ensure PDF includes all bill details, parts, quantities, labor charges, and total.
5. **Test the Modal and PDF Download**:
   - Verify modal displays correctly with data.
   - Test PDF generation and download functionality.
