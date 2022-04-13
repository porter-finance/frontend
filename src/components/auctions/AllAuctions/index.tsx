import React, { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { css } from 'styled-components'

import { useGlobalFilter, usePagination, useTable } from 'react-table'

import { ReactComponent as AuctionsLogo } from '../../../assets/svg/auctions.svg'
import { ReactComponent as OTCLogo } from '../../../assets/svg/otc.svg'
import { AuctionButtonOutline, LoadingBox, OTCButtonOutline } from '../../../pages/Auction'
import { ActionButton } from '../../auction/Claimer'
import { Dropdown } from '../../common/Dropdown'
import { ChevronRight } from '../../icons/ChevronRight'
import { Delete } from '../../icons/Delete'
import { Magnifier } from '../../icons/Magnifier'
import { Cell } from '../../pureStyledComponents/Cell'
import { PageTitle } from '../../pureStyledComponents/PageTitle'

const Wrapper = styled.div`
  margin-top: -30px;
`

const SectionTitle = styled(PageTitle)`
  font-weight: 400;
  font-size: 42px;
  color: #ffffff;
  margin: 0;
`

const TableControls = styled.div`
  @media (min-width: ${({ theme }) => theme.themeBreakPoints.md}) {
    align-items: center;
    display: flex;
    justify-content: space-between;
  }
`

const SearchWrapper = styled.div`
  align-items: center;
  display: flex;
  max-width: 100%;
  padding-left: 9px;
  padding-right: 0;
  width: 237px;
  border-radius: 100px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
`

const SearchInput = styled.input`
  border: none;
  background: none;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  letter-spacing: 0.1em;
  color: white;
  ::placeholder {
    text-transform: uppercase;
    color: white;
    opacity: 0.8;
  }
  flex-grow: 1;
  height: 32px;
  margin: 0 0 0 10px;
  outline: none;
  overflow: hidden;
  padding: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const DeleteSearchTerm = styled.button`
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-shrink: none;
  height: 100%;
  justify-content: center;
  margin: 0;
  outline: none;
  padding: 0;
  width: 38px;

  &[disabled] {
    opacity: 0.5;
  }
`

const Pagination = styled.div`
  align-items: center;
  border-top: 1px solid ${({ theme }) => theme.border};
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 50px;
  padding: 0 15px;

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.md}) {
    flex-direction: row;
    justify-content: flex-end;
  }
`

const PaginationBlock = styled.span`
  align-items: center;
  display: flex;
  justify-content: center;
`

const PaginationTextCSS = css`
  color: ${({ theme }) => theme.text1};
  font-size: 13px;
  font-weight: normal;
  white-space: nowrap;
`

const PaginationText = styled.span`
  ${PaginationTextCSS}
  margin-right: 8px;
`

const PaginationBreak = styled.span`
  ${PaginationTextCSS}
  display: none;
  margin: 0 12px;

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.md}) {
    display: block;
  }
`

const PaginationButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  height: auto;
  outline: none;
  padding: 0;
  user-select: none;
  width: 25px;
  white-space: nowrap;

  &:hover {
    .fill {
      color: ${({ theme }) => theme.primary1};
    }
  }

  &[disabled],
  &[disabled]:hover {
    cursor: not-allowed;
    opacity: 0.5;

    .fill {
      color: ${({ theme }) => theme.text1};
    }
  }

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.md}) {
    height: 35px;
  }
`

const ChevronLeft = styled(ChevronRight)`
  transform: rotateZ(180deg);
`

const DropdownPagination = styled(Dropdown)`
  .dropdownItems {
    min-width: 70px;
  }
`

const PaginationDropdownButton = styled.div`
  ${PaginationTextCSS}
  cursor: pointer;
  white-space: nowrap;
`

const PaginationItem = styled.div`
  align-items: center;
  border-bottom: 1px solid ${(props) => props.theme.dropdown.item.borderColor};
  color: ${(props) => props.theme.dropdown.item.color};
  cursor: pointer;
  display: flex;
  font-size: 14px;
  font-weight: 400;
  height: 32px;
  line-height: 1.2;
  padding: 0 10px;
  white-space: nowrap;

  &:hover {
    background-color: ${(props) => props.theme.dropdown.item.backgroundColorHover};
  }
`

const TBody = styled.div`
  min-height: 266px;
  @media (max-width: ${({ theme }) => theme.themeBreakPoints.md}) {
    > div:first-child {
      position: relative !important;
    }

    > div:not(:first-child) {
      display: none !important;
    }
  }
`

interface Props {
  tableData: any[]
  loading: boolean
}

const columns = [
  {
    Header: 'Issuer',
    accessor: 'issuer',
    align: 'flex-start',
    show: true,
    style: { height: '100%', justifyContent: 'center' },
    filter: 'searchInTags',
  },
  {
    Header: 'Offering',
    accessor: 'offering',
    align: 'flex-start',
    show: true,
    style: {},
    filter: 'searchInTags',
  },
  {
    Header: 'Size',
    accessor: 'size',
    align: 'flex-start',
    show: true,
    style: {},
    filter: 'searchInTags',
  },
  {
    Header: 'Interest Rate',
    accessor: 'interestRate',
    align: 'flex-start',
    show: true,
    style: {},
    filter: 'searchInTags',
  },
  {
    Header: 'Price',
    accessor: 'price',
    align: 'flex-start',
    show: true,
    style: {},
    filter: 'searchInTags',
  },
  {
    Header: 'Status',
    accessor: 'status',
    align: 'flex-start',
    show: true,
    style: {},
    filter: 'searchInTags',
  },
  {
    Header: '',
    accessor: 'url',
    align: '',
    show: false,
    style: {},
  },
]

const AllAuctions = ({ loading, tableData, ...restProps }: Props) => {
  const navigate = useNavigate()

  const globalFilter = React.useMemo(
    () => (rows, columns, filterValue) =>
      rows.filter((row) => row?.original?.search.toLowerCase().includes(filterValue.toLowerCase())),
    [],
  )

  const {
    canNextPage,
    canPreviousPage,
    getTableBodyProps,
    getTableProps,
    headerGroups,
    nextPage,
    page,
    prepareRow,
    previousPage,
    rows,
    setGlobalFilter,
    setPageSize,
    state,
  } = useTable(
    {
      columns,
      data: tableData,
      globalFilter,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useGlobalFilter,
    usePagination,
  )

  const sectionHead = useRef(null)
  const { pageIndex, pageSize } = state

  function handleNextPage() {
    nextPage()
    sectionHead.current.scrollIntoView()
  }

  function handlePrevPage() {
    previousPage()
    sectionHead.current.scrollIntoView()
  }

  return (
    <Wrapper ref={sectionHead} {...restProps}>
      <div className="py-2 flex content-center justify-center md:justify-between flex-wrap items-end mb-10">
        <div className="flex flex-col space-y-4">
          <SectionTitle>Offerings</SectionTitle>

          <div className="flex flex-row space-x-4 items-center">
            <div className="rounded-full bg-black px-4 py-2 text-white text-xs uppercase">All</div>
            <svg
              fill="none"
              height="16"
              viewBox="0 0 2 16"
              width="2"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M1 0V16" opacity="0.5" stroke="white" />
            </svg>
            <AuctionButtonOutline plural />
            <OTCButtonOutline />
          </div>
        </div>

        <div>
          <TableControls>
            <SearchWrapper>
              <Magnifier />
              <SearchInput
                onChange={(e) => {
                  setGlobalFilter(e.target.value)
                }}
                placeholder="Search"
                value={state.globalFilter || ''}
              />
              <DeleteSearchTerm
                disabled={!state.globalFilter}
                onClick={() => {
                  setGlobalFilter(undefined)
                }}
              >
                <Delete />
              </DeleteSearchTerm>
            </SearchWrapper>
          </TableControls>
        </div>
      </div>

      {loading && <LoadingBox height={600} />}

      {!loading && (
        <div className="min-h-[385px]">
          <table className="table w-full h-full" {...getTableProps()}>
            <thead>
              {headerGroups.map((headerGroup, i) => (
                <tr
                  className="border-b border-b-[#D5D5D519]"
                  key={i}
                  {...headerGroup.getHeaderGroupProps()}
                >
                  {headerGroup.headers.map(
                    (column, i) =>
                      column.render('show') && (
                        <th
                          className="bg-transparent text-[#696969] text-[10px] font-normal"
                          key={i}
                          {...column.getHeaderProps()}
                        >
                          {column.render('Header')}
                        </th>
                      ),
                  )}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {!page.length && (
                <tr className="bg-transparent text-[#D2D2D2] text-sm">
                  <td
                    className="bg-transparent text-center py-[100px] text-[#696969] space-y-7"
                    colSpan={6}
                  >
                    <div className="flex justify-center space-x-4 opacity-60">
                      <AuctionsLogo height={36} width={36} /> <OTCLogo height={36} width={36} />
                    </div>
                    <div className="text-base text-[#696969]">
                      There are no offerings at the moment
                    </div>
                    <ActionButton className="w-[236px] h-[41px]">Get notify</ActionButton>
                  </td>
                </tr>
              )}
              {page.map((row, i) => {
                prepareRow(row)
                return (
                  <tr
                    className="bg-transparent text-[#D2D2D2] text-sm cursor-pointer hover"
                    key={i}
                    onClick={() => navigate(row.original.url)}
                    {...row.getRowProps()}
                  >
                    {row.cells.map((cell, i) => {
                      return (
                        cell.render('show') && (
                          <td className="bg-transparent" key={i} {...cell.getCellProps()}>
                            {cell.render('Cell')}
                          </td>
                        )
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>

          <Pagination>
            <PaginationBlock>
              <PaginationText>Items per page</PaginationText>{' '}
              <DropdownPagination
                dropdownButtonContent={
                  <PaginationDropdownButton>{pageSize} ▼</PaginationDropdownButton>
                }
                items={[5, 10, 20, 30].map((pageSize) => (
                  <PaginationItem
                    key={pageSize}
                    onClick={() => {
                      setPageSize(Number(pageSize))
                    }}
                  >
                    {pageSize}
                  </PaginationItem>
                ))}
              />
            </PaginationBlock>
            <PaginationBreak>|</PaginationBreak>
            <PaginationBlock>
              <PaginationText>
                {pageIndex + 1 === 1 ? 1 : pageIndex * pageSize + 1} -{' '}
                {rows.length < (pageIndex + 1) * pageSize
                  ? rows.length
                  : (pageIndex + 1) * pageSize}{' '}
                of {rows.length} auctions
              </PaginationText>{' '}
              <PaginationButton disabled={!canPreviousPage} onClick={() => handlePrevPage()}>
                <ChevronLeft />
              </PaginationButton>
              <PaginationButton disabled={!canNextPage} onClick={() => handleNextPage()}>
                <ChevronRight />
              </PaginationButton>
            </PaginationBlock>
          </Pagination>
        </div>
      )}
    </Wrapper>
  )
}

export default AllAuctions
