import Big from "big.js";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import PizZipUtils from "pizzip/utils";
import currencyFormatter from "currency-formatter";
import { saveAs } from "file-saver";

export type Invoice = {
  date: Date;
  exchange_rate: number;
  invoice_number: string;
  customer: {
    name: string;
    address: string;
    phone: string;
    sale_name: string;
    taxi_phone: string;
  };
  products: [
    {
      product: {
        name: string;
      };
      quantity: number;
      variant: {
        name: string;
        price: string;
        unit: string;
      };
      variantPrice: string;
    }
  ];
};

export type InvoiceOptions = {
  exchangeRate: boolean;
};

export const getInvoiceData = (
  invoice: Invoice,
  options: InvoiceOptions = { exchangeRate: true }
) => {
  let totalPrice = new Big(0);
  const products = invoice.products.map((product) => {
    const variantPrice = product.variantPrice ?? product.variant.price;
    const productTotalPrice = new Big(variantPrice).times(product.quantity);
    totalPrice = totalPrice.add(productTotalPrice);
    return {
      product_name: product.product.name,
      variant_name: product.variant.name,
      variant_unit: product.variant.unit,
      variant_price: formatPrice(new Big(variantPrice)),
      quantity: `${product.quantity}`,
      total_price: formatPrice(productTotalPrice),
    };
  });

  if (products.length < 8) {
    const diff = 8 - products.length;
    for (let i = 0; i < diff; i++) {
      products.push({
        product_name: "",
        variant_name: "",
        variant_unit: "",
        variant_price: "",
        quantity: "",
        total_price: "",
      });
    }
  }

  const date = new Date(invoice.date);

  return {
    invoice_number: invoice.invoice_number,
    sale_name: invoice.customer.sale_name,
    customer_name: invoice.customer.name,
    customer_phone: invoice.customer.phone,
    customer_address: invoice.customer.address,
    exchange_rate: !options?.exchangeRate ? "" : invoice.exchange_rate || "",
    taxi_phone: invoice.customer.taxi_phone,
    products: products,
    total_price_usd: formatPrice(totalPrice),
    total_price_riel: !options?.exchangeRate
      ? ""
      : invoice.exchange_rate
      ? formatPrice(totalPrice.times(invoice.exchange_rate), true)
      : "",
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
};

export const downloadInvoiceDocx = async (
  invoice: Invoice,
  options: InvoiceOptions = { exchangeRate: true }
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

    const data = getInvoiceData(invoice, options);

    doc.render(data);

    const out = doc.getZip().generate({
      type: "blob",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }); //Output the document using Data-URI
    saveAs(out, `${data.customer_name}(${data.invoice_number}).docx`);
  });
};

export const formatPrice = (price: any, riel = false) => {
  const precision = price.toNumber() % 1 === 0 ? 0 : 2;
  return currencyFormatter.format(price.toNumber(), {
    symbol: riel ? "៛" : "$",
    decimal: ".",
    thousand: ",",
    precision,
    format: "%v%s", // %s is the symbol and %v is the value
  });
};

function loadFile(url: any, callback: any) {
  PizZipUtils.getBinaryContent(url, callback);
}
