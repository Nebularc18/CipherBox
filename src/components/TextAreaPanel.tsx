import type { ReactNode } from 'react'
import { X } from 'lucide-react'

type TextAreaPanelProps = {
  id: string
  label: string
  value: string
  onChange?: (value: string) => void
  placeholder: string
  readOnly?: boolean
  helperText?: string
  isError?: boolean
  actions?: ReactNode
}

export function TextAreaPanel({
  id,
  label,
  value,
  onChange,
  placeholder,
  readOnly = false,
  helperText,
  isError = false,
  actions,
}: TextAreaPanelProps) {
  return (
    <div className={`panel ${isError ? 'panel-error' : ''}`}>
      <div className="panel-header">
        <label htmlFor={id}>{label}</label>
        <div className="panel-actions">
          {onChange ? (
            <button
              type="button"
              className="ghost-button icon-text-button"
              onClick={() => onChange('')}
              aria-label={`Clear ${label.toLowerCase()}`}
            >
              <X size={16} strokeWidth={1.8} aria-hidden="true" />
              <span>Clear</span>
            </button>
          ) : null}
          {actions}
        </div>
      </div>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        readOnly={readOnly}
        placeholder={placeholder}
        spellCheck={false}
      />
      <p className={`panel-helper ${isError ? 'error-text' : ''}`}>
        {helperText || ' '}
      </p>
    </div>
  )
}
