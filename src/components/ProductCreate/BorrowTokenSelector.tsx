import React, { Fragment } from 'react'

import { Listbox, Transition } from '@headlessui/react'
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons'
import { useFormContext, useWatch } from 'react-hook-form'

import { BorrowTokens } from './SelectableTokens'

import { requiredChain } from '@/connectors'

const BorrowToken = ({ option }) => (
  <span className="flex items-center py-3 px-4 space-x-4 text-xs" key={option?.name}>
    {option?.icon?.()}
    <span>{option?.name || 'Pick a token'}</span>
  </span>
)

export const Selector = ({ OptionEl, name, options }) => {
  // We assume `options` will have "name" key
  const { register, setValue } = useFormContext()
  const fieldValue = useWatch({ name })
  const selected = options?.find(
    (o) => o?.address === fieldValue?.address || o?.id === fieldValue?.id,
  )

  const setList = (e) => {
    setValue(name, e, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })
  }

  return (
    <Listbox onChange={setList} value={selected}>
      <input
        className="hidden"
        readOnly
        {...register(name, { required: true })}
        defaultValue={selected?.address || selected?.id}
      />
      <div className="relative mt-1">
        <Listbox.Button className="relative pr-4 w-full text-sm text-left text-white bg-transparent rounded-lg border border-[#2A2B2C] shadow-md cursor-pointer">
          {!selected?.address && !selected?.id ? (
            <OptionEl option={null} />
          ) : (
            <>
              <OptionEl option={selected} />
              <span className="flex absolute inset-y-0 right-0 items-center pr-2 pointer-events-none">
                <CaretSortIcon aria-hidden="true" className="w-5 h-5 text-gray-400" />
              </span>
            </>
          )}
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="overflow-auto absolute z-10 w-full max-h-64 bg-[#1F2123] rounded-lg border border-[#2A2B2C] focus:outline-none ring-1 ring-black ring-opacity-5 shadow scrollbar-thin scrollbar-track-zinc-800 scrollbar-thumb-zinc-700">
            {options?.map((option, optionIdx) => (
              <Listbox.Option
                className={({ active }) =>
                  `cursor-pointer relative select-none text-white hover:bg-zinc-800 ${
                    active ? 'bg-zinc-800' : ''
                  }`
                }
                key={optionIdx}
                value={option}
              >
                {({ selected }) => (
                  <>
                    <OptionEl option={option} />
                    {selected ? (
                      <span className="flex absolute inset-y-0 right-2 items-center pl-3 text-[#532DBE]">
                        <CheckIcon aria-hidden="true" className="w-5 h-5" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}

const BorrowTokenSelector = () => {
  return (
    <Selector OptionEl={BorrowToken} name="borrowToken" options={BorrowTokens[requiredChain?.id]} />
  )
}

export default BorrowTokenSelector
