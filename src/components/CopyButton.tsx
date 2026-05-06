import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'

type CopyButtonProps = {
  value: string
  disabled?: boolean
}

export function CopyButton({ value, disabled }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) {
      return
    }

    const timeoutId = window.setTimeout(() => setCopied(false), 1600)

    return () => window.clearTimeout(timeoutId)
  }, [copied])

  const onCopy = async () => {
    if (!value || disabled) {
      return
    }

    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      className="ghost-button icon-text-button"
      onClick={onCopy}
      disabled={disabled}
      aria-label={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
    >
      {copied ? (
        <Check size={16} strokeWidth={1.9} aria-hidden="true" />
      ) : (
        <Copy size={16} strokeWidth={1.8} aria-hidden="true" />
      )}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  )
}
