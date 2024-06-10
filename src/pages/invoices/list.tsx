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
  useDataGrid,
} from "@refinedev/mui";
import React, { useState } from "react";
import { DownloadButton } from "./create";
import { Box, Button } from "@mui/material";
import { useMany, useOne } from "@refinedev/core";
import { DownloadInvoicePdf } from "../../components/invoice/PDF";

export const InvoiceList = () => {
  const { dataGridProps } = useDataGrid({
    sorters: {
      initial: [
        {
          field: "date",
          order: "desc",
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
        minWidth: 350,
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
        slots={{
          toolbar: CustomToolbar,
        }}
        slotProps={{
          toolbar: {
            rowSelectionModel,
          },
        }}
        onRowSelectionModelChange={(newRowSelectionModel, details) => {
          console.log("newRowSelectionModel", newRowSelectionModel);
          setRowSelectionModel(newRowSelectionModel);
        }}
        rowSelectionModel={rowSelectionModel}
        autoHeight
      />
    </List>
  );
};

function CustomToolbar({ rowSelectionModel }: any) {
  const { refetch, data, } = useMany({
    queryOptions: {
      enabled: false,
    },
    resource: "invoices",
    ids: rowSelectionModel,
  });

  return (
    <GridToolbarContainer>
      {rowSelectionModel.length > 0 && (
        <Box sx={{ my: 1, display: "flex", gap: 1 }}>
          <DownloadInvoicePdf>
            {({ handlePrint, setContent }) => (
              <Button
                variant="contained"
                onClick={async () => {
                  if (
                    !isSame(
                      rowSelectionModel,
                      (data?.data ?? []).map((d: any) => d.id)
                    )
                  ) {
                    const res = await refetch();
                    setContent((res?.data?.data as any) ?? []);
                  } else {
                    setContent((data?.data as any) ?? []);
                  }
                  handlePrint();
                }}
              >
                ({rowSelectionModel.length}) PDF 
              </Button>
            )}
          </DownloadInvoicePdf>
          <DownloadInvoicePdf options={{ exchangeRate: false }}>
            {({ handlePrint, setContent }) => (
              <Button
                variant="contained"
                onClick={async () => {
                  if (
                    !isSame(
                      rowSelectionModel,
                      (data?.data ?? []).map((d: any) => d.id)
                    )
                  ) {
                    const res = await refetch();
                    setContent((res?.data?.data as any) ?? []);
                  } else {
                    setContent((data?.data as any) ?? []);
                  }
                  handlePrint();
                }}
              >
                ({rowSelectionModel.length}) PDF (No Exchange Rate){" "}
              </Button>
            )}
          </DownloadInvoicePdf>
        </Box>
      )}
    </GridToolbarContainer>
  );
}

const isSame = (array1: any, array2: any) => {
  return (
    array1.length === array2.length &&
    array1.every((value: any) => array2.includes(value))
  );
};
