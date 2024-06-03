import {
  Autocomplete,
  Box,
  Button,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { Create, useAutocomplete } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import React from "react";
import { Controller, useFieldArray } from "react-hook-form";

export const InvoiceCreate = () => {
  const {
    saveButtonProps,
    refineCore: { formLoading },
    register,
    control,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      exchange_rate: 4050,
      invoice_number: "",
      customer: null,
      products: [
        {
          product: null,
          variant: null,
          quantity: 1,
        },
      ],
    },
  });

  const { autocompleteProps: customerAutocompleteProps } = useAutocomplete({
    resource: "customers",
  });

  const { autocompleteProps: productAutocompleteProps } = useAutocomplete({
    resource: "products",
  });

  console.log(productAutocompleteProps);

  const { fields, remove, append } = useFieldArray({
    control,
    name: "products",
  });

  const watchFieldArray = watch("products");
  const controlledFields = fields.map((field, index) => {
    return {
      ...field,
      ...watchFieldArray[index],
    };
  });

  return (
    <Create isLoading={formLoading} saveButtonProps={saveButtonProps}>
      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column" }}
        autoComplete="off"
      >
        <TextField
          {...register("invoice_number", {
            required: "This field is required",
          })}
          error={!!(errors as any)?.invoice_number}
          helperText={(errors as any)?.invoice_number?.message}
          margin="normal"
          fullWidth
          InputLabelProps={{ shrink: true }}
          type="text"
          label={"Invoice Number"}
          name="invoice_number"
        />
        <TextField
          {...register("exchange_rate", {
            required: "This field is required",
          })}
          error={!!(errors as any)?.exchange_rate}
          helperText={(errors as any)?.exchange_rate?.message}
          margin="normal"
          fullWidth
          InputLabelProps={{ shrink: true }}
          type="number"
          label={"Exchange Rate"}
          name="exchange_rate"
        />
        <Controller
          control={control}
          name={"customer"}
          rules={{ required: "This field is required" }}
          // eslint-disable-next-line
          defaultValue={null as any}
          render={({ field }) => (
            <Autocomplete
              {...customerAutocompleteProps}
              {...field}
              onChange={(_, value) => {
                field.onChange(value);
              }}
              getOptionLabel={(item) => {
                return `${item?.name} - ${item?.phone} - ${item?.address}`;
              }}
              isOptionEqualToValue={(option, value) => {
                return option.id === value.id;
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={"Customer"}
                  margin="normal"
                  variant="outlined"
                  error={!!(errors as any)?.customer?.id}
                  helperText={(errors as any)?.customer?.id?.message}
                  required
                />
              )}
            />
          )}
        />
        <Typography>Products</Typography>
        <Grid container spacing={2} alignItems={"center"}>
          {controlledFields.map((controlledField: any, index: number) => (
            <React.Fragment key={controlledField.id}>
              <Grid item xs={4}>
                <Controller
                  control={control}
                  name={`products.${index}.product`}
                  rules={{ required: "This field is required" }}
                  defaultValue={controlledField.product}
                  render={({ field }) => (
                    <Autocomplete
                      {...productAutocompleteProps}
                      {...field}
                      onChange={(_, value) => {
                        field.onChange(value);
                      }}
                      getOptionLabel={(item) => {
                        return `${item?.name}`;
                      }}
                      isOptionEqualToValue={(option, value) => {
                        return option.id === value.id;
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={"Product"}
                          margin="normal"
                          variant="outlined"
                          required
                        />
                      )}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={4}>
                <Controller
                  control={control}
                  name={`products.${index}.variant`}
                  rules={{ required: "This field is required" }}
                  defaultValue={controlledField.variant}
                  render={({ field }) => (
                    <Autocomplete
                      {...productAutocompleteProps}
                      options={controlledField?.product?.variants ?? []}
                      {...field}
                      onChange={(_, value) => {
                        field.onChange(value);
                      }}
                      getOptionLabel={(item) => {
                        return `${item?.name} / ${item?.unit} / ${item?.price}$`;
                      }}
                      isOptionEqualToValue={(option, value) => {
                        return option.name === value.name;
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={"Variant"}
                          margin="normal"
                          variant="outlined"
                          required
                        />
                      )}
                    />
                  )}
                />
              </Grid>
              <Grid item xs>
                <TextField
                  {...register(`products.${index}.quantity`, {
                    required: "This field is required",
                  })}
                  margin="normal"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  type="number"
                  label={"Quantity"}
                  name={`products.${index}.quantity`}
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
            </React.Fragment>
          ))}
          <Grid item xs={12}>
            <Button
              onClick={() => {
                append({
                  product: null,
                  variant: null,
                  quantity: 1,
                });
              }}
            >
              Add
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Create>
  );
};

export const InvoiceForm = ({ register, errors }: any) => (
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
