export function usePartialOrCurrentValue(partialValue, currentValue, priority = 'partial') {
    if (priority === 'current') {
        return (currentValue ?? '') === '' ? partialValue : currentValue;
    }
    return (partialValue ?? '') === '' ? currentValue : partialValue;
}
