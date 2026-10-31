import React from 'react'
import { useRouter } from 'next/router'
import { HiLockClosed, HiArrowLeft } from 'react-icons/hi'

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-white font-sans">
      <div className="max-w-md w-full border border-gray-200 p-8 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <HiLockClosed className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-900">
            Acceso No Autorizado
          </h1>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            No cuentas con el rol corporativo necesario para visualizar esta
            sección de Banco Andino.
          </p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="w-full py-2.5 bg-black hover:bg-gray-800 text-white text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <HiArrowLeft className="w-4 h-4" />
          <span>Volver al inicio de sesión</span>
        </button>
      </div>
    </div>
  )
}
