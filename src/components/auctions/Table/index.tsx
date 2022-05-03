import React, { ReactElement, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { css } from 'styled-components'

import { useGlobalFilter, usePagination, useTable } from 'react-table'

import { ActionButton } from '../../auction/Claimer'
import { Dropdown } from '../../common/Dropdown'
import Tooltip from '../../common/Tooltip'
import { ChevronRight } from '../../icons/ChevronRight'
import { Delete } from '../../icons/Delete'
import { Magnifier } from '../../icons/Magnifier'
import { PageTitle } from '../../pureStyledComponents/PageTitle'

const Wrapper = styled.div`
  margin-top: -30px;
`

const SectionTitle = styled(PageTitle)`
  font-weight: 400;
  font-size: 42px;
  color: #e0e0e0;
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
  letter-spacing: 0.06em;
  color: #d6d6d6;
  ::placeholder {
    text-transform: uppercase;
    color: #d6d6d6;
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

interface Props {
  data: any[]
  loading: boolean
  title: string
  columns: any[]
  emptyActionClass?: string
  emptyActionText?: string
  emptyDescription: string
  emptyActionClick?: () => void
  emptyLogo: ReactElement
  legendIcons: ReactElement
  name: string
}

const Table = ({
  columns,
  data,
  emptyActionClass,
  emptyActionClick,
  emptyActionText,
  emptyDescription,
  emptyLogo,
  legendIcons,
  loading,
  name,
  title,
  ...restProps
}: Props) => {
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
      data,
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
      <div className="flex flex-wrap justify-center content-center items-end py-2 mb-10 md:justify-between">
        <div className="flex flex-col space-y-4">
          <SectionTitle>{title}</SectionTitle>

          <div className="flex flex-row items-center space-x-4">{legendIcons}</div>
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
                        className="text-xs font-normal tracking-widest text-[#696969] bg-transparent"
                        key={i}
                        {...column.getHeaderProps()}
                      >
                        {column.tooltip ? (
                          <Tooltip left={column.Header} tip={column.tooltip} />
                        ) : (
                          column.render('Header')
                        )}
                      </th>
                    ),
                )}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {loading &&
              [...Array(10).keys()].map((z) => (
                <tr className="text-sm text-[#D2D2D2] bg-transparent" key={z}>
                  {[...Array(columns.length - 1).keys()].map((i) => (
                    <td className="text-center text-[#696969] bg-transparent" key={i}>
                      <div className="my-4 w-full max-w-sm h-4 bg-gradient-to-r from-[#1F2123] to-[#181A1C] rounded animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && !page.length && (
              <tr className="text-sm text-[#D2D2D2] bg-transparent">
                <td
                  className="py-[100px] space-y-7 text-center text-[#696969] bg-transparent"
                  colSpan={columns.length}
                >
                  <div className="flex justify-center space-x-4 opacity-60">{emptyLogo}</div>
                  <div className="text-base text-[#696969]">{emptyDescription}</div>
                  {emptyActionText && (
                    <ActionButton
                      className={`!w-[236px] !h-[41px] ${emptyActionClass}`}
                      onClick={emptyActionClick}
                    >
                      {emptyActionText}
                    </ActionButton>
                  )}
                </td>
              </tr>
            )}
            {!loading &&
              page.map((row, i) => {
                prepareRow(row)
                return (
                  <tr
                    className="text-2sm text-[#D2D2D2] bg-transparent cursor-pointer hover"
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
              {rows.length < (pageIndex + 1) * pageSize ? rows.length : (pageIndex + 1) * pageSize}{' '}
              of {rows.length} {name}
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
    </Wrapper>
  )
}

export default Table
