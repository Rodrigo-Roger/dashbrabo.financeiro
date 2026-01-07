import { cn } from "@/lib/utils";
import { ChevronDown, User } from "lucide-react";
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
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <User className="h-5 w-5" />
      </div>
      <Select value={selectedId} onValueChange={onSelect}>
        <SelectTrigger className="w-[280px] border-0 bg-transparent text-lg font-semibold shadow-none focus:ring-0">
          <SelectValue>
            {selectedEmployee?.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {employees.map((employee) => (
            <SelectItem key={employee.id} value={employee.id}>
              <div className="flex flex-col">
                <span className="font-medium">{employee.name}</span>
                <span className="text-xs text-muted-foreground">
                  {ROLES[employee.role].name}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
