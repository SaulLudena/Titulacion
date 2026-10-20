import React from 'react'
import ExecutiveLayout from '@/src/components/dashboard/executive/executivelayout'
import DatasetUsage from '@/src/components/dashboard/executive/datasetusage/datasetusage'

export default function DatasetUsagePage() {
  return (
    <ExecutiveLayout>
      <DatasetUsage />
    </ExecutiveLayout>
  )
}
