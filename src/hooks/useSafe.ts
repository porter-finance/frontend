// import { useEffect, useState } from 'react'

// import SafeAppsSDK from '@gnosis.pm/safe-apps-sdk/dist/src/sdk'

// const appsSdk = new SafeAppsSDK()

// const useSafe = () => {
//   const [safeAddress, setSafeAddress] = useState<string | null>(null)
//   useEffect(() => {
//     const getSafeAddress = async () => {
//       const { safeAddress } = await appsSdk.safe.getInfo()
//       setSafeAddress(safeAddress)
//     }
//     getSafeAddress()
//   }, [])

//   return { safeAddress }
// }

// export default useSafe
