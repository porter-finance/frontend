import { isDev } from '../components/Dev'
import { getLogger } from '../utils/logger'

const logger = getLogger('useIsBondDefaulted')

export function useIsBondDefaulted(address: string | undefined): boolean | undefined {
  return isDev ? true : undefined
}
