# TODO: Implement Paginated Appointments Page

## Steps:
1. **Implement API Route for Appointments List with Pagination**
   - Edit `app/api/service-centers/appointments/route.ts` to add GET handler with pagination (limit 20, page param), fetch from Prisma with serviceCenterId filter, return appointments, totalCount, etc.

2. **Add POST Handler for Creating Appointments (if needed)**
   - In the same route.ts, add POST handler using RHF/Zod for validation, create appointment in Prisma, return success.

3. **Update Appointments Page Component**
   - Replace `app/service-center/appointments/page.tsx` with full component: useQuery for fetching, Shadcn Table for rendering, pagination controls, Dialog with Form for creating new appointments.

4. **Test and Verify**
   - Run dev server, navigate to page, check data loading, pagination, form submission, responsiveness.
