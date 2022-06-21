export const confirmSteps = [
  {
    text: (bondSymbol = '') => `Approve ${bondSymbol} for sale`,
    tip: 'The bonds need to be approved so they can be offered for sale.',
  },
  {
    text: () => 'Initiate auction',
    tip: 'Transfer your bonds into the auction contract and initiate the auction.',
  },
]
