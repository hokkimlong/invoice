import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useDataGrid,
} from "@refinedev/mui";
import React from "react";

export const InvoiceList = () => {
  const { dataGridProps } = useDataGrid({});

  const columns = React.useMemo<GridColDef[]>(
    () => [
      {
        field: "id",
        headerName: "ID",
        type: "number",
        minWidth: 50,
      },
      {
        field: "invoice_number",
        flex: 1,
        headerName: "Invoice Number",
        minWidth: 100,
      },
      {
        field: "customer",
        flex: 1,
        headerName: "Customer",
        minWidth: 200,
        renderCell: function render({ row }) {
          return (
            <div>
              <div>{`${row.customer?.name} - ${row.customer?.phone}`}</div>
              <div>{row.customer.address}</div>
            </div>
          );
        },
      },
      {
        field: "products",
        flex: 1,
        headerName: "Product",
        minWidth: 200,
        renderCell: function render({ row }) {
          return (
            <div>
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
              <EditButton hideText recordItemId={row.id} />
              <ShowButton hideText recordItemId={row.id} />
              <DeleteButton hideText recordItemId={row.id} />
            </>
          );
        },
        align: "center",
        headerAlign: "center",
        minWidth: 80,
      },
    ],
    []
  );

  return (
    <List>
      <DataGrid {...dataGridProps} columns={columns} autoHeight />
    </List>
  );
};
