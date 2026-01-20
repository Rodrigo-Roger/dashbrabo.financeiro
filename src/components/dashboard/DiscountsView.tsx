import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Users,
  Percent,
  Save,
  Plus,
  Trash2,
  DollarSign,
  Package,
} from "lucide-react";
import { formatCurrency, Employee, SAMPLE_EMPLOYEES } from "@/lib/data";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDiscount,
  fetchDiscounts,
  deleteDiscount,
  fetchDiscountTypes,
  type Discount,
  type DiscountType,
} from "@/lib/api";

interface DiscountsViewProps {
  employees?: Employee[];
  className?: string;
}

export function DiscountsView({
  employees = SAMPLE_EMPLOYEES,
  className,
}: DiscountsViewProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [selectedDiscountTypeId, setSelectedDiscountTypeId] =
    useState<string>("");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [notes, setNotes] = useState<string>("");
  const queryClient = useQueryClient();

  // Buscar tipos de desconto disponíveis
  const { data: discountTypes = [] } = useQuery({
    queryKey: ["discountTypes"],
    queryFn: fetchDiscountTypes,
  });

  // Buscar descontos do funcionário selecionado
  const { data: discounts = [], refetch } = useQuery({
    queryKey: ["discounts", selectedEmployeeId],
    queryFn: () =>
      selectedEmployeeId
        ? fetchDiscounts(selectedEmployeeId)
        : Promise.resolve([]),
    enabled: !!selectedEmployeeId,
  });

  const { mutate: createDiscountMutation, isPending: isCreating } = useMutation(
    {
      mutationFn: async (discount: Discount) => {
        return await createDiscount(discount);
      },
      onSuccess: () => {
        toast.success("Desconto adicionado com sucesso");
        refetch();
        // Limpar formulário
        setSelectedDiscountTypeId("");
        setCustomAmount("");
        setQuantity("1");
        setNotes("");
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Não foi possível adicionar o desconto",
        );
      },
    },
  );

  const { mutate: deleteDiscountMutation } = useMutation({
    mutationFn: async (discountId: string) => {
      return await deleteDiscount(discountId);
    },
    onSuccess: () => {
      toast.success("Desconto removido com sucesso");
      refetch();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível remover o desconto",
      );
    },
  });

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);
  const selectedDiscountType = discountTypes.find(
    (dt) => dt.id === selectedDiscountTypeId,
  );

  const handleAddDiscount = () => {
    if (!selectedEmployeeId || !selectedDiscountTypeId) {
      toast.error("Selecione um vendedor e um tipo de desconto");
      return;
    }

    const discountData: Discount = {
      seller: selectedEmployeeId,
      discount_type: selectedDiscountTypeId,
      notes: notes || undefined,
    };

    // Se requer quantidade (Monster), adiciona quantidade
    if (selectedDiscountType?.requires_quantity) {
      const qty = parseInt(quantity);
      if (!qty || qty <= 0) {
        toast.error("Digite uma quantidade válida");
        return;
      }
      discountData.quantity = qty;
    } else {
      // Se não requer quantidade (Adiantamento), adiciona custom_amount
      const amount = parseFloat(customAmount);
      if (!amount || amount <= 0) {
        toast.error("Digite um valor válido");
        return;
      }
      discountData.custom_amount = amount;
    }

    createDiscountMutation(discountData);
  };

  const calculateTotal = () => {
    return discounts.reduce((acc, d) => {
      const value = parseFloat(d.total_discount || "0");
      return acc + value;
    }, 0);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="rounded-xl bg-card p-6 shadow-card">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Percent className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              Gerenciamento de Descontos
            </h3>
            <p className="text-sm text-muted-foreground">
              Adicione adiantamentos ou descontos Monster para os colaboradores
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Formulário de Adicionar Desconto */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Vendedor
              </Label>
              <Select
                value={selectedEmployeeId}
                onValueChange={setSelectedEmployeeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      <div className="flex flex-col">
                        <span>{emp.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Tipo de Desconto
              </Label>
              <Select
                value={selectedDiscountTypeId}
                onValueChange={setSelectedDiscountTypeId}
                disabled={!selectedEmployeeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {discountTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        {type.requires_quantity ? (
                          <Package className="h-4 w-4" />
                        ) : (
                          <DollarSign className="h-4 w-4" />
                        )}
                        <div className="flex flex-col">
                          <span>{type.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {type.fixed_amount
                              ? `R$ ${type.fixed_amount} por unidade`
                              : "Valor customizável"}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedDiscountType?.requires_quantity ? (
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                />
                {selectedDiscountType.fixed_amount && (
                  <p className="text-sm text-muted-foreground">
                    Total:{" "}
                    {formatCurrency(
                      parseFloat(selectedDiscountType.fixed_amount) *
                        parseInt(quantity || "0"),
                    )}
                  </p>
                )}
              </div>
            ) : selectedDiscountType &&
              !selectedDiscountType.requires_quantity ? (
              <div className="space-y-2">
                <Label>Valor do Desconto</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>
            ) : null}

            {selectedDiscountTypeId && (
              <div className="space-y-2">
                <Label>Observações (opcional)</Label>
                <Input
                  type="text"
                  placeholder="Adicione uma observação..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            )}

            <Button
              onClick={handleAddDiscount}
              disabled={
                !selectedEmployeeId || !selectedDiscountTypeId || isCreating
              }
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isCreating ? "Adicionando..." : "Adicionar Desconto"}
            </Button>
          </div>

          {/* Lista de Descontos */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">
              Descontos do Colaborador
            </h4>

            {selectedEmployee ? (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      {selectedEmployee.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {discounts.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhum desconto cadastrado
                      </p>
                    ) : (
                      <>
                        {discounts.map((discount) => (
                          <div
                            key={discount.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-border"
                          >
                            <div className="flex items-center gap-3">
                              {discount.discount_type &&
                              "requires_quantity" in discount.discount_type ? (
                                <Package className="h-4 w-4 text-green-500" />
                              ) : (
                                <DollarSign className="h-4 w-4 text-blue-500" />
                              )}
                              <div>
                                <p className="text-sm font-medium">
                                  {discount.discount_type_name}
                                </p>
                                {discount.quantity && (
                                  <p className="text-xs text-muted-foreground">
                                    {discount.quantity}x unidades
                                  </p>
                                )}
                                {discount.custom_amount && (
                                  <p className="text-xs text-muted-foreground">
                                    Valor:{" "}
                                    {formatCurrency(
                                      parseFloat(discount.custom_amount),
                                    )}
                                  </p>
                                )}
                                {discount.notes && (
                                  <p className="text-xs text-muted-foreground italic">
                                    {discount.notes}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  {new Date(
                                    discount.created_at || "",
                                  ).toLocaleDateString("pt-BR")}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">
                                {formatCurrency(
                                  parseFloat(discount.total_discount || "0"),
                                )}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() =>
                                  discount.id &&
                                  deleteDiscountMutation(discount.id)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}

                        <div className="pt-3 border-t border-border mt-3">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">
                              Total de Descontos:
                            </span>
                            <span className="text-lg font-bold text-destructive">
                              {formatCurrency(calculateTotal())}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <Percent className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Selecione um vendedor para ver os descontos
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
