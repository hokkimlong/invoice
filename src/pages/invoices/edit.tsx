import { Box } from "@mui/material";
import { Edit } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { DownloadInvoiceButton, InvoiceForm } from "./create";

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
          <DownloadInvoiceButton getValues={getValues} />
          <div style={{display:"flex",gap:'20px'}}>{defaultButtons}</div>
        </>
      )}
      saveButtonProps={{
        ...saveButtonProps,
        onClick: handleSubmit((data) =>
          onFinish({
            ...data,
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
