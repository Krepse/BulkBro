import { useState, useEffect, useRef } from 'react';

interface DecimalInputProps {
    value: number;
    onChange: (value: number) => void;
    className?: string;
    label?: string;
}

/**
 * Input component that handles decimal numbers properly on iOS.
 * Keeps a local string state during editing so the user can type "17," 
 * without the comma being eaten by immediate number parsing.
 */
export function DecimalInput({ value, onChange, className, label }: DecimalInputProps) {
    const [localValue, setLocalValue] = useState(String(value));
    const inputRef = useRef<HTMLInputElement>(null);
    const isEditingRef = useRef(false);

    // Sync external value changes (but not during active editing)
    useEffect(() => {
        if (!isEditingRef.current) {
            setLocalValue(String(value));
        }
    }, [value]);

    const parseDecimal = (str: string): number => {
        const normalized = str.replace(',', '.');
        const parsed = parseFloat(normalized);
        return isNaN(parsed) ? 0 : parsed;
    };

    return (
        <div className="relative">
            <input
                ref={inputRef}
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                value={localValue}
                onFocus={(e) => {
                    isEditingRef.current = true;
                    e.target.select();
                }}
                onChange={(e) => {
                    const raw = e.target.value;
                    // Only allow digits, dot, and comma
                    if (/^[0-9]*[.,]?[0-9]*$/.test(raw) || raw === '') {
                        setLocalValue(raw);
                    }
                }}
                onBlur={() => {
                    isEditingRef.current = false;
                    const parsed = parseDecimal(localValue);
                    setLocalValue(String(parsed));
                    onChange(parsed);
                }}
                className={className}
            />
            {label && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 pointer-events-none">
                    {label}
                </span>
            )}
        </div>
    );
}
