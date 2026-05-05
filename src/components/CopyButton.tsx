import { useEffect, useState } from 'react'

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
    <button type="button" className="ghost-button" onClick={onCopy} disabled={disabled}>
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}
