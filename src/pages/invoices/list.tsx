import {
  DataGrid,
  GridRowSelectionModel,
  GridToolbarContainer,
  type GridColDef,
} from "@mui/x-data-grid";
import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  useAutocomplete,
  useDataGrid,
} from "@refinedev/mui";
import React from "react";
import { DownloadButton } from "./create";
import {
  Autocomplete,
  Box,
  Button,
  Menu,
  MenuItem,
  TextField,
} from "@mui/material";
import { useList, useMany } from "@refinedev/core";
import { DownloadInvoicePdf } from "../../components/invoice/PDF";
import Big from "big.js";
import { formatPrice } from "../../components/invoice/util";
import DateRangePicker from "../../components/date-picker";
import dayjs, { Dayjs } from "dayjs";
import { Clear, FilterAlt, ImportExport } from "@mui/icons-material";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { flushSync } from "react-dom";

const defaultDateRange = [dayjs().startOf("month"), dayjs().endOf("month")];

export const InvoiceList = () => {
  const { dataGridProps, setFilters, filters } = useDataGrid({
    sorters: {
      initial: [
        {
          field: "invoice_number",
          order: "desc",
        },
      ],
    },
    pagination: {
      pageSize: 100,
    },
    syncWithLocation: false,
    filters: {
      initial: [
        {
          field: "date",
          operator: "gte",
          value: defaultDateRange[0].toISOString(),
        },
        {
          field: "date",
          operator: "lte",
          value: defaultDateRange[1].toISOString(),
        },
      ],
    },
  });

  const columns = React.useMemo<GridColDef[]>(
    () => [
      {
        field: "invoice_number",
        headerName: "Invoice Number",
        width: 150,
      },
      {
        field: "date",
        headerName: "Date",
        width: 150,
        renderCell: function render({ row }) {
          return <DateField value={row.date ?? new Date()} />;
        },
      },
      {
        field: "total_price",
        headerName: "TotalPrice",
        minWidth: 120,
        renderCell: function render({ row }) {
          if (!row?.total_price) {
            return "";
          }
          return formatPrice(new Big(row?.total_price));
        },
      },
      {
        field: "customer",
        headerName: "Customer",
        minWidth: 350,
        renderCell: function render({ row }) {
          return (
            <div style={{ padding: "10px 0" }}>
              <div>{`${row.customer?.name} - ${row.customer?.phone}`}</div>
              <div>{row.customer.address}</div>
            </div>
          );
        },
      },
      {
        field: "products",
        headerName: "Product",
        minWidth: 320,
        renderCell: function render({ row }) {
          return (
            <div style={{ padding: "10px 0" }}>
              {row.products.map((product: any) => (
                <div>{`${product.product.name} - ${product.variant.name} x ${product.quantity}`}</div>
              ))}
            </div>
          );
        },
      },
      {
        field: "actions",
        headerName: "Actions",
        sortable: false,
        renderCell: function render({ row }) {
          return (
            <>
              <DownloadButton hideText getValues={() => row} />
              <EditButton hideText recordItemId={row.id} />
              <DeleteButton hideText recordItemId={row.id} />
            </>
          );
        },
        align: "center",
        headerAlign: "center",
      },
    ],
    []
  );

  const [rowSelectionModel, setRowSelectionModel] =
    React.useState<GridRowSelectionModel>([]);

  return (
    <List>
      <DataGrid
        {...dataGridProps}
        getRowHeight={() => "auto"}
        columns={columns}
        checkboxSelection
        disableColumnFilter
        disableColumnMenu
        slots={{
          toolbar: CustomToolbar,
        }}
        slotProps={{
          toolbar: {
            rowSelectionModel,
            setFilters,
            filters,
            rowCount: dataGridProps.rowCount,
          },
        }}
        onRowSelectionModelChange={(newRowSelectionModel) => {
          setRowSelectionModel(newRowSelectionModel);
        }}
        keepNonExistentRowsSelected
        rowSelectionModel={rowSelectionModel}
        autoHeight
      />
    </List>
  );
};

function CustomToolbar({
  rowSelectionModel,
  setFilters,
  rowCount,
  filters,
}: any) {
  const { refetch } = useMany({
    queryOptions: {
      enabled: false,
    },
    resource: "invoices",
    ids: rowSelectionModel,
  });

  const { refetch: refetchAll } = useList({
    queryOptions: {
      enabled: false,
    },
    resource: "invoices",
    filters,
    pagination: {
      pageSize: rowCount,
    },
  });

  const [dateRange, setDateRange] =
    React.useState<(Dayjs | null)[]>(defaultDateRange);

  const [customerId, setCustomerId] = React.useState<string | null>(null);

  const handlePrintPdf = ({ label }: any, popupState: any) => {
    return ({ handlePrint, setContent }: any) => (
      <MenuItem
        onClick={() => {
          popupState.close();
          if (rowSelectionModel.length === 0) {
            refetchAll()
              .then((res) => {
                flushSync(() => {
                  setContent((res?.data?.data as any) ?? []);
                });
                handlePrint();
              })
              .catch((e) => {
                console.error(e);
              });
          } else {
            refetch()
              .then((res) => {
                flushSync(() => {
                  setContent((res?.data?.data as any) ?? []);
                });
                handlePrint();
              })
              .catch((e) => {
                console.error(e);
              });
          }
        }}
      >
        {label}
      </MenuItem>
    );
  };

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

  return (
    <GridToolbarContainer
      sx={{ display: "flex", justifyContent: "space-between" }}
    >
      <Box my={2} display={"flex"} gap={1}>
        <DateRangePicker
          value={dateRange}
          onChange={(value) => {
            setDateRange(value);
          }}
        />
        <Autocomplete
          {...customerAutocompleteProps}
          onChange={(_, value) => {
            setCustomerId(value?.id);
          }}
          autoHighlight
          getOptionLabel={(item) => {
            return `${item?.name} - ${item?.phone} - ${item?.address}`;
          }}
          isOptionEqualToValue={(option, value) => {
            return option.id === value.id;
          }}
          size="small"
          renderInput={(params) => (
            <TextField
              {...params}
              style={{ margin: 0, minWidth: "300px" }}
              size="small"
              label={"Customer"}
              margin="normal"
              variant="outlined"
            />
          )}
        />
        <Button
          onClick={() => {
            setFilters([
              {
                field: "date",
                operator: "gte",
                value: dateRange[0]?.toISOString(),
              },
              {
                field: "date",
                operator: "lte",
                value: dateRange[1]?.toISOString(),
              },
              ...(customerId
                ? [
                    {
                      field: "customer_id",
                      operator: "eq",
                      value: customerId,
                    },
                  ]
                : []),
            ]);
          }}
          startIcon={<FilterAlt />}
          variant="outlined"
        >
          Filter
        </Button>
        <Button
          onClick={() => {
            setFilters([]);
            setDateRange([null, null]);
            setCustomerId(null);
          }}
          startIcon={<Clear />}
          variant="outlined"
        >
          Clear
        </Button>
      </Box>
      {rowCount > 0 && (
        <Box sx={{ my: 1, display: "flex", gap: 1 }}>
          <PopupState variant="popover" popupId="demo-popup-menu">
            {(popupState) => (
              <React.Fragment>
                <Button
                  startIcon={<ImportExport />}
                  {...bindTrigger(popupState)}
                  variant="outlined"
                >
                  Export{" "}
                  {rowSelectionModel.length >= 1
                    ? rowSelectionModel.length
                    : rowCount}
                </Button>
                <Menu {...bindMenu(popupState)}>
                  <DownloadInvoicePdf>
                    {handlePrintPdf({ label: "PDF" }, popupState)}
                  </DownloadInvoicePdf>
                  <DownloadInvoicePdf options={{ exchangeRate: false }}>
                    {handlePrintPdf(
                      { label: "PDF (No Exchange Rate)" },
                      popupState
                    )}
                  </DownloadInvoicePdf>
                </Menu>
              </React.Fragment>
            )}
          </PopupState>
        </Box>
      )}
    </GridToolbarContainer>
  );
}
