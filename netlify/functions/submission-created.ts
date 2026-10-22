import { netlifyInquiries, type FormSubmission } from "../inquiries";

// Netlify runs this function, found by its name, for each form submission that passes its spam
// filter, and only Netlify can run it. It saves each Inquiry from the contact form, with its photos.
// Netlify Forms still stores the submission and emails the owner as before. Tests build it with their
// own store.

export const submissionCreated =
  (inquiries = netlifyInquiries) =>
  async (request: Request): Promise<Response> => {
    const { payload }: { payload: FormSubmission } = await request.json();
    await inquiries().receive(payload);
    return new Response(null, { status: 204 });
  };

export default submissionCreated();
