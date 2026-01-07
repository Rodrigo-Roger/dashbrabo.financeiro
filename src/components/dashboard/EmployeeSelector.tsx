import { cn } from "@/lib/utils";
import { Employee, ROLES } from "@/lib/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmployeeSelectorProps {
  employees: Employee[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function EmployeeSelector({ employees, selectedId, onSelect, className }: EmployeeSelectorProps) {
  const selectedEmployee = employees.find(e => e.id === selectedId);
  
  return (
    <Select value={selectedId} onValueChange={onSelect}>
      <SelectTrigger className={cn("w-[220px] h-9 text-sm bg-card", className)}>
        <SelectValue>
          {selectedEmployee?.name}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {employees.map((employee) => (
          <SelectItem key={employee.id} value={employee.id}>
            <div className="flex flex-col">
              <span className="text-sm">{employee.name}</span>
              <span className="text-xs text-muted-foreground">
                {ROLES[employee.role].name}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
