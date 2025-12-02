import { ContrastMode, TextSize } from "@/store/test-display-store";
import { cn } from "@/lib/utils";

export const getContrastClasses = (contrast: ContrastMode): string => {
  switch (contrast) {
    case "black-on-white":
      return "bg-white [&_p]:text-black [&_div]:text-black [&_span]:text-black [&_h1]:text-black [&_h2]:text-black [&_h3]:text-black [&_h4]:text-black [&_h5]:text-black [&_h6]:text-black [&_li]:text-black [&_td]:text-black [&_th]:text-black [&_label]:text-black";
    case "white-on-black":
      return "bg-black [&_p]:text-white [&_div]:text-white [&_span]:text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_h4]:text-white [&_h5]:text-white [&_h6]:text-white [&_li]:text-white [&_td]:text-white [&_th]:text-white [&_label]:text-white";
    case "yellow-on-black":
      return "bg-black [&_p]:text-yellow-300 [&_div]:text-yellow-300 [&_span]:text-yellow-300 [&_h1]:text-yellow-300 [&_h2]:text-yellow-300 [&_h3]:text-yellow-300 [&_h4]:text-yellow-300 [&_h5]:text-yellow-300 [&_h6]:text-yellow-300 [&_li]:text-yellow-300 [&_td]:text-yellow-300 [&_th]:text-yellow-300 [&_label]:text-yellow-300";
    default:
      return "bg-white [&_p]:text-black [&_div]:text-black [&_span]:text-black [&_h1]:text-black [&_h2]:text-black [&_h3]:text-black [&_h4]:text-black [&_h5]:text-black [&_h6]:text-black [&_li]:text-black [&_td]:text-black [&_th]:text-black [&_label]:text-black";
  }
};

export const getTextSizeClasses = (textSize: TextSize): string => {
  switch (textSize) {
    case "regular":
      return "text-sm [&_p]:text-sm [&_div]:text-sm [&_span]:text-sm";
    case "large":
      return "text-base [&_p]:text-base [&_div]:text-base [&_span]:text-base";
    case "extra-large":
      return "text-lg [&_p]:text-lg [&_div]:text-lg [&_span]:text-lg";
    default:
      return "text-sm [&_p]:text-sm [&_div]:text-sm [&_span]:text-sm";
  }
};

export const getTestDisplayClasses = (
  contrast: ContrastMode,
  textSize: TextSize
): string => {
  return cn(getContrastClasses(contrast), getTextSizeClasses(textSize));
};

