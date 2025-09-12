import { useRef, useLayoutEffect, useCallback, useState } from "react";

interface AutoTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onInput"> {
  minHeight?: number;
  maxHeight?: number;
}

export function AutoTextarea({
  value,
  onChange,
  onKeyDown,
  minHeight = 0,
  maxHeight = 400,
  className = "",
  ...props
}: AutoTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const adjustHeight = useCallback(() => {
    const textarea = ref.current;
    if (!textarea) return;

    // Only adjust if the content actually changed
    const currentHeight = textarea.scrollHeight;
    const currentTextareaHeight = parseInt(textarea.style.height) || 0;

    // Check if we need to resize
    const needsResize =
      currentHeight !== currentTextareaHeight ||
      currentHeight < minHeight ||
      currentHeight > maxHeight;

    if (!needsResize) return;

    // Store current state
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const isActive = document.activeElement === textarea;

    // Calculate new height
    const newHeight = Math.min(Math.max(currentHeight, minHeight), maxHeight);
    const willOverflow = currentHeight > maxHeight;

    // Apply height change
    textarea.style.height = `${newHeight}px`;
    setIsOverflowing(willOverflow);

    // Only restore selection if textarea was active (user was typing)
    if (isActive) {
      // Use setTimeout to let the browser finish layout
      setTimeout(() => {
        if (textarea && document.activeElement === textarea) {
          textarea.setSelectionRange(selectionStart, selectionEnd);
        }
      }, 0);
    }
  }, [maxHeight, minHeight]);

  // Adjust height when value changes
  useLayoutEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e);
    },
    [onChange]
  );

  // Handle input with minimal interference
  const handleInput = useCallback(() => {
    // Let the browser handle the typing naturally, then adjust height
    requestAnimationFrame(() => {
      adjustHeight();
    });
  }, [adjustHeight]);

  // Handle key events to ensure proper behavior
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // For Enter key, let browser handle scroll naturally
      if (e.key === "Enter") {
        // Don't interfere - let browser scroll to cursor automatically
        setTimeout(() => adjustHeight(), 0);
      }
      onKeyDown?.(e);
    },
    [adjustHeight, onKeyDown]
  );

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={handleChange}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      rows={1}
      style={{
        minHeight: `${minHeight}px`,
        maxHeight: `${maxHeight}px`,
        paddingBottom: isOverflowing ? "1.25rem" : undefined,
        boxSizing: "border-box",
        // Let overflow be visible during typing
        overflowY: isOverflowing ? "auto" : "hidden",
      }}
      className={`w-full resize-none bg-transparent outline-none text-gray-300 text-md ${className}`}
      {...props}
    />
  );
}
