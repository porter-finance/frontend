import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled, { css } from 'styled-components'

import AuctionBody from '../../components/auction/AuctionBody'
import { ButtonCopy } from '../../components/buttons/ButtonCopy'
import { InlineLoading } from '../../components/common/InlineLoading'
import { NetworkIcon } from '../../components/icons/NetworkIcon'
import WarningModal from '../../components/modals/WarningModal'
import { PageTitle } from '../../components/pureStyledComponents/PageTitle'
import useShowTopWarning from '../../hooks/useShowTopWarning'
import { useDerivedAuctionInfo } from '../../state/orderPlacement/hooks'
import { RouteAuctionIdentifier, parseURL } from '../../state/orderPlacement/reducer'
import { useTokenListState } from '../../state/tokenList/hooks'
import { isAddress } from '../../utils'
import { getChainName } from '../../utils/tools'

const Title = styled(PageTitle)`
  margin-bottom: 2px;
`

const SubTitleWrapperStyled = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: 20px;
`

const SubTitle = styled.h2`
  align-items: center;
  color: ${({ theme }) => theme.text1};
  display: flex;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0 8px 0 0;
`

const AuctionId = styled.span`
  align-items: center;
  display: flex;
`

const IconCSS = css`
  height: 14px;
  width: 14px;
`

const CopyButton = styled(ButtonCopy)`
  ${IconCSS}
`

const Network = styled.span`
  align-items: center;
  display: flex;
  margin-right: 5px;
`

const NetworkIconStyled = styled(NetworkIcon)`
  ${IconCSS}
`

const NetworkName = styled.span`
  margin-left: 8px;
  text-transform: capitalize;
`

const Auction: React.FC = () => {
  const { setShowTopWarning } = useShowTopWarning()
  const navigate = useNavigate()

  const auctionIdentifier = parseURL(useParams<RouteAuctionIdentifier>())
  const derivedAuctionInfo = useDerivedAuctionInfo(auctionIdentifier)
  const { tokens } = useTokenListState()
  const url = window.location.href

  const biddingTokenAddress = derivedAuctionInfo?.biddingToken?.address
  const auctioningTokenAddress = derivedAuctionInfo?.auctioningToken?.address
  const validBiddingTokenAddress =
    biddingTokenAddress !== undefined &&
    isAddress(biddingTokenAddress) &&
    tokens &&
    tokens[biddingTokenAddress.toLowerCase()] !== undefined
  const validAuctioningTokenAddress =
    auctioningTokenAddress !== undefined &&
    isAddress(auctioningTokenAddress) &&
    tokens &&
    tokens[auctioningTokenAddress.toLowerCase()] !== undefined

  React.useEffect(() => {
    if (
      !derivedAuctionInfo ||
      biddingTokenAddress === undefined ||
      auctioningTokenAddress === undefined
    ) {
      setShowTopWarning(false)
      return
    }

    setShowTopWarning(!validBiddingTokenAddress || !validAuctioningTokenAddress)
  }, [
    auctioningTokenAddress,
    biddingTokenAddress,
    derivedAuctionInfo,
    setShowTopWarning,
    validAuctioningTokenAddress,
    validBiddingTokenAddress,
  ])

  const isLoading = React.useMemo(() => derivedAuctionInfo === null, [derivedAuctionInfo])
  const invalidAuction = React.useMemo(
    () => !auctionIdentifier || derivedAuctionInfo === undefined,
    [auctionIdentifier, derivedAuctionInfo],
  )

  return (
    <>
      {isLoading && <InlineLoading />}
      {!isLoading && !invalidAuction && (
        <>
          <div>
            <div className="flex items-center content-center text-white">
              <svg
                fill="none"
                height="12"
                viewBox="0 0 7 12"
                width="7"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.72612 1.61726C7.09129 1.24729 7.09129 0.647449 6.72612 0.277479C6.36096 -0.092492 5.76891 -0.092492 5.40374 0.277479L0.416733 5.33011C0.0547446 5.69686 0.0511355 6.29035 0.408637 6.66159L5.27426 11.7142C5.6349 12.0887 6.22691 12.0961 6.59654 11.7307C6.96618 11.3653 6.97347 10.7655 6.61283 10.391L2.39221 6.0082L6.72612 1.61726Z"
                  fill="white"
                />
              </svg>
              <p className="ml-2">Offerings</p>
            </div>
            <div className="flex items-center content-center justify-between ...">
              <div className="flex">
                <div className="self-center mr-5">
                  <svg
                    fill="none"
                    height="60"
                    viewBox="0 0 60 60"
                    width="60"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect fill="#F8F9F3" height="60" rx="12" width="60" />
                    <g clipPath="url(#clip0_8725_1995)">
                      <path
                        d="M26.5036 19.0374C26.1111 18.9794 26.0893 18.9648 26.2783 18.9431C26.6344 18.885 27.463 18.9648 28.0445 19.0955C29.3964 19.4148 30.6102 20.2348 31.904 21.6789L32.2383 22.0707L32.7253 21.9982C34.804 21.6644 36.9409 21.9256 38.7289 22.7456C39.2159 22.9706 39.9863 23.4205 40.0808 23.5294C40.1172 23.5656 40.1753 23.8124 40.2117 24.0518C40.3425 24.9299 40.2843 25.5903 40.0081 26.091C39.8555 26.374 39.8555 26.4466 39.95 26.6933C40.0227 26.882 40.248 27.0126 40.4588 27.0126C40.9094 27.0126 41.3746 26.3015 41.5999 25.3073L41.6944 24.9154L41.8616 25.1041C42.821 26.1708 43.5696 27.6512 43.6787 28.6962L43.715 28.9792L43.5478 28.7325C43.2644 28.3043 43.0027 28.0213 42.6465 27.7746C42.0069 27.3464 41.331 27.2158 39.5502 27.1215C37.9367 27.0271 37.0209 26.8965 36.1196 26.599C34.5787 26.091 33.7937 25.4379 31.9766 23.0214C31.1699 21.9546 30.6611 21.3741 30.1596 20.8879C29.0548 19.8211 27.9427 19.2624 26.5036 19.0374Z"
                        fill="#FF007A"
                      />
                      <path
                        d="M40.4733 21.4103C40.5096 20.6991 40.6041 20.2274 40.8076 19.7993C40.8803 19.6324 40.9602 19.48 40.9748 19.48C40.9966 19.48 40.953 19.6106 40.9021 19.763C40.7495 20.1766 40.7349 20.7572 40.8294 21.4103C40.9602 22.2521 41.0184 22.3682 41.9197 23.2825C42.334 23.7107 42.8209 24.255 43.0099 24.4799L43.3297 24.8936L43.0099 24.596C42.6174 24.2187 41.7161 23.5075 41.5126 23.4132C41.3818 23.3406 41.36 23.3406 41.2655 23.4349C41.1928 23.5075 41.171 23.6236 41.171 24.1679C41.1492 25.0097 41.0402 25.5321 40.7567 26.0764C40.6041 26.3594 40.5896 26.3014 40.7204 25.9821C40.8149 25.7353 40.8294 25.6265 40.8294 24.821C40.8294 23.1955 40.6404 22.7963 39.4993 22.1432C39.2159 21.9763 38.7289 21.7296 38.4527 21.599C38.1547 21.4683 37.9294 21.3522 37.9439 21.3522C37.9802 21.3159 39.085 21.6352 39.5211 21.8167C40.1753 22.0779 40.2916 22.0997 40.3642 22.0779C40.4151 22.0344 40.4515 21.882 40.4733 21.4103Z"
                        fill="#FF007A"
                      />
                      <path
                        d="M27.274 24.2043C26.489 23.1158 25.9802 21.4322 26.0893 20.1768L26.1256 19.7849L26.3146 19.8212C26.6489 19.8793 27.2304 20.1042 27.5139 20.2711C28.2625 20.721 28.6041 21.3379 28.9166 22.8763C29.0111 23.3262 29.142 23.8487 29.2001 24.0156C29.2946 24.2986 29.6507 24.9517 29.9487 25.3654C30.1523 25.6629 30.0214 25.8153 29.5563 25.779C28.844 25.6992 27.8918 25.0461 27.274 24.2043Z"
                        fill="#FF007A"
                      />
                      <path
                        d="M39.5139 32.3463C35.7998 30.8514 34.4915 29.5597 34.4915 27.3681C34.4915 27.0488 34.5133 26.7876 34.5133 26.7876C34.5351 26.7876 34.6659 26.8964 34.8331 27.0343C35.5817 27.6366 36.4248 27.8979 38.7725 28.2317C40.1389 28.4349 40.9312 28.5873 41.6435 28.834C43.9112 29.5815 45.3213 31.1199 45.6556 33.1953C45.7501 33.7976 45.6919 34.9369 45.5466 35.532C45.4157 35.9964 45.0378 36.86 44.9433 36.8818C44.9215 36.8818 44.8852 36.7874 44.8852 36.635C44.8488 35.8513 44.4563 35.0966 43.7949 34.5161C43.0027 33.8484 41.9924 33.3405 39.5139 32.3463Z"
                        fill="#FF007A"
                      />
                      <path
                        d="M36.8899 32.9632C36.8535 32.6802 36.759 32.3246 36.7009 32.1795L36.6064 31.8965L36.7736 32.0997C37.0207 32.3827 37.2024 32.7165 37.3768 33.1882C37.5077 33.5438 37.5077 33.6526 37.5077 34.2332C37.5077 34.792 37.4859 34.9226 37.3768 35.2419C37.1879 35.7499 36.9626 36.1054 36.5919 36.4973C35.9159 37.1867 35.0364 37.5641 33.779 37.731C33.5537 37.7527 32.9141 37.8035 32.3544 37.8398C30.9517 37.9124 30.0141 38.0648 29.1637 38.3623C29.0546 38.3986 28.9383 38.4349 28.9165 38.4204C28.8802 38.3841 29.4617 38.043 29.9268 37.818C30.581 37.4987 31.2569 37.3318 32.7397 37.0706C33.4738 36.9617 34.2224 36.8093 34.4114 36.7368C36.2721 36.1635 37.1879 34.7266 36.8899 32.9632Z"
                        fill="#FF007A"
                      />
                      <path
                        d="M38.598 35.982C38.111 34.9153 37.9947 33.9066 38.2636 32.9487C38.3 32.8543 38.3363 32.76 38.3726 32.76C38.409 32.76 38.5253 32.8181 38.6343 32.8906C38.8596 33.043 39.3248 33.3043 40.5313 33.9574C42.0504 34.7846 42.9154 35.416 43.5114 36.1489C44.0347 36.7875 44.3545 37.5132 44.5071 38.413C44.6016 38.921 44.5435 40.1329 44.4126 40.6409C43.9983 42.2301 43.0607 43.5073 41.6943 44.233C41.4908 44.3418 41.3163 44.4216 41.3018 44.4216C41.2873 44.4216 41.3599 44.233 41.469 44.008C41.9196 43.0501 41.9777 42.1358 41.6361 41.1053C41.4326 40.4667 40.9965 39.7047 40.1389 38.4058C39.0995 36.9181 38.8596 36.519 38.598 35.982Z"
                        fill="#FF007A"
                      />
                      <path
                        d="M24.6283 41.7076C26.0166 40.5465 27.7246 39.7265 29.2946 39.458C29.9706 39.3492 31.0971 39.3854 31.715 39.5524C32.7107 39.8136 33.612 40.3796 34.0772 41.069C34.5278 41.7439 34.7313 42.3244 34.9421 43.6161C35.0148 44.1241 35.1093 44.6466 35.1311 44.7555C35.2837 45.4303 35.5817 45.9528 35.9597 46.2358C36.5411 46.664 37.5514 46.6858 38.5472 46.3084C38.7144 46.2503 38.867 46.1995 38.867 46.2141C38.9033 46.2503 38.4018 46.5914 38.0602 46.7583C37.595 47.005 37.2171 47.0776 36.7083 47.0776C35.807 47.0776 35.0366 46.6132 34.4188 45.6771C34.2879 45.4884 34.0263 44.9441 33.801 44.4434C33.1468 42.9267 32.8052 42.4768 32.0348 41.9689C31.3588 41.5407 30.4939 41.4464 29.8397 41.7657C28.9748 42.1793 28.7495 43.2823 29.3527 43.9572C29.5999 44.2402 30.0432 44.4652 30.4212 44.516C31.1117 44.6103 31.715 44.0661 31.715 43.3767C31.715 42.9267 31.5478 42.6655 31.0971 42.4623C30.4939 42.2011 29.8397 42.4986 29.8615 43.0791C29.8615 43.3259 29.9706 43.471 30.2177 43.5871C30.3703 43.6597 30.3703 43.6597 30.254 43.6452C29.7089 43.5363 29.5781 42.8614 30.0069 42.426C30.5302 41.9035 31.635 42.1285 32.013 42.8542C32.1656 43.1517 32.1801 43.754 32.0493 44.1241C31.7295 44.9514 30.8282 45.3795 29.9124 45.1328C29.2946 44.9659 29.0329 44.799 28.2843 44.0298C26.9687 42.68 26.4672 42.4188 24.592 42.1358L24.2358 42.0777L24.6283 41.7076Z"
                        fill="#FF007A"
                      />
                      <path
                        clipRule="evenodd"
                        d="M14.7651 11.5848C19.1334 16.8823 25.8638 25.1187 26.2055 25.5686C26.4889 25.946 26.3726 26.3016 25.9075 26.5628C25.6458 26.7152 25.1007 26.8603 24.839 26.8603C24.541 26.8603 24.1849 26.7079 23.9377 26.4685C23.7706 26.3016 23.0365 25.2348 21.3866 22.6659C20.1291 20.6993 19.0607 19.0738 19.0462 19.052C18.9735 19.0157 18.9735 19.0157 21.2557 23.0941C22.7021 25.6557 23.1673 26.5773 23.1673 26.6862C23.1673 26.9329 23.0946 27.0635 22.7893 27.3973C22.2806 27.9561 22.0552 28.5947 21.8881 29.9227C21.6991 31.4031 21.1976 32.4481 19.7512 34.226C18.9081 35.2709 18.7772 35.4596 18.5664 35.895C18.3048 36.4175 18.2321 36.7223 18.1885 37.3899C18.1521 38.1011 18.2248 38.551 18.4356 39.2259C18.6246 39.8282 18.8281 40.2201 19.3369 40.9893C19.7657 41.6642 20.0274 42.1722 20.0274 42.3536C20.0274 42.506 20.0637 42.506 20.7397 42.3536C22.3532 41.9762 23.6833 41.3449 24.4174 40.5539C24.8681 40.0677 24.9771 39.8064 24.9771 39.1316C24.9771 38.7034 24.9553 38.6091 24.8463 38.3478C24.6573 37.9342 24.3012 37.6004 23.5307 37.0779C22.5204 36.3885 22.0843 35.8225 21.9753 35.075C21.8808 34.4364 21.9971 34.0083 22.5568 32.8254C23.1382 31.6063 23.2909 31.1056 23.3853 29.8646C23.4435 29.0809 23.538 28.7616 23.7633 28.5149C24.0104 28.2536 24.2139 28.1593 24.7954 28.0867C25.7548 27.9561 26.3726 27.7094 26.8596 27.2449C27.2884 26.8531 27.4774 26.4612 27.4992 25.8807L27.521 25.4525L27.2739 25.1913C26.3872 24.1826 14.1836 10.7793 14.1255 10.7793C14.1037 10.7793 14.409 11.1349 14.7651 11.5848ZM20.5216 38.2099C20.7251 37.8544 20.6161 37.4044 20.2745 37.1795C19.9547 36.9763 19.4677 37.0706 19.4677 37.3464C19.4677 37.419 19.5041 37.4988 19.6203 37.5351C19.7875 37.6294 19.8093 37.7237 19.6785 37.9269C19.5477 38.1301 19.5477 38.3188 19.7148 38.4494C19.9765 38.6599 20.3326 38.5438 20.5216 38.2099Z"
                        fill="#FF007A"
                        fillRule="evenodd"
                      />
                      <path
                        clipRule="evenodd"
                        d="M28.1171 28.3624C27.6665 28.493 27.2377 28.9792 27.1068 29.4654C27.0342 29.7629 27.0705 30.3072 27.2013 30.4741C27.4048 30.7353 27.5938 30.8079 28.1171 30.8079C29.1492 30.8079 30.0287 30.358 30.1232 29.8137C30.2177 29.3638 29.8252 28.747 29.2801 28.4639C28.9966 28.3188 28.4151 28.268 28.1171 28.3624ZM29.3164 29.2985C29.469 29.0735 29.4109 28.834 29.1274 28.6599C28.6187 28.3406 27.8555 28.6018 27.8555 29.088C27.8555 29.3348 28.248 29.596 28.6259 29.596C28.8658 29.596 29.2001 29.4436 29.3164 29.2985Z"
                        fill="#FF007A"
                        fillRule="evenodd"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_8725_1995">
                        <rect
                          fill="white"
                          height="36.4286"
                          transform="translate(13.9286 10.7144)"
                          width="32.1429"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl text-white">Uniswap</h1>
                  <p className="text-blue-100">UNI CONVERT 24 AUG 2022 2p 25c USDC </p>
                </div>
              </div>
              <div className="py-8">
                <button className="btn btn-sm px-5 rounded-full bg-transparent text-white border-blue-100">
                  <svg
                    fill="none"
                    height="12"
                    viewBox="0 0 18 18"
                    width="18"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8.27227 0.999565L16.9999 8.9999L8.27227 17.0002"
                      stroke="white"
                      strokeMiterlimit="10"
                    />
                    <path
                      d="M0.999999 0.999565L9.72764 8.9999L1 17.0002"
                      stroke="white"
                      strokeMiterlimit="10"
                    />
                  </svg>
                  <span className="ml-2">Convert</span>
                </button>
                <button className="btn btn-sm px-5 rounded-full ml-2 text-indigo-500 bg-white">
                  <svg
                    className="-ml-0.5 mr-1.5 h-2 w-2 text-indigo-200"
                    fill="currentColor"
                    viewBox="0 0 8 8"
                  >
                    <circle cx={4} cy={4} r={3} />
                  </svg>
                  ongoing
                </button>
              </div>
            </div>
          </div>
          <Title>Auction Details</Title>
          <SubTitleWrapperStyled>
            <SubTitle>
              <Network>
                <NetworkIconStyled />
                <NetworkName>Selling on {getChainName(auctionIdentifier.chainId)} -</NetworkName>
              </Network>
              <AuctionId>Auction Id #{auctionIdentifier.auctionId}</AuctionId>
            </SubTitle>
            <CopyButton copyValue={url} title="Copy URL" />
          </SubTitleWrapperStyled>

          <AuctionBody
            auctionIdentifier={auctionIdentifier}
            derivedAuctionInfo={derivedAuctionInfo}
          />
        </>
      )}
      {!isLoading && invalidAuction && (
        <>
          <WarningModal
            content={`This auction doesn't exist or it hasn't started yet.`}
            isOpen
            onDismiss={() => navigate('/overview')}
            title="Warning!"
          />
        </>
      )}
    </>
  )
}

export default Auction
