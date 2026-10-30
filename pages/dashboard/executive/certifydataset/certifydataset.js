import React from 'react'
import ExecutiveLayout from '@/src/components/dashboard/executive/executivelayout'
import CertifyDataset from '@/src/components/dashboard/executive/certifydataset/certifydataset' // Ajusta la ruta si guardaste el componente en otra carpeta

export default function CertifyDatasetPage() {
  return (
    <ExecutiveLayout>
      <CertifyDataset />
    </ExecutiveLayout>
  )
}
