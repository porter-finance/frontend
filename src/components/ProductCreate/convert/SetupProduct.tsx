import React from 'react'

import { BondActionSteps } from '../BondActionSteps'
import { FormSteps } from '../FormSteps'
import { StepOne } from '../StepOne'
import { StepThree } from './StepThree'
import { StepTwo } from './StepTwo'
import { Summary } from './Summary'

const SetupProduct = () => {
  const midComponents = [<StepOne key={0} />, <StepTwo key={1} />, <StepThree key={2} />]
  const steps = ['Setup product', 'Choose collateral', 'Set convertibility', 'Confirm creation']

  return (
    <FormSteps
      ActionSteps={BondActionSteps}
      Summary={Summary}
      color="purple"
      convertible
      midComponents={midComponents}
      steps={steps}
      title="Convertible Bond Creation"
    />
  )
}

export default SetupProduct
