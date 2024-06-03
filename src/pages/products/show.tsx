import { Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useShow } from "@refinedev/core";
import { Show, TextFieldComponent as TextField } from "@refinedev/mui";

export const ProductShow = () => {
  const { queryResult } = useShow({});
  const { data, isLoading } = queryResult;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Stack gap={1}>
        <Typography variant="body1" fontWeight="bold">
          {"ID"}
        </Typography>
        <TextField value={record?.id} />
        <Typography variant="body1" fontWeight="bold">
          {"Product Name"}
        </Typography>
        <TextField value={record?.name} />
        <Typography variant="body1" fontWeight="bold">
          {"Variants"}
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{"Name"}</TableCell>
              <TableCell>{"Unit"}</TableCell>
              <TableCell>{"Price"}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {record?.variants.map((variant: any) => (
              <TableRow key={variant.id}>
                <TableCell>{variant.name}</TableCell>
                <TableCell>{variant.unit}</TableCell>
                <TableCell>{variant.price}$</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Stack>
    </Show>
  );
};
