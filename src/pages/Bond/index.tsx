import React from 'react'

import { useHasRole } from '../../hooks/useHasRole'

const CreateBond: React.FC = () => {
  const hasRole = useHasRole()

  return <>create bond. hasRole: {JSON.stringify(hasRole || false)}</>
}

export default CreateBond
