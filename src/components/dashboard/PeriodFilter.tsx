import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MONTHS } from "@/utils/format";

interface PeriodFilterProps {
  selectedMonth: string;
  selectedYear: string;
  onMonthChange: (month: string) => void;
  onYearChange: (year: string) => void;
  className?: string;
  label?: string;
}

export function PeriodFilter({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  className,
  label = "Período",
}: PeriodFilterProps) {
  return (
    <div className={className}>
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="grid grid-cols-2 gap-2">
          <Select value={selectedMonth} onValueChange={onMonthChange}>
            <SelectTrigger>
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="number"
            min="2020"
            max="2099"
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            placeholder="Ano"
          />
        </div>
      </div>
    </div>
  );
}
