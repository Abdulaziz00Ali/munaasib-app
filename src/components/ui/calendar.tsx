
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils.ts";
import { buttonVariants } from "@/components/ui/button.tsx";
import { ar } from 'date-fns/locale';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale = ar,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      locale={locale}
      ISOWeek={true}
      formatters={{
        // Custom formatters for Hijri calendar
        formatCaption: (date) => {
          // Format to Arabic month name and year
          try {
            return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { 
              month: 'long',
              year: 'numeric'
            }).format(date);
          } catch {
            try {
              return date.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' });
            } catch {
              return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            }
          }
        },
        formatWeekdayName: (weekday) => {
          try {
            return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { 
              weekday: 'short' 
            }).format(new Date(weekday.getFullYear(), weekday.getMonth(), weekday.getDate() + weekday.getDay()));
          } catch {
            try {
              return new Date(weekday).toLocaleDateString('ar-SA', { weekday: 'short' });
            } catch {
              return new Date(weekday).toLocaleDateString('en-US', { weekday: 'short' });
            }
          }
        },
        formatDay: (day) => {
          try {
            return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { 
              day: 'numeric' 
            }).format(day);
          } catch {
            try {
              return day.toLocaleDateString('ar-SA', { day: 'numeric' });
            } catch {
              return String(day.getDate());
            }
          }
        }
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
