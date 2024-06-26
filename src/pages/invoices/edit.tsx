import { Box } from "@mui/material";
import { Edit } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { DownloadButton, InvoiceForm } from "./create";
import Big from "big.js";

export const InvoiceEdit = () => {
  const {
    saveButtonProps,
    register,
    formState: { errors },
    watch,
    refineCore: { onFinish },
    getValues,
    control,
    setValue,
    handleSubmit,
    trigger,
  } = useForm({});

  return (
    <Edit
      footerButtonProps={{
        style: {
          justifyContent: "space-between",
        },
      }}
      footerButtons={({ defaultButtons }) => (
        <>
          <DownloadButton
            getValues={getValues}
            onBeforeAction={async (action) => {
              const result = await trigger(null as any, { shouldFocus: true });
              if (result) action();
            }}
          />
          <div style={{ display: "flex", gap: "20px" }}>{defaultButtons}</div>
        </>
      )}
      saveButtonProps={{
        ...saveButtonProps,
        onClick: handleSubmit((data) =>
          onFinish({
            ...data,
            total_price: getValues('products').reduce(
              (acc: any, cur: any) =>
                acc.add(
                  new Big(cur.variantPrice || 0).times(cur.quantity || 1)
                ),
            new Big(0)
            ).toString(),
            customer_id: data.customer.id,
            exchange_rate: data.exchange_rate || (null as any),
          })
        ),
      }}
    >
      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column" }}
        autoComplete="off"
      >
        <InvoiceForm
          register={register}
          errors={errors}
          watch={watch}
          control={control}
          setValue={setValue}
        />
      </Box>
    </Edit>
  );
};
