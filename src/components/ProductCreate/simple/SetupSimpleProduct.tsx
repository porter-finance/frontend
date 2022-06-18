import React from 'react'

import { BondActionSteps } from '../BondActionSteps'
import { FormSteps } from '../FormSteps'
import { StepOne } from '../StepOne'
import { StepTwo } from './StepTwo'
import { Summary } from './Summary'

const SetupSimpleProduct = () => {
  const midComponents = [<StepOne key={0} />, <StepTwo key={1} />]
  const steps = ['Setup product', 'Choose collateral', 'Confirm creation']

  return (
    <FormSteps
      ActionSteps={BondActionSteps}
      Summary={Summary}
      color="purple"
      convertible={false}
      midComponents={midComponents}
      steps={steps}
      title="Simple Bond Creation"
    />
  )
}

export default SetupSimpleProduct
