import { useEffect, useState } from 'react'
import { iniciarRegistro, verificarCodigo } from '../../libs/mfa'

export default function Mfa({
  token,
  factorId,
  enrolar,
  onVerificado,
  onCancelar,
}) {
  const [registro, setRegistro] = useState(null)
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(enrolar)

  useEffect(() => {
    if (!enrolar) return
    let vigente = true
    iniciarRegistro(token)
      .then((r) => vigente && setRegistro(r))
      .catch((e) => vigente && setError(e.message))
      .finally(() => vigente && setCargando(false))
    return () => {
      vigente = false
    }
  }, [enrolar, token])

  const enviar = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError(null)
    try {
      const sesion = await verificarCodigo(
        token,
        registro?.factorId || factorId,
        codigo.trim(),
      )
      onVerificado(sesion)
    } catch {
      setError('El código no es válido. Inténtalo de nuevo.')
      setCargando(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-1">
        Verificación en dos pasos
      </h2>
      <p className="text-gray-400 text-xs font-normal">
        {enrolar
          ? 'Escanea el código QR con tu app autenticadora (Google Authenticator, Microsoft Authenticator o similar) e ingresa el código de 6 dígitos.'
          : 'Ingresa el código de 6 dígitos de tu app autenticadora.'}
      </p>
      <div className="w-full h-[1px] bg-gray-100 my-3" />

      {error && (
        <div
          role="alert"
          className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded-none"
        >
          {error}
        </div>
      )}

      {enrolar && registro && (
        <div className="mb-3 flex flex-col items-center gap-2">
          <img
            src={registro.qr}
            alt="Código QR para la app autenticadora"
            className="w-44 h-44 border border-gray-200"
          />
          <p className="text-[11px] text-gray-500 text-center">
            Si no puedes escanearlo, ingresa esta clave manualmente:
          </p>
          <code className="text-xs font-mono text-gray-900 break-all text-center">
            {registro.secreto}
          </code>
        </div>
      )}

      <form onSubmit={enviar} className="space-y-3 w-full">
        <div>
          <label
            htmlFor="mfa-codigo"
            className="block text-[11px] font-medium text-gray-500 mb-1"
          >
            Código de verificación
          </label>
          <input
            id="mfa-codigo"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            autoFocus
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            className="w-full px-3.5 py-2.5 border border-gray-200 text-gray-900 text-sm tracking-[0.4em] text-center focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] transition-all font-medium"
          />
        </div>
        <button
          type="submit"
          disabled={cargando || codigo.length !== 6 || (enrolar && !registro)}
          className="w-full py-2.5 px-4 bg-[#ea580c] hover:bg-[#d94e09] text-white font-medium text-sm shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          {cargando
            ? 'Verificando...'
            : enrolar
              ? 'Activar y entrar'
              : 'Verificar'}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="w-full py-2 text-xs text-gray-500 hover:text-gray-800 cursor-pointer"
        >
          Volver al inicio de sesión
        </button>
      </form>
    </div>
  )
}
