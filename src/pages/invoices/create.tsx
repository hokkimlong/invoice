import { Box, TextField } from "@mui/material";
import { Create } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";

export const InvoiceCreate = () => {
  const {
    saveButtonProps,
    refineCore: { formLoading },
    register,
    formState: { errors },
  } = useForm({});

  return (
    <Create isLoading={formLoading} saveButtonProps={saveButtonProps}>
      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column" }}
        autoComplete="off"
      >
        <CustomerForm register={register} errors={errors} />
      </Box>
    </Create>
  );
};

export const CustomerForm = ({ register, errors }: any) => (
  <>
    <TextField
      {...register("name", {
        required: "This field is required",
      })}
      error={!!(errors as any)?.name}
      helperText={(errors as any)?.name?.message}
      margin="normal"
      fullWidth
      InputLabelProps={{ shrink: true }}
      type="text"
      label={"Name"}
      name="name"
    />
    <TextField
      {...register("phone", {
        required: "This field is required",
      })}
      error={!!(errors as any)?.phone}
      helperText={(errors as any)?.phone?.message}
      margin="normal"
      fullWidth
      InputLabelProps={{ shrink: true }}
      type="text"
      label={"Phone"}
      name="phone"
    />
    <TextField
      {...register("address", {
        required: "This field is required",
      })}
      error={!!(errors as any)?.address}
      helperText={(errors as any)?.address?.message}
      margin="normal"
      fullWidth
      InputLabelProps={{ shrink: true }}
      type="text"
      label={"Address"}
      name="address"
      multiline
      rows={4}
    />
  </>
);
