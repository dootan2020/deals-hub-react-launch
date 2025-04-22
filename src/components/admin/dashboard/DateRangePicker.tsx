
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { addDays, format, startOfMonth } from "date-fns";
import { vi } from "date-fns/locale";
import { useState } from "react";

interface DateRangePickerProps {
  onRangeChange: (range: { from: Date; to: Date }) => void;
}

export function DateRangePicker({ onRangeChange }: DateRangePickerProps) {
  const [date, setDate] = useState<{ from: Date; to: Date }>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });

  const handlePresetClick = (days: number) => {
    const to = new Date();
    const from = addDays(to, -days);
    setDate({ from, to });
    onRangeChange({ from, to });
  };

  const handleMonthClick = () => {
    const to = new Date();
    const from = startOfMonth(to);
    setDate({ from, to });
    onRangeChange({ from, to });
  };

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>
              {date.from ? (
                <>
                  {format(date.from, "dd/MM/yyyy")} -{" "}
                  {format(date.to, "dd/MM/yyyy")}
                </>
              ) : (
                "Chọn ngày"
              )}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date.from}
            selected={date}
            onSelect={(range: any) => {
              setDate(range);
              if (range?.from && range?.to) {
                onRangeChange(range);
              }
            }}
            locale={vi}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePresetClick(7)}
      >
        7 ngày
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePresetClick(30)}
      >
        30 ngày
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleMonthClick}
      >
        Tháng này
      </Button>
    </div>
  );
}
