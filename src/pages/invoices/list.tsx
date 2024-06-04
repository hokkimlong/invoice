import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  useDataGrid,
} from "@refinedev/mui";
import React from "react";

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
        flex: 1,
        headerName: "Invoice Number",
        minWidth: 50,
      },
      {
        field: "date",
        flex: 1,
        headerName: "Date",
        minWidth: 50,
        renderCell: function render({ row }) {
          return <DateField value={row.date ?? new Date()} />;
        },
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
              <EditButton hideText recordItemId={row.id} />
              {/* <ShowButton hideText recordItemId={row.id} /> */}
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
      <DataGrid
        {...dataGridProps}
        getRowHeight={() => "auto"}
        columns={columns}
        autoHeight
      />
    </List>
  );
};
