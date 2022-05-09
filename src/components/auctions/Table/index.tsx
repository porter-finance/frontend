import React, { ReactElement, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { useGlobalFilter, useTable } from 'react-table'

import { ActionButton } from '../../auction/Claimer'
import Tooltip from '../../common/Tooltip'
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
    getTableBodyProps,
    getTableProps,
    headerGroups,
    prepareRow,
    rows,
    setGlobalFilter,
    state,
  } = useTable(
    {
      columns,
      data,
      globalFilter,
    },
    useGlobalFilter,
  )

  const sectionHead = useRef(null)

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

      <div
        className="overflow-auto overscroll-contain min-h-[492px] scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-zinc-700"
        style={{
          maxHeight: !rows.length ? '100%' : 'calc(100vh - 391px)',
          height: !rows.length ? 'calc(100vh - 391px)' : 'inherit',
        }}
      >
        <table className="table w-full h-full" {...getTableProps()}>
          <thead className="sticky top-0 z-[1]">
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
                        className="text-xs font-normal tracking-widest text-[#696969] bg-base-100"
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
                <tr className="h-[57px] text-sm text-[#D2D2D2] bg-transparent" key={z}>
                  {[...Array(columns.length - 1).keys()].map((i) => (
                    <td className="text-center text-[#696969] bg-transparent" key={i}>
                      <div className="my-4 w-full max-w-sm h-4 bg-gradient-to-r from-[#1F2123] to-[#181A1C] rounded animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && !rows.length && (
              <tr className="h-[57px] text-sm text-[#D2D2D2] bg-transparent">
                <td
                  className="py-[100px] space-y-7 text-center text-[#696969] bg-transparent"
                  colSpan={columns.length - 1}
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
              rows.map((row, i) => {
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
      </div>
    </Wrapper>
  )
}

export default Table
