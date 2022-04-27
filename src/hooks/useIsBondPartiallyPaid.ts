import { forceDevData } from '../components/Dev'
import { getLogger } from '../utils/logger'

const logger = getLogger('useIsBondPartiallyPaid')

export function useIsBondPartiallyPaid(address: string | undefined): boolean | undefined {
  return forceDevData ? false : undefined
}
