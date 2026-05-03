import type { RoutePageProps } from '../../app/pageProps'
import { EndOfDayScreen } from '../../features/end-of-day/components/EndOfDayScreen'

export function EndOfDayPage({ settings }: RoutePageProps) {
  return <EndOfDayScreen settings={settings} />
}
