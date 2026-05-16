import { useCallback, useState } from "react";

/** Copies text to the clipboard with a transient "copied" flag and a fallback for unsupported browsers. */
export function useCopyToClipboard(resetMs = 1800) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (value: string) => {
      let success = false;
      try {
        await navigator.clipboard.writeText(value);
        success = true;
      } catch {
        success = fallbackCopy(value);
      }
      if (success) {
        setCopied(true);
        window.setTimeout(() => setCopied(false), resetMs);
      }
      return success;
    },
    [resetMs],
  );

  return { copied, copy };
}

function fallbackCopy(value: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);
  return copied;
}
