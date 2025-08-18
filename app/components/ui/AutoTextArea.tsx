import { useRef, useLayoutEffect, useCallback, useState } from "react";

interface AutoTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onInput"> {
  minHeight?: number;
  maxHeight?: number;
}

export function AutoTextarea({
  value,
  onChange,
  minHeight = 0,
  maxHeight = 400,
  className = "",
  ...props
}: AutoTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const adjustHeight = useCallback(() => {
    const textarea = ref.current;
    if (!textarea) return;

    // Store current scroll position and selection
    const scrollTop = textarea.scrollTop;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const isAtBottom =
      scrollTop >= textarea.scrollHeight - textarea.clientHeight - 5;

    // Reset height to get accurate scrollHeight
    textarea.style.height = `${minHeight}px`;

    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.min(scrollHeight, maxHeight);
    const willOverflow = scrollHeight > maxHeight;

    // Apply new height
    textarea.style.height = `${newHeight}px`;

    // Update overflow state only if it changed
    setIsOverflowing((prev) => (prev !== willOverflow ? willOverflow : prev));

    // Restore scroll position and selection if needed
    if (willOverflow) {
      if (isAtBottom) {
        textarea.scrollTop = textarea.scrollHeight - textarea.clientHeight;
      } else {
        textarea.scrollTop = scrollTop;
      }
    }

    // Restore selection
    textarea.setSelectionRange(selectionStart, selectionEnd);
  }, [maxHeight, minHeight]);

  // Use useLayoutEffect to prevent layout thrashing
  useLayoutEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  // Debounced version for input events to reduce excessive calls
  const handleInput = useCallback(() => {
    // Clear existing timeout
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    // Debounce rapid input events
    resizeTimeoutRef.current = setTimeout(() => {
      adjustHeight();
    }, 0);
  }, [adjustHeight]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e);
      // No need for setTimeout here since value change will trigger useLayoutEffect
    },
    [onChange]
  );

  // Cleanup timeout on unmount
  useLayoutEffect(() => {
    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={handleChange}
      onInput={handleInput}
      rows={1}
      style={{
        minHeight: `${minHeight}px`,
        maxHeight: `${maxHeight}px`,
        // Using CSS to handle overflow instead of conditional classes
        paddingBottom: isOverflowing ? "1.25rem" : undefined,
      }}
      className={`w-full resize-none overflow-y-auto bg-transparent outline-none text-gray-300 text-md ${className}`}
      {...props}
    />
  );
}
