export function usePartialOrCurrentValue<T>(
  partialValue: T | undefined,
  currentValue: T,
  priority: 'current' | 'partial' = 'partial'
): T | undefined {
  if (priority === 'current') {
    return (currentValue ?? '') === '' ? partialValue : currentValue
  }

  return (partialValue ?? '') === '' ? currentValue : partialValue
}
