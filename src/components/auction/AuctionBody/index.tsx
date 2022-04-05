import React from 'react'

import { useAuctionDetails } from '../../../hooks/useAuctionDetails'
import { AuctionState, DerivedAuctionInfo } from '../../../state/orderPlacement/hooks'
import { AuctionIdentifier } from '../../../state/orderPlacement/reducer'
import AuctionDetails from '../AuctionDetails'
import { AuctionNotStarted } from '../AuctionNotStarted'
import Claimer from '../Claimer'
import OrderPlacement from '../OrderPlacement'
import { OrderBookContainer } from '../OrderbookContainer'

interface AuctionBodyProps {
  auctionIdentifier: AuctionIdentifier
  derivedAuctionInfo: DerivedAuctionInfo
}

const WarningCard = () => (
  <div className="card card-bordered border-color-[#D5D5D5]">
    <div className="card-body">
      <div className="flex flex-row items-center space-x-2">
        <svg
          fill="none"
          height="14"
          viewBox="0 0 15 14"
          width="15"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clipRule="evenodd"
            d="M7.801 14C11.7702 14 14.9879 10.866 14.9879 7C14.9879 3.13401 11.7702 0 7.801 0C3.83179 0 0.614105 3.13401 0.614105 7C0.614105 10.866 3.83179 14 7.801 14ZM6.80125 3.52497C6.78659 3.23938 7.02037 3 7.31396 3H8.28804C8.58162 3 8.81541 3.23938 8.80075 3.52497L8.59541 7.52497C8.58175 7.79107 8.35625 8 8.0827 8H7.5193C7.24575 8 7.02025 7.79107 7.00659 7.52497L6.80125 3.52497ZM6.7743 10C6.7743 9.44772 7.23397 9 7.801 9C8.36803 9 8.8277 9.44772 8.8277 10C8.8277 10.5523 8.36803 11 7.801 11C7.23397 11 6.7743 10.5523 6.7743 10Z"
            fill="#EDA651"
            fillRule="evenodd"
          />
        </svg>
        <span className="text-[#EDA651]">Warning</span>
      </div>
      <div className="text-sm text-[#9F9F9F]">
        The warning will display a paragraph of text and will be dismissable by a button. It also
        links to auction documentation.
      </div>
      <div className="card-actions mt-6">
        <button className="btn btn-sm btn-warning normal-case text-sm font-normal">
          Ok, I understand
        </button>
        <button className="btn btn-sm btn-link text-white normal-case text-sm font-normal">
          Learn more
        </button>
      </div>
    </div>
  </div>
)

const BondCard = () => (
  <div className="card card-bordered border-[#532DBEA4]">
    <div className="card-body">
      <div className="flex justify-between">
        <h2 className="card-title">Bond information</h2>
        <button className="btn btn-link space-x-2">
          <svg
            fill="none"
            height="18"
            viewBox="0 0 18 18"
            width="18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.27228 0.999809L16.9999 9.00015L8.27228 17.0005"
              stroke="white"
              strokeMiterlimit="10"
            />
            <path
              d="M0.999999 0.999809L9.72764 9.00015L1 17.0005"
              stroke="white"
              strokeMiterlimit="10"
            />
          </svg>
          <span className="text-white text-xs font-normal">Convert</span>
        </button>
      </div>

      <div className="text-sm text-[#9F9F9F] flex justify-between items-end">
        <div className="flex items-center space-x-4">
          <svg
            fill="none"
            height="51"
            viewBox="0 0 51 51"
            width="51"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect fill="#F8F9F3" height="51" rx="12" width="51" />
            <g clipPath="url(#clip0_8815_917)">
              <path
                d="M22.5282 16.1805C22.1946 16.1312 22.176 16.1188 22.3366 16.1003C22.6394 16.051 23.3437 16.1188 23.8379 16.2299C24.987 16.5013 26.0188 17.1983 27.1185 18.4258L27.4027 18.7589L27.8166 18.6972C29.5835 18.4134 31.3999 18.6355 32.9197 19.3325C33.3336 19.5237 33.9885 19.9062 34.0688 19.9987C34.0997 20.0295 34.1491 20.2392 34.18 20.4428C34.2912 21.1892 34.2418 21.7505 34.007 22.1761C33.8773 22.4167 33.8773 22.4783 33.9576 22.6881C34.0194 22.8484 34.2109 22.9595 34.3901 22.9595C34.7731 22.9595 35.1685 22.355 35.36 21.5099L35.4404 21.1768L35.5824 21.3372C36.398 22.2439 37.0343 23.5023 37.127 24.3905L37.1579 24.6311L37.0158 24.4213C36.7748 24.0574 36.5524 23.8168 36.2497 23.6071C35.706 23.2432 35.1314 23.1322 33.6178 23.052C32.2463 22.9718 31.4678 22.8608 30.7018 22.6079C29.392 22.1761 28.7248 21.6209 27.1803 19.5669C26.4945 18.6602 26.062 18.1667 25.6357 17.7534C24.6967 16.8467 23.7514 16.3717 22.5282 16.1805Z"
                fill="#FF007A"
              />
              <path
                d="M34.4025 18.1974C34.4334 17.5929 34.5137 17.192 34.6867 16.828C34.7485 16.6862 34.8164 16.5566 34.8288 16.5566C34.8473 16.5566 34.8102 16.6677 34.767 16.7972C34.6372 17.1488 34.6249 17.6423 34.7052 18.1974C34.8164 18.9129 34.8658 19.0116 35.6319 19.7888C35.9841 20.1527 36.398 20.6154 36.5586 20.8066L36.8305 21.1582L36.5586 20.9053C36.225 20.5845 35.4589 19.98 35.2859 19.8998C35.1747 19.8382 35.1562 19.8382 35.0759 19.9184C35.0141 19.98 34.9956 20.0787 34.9956 20.5413C34.977 21.2569 34.8844 21.701 34.6434 22.1636C34.5137 22.4042 34.5013 22.3548 34.6125 22.0834C34.6928 21.8737 34.7052 21.7812 34.7052 21.0965C34.7052 19.7148 34.5446 19.3755 33.5746 18.8204C33.3337 18.6785 32.9197 18.4688 32.685 18.3578C32.4317 18.2467 32.2402 18.1481 32.2525 18.1481C32.2834 18.1172 33.2225 18.3886 33.5932 18.5428C34.1492 18.7649 34.248 18.7834 34.3098 18.7649C34.3531 18.7279 34.3839 18.5983 34.4025 18.1974Z"
                fill="#FF007A"
              />
              <path
                d="M23.1831 20.5719C22.5158 19.6467 22.0834 18.2156 22.176 17.1485L22.2069 16.8154L22.3676 16.8463C22.6518 16.8956 23.146 17.0868 23.387 17.2287C24.0233 17.6111 24.3137 18.1354 24.5793 19.4431C24.6596 19.8255 24.7708 20.2697 24.8203 20.4115C24.9006 20.6521 25.2033 21.2072 25.4566 21.5588C25.6296 21.8117 25.5184 21.9413 25.123 21.9104C24.5175 21.8426 23.7082 21.2874 23.1831 20.5719Z"
                fill="#FF007A"
              />
              <path
                d="M33.5869 27.4929C30.4299 26.2223 29.3179 25.1243 29.3179 23.2615C29.3179 22.9901 29.3364 22.7681 29.3364 22.7681C29.3549 22.7681 29.4661 22.8606 29.6082 22.9778C30.2446 23.4898 30.9612 23.7118 32.9568 23.9955C34.1182 24.1683 34.7916 24.2978 35.3971 24.5075C37.3247 25.1428 38.5232 26.4505 38.8074 28.2146C38.8877 28.7266 38.8383 29.695 38.7147 30.2008C38.6035 30.5956 38.2823 31.3296 38.2019 31.3481C38.1834 31.3481 38.1525 31.2679 38.1525 31.1384C38.1216 30.4722 37.788 29.8307 37.2258 29.3373C36.5524 28.7698 35.6936 28.338 33.5869 27.4929Z"
                fill="#FF007A"
              />
              <path
                d="M31.3566 28.0171C31.3257 27.7765 31.2454 27.4743 31.196 27.3509L31.1156 27.1104L31.2577 27.2831C31.4678 27.5236 31.6222 27.8074 31.7705 28.2083C31.8817 28.5106 31.8817 28.6031 31.8817 29.0965C31.8817 29.5715 31.8632 29.6825 31.7705 29.9539C31.6099 30.3857 31.4184 30.688 31.1033 31.021C30.5287 31.607 29.7812 31.9278 28.7124 32.0697C28.5209 32.0882 27.9772 32.1313 27.5015 32.1622C26.3091 32.2239 25.5121 32.3534 24.7893 32.6063C24.6966 32.6371 24.5978 32.668 24.5793 32.6556C24.5484 32.6248 25.0426 32.3349 25.438 32.1437C25.994 31.8723 26.5686 31.7304 27.8289 31.5083C28.4529 31.4158 29.0892 31.2863 29.2499 31.2246C30.8315 30.7373 31.6099 29.516 31.3566 28.0171Z"
                fill="#FF007A"
              />
              <path
                d="M32.8083 30.5834C32.3944 29.6767 32.2956 28.8193 32.5241 28.0051C32.555 27.9249 32.5859 27.8447 32.6168 27.8447C32.6477 27.8447 32.7466 27.8941 32.8392 27.9558C33.0308 28.0853 33.4261 28.3073 34.4517 28.8625C35.7429 29.5657 36.4781 30.1023 36.9847 30.7253C37.4295 31.2681 37.7014 31.8849 37.8311 32.6498C37.9114 33.0816 37.862 34.1117 37.7508 34.5435C37.3987 35.8943 36.6017 36.9799 35.4402 37.5967C35.2672 37.6893 35.1189 37.7571 35.1066 37.7571C35.0942 37.7571 35.156 37.5967 35.2487 37.4055C35.6317 36.5913 35.6811 35.8141 35.3908 34.9382C35.2178 34.3954 34.8471 33.7477 34.1181 32.6436C33.2346 31.3791 33.0308 31.0399 32.8083 30.5834Z"
                fill="#FF007A"
              />
              <path
                d="M20.9342 35.4502C22.1142 34.4633 23.5661 33.7663 24.9005 33.5381C25.4751 33.4455 26.4327 33.4764 26.9578 33.6183C27.8042 33.8403 28.5703 34.3214 28.9657 34.9074C29.3488 35.4811 29.5217 35.9745 29.7009 37.0725C29.7627 37.5043 29.843 37.9484 29.8615 38.0409C29.9913 38.6145 30.2446 39.0587 30.5658 39.2992C31.0601 39.6631 31.9188 39.6816 32.7652 39.3609C32.9073 39.3116 33.0371 39.2684 33.0371 39.2807C33.068 39.3115 32.6417 39.6015 32.3513 39.7433C31.9559 39.953 31.6346 40.0147 31.2022 40.0147C30.4361 40.0147 29.7812 39.62 29.2561 38.8243C29.1449 38.6639 28.9225 38.2013 28.7309 37.7757C28.1749 36.4865 27.8845 36.1041 27.2297 35.6723C26.6551 35.3084 25.9199 35.2282 25.3639 35.4996C24.6287 35.8512 24.4372 36.7887 24.95 37.3624C25.16 37.6029 25.5369 37.7942 25.8581 37.8373C26.4451 37.9175 26.9578 37.4549 26.9578 36.8689C26.9578 36.4865 26.8157 36.2644 26.4327 36.0917C25.9199 35.8697 25.3639 36.1226 25.3824 36.616C25.3824 36.8257 25.4751 36.9491 25.6851 37.0478C25.8149 37.1095 25.8149 37.1095 25.716 37.0971C25.2527 37.0046 25.1415 36.431 25.506 36.0609C25.9508 35.6168 26.8899 35.808 27.2111 36.4248C27.3409 36.6777 27.3532 37.1897 27.242 37.5043C26.9702 38.2074 26.2041 38.5714 25.4257 38.3616C24.9005 38.2198 24.6781 38.0779 24.0418 37.4241C22.9235 36.2768 22.4973 36.0547 20.9033 35.8142L20.6006 35.7648L20.9342 35.4502Z"
                fill="#FF007A"
              />
              <path
                clipRule="evenodd"
                d="M12.5503 9.8463C16.2634 14.3491 21.9843 21.3501 22.2746 21.7326C22.5156 22.0533 22.4167 22.3555 22.0213 22.5776C21.7989 22.7071 21.3356 22.8305 21.1132 22.8305C20.8599 22.8305 20.5571 22.701 20.3471 22.4974C20.205 22.3555 19.581 21.4488 18.1786 19.2652C17.1098 17.5936 16.2016 16.212 16.1892 16.1934C16.1275 16.1626 16.1275 16.1626 18.0674 19.6292C19.2968 21.8066 19.6922 22.5899 19.6922 22.6825C19.6922 22.8922 19.6304 23.0032 19.3709 23.287C18.9385 23.7619 18.747 24.3047 18.6049 25.4335C18.4442 26.6918 18.0179 27.5801 16.7885 29.0913C16.0719 29.9795 15.9606 30.1399 15.7815 30.51C15.5591 30.9541 15.4973 31.2132 15.4602 31.7807C15.4293 32.3852 15.4911 32.7676 15.6703 33.3412C15.8309 33.8532 16.0039 34.1863 16.4364 34.8401C16.8009 35.4138 17.0233 35.8456 17.0233 35.9998C17.0233 36.1293 17.0542 36.1293 17.6287 35.9998C19.0003 35.679 20.1309 35.1424 20.7548 34.47C21.1379 34.0568 21.2305 33.8347 21.2305 33.261C21.2305 32.8971 21.212 32.8169 21.1193 32.5949C20.9587 32.2433 20.656 31.9595 20.0011 31.5154C19.1424 30.9294 18.7717 30.4483 18.679 29.813C18.5987 29.2702 18.6975 28.9062 19.1732 27.9008C19.6675 26.8646 19.7972 26.4389 19.8775 25.3842C19.927 24.718 20.0073 24.4466 20.1988 24.2369C20.4089 24.0148 20.5819 23.9346 21.0761 23.8729C21.8916 23.7619 22.4167 23.5522 22.8307 23.1574C23.1952 22.8243 23.3558 22.4913 23.3743 21.9978L23.3929 21.6339L23.1828 21.4118C22.4291 20.5544 12.0561 9.16162 12.0067 9.16162C11.9881 9.16162 12.2476 9.46387 12.5503 9.8463ZM17.4434 32.4777C17.6164 32.1754 17.5237 31.793 17.2333 31.6018C16.9615 31.4291 16.5476 31.5093 16.5476 31.7437C16.5476 31.8053 16.5785 31.8732 16.6773 31.904C16.8194 31.9842 16.8379 32.0644 16.7267 32.2371C16.6155 32.4098 16.6155 32.5702 16.7576 32.6812C16.98 32.8601 17.2828 32.7614 17.4434 32.4777Z"
                fill="#FF007A"
                fillRule="evenodd"
              />
              <path
                clipRule="evenodd"
                d="M23.8996 24.1071C23.5166 24.2182 23.1521 24.6314 23.0409 25.0447C22.9791 25.2976 23.01 25.7602 23.1212 25.9021C23.2942 26.1241 23.4548 26.1858 23.8996 26.1858C24.7769 26.1858 25.5245 25.8034 25.6048 25.3408C25.6851 24.9583 25.3515 24.434 24.8881 24.1935C24.6472 24.0701 24.1529 24.0269 23.8996 24.1071ZM24.919 24.9028C25.0488 24.7116 24.9993 24.5081 24.7584 24.36C24.3259 24.0886 23.6772 24.3107 23.6772 24.7239C23.6772 24.9337 24.0108 25.1557 24.3321 25.1557C24.536 25.1557 24.8202 25.0262 24.919 24.9028Z"
                fill="#FF007A"
                fillRule="evenodd"
              />
            </g>
            <defs>
              <clipPath id="clip0_8815_917">
                <rect
                  fill="white"
                  height="30.9643"
                  rx="12"
                  width="27.3214"
                  x="11.8392"
                  y="9.10693"
                />
              </clipPath>
            </defs>
          </svg>

          <div className="space-y-2">
            <h2 className="text-2xl text-white font-normal">Uniswap Convert</h2>
            <p className="text-[#9F9F9F] text-xs font-normal">
              UNI CONVERT 24 AUG 2022 2p 25c USDC
            </p>
          </div>
        </div>
        <button className="rounded-md text-xs font-normal btn btn-sm btn-primary bg-[#532DBE]">
          More Details
        </button>
      </div>
    </div>
  </div>
)

const AuctionBody = (props: AuctionBodyProps) => {
  const {
    auctionIdentifier,
    derivedAuctionInfo: { auctionState },
    derivedAuctionInfo,
  } = props
  const { auctionDetails, auctionInfoLoading } = useAuctionDetails(auctionIdentifier)

  const auctionStarted = React.useMemo(
    () => auctionState !== undefined && auctionState !== AuctionState.NOT_YET_STARTED,
    [auctionState],
  )
  const isPrivate = React.useMemo(
    () => auctionDetails && auctionDetails.isPrivateAuction,
    [auctionDetails],
  )
  return (
    <>
      {auctionStarted && (
        <main className="pb-8 px-0">
          <div className="max-w-3xl mx-auto lg:max-w-7xl">
            <h1 className="sr-only">Page title</h1>
            {/* Main 3 column grid */}
            <div className="grid grid-cols-1 gap-4 items-start lg:grid-cols-3 lg:gap-8">
              {/* Left column */}
              <div className="grid grid-cols-1 gap-4 lg:col-span-2">
                <section aria-labelledby="section-1-title">
                  <AuctionDetails
                    auctionIdentifier={auctionIdentifier}
                    derivedAuctionInfo={derivedAuctionInfo}
                  />

                  <BondCard />

                  <OrderBookContainer
                    auctionIdentifier={auctionIdentifier}
                    auctionStarted={auctionStarted}
                    auctionState={auctionState}
                    derivedAuctionInfo={derivedAuctionInfo}
                  />
                </section>
              </div>

              {/* Right column */}
              <div className="grid grid-cols-1 gap-4">
                <section aria-labelledby="section-2-title">
                  <div
                    className={`card card-bordered ${
                      !auctionInfoLoading && isPrivate
                        ? 'border-color-[#D5D5D5]'
                        : 'border-[#404EEDA4]'
                    }`}
                  >
                    <div className="card-body">
                      {(auctionState === AuctionState.ORDER_PLACING ||
                        auctionState === AuctionState.ORDER_PLACING_AND_CANCELING) && (
                        <OrderPlacement
                          auctionIdentifier={auctionIdentifier}
                          derivedAuctionInfo={derivedAuctionInfo}
                        />
                      )}
                      {(auctionState === AuctionState.CLAIMING ||
                        auctionState === AuctionState.PRICE_SUBMISSION) && (
                        <Claimer
                          auctionIdentifier={auctionIdentifier}
                          derivedAuctionInfo={derivedAuctionInfo}
                        />
                      )}
                    </div>
                  </div>
                  <WarningCard />
                </section>
              </div>
            </div>
          </div>
        </main>
      )}
      {auctionState === AuctionState.NOT_YET_STARTED && <AuctionNotStarted />}
    </>
  )
}
export default AuctionBody
