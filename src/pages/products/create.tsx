import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import { Create } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { useFieldArray } from "react-hook-form";
import { supabaseClient } from "../../utility";

export const ProductCreate = () => {
  const {
    saveButtonProps,
    refineCore: { formLoading },
    register,
    formState: { errors },
    control,
  } = useForm({
    defaultValues: {
      name: "",
      variants: [{ name: "", unit: "", price: "" }],
    },
  });


  return (
    <Create isLoading={formLoading} saveButtonProps={{
      ...saveButtonProps,
    }}>
      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column" }}
        autoComplete="off"
      >
        <ProductForm register={register} errors={errors} control={control} />
      </Box>
    </Create>
  );
};

export const ProductForm = ({ register, errors, control }: any) => {
  const { fields, append, remove } = useFieldArray({
    control: control,
    name: "variants",
  });

  return (
    <>
      <Typography>Products</Typography>
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
      <Typography>Variants</Typography>
      <Grid container spacing={2} alignItems={"center"}>
        {fields.map((field: any, index: number) => (
          <>
            <Grid item xs={4} key={field.id}>
              <TextField
                {...register(`variants.${index}.name`, {
                  required: "This field is required",
                })}
                error={!!(errors as any)?.variants?.[index]?.name}
                helperText={(errors as any)?.variants?.[index]?.name?.message}
                margin="normal"
                fullWidth
                InputLabelProps={{ shrink: true }}
                type="text"
                label={"Name"}
                name={`variants.${index}.name`}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                {...register(`variants.${index}.unit`, {
                  required: "This field is required",
                })}
                error={!!(errors as any)?.variants?.[index]?.unit}
                helperText={(errors as any)?.variants?.[index]?.unit?.message}
                margin="normal"
                fullWidth
                InputLabelProps={{ shrink: true }}
                type="text"
                label={"Unit"}
                name={`variants.${index}.unit`}
              />
            </Grid>
            <Grid item xs>
              <TextField
                {...register(`variants.${index}.price`, {
                  required: "This field is required",
                })}
                error={!!(errors as any)?.variants?.[index]?.price}
                helperText={(errors as any)?.variants?.[index]?.price?.message}
                margin="normal"
                fullWidth
                InputLabelProps={{ shrink: true }}
                type="number"
                label={"Price"}
                name={`variants.${index}.price`}
              />
            </Grid>
            <Grid item xs="auto">
              <Button
                color="error"
                disabled={fields.length === 1}
                onClick={() => {
                  remove(index);
                }}
              >
                Delete
              </Button>
            </Grid>
          </>
        ))}
        <Grid item xs={12}>
          <Button
            onClick={() => {
              append({ name: "", unit: "", price: "" });
            }}
          >
            Add
          </Button>
        </Grid>
      </Grid>
    </>
  );
};
