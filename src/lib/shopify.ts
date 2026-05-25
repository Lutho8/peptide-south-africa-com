// Shopify Storefront API client + cart mutations.
// Live storefront wiring — products and cart sourced from Shopify in real time.
import { toast } from "sonner";

export const SHOPIFY_API_VERSION = "2025-07";
export const SHOPIFY_STORE_PERMANENT_DOMAIN = "tide-shop-clone-8nn8g.myshopify.com";
export const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
export const SHOPIFY_STOREFRONT_TOKEN = "e48e7e734bf23205d246c15d7c14241d";

export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyVariantNode {
  id: string;
  title: string;
  price: ShopifyMoney;
  availableForSale: boolean;
  selectedOptions: Array<{ name: string; value: string }>;
}

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    priceRange: { minVariantPrice: ShopifyMoney };
    images: { edges: Array<{ node: { url: string; altText: string | null } }> };
    variants: { edges: Array<{ node: ShopifyVariantNode }> };
    options: Array<{ name: string; values: string[] }>;
  };
}

export const PRODUCTS_QUERY = /* GraphQL */ `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          description
          handle
          priceRange { minVariantPrice { amount currencyCode } }
          images(first: 5) { edges { node { url altText } } }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price { amount currencyCode }
                availableForSale
                selectedOptions { name value }
              }
            }
          }
          options { name values }
        }
      }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  query ProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      description
      handle
      priceRange { minVariantPrice { amount currencyCode } }
      images(first: 10) { edges { node { url altText } } }
      variants(first: 25) {
        edges {
          node {
            id
            title
            price { amount currencyCode }
            availableForSale
            selectedOptions { name value }
          }
        }
      }
      options { name values }
    }
  }
`;

export const CART_QUERY = /* GraphQL */ `
  query cart($id: ID!) {
    cart(id: $id) { id totalQuantity }
  }
`;

export const CART_CREATE_MUTATION = /* GraphQL */ `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        lines(first: 100) {
          edges { node { id merchandise { ... on ProductVariant { id } } } }
        }
      }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_ADD_MUTATION = /* GraphQL */ `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        lines(first: 100) {
          edges { node { id merchandise { ... on ProductVariant { id } } } }
        }
      }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_UPDATE_MUTATION = /* GraphQL */ `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_REMOVE_MUTATION = /* GraphQL */ `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id }
      userErrors { field message }
    }
  }
`;

export async function storefrontApiRequest<T = any>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<{ data?: T; errors?: Array<{ message: string }> } | undefined> {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (response.status === 402) {
    toast.error("Shopify: Payment required", {
      description:
        "Shopify API access requires an active billing plan. Visit https://admin.shopify.com to upgrade.",
    });
    return;
  }

  if (!response.ok) {
    throw new Error(`Shopify HTTP error ${response.status}`);
  }

  const data = await response.json();
  if (data.errors) {
    throw new Error(`Shopify: ${data.errors.map((e: any) => e.message).join(", ")}`);
  }
  return data;
}

export function formatCheckoutUrl(checkoutUrl: string): string {
  try {
    const url = new URL(checkoutUrl);
    url.searchParams.set("channel", "online_store");
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}

export function isCartNotFoundError(
  userErrors: Array<{ field: string[] | null; message: string }>,
): boolean {
  return userErrors.some(
    (e) =>
      e.message.toLowerCase().includes("cart not found") ||
      e.message.toLowerCase().includes("does not exist"),
  );
}
