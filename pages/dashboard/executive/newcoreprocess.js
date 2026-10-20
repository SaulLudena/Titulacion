import React from 'react'
import ExecutiveLayout from '@/src/components/dashboard/executive/executivelayout'
import NewCoreProcess from '@/src/components/dashboard/executive/newcoreprocess/newcoreprocess'

export default function NewProcessPage() {
  return (
    <ExecutiveLayout>
      <NewCoreProcess />
    </ExecutiveLayout>
  )
}
