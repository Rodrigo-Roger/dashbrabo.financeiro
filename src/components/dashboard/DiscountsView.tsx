import { useState, useEffect, useMemo } from "react";
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
  dateFilter?: {
    startDate?: string;
    endDate?: string;
  };
}

export function DiscountsView({
  employees = SAMPLE_EMPLOYEES,
  className,
  dateFilter,
}: DiscountsViewProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [selectedDiscountTypeId, setSelectedDiscountTypeId] =
    useState<string>("");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [notes, setNotes] = useState<string>("");
  const [referenceMonth, setReferenceMonth] = useState<string>(
    new Date().toISOString().slice(0, 7),
  );
  const [refMonth, setRefMonth] = useState<string>(
    new Date().toISOString().slice(5, 7),
  );
  const [refYear, setRefYear] = useState<string>(
    new Date().getFullYear().toString(),
  );

  // Filtros de consulta (lado direito)
  const [consultaVendedorId, setConsultaVendedorId] = useState<string>("");
  const [consultaMes, setConsultaMes] = useState<string>(
    new Date().toISOString().slice(0, 7),
  );
  const [consultaMonth, setConsultaMonth] = useState<string>(
    new Date().toISOString().slice(5, 7),
  );
  const [consultaYear, setConsultaYear] = useState<string>(
    new Date().getFullYear().toString(),
  );

  const monthOptions = useMemo(
    () => [
      { value: "01", label: "janeiro" },
      { value: "02", label: "fevereiro" },
      { value: "03", label: "março" },
      { value: "04", label: "abril" },
      { value: "05", label: "maio" },
      { value: "06", label: "junho" },
      { value: "07", label: "julho" },
      { value: "08", label: "agosto" },
      { value: "09", label: "setembro" },
      { value: "10", label: "outubro" },
      { value: "11", label: "novembro" },
      { value: "12", label: "dezembro" },
    ],
    [],
  );

  useEffect(() => {
    const composed = `${refYear}-${refMonth}`;
    setReferenceMonth(composed);
  }, [refMonth, refYear]);

  useEffect(() => {
    const composed = `${consultaYear}-${consultaMonth}`;
    setConsultaMes(composed);
  }, [consultaMonth, consultaYear]);

  const queryClient = useQueryClient();

  // Buscar tipos de desconto disponíveis
  const { data: discountTypes = [] } = useQuery({
    queryKey: ["discountTypes"],
    queryFn: fetchDiscountTypes,
  });

  // Buscar descontos do funcionário selecionado para adicionar
  const { data: discounts = [], refetch } = useQuery({
    queryKey: ["discounts", selectedEmployeeId],
    queryFn: () =>
      selectedEmployeeId
        ? fetchDiscounts(selectedEmployeeId)
        : Promise.resolve([]),
    enabled: !!selectedEmployeeId,
  });

  // Buscar descontos do funcionário selecionado para consulta
  const { data: discountosConsulta = [] } = useQuery({
    queryKey: ["discounts", consultaVendedorId],
    queryFn: () =>
      consultaVendedorId
        ? fetchDiscounts(consultaVendedorId)
        : Promise.resolve([]),
    enabled: !!consultaVendedorId,
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
        const now = new Date();
        setRefMonth(now.toISOString().slice(5, 7));
        setRefYear(now.getFullYear().toString());
      },
      onError: (error) => {
        let errorMessage = "Não foi possível adicionar o desconto";

        if (error instanceof Error) {
          if (
            error.message.includes("set único") ||
            error.message.includes("unique")
          ) {
            errorMessage =
              "Já existe um desconto deste tipo para este vendedor neste mês";
          } else {
            errorMessage = error.message;
          }
        }

        toast.error(errorMessage);
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

    if (!referenceMonth) {
      toast.error("Selecione o mês de referência");
      return;
    }

    const normalizedReferenceMonth =
      referenceMonth.length === 7 ? `${referenceMonth}-01` : referenceMonth;

    const discountData: Discount = {
      seller: selectedEmployeeId,
      discount_type: selectedDiscountTypeId,
      reference_month: normalizedReferenceMonth,
      notes: notes || undefined,
    };

    // Se requer quantidade (Monster), adiciona quantidade e resolve o valor
    if (selectedDiscountType?.requires_quantity) {
      const fixed = selectedDiscountType.fixed_amount
        ? parseFloat(selectedDiscountType.fixed_amount)
        : NaN;

      // Backend calcula total_discount com discount_type.fixed_amount; se vier vazio/zero, bloquear
      if (!Number.isFinite(fixed) || fixed <= 0) {
        toast.error(
          "Tipo de desconto sem valor fixo configurado. Defina o valor unitário no cadastro do tipo.",
        );
        return;
      }

      const qty = parseInt(quantity);
      if (!qty || qty <= 0) {
        toast.error("Digite uma quantidade válida");
        return;
      }
      discountData.quantity = qty;
      // Enviar o valor unitário fixo para referência (mesmo que backend use o discount_type)
      discountData.custom_amount = fixed;
    } else {
      // Se não requer quantidade (Adiantamento), adiciona custom_amount total
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

  // Filtrar descontos de consulta por mês
  const discountosConsultaFiltrados = discountosConsulta.filter((d) => {
    if (!consultaMes) return true;
    const discountMonth = d.reference_month?.substring(0, 7);
    return discountMonth === consultaMes;
  });

  const calculateConsultaTotal = () => {
    return discountosConsultaFiltrados.reduce((acc, d) => {
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
          {/* Coluna Esquerda: Formulário de Adicionar Desconto */}
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

            <div className="space-y-2">
              <Label>Mês de referência</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select value={refMonth} onValueChange={setRefMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="2020"
                  max="2099"
                  value={refYear}
                  onChange={(e) => setRefYear(e.target.value)}
                  placeholder="Ano"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Escolha o mês e ano do desconto.
              </p>
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
                {!selectedDiscountType.fixed_amount && (
                  <p className="text-sm text-destructive">
                    Defina um valor fixo para este tipo no backend para liberar
                    o cadastro.
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
                !selectedEmployeeId ||
                !selectedDiscountTypeId ||
                !referenceMonth ||
                isCreating
              }
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isCreating ? "Adicionando..." : "Adicionar Desconto"}
            </Button>
          </div>

          {/* Coluna Direita: Consulta + Lista de Descontos */}
          <div className="space-y-4">
            {/* Seção de Consulta */}
            <div className="space-y-4 border-b pb-6">
              <h4 className="font-semibold text-foreground">
                Consultar Descontos
              </h4>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Vendedor
                </Label>
                <Select
                  value={consultaVendedorId}
                  onValueChange={setConsultaVendedorId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um vendedor para consultar" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Mês</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={consultaMonth}
                    onValueChange={setConsultaMonth}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Mês" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="2020"
                    max="2099"
                    value={consultaYear}
                    onChange={(e) => setConsultaYear(e.target.value)}
                    placeholder="Ano"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Filtra pelos descontos do mês/ano selecionado.
                </p>
              </div>
            </div>

            {/* Lista de Descontos para Consulta */}
            {consultaVendedorId ? (
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">
                  Descontos -{" "}
                  {employees.find((e) => e.id === consultaVendedorId)?.name}
                </h4>

                {discountosConsultaFiltrados.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-8 text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      Nenhum desconto neste período
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      Total de descontos do vendedor:{" "}
                      {discountosConsulta.length}
                    </p>
                  </div>
                ) : (
                  <>
                    {discountosConsultaFiltrados.map((discount) => (
                      <div
                        key={discount.id}
                        className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card/80 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-start gap-3 flex-1">
                            {discount.discount_type &&
                            "requires_quantity" in discount.discount_type ? (
                              <Package className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            ) : (
                              <DollarSign className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground">
                                {discount.discount_type_name}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {discount.reference_month
                                  ? new Date(
                                      discount.reference_month + "-01",
                                    ).toLocaleDateString("pt-BR", {
                                      month: "long",
                                      year: "numeric",
                                    })
                                  : "Sem mês"}
                              </p>
                              {discount.created_at && (
                                <p className="text-xs text-muted-foreground/70">
                                  Criado:{" "}
                                  {new Date(
                                    discount.created_at,
                                  ).toLocaleDateString("pt-BR")}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-lg font-bold text-foreground">
                              {discount.total_discount ?? "0"}
                            </p>
                          </div>
                        </div>

                        {discount.quantity && (
                          <p className="text-xs bg-green-50/50 dark:bg-green-950/20 text-green-700 dark:text-green-300 px-2 py-1 rounded w-fit">
                            {discount.quantity}x unidades
                          </p>
                        )}

                        {discount.notes && (
                          <p className="text-xs text-muted-foreground italic mt-2 border-l-2 border-muted-foreground/30 pl-2">
                            {discount.notes}
                          </p>
                        )}

                        <div className="flex justify-end mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() =>
                              discount.id && deleteDiscountMutation(discount.id)
                            }
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remover
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
                          {calculateConsultaTotal().toString()}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
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
