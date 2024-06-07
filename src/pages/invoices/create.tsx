import {
  Autocomplete,
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  // DateField
} from "@mui/material";
import { Create, useAutocomplete } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import React from "react";
import { Controller, useFieldArray } from "react-hook-form";

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
          <DownloadInvoiceButton getValues={getValues} />
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

import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import PizZipUtils from "pizzip/utils/index.js";
import { saveAs } from "file-saver";
import currencyFormatter from "currency-formatter";
import Big from "big.js";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";

function loadFile(url: any, callback: any) {
  PizZipUtils.getBinaryContent(url, callback);
}

const formatPrice = (price: any, riel = false) => {
  const precision = price.toNumber() % 1 === 0 ? 0 : 2;
  return currencyFormatter.format(price.toNumber(), {
    symbol: riel ? "៛" : "$",
    decimal: ".",
    thousand: ",",
    precision,
    format: "%v%s", // %s is the symbol and %v is the value
  });
};

export const DownloadInvoiceButton = ({ getValues }: any) => {
  const generateDocument = (
    options: { exchangeRate: boolean } = { exchangeRate: true }
  ) => {
    loadFile("/template/template.docx", function (error: any, content: any) {
      if (error) {
        throw error;
      }
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });
      const value = getValues();
      let totalPrice = new Big(0);
      const products = value.products.map((product: any, index: any) => {
        const variantPrice = product.variantPrice ?? product.variant.price;
        const productTotalPrice = new Big(variantPrice).times(product.quantity);
        totalPrice = totalPrice.add(productTotalPrice);
        return {
          index: index + 1,
          product_name: product.product.name,
          variant_name: product.variant.name,
          variant_unit: product.variant.unit,
          variant_price: formatPrice(new Big(variantPrice)),
          quantity: product.quantity,
          total_price: formatPrice(productTotalPrice),
        };
      });

      if (products.length < 8) {
        const diff = 8 - products.length;
        for (let i = 0; i < diff; i++) {
          products.push({
            index: "",
            product_name: "",
            variant_name: "",
            variant_unit: "",
            variant_price: "",
            quantity: "",
            total_price: "",
          });
        }
      }

      const date =
        typeof value.date === "string"
          ? new Date(value.date)
          : new Date(value.date);
      doc.render({
        invoice_number: value.invoice_number,
        sale_name: value.customer.sale_name,
        customer_name: value.customer.name,
        customer_phone: value.customer.phone,
        customer_address: value.customer.address,
        exchange_rate: !options?.exchangeRate ? "" : value.exchange_rate || "",
        taxi_phone: value.customer.taxi_phone,
        products: products,
        total_price_usd: formatPrice(totalPrice),
        total_price_riel: !options?.exchangeRate
          ? ""
          : value.exchange_rate
          ? formatPrice(totalPrice.times(value.exchange_rate), true)
          : "",
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
      });
      const out = doc.getZip().generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }); //Output the document using Data-URI
      saveAs(out, `${value.customer.name}(${value.invoice_number}).docx`);
    });
  };

  return (
    <Box>
      <div style={{ marginBottom: "10px" }}>
        <Button onClick={() => generateDocument()} variant="contained">
          Download Invoice
        </Button>
      </div>
      <div>
        <Button
          onClick={() =>
            generateDocument({
              exchangeRate: false,
            })
          }
          variant="contained"
        >
          Download Invoice No Exchange Rate
        </Button>
      </div>
    </Box>
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
              render={({ field }) => (
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
                  <Grid item xs={3}>
                    <Controller
                      control={control}
                      name={`products.${index}.product`}
                      rules={{ required: "This field is required" }}
                      defaultValue={controlledField.product}
                      render={({ field }) => (
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
