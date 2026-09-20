import * as React from "react"
import { cn } from "@/lib/utils"

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    onValueChange?: (value: string) => void;
    defaultValue?: string;
    value?: string;
}

const RadioGroup = React.forwardRef<
    HTMLDivElement,
    RadioGroupProps
>(({ className, ...props }, ref) => {
    return (
        <div
            className={cn("grid gap-4", className)}
            {...props}
            ref={ref}
        />
    )
})
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
    return (
        <div className="relative flex items-center">
            <input
                type="radio"
                ref={ref}
                className={cn(
                    "peer h-6 w-6 rounded-full border border-white/10 bg-white/[0.02] text-primary focus:ring-primary/20 focus-visible:ring-primary/20 appearance-none checked:bg-primary checked:border-primary transition-all cursor-pointer",
                    className
                )}
                {...props}
            />
            <div className="absolute left-[7px] top-[7px] w-2.5 h-2.5 rounded-full bg-black scale-0 peer-checked:scale-100 transition-transform pointer-events-none" />
        </div>
    )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
