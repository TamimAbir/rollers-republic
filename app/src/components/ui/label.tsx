import * as React from "react"
import { cn } from "@/lib/utils"

const Label = React.forwardRef<
    HTMLLabelElement,
    React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }
>(({ className, required, children, ...props }, ref) => (
    <label
        ref={ref}
        className={cn(
            "text-[10px] font-black uppercase tracking-[0.3em] text-white/60 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 italic",
            className
        )}
        {...props}
    >
        {children}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
))
Label.displayName = "Label"

export { Label }
