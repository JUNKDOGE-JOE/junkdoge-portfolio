import { HashRedirect } from '@/components/HashRedirect'

/* Marathon UI lives in ./Marathon.tsx — imported by app/page.tsx (main site).
   This lab URL redirects to `/` so we don't maintain two entry points. */

export default function MarathonLabPage() {
  return <HashRedirect hash="mr-top" />
}
