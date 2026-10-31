import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { HiX } from 'react-icons/hi'

export default function ConfirmModal({
  open,
  title,
  children,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  loading = false,
  loadingLabel = 'Procesando...',
  error = null,
  variant = 'default',
}) {
  const panelRef = useRef(null)
  const confirmRef = useRef(null)
  const previousFocus = useRef(null)

  // Foco inicial, bloqueo del scroll, Esc y foco atrapado dentro de la ventana
  useEffect(() => {
    if (!open) return

    previousFocus.current = document.activeElement
    confirmRef.current?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onCancel?.()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return

      const focusable = panelRef.current.querySelectorAll(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus.current?.focus?.()
    }
  }, [open, loading, onCancel])

  if (!open || typeof document === 'undefined') return null

  const confirmColors =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700'
      : 'bg-[#ea580c] hover:bg-[#d94e09]'

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onMouseDown={(e) => {
        // Clic en el fondo oscuro = cancelar (salvo que se esté procesando)
        if (e.target === e.currentTarget && !loading) onCancel?.()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="w-full max-w-md bg-white  rounded-none shadow-xl font-sans"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between gap-4 bg-[#0a0a0a] px-5 py-4 border-b-2 border-[#ea580c]">
          <h2
            id="confirm-modal-title"
            className="text-sm font-semibold text-white"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            aria-label="Cerrar"
            className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-none transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <HiX className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido */}
        <div className="px-5 py-5 text-xs text-gray-700 leading-relaxed space-y-4">
          {children}

          {error && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 p-3 text-xs text-red-600"
            >
              {error}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 bg-gray-50 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-semibold rounded-none transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2.5 ${confirmColors} text-white text-xs font-semibold rounded-none shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
