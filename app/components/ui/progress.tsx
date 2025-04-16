"use client";

import * as React from "react";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value: number; // ค่าเปอร์เซ็นต์ของ Progress (0 - 100)
}

export function Progress({ value, className, ...props }: ProgressProps) {
    return (
        <div className={`relative h-2 w-full bg-gray-700 rounded ${className}`} {...props}>
            <div
                className="absolute h-full bg-green-500 rounded"
                style={{ width: `${value}%` }}
            />
        </div>
    );
}
