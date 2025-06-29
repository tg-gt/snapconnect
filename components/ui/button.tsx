import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Pressable } from "react-native";
import { cn } from "@/lib/utils";
import { TextClassContext } from "@/components/ui/text";

const buttonVariants = cva(
	"group flex items-center justify-center rounded-lg web:ring-offset-background web:transition-all web:duration-200 web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2 shadow-sm",
	{
		variants: {
			variant: {
				default: "gradient-primary web:hover:opacity-90 active:opacity-90 shadow-lg shadow-primary/25 web:hover:shadow-xl web:hover:shadow-primary/30 web:hover:-translate-y-0.5 active:translate-y-0",
				destructive: "bg-destructive web:hover:opacity-90 active:opacity-90 shadow-lg shadow-destructive/25 web:hover:shadow-xl web:hover:shadow-destructive/30",
				outline:
					"border-2 border-primary/20 bg-background web:hover:bg-primary/5 web:hover:border-primary/30 active:bg-primary/10",
				secondary: "bg-secondary web:hover:opacity-90 active:opacity-90 shadow-md web:hover:shadow-lg",
				ghost:
					"shadow-none web:hover:bg-accent web:hover:text-accent-foreground active:bg-accent",
				link: "shadow-none web:underline-offset-4 web:hover:underline web:focus:underline",
			},
			size: {
				default: "h-11 px-5 py-2.5 native:h-12 native:px-5 native:py-3",
				sm: "h-9 rounded-md px-3 text-sm",
				lg: "h-12 rounded-lg px-8 native:h-14 text-base",
				icon: "h-10 w-10 rounded-full",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

const buttonTextVariants = cva(
	"web:whitespace-nowrap text-sm native:text-base font-semibold text-foreground web:transition-colors",
	{
		variants: {
			variant: {
				default: "text-primary-foreground",
				destructive: "text-destructive-foreground",
				outline: "text-foreground group-hover:text-primary",
				secondary:
					"text-secondary-foreground group-active:text-secondary-foreground",
				ghost: "group-active:text-accent-foreground",
				link: "text-primary group-active:underline font-medium",
			},
			size: {
				default: "",
				sm: "text-sm",
				lg: "text-base native:text-lg",
				icon: "",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

type ButtonProps = React.ComponentPropsWithoutRef<typeof Pressable> &
	VariantProps<typeof buttonVariants>;

const Button = React.forwardRef<
	React.ComponentRef<typeof Pressable>,
	ButtonProps
>(({ className, variant, size, ...props }, ref) => {
	return (
		<TextClassContext.Provider
			value={buttonTextVariants({
				variant,
				size,
				className: "web:pointer-events-none",
			})}
		>
			<Pressable
				className={cn(
					props.disabled && "opacity-50 web:pointer-events-none",
					buttonVariants({ variant, size, className }),
				)}
				ref={ref}
				role="button"
				{...props}
			/>
		</TextClassContext.Provider>
	);
});
Button.displayName = "Button";

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
