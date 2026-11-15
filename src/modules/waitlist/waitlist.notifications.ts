import { getAdminRecipients, getEmailSender } from '@/lib/email/sender';
import { adminSignupEmail } from '@/lib/email/templates/adminSignup';
import { welcomeEmail } from '@/lib/email/templates/welcome';
import { adminUrl, unsubscribeHeaders, unsubscribeLinks } from '@/lib/links';
import { firstName } from '@/modules/waitlist/waitlist.mapper';
import type { Registration } from '@/modules/waitlist/waitlist.schema';

export function adminSummaryRows(registration: Registration, id: string): Array<readonly [string, string]> {
  const common: Array<readonly [string, string]> = [
    ['ID', id],
    ['Name', registration.fullName],
    ['WhatsApp', registration.whatsapp],
    ['Email', registration.email],
    ['Area', registration.area],
  ];
  if (registration.type === 'customer') {
    return [...common, ['Student', registration.student], ['Cravings', registration.searches.join(', ')]];
  }
  return [
    ['Business', registration.businessName],
    ...common,
    ['Category', registration.category],
    ['Delivers', registration.delivers],
    ['Locations', registration.operatingLocations.join(', ')],
    ['Social', registration.socialMediaLink],
  ];
}

export async function notifyNewRegistration(registration: Registration, id: string): Promise<void> {
  const sender = getEmailSender();
  if (!sender) return;

  const tasks: Promise<void>[] = [];
  const admins = getAdminRecipients();

  if (admins.length > 0) {
    const title =
      registration.type === 'customer'
        ? `New waitlist signup: ${firstName(registration.fullName)}`
        : `New vendor application: ${registration.businessName}`;
    tasks.push(
      sender.send({ to: admins, ...adminSignupEmail({ title, rows: adminSummaryRows(registration, id), adminUrl: adminUrl() }) })
    );
  }

  if (registration.email) {
    const links = unsubscribeLinks(registration.email);
    tasks.push(
      sender.send({
        to: [registration.email],
        headers: unsubscribeHeaders(links),
        ...welcomeEmail({
          firstName: firstName(registration.fullName),
          type: registration.type,
          businessName: registration.type === 'vendor' ? registration.businessName : undefined,
          unsubscribeUrl: links.page,
        }),
      })
    );
  }

  const results = await Promise.allSettled(tasks);
  for (const result of results) {
    if (result.status === 'rejected') {
      console.error(
        '[waitlist] Notification email failed.',
        result.reason instanceof Error ? result.reason.message : result.reason
      );
    }
  }
}
