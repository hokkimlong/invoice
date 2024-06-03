import { Box } from "@mui/material";
import { Edit } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { ProductForm } from "./create";

export const ProductEdit = () => {
  const {
    saveButtonProps,
    register,
    formState: { errors },
    control
  } = useForm({});

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column" }}
        autoComplete="off"
      >
        <ProductForm register={register} errors={errors} control={control}/>
      </Box>
    </Edit>
  );
};
