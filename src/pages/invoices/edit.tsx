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
    getValues,
    control,
    setValue
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
          {defaultButtons}
        </>
      )}
    saveButtonProps={saveButtonProps}>
      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column" }}
        autoComplete="off"
      >
        <InvoiceForm register={register} errors={errors} watch={watch} control={control} setValue={setValue}/>
      </Box>
    </Edit>
  );
};
