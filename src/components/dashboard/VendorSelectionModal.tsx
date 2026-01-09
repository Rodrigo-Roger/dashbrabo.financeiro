import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { Employee } from "@/lib/data";

interface VendorSelectionModalProps {
  employees: Employee[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onSave: (selectedIds: string[]) => void;
  userProfile?: "MASTER" | "GERENTE" | "LIDER" | "VENDEDOR";
}

export function VendorSelectionModal({
  employees,
  open,
  onOpenChange,
  selectedIds,
  onSave,
  userProfile,
}: VendorSelectionModalProps) {
  const [tempSelected, setTempSelected] = useState<string[]>(selectedIds);

  useEffect(() => {
    setTempSelected(selectedIds);
  }, [selectedIds, open]);

  const toggleEmployee = (id: string) => {
    setTempSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setTempSelected(employees.map((e) => e.id));
  };

  const deselectAll = () => {
    setTempSelected([]);
  };

  const handleSave = () => {
    onSave(tempSelected);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Selecionar Vendedores</DialogTitle>
          <DialogDescription>
            {userProfile === "MASTER" ? (
              <span>
                Escolha quais vendedores devem ser exibidos no dashboard (você
                tem acesso a todos)
              </span>
            ) : (
              <span>
                Escolha quais vendedores devem ser exibidos no dashboard
                (baseado nas suas permissões)
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between py-2">
          <div className="text-sm text-muted-foreground">
            {tempSelected.length} de {employees.length} selecionados
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
              disabled={tempSelected.length === employees.length}
            >
              Selecionar Todos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={deselectAll}
              disabled={tempSelected.length === 0}
            >
              Limpar Seleção
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[400px] rounded-md border p-4">
          <div className="space-y-4">
            {employees.map((employee) => {
              const isSelected = tempSelected.includes(employee.id);
              return (
                <div
                  key={employee.id}
                  className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => toggleEmployee(employee.id)}
                >
                  <Checkbox
                    id={employee.id}
                    checked={isSelected}
                    onCheckedChange={() => toggleEmployee(employee.id)}
                  />
                  <div className="flex-1 space-y-1">
                    <Label
                      htmlFor={employee.id}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {employee.name}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {employee.role}
                      </Badge>
                      {employee.department && (
                        <span className="text-xs text-muted-foreground">
                          {employee.department}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Seleção</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
