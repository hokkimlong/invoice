import {
  Autocomplete,
  Box,
  Button,
  Grid,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { Create, useAutocomplete } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import React from "react";
import { Controller, useFieldArray } from "react-hook-form";
import Big from "big.js";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import {
  downloadInvoiceDocx,
  formatPrice,
} from "../../components/invoice/util";
import { DownloadInvoicePdf } from "../../components/invoice/PDF";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { Download } from "@mui/icons-material";

export const InvoiceCreate = () => {
  const {
    saveButtonProps,
    refineCore: { formLoading, onFinish },
    register,
    control,
    getValues,
    formState: { errors },
    watch,
    setValue,
    trigger,
    handleSubmit,
  } = useForm({
    defaultValues: {
      date: dayjs(),
      exchange_rate: 4045,
      invoice_number: "",
      customer: null,
      products: [
        {
          product: null,
          variant: null,
          quantity: 1,
          variantPrice: null,
        },
      ],
    },
  });

  return (
    <Create
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
          {defaultButtons}
        </>
      )}
      isLoading={formLoading}
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
          control={control}
          watch={watch}
          setValue={setValue}
        />
      </Box>
    </Create>
  );
};

export const DownloadButton = ({
  getValues,
  onBeforeAction = (action) => action(),
  hideText,
}: {
  getValues: () => any;
  onBeforeAction?: (action: () => void) => void;
  hideText?: boolean;
}) => {
  return (
    <PopupState variant="popover" popupId="demo-popup-menu">
      {(popupState) => (
        <React.Fragment>
          <Button {...bindTrigger(popupState)}>
            <Download />
            {!hideText && "Download"}
          </Button>
          <Menu {...bindMenu(popupState)}>
            <DownloadInvoicePdf data={[getValues()]}>
              {({ handlePrint }) => (
                <MenuItem
                  onClick={() => {
                    onBeforeAction(handlePrint);
                    popupState.close();
                  }}
                >
                  PDF
                </MenuItem>
              )}
            </DownloadInvoicePdf>
            <DownloadInvoicePdf
              data={[getValues()]}
              options={{ exchangeRate: false }}
            >
              {({ handlePrint }) => (
                <MenuItem
                  onClick={() => {
                    onBeforeAction(handlePrint);
                    popupState.close();
                  }}
                >
                  PDF (No Exchange Rate)
                </MenuItem>
              )}
            </DownloadInvoicePdf>
            <MenuItem
              onClick={() => {
                onBeforeAction(() => downloadInvoiceDocx(getValues()));
                popupState.close();
              }}
            >
              Word
            </MenuItem>
            <MenuItem
              onClick={() => {
                onBeforeAction(() =>
                  downloadInvoiceDocx(getValues(), { exchangeRate: false })
                );
                popupState.close();
              }}
            >
              Word (No Exchange Rate)
            </MenuItem>
          </Menu>
        </React.Fragment>
      )}
    </PopupState>
  );
};

export const InvoiceForm = ({
  register,
  errors,
  control,
  watch,
  setValue,
}: any) => {
  const { autocompleteProps: customerAutocompleteProps } = useAutocomplete({
    resource: "customers",
    onSearch: (value) => [
      {
        field: "name",
        operator: "contains",
        value,
      },
    ],
  });

  const { autocompleteProps: productAutocompleteProps } = useAutocomplete({
    resource: "products",
    onSearch: (value) => [
      {
        field: "name",
        operator: "contains",
        value,
      },
    ],
  });

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
    <Grid container spacing={2}>
      <Grid item xs={4}>
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
      </Grid>
      <Grid item xs={4}>
        <TextField
          {...register("exchange_rate")}
          error={!!(errors as any)?.exchange_rate}
          helperText={(errors as any)?.exchange_rate?.message}
          margin="normal"
          fullWidth
          InputLabelProps={{ shrink: true }}
          type="number"
          label={"Exchange Rate"}
          name="exchange_rate"
        />
      </Grid>
      <Grid item xs={4}>
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <DatePicker
              format="DD/MM/YYYY"
              sx={{ mt: 1.9, width: "100%" }}
              value={
                typeof field.value === "string"
                  ? dayjs(field.value)
                  : field.value
              }
              onChange={(value) => {
                field.onChange(value);
              }}
              label={"Date"}
              name="date"
            />
          )}
        ></Controller>
      </Grid>
      <Grid item xs={12}>
        <Grid container>
          <Grid item xs={12}>
            <Controller
              control={control}
              name={"customer"}
              rules={{ required: "This field is required" }}
              // eslint-disable-next-line
              defaultValue={null as any}
              render={({ field, fieldState }) => (
                <Autocomplete
                  {...customerAutocompleteProps}
                  {...field}
                  onChange={(_, value) => {
                    field.onChange(value);
                  }}
                  autoHighlight
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
                      error={!!fieldState.error}
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
                  <Grid item xs={3}>
                    <Controller
                      control={control}
                      name={`products.${index}.product`}
                      rules={{ required: "This field is required" }}
                      defaultValue={controlledField.product}
                      render={({ field, fieldState }) => (
                        <Autocomplete
                          {...productAutocompleteProps}
                          {...field}
                          autoHighlight
                          onChange={(_, value) => {
                            field.onChange(value);
                            setValue(
                              `products.${index}.variant`,
                              value.variants[0]
                            );
                            setValue(
                              `products.${index}.variantPrice`,
                              value.variants[0].price
                            );
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
                              error={!!fieldState.error}
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
                      render={({ field, fieldState }) => (
                        <Autocomplete
                          options={controlledField?.product?.variants ?? []}
                          autoHighlight
                          {...field}
                          onChange={(_, value) => {
                            field.onChange(value);
                            setValue(
                              `products.${index}.variantPrice`,
                              value.price
                            );
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
                              error={!!fieldState.error}
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
                  <Grid item xs={"auto"}>
                    <TextField
                      {...register(`products.${index}.quantity`, {
                        required: "This field is required",
                      })}
                      margin="normal"
                      style={{ width: "100px" }}
                      InputLabelProps={{ shrink: true }}
                      type="number"
                      label={"Quantity"}
                      name={`products.${index}.quantity`}
                    />
                  </Grid>
                  <Grid item xs={"auto"}>
                    <TextField
                      {...register(`products.${index}.variantPrice`, {
                        required: "This field is required",
                      })}
                      style={{ width: "150px" }}
                      defaultValue={
                        controlledField.variantPrice ??
                        controlledField.variant?.price
                      }
                      margin="normal"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      type="number"
                      label={"Price"}
                      name={`products.${index}.variantPrice`}
                    />
                  </Grid>
                  <Grid item xs="auto">
                    <Typography>
                      {controlledField.variantPrice
                        ? formatPrice(
                            new Big(controlledField.variantPrice).times(
                              controlledField.quantity || 1
                            )
                          )
                        : ""}
                    </Typography>
                  </Grid>
                  <Grid item xs></Grid>
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
                <Grid container justifyContent={"space-between"}>
                  <Grid item>
                    <Button
                      onClick={() => {
                        append(
                          {
                            product: null,
                            variant: null,
                            quantity: 1,
                          },
                          {
                            focusName: `products.${fields.length}.product`,
                          }
                        );
                      }}
                    >
                      Add
                    </Button>
                  </Grid>
                  <Grid item>
                    <div style={{ marginRight: "200px" }}>
                      <Typography>Total Price</Typography>
                      <Typography>
                        {formatPrice(
                          controlledFields.reduce(
                            (acc: any, cur: any) =>
                              acc.add(
                                new Big(cur.variantPrice || 0).times(
                                  cur.quantity || 1
                                )
                              ),
                            new Big(0)
                          )
                        )}
                      </Typography>
                    </div>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
