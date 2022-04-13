import React, { useMemo, useRef, useState } from 'react'
import styled, { css } from 'styled-components'

import { useFilters, useGlobalFilter, usePagination, useTable } from 'react-table'

import { AuctionButtonOutline, LoadingBox, OTCButtonOutline } from '../../../pages/Auction'
import { ButtonSelect } from '../../buttons/ButtonSelect'
import { Dropdown, DropdownItem } from '../../common/Dropdown'
import { ChevronRight } from '../../icons/ChevronRight'
import { Delete } from '../../icons/Delete'
import { InfoIcon } from '../../icons/InfoIcon'
import { Magnifier } from '../../icons/Magnifier'
import { Cell } from '../../pureStyledComponents/Cell'
import { EmptyContentText, EmptyContentWrapper } from '../../pureStyledComponents/EmptyContent'
import { PageTitle } from '../../pureStyledComponents/PageTitle'

const Wrapper = styled.div`
  margin-top: -25px;
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
  const data = useMemo(() => Object.values(tableData), [tableData])
  const [currentDropdownFilter, setCurrentDropdownFilter] = useState<string | undefined>()

  const searchValue = React.useCallback((element: any, filterValue: string) => {
    const isReactElement = element && element.props && element.props.children
    const isString = !isReactElement && typeof element === 'string'
    /**
     * this will work only for strings, and react elements like
     * <>
     *   <span>some text</span>
     *   <Icon />
     * </>
     *
     * maybe make it better in the future?
     */
    const value = isReactElement
      ? element.props.children[0].props.children
      : isString
      ? element
      : ''

    return filterValue.length === 0
      ? true
      : String(value).toLowerCase().includes(String(filterValue).toLowerCase())
  }, [])

  const filterTypes = React.useMemo(
    () => ({
      searchInTags: (rows, id, filterValue) =>
        rows.filter((row) => searchValue(row.values[id], filterValue)),
    }),
    [searchValue],
  )

  const globalFilter = React.useMemo(
    () => (rows, columns, filterValue) =>
      rows.filter((row) => {
        let searchResult = false
        for (const column of columns) {
          searchResult = searchResult || searchValue(row.values[column], filterValue)
        }
        return searchResult
      }),
    [searchValue],
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
    setAllFilters,
    setFilter,
    setGlobalFilter,
    setPageSize,
    state,
  } = useTable(
    {
      columns,
      data,
      filterTypes,
      globalFilter,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useGlobalFilter,
    useFilters,
    usePagination,
  )

  const sectionHead = useRef(null)

  const updateFilter = (column?: string | undefined, value?: string | undefined) => {
    setAllFilters([])
    if (column && value) {
      setFilter(column, value)
    }
  }

  const filterOptions = [
    {
      onClick: updateFilter,
      title: 'All',
    },
    {
      column: 'participation',
      onClick: updateFilter,
      title: 'Participation "Yes"',
      value: 'yes',
    },
    {
      column: 'participation',
      onClick: updateFilter,
      title: 'Participation "No"',
      value: 'no',
    },
    {
      column: 'status',
      onClick: updateFilter,
      title: 'Ongoing',
      value: 'ongoing',
    },
    {
      column: 'status',
      onClick: updateFilter,
      title: 'Ended',
      value: 'ended',
    },
    {
      column: 'type',
      onClick: updateFilter,
      title: 'Private',
      value: 'private',
    },
    {
      column: 'type',
      onClick: updateFilter,
      title: 'Public',
      value: 'public',
    },
  ]

  const { pageIndex, pageSize } = state
  const noAuctions = tableData.length === 0
  const noAuctionsFound = page.length === 0
  const noData = noAuctions || noAuctionsFound

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
            <Dropdown
              dropdownButtonContent={
                <ButtonSelect
                  content={
                    <span>
                      {!currentDropdownFilter ? filterOptions[0].title : currentDropdownFilter}
                    </span>
                  }
                />
              }
              items={filterOptions.map((item, index) => (
                <DropdownItem
                  key={index}
                  onClick={() => {
                    item.onClick(item.column, item.value)
                    setCurrentDropdownFilter(item.title)
                  }}
                >
                  {item.title}
                </DropdownItem>
              ))}
            />

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

      {!loading && noData && (
        <EmptyContentWrapper>
          <InfoIcon />
          <EmptyContentText>
            {noAuctions && 'No auctions.'}
            {noAuctionsFound && 'No auctions found.'}
          </EmptyContentText>
        </EmptyContentWrapper>
      )}

      {!loading && !noData && (
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
                    className="bg-transparent text-center py-[100px] text-[#696969] space-y-4"
                    colSpan={5}
                  >
                    <svg
                      className="m-auto"
                      fill="none"
                      height="40"
                      viewBox="0 0 32 40"
                      width="32"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M27.202 4.35355L27.2113 4.36285L27.2211 4.37165L31.5 8.22268V39.5H0.5V0.5H23.3484L27.202 4.35355Z"
                        stroke="white"
                        strokeOpacity="0.6"
                      />
                      <path d="M7 14H25" stroke="white" strokeOpacity="0.6" />
                      <path d="M7 19H25" stroke="white" strokeOpacity="0.6" />
                      <path d="M7 24H25" stroke="white" strokeOpacity="0.6" />
                      <path d="M7 29H25" stroke="white" strokeOpacity="0.6" />
                    </svg>
                    <div className="text-base">No orders placed yet</div>
                  </td>
                </tr>
              )}
              {page.map((row, i) => {
                prepareRow(row)
                return (
                  <tr
                    className="bg-transparent text-[#D2D2D2] text-sm"
                    key={i}
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
