import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ShopifyCartDrawer from "@/components/shopify/ShopifyCartDrawer";
import { PRODUCTS_QUERY, storefrontApiRequest, type ShopifyProduct } from "@/lib/shopify";
import { useShopifyCartStore } from "@/stores/shopifyCartStore";

async function fetchProducts(): Promise<ShopifyProduct[]> {
  const data = await storefrontApiRequest(PRODUCTS_QUERY, { first: 50 });
  return data?.data?.products?.edges ?? [];
}

export default function ShopifyStorePage() {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["shopify-products"],
    queryFn: fetchProducts,
  });
  const addItem = useShopifyCartStore((s) => s.addItem);
  const cartLoading = useShopifyCartStore((s) => s.isLoading);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold text-primary">Live Store</h1>
          <p className="text-muted-foreground mt-2">
            Products fetched live from Shopify · Prices in ZAR
          </p>
        </div>
        <ShopifyCartDrawer />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="text-center py-24 text-destructive">
          Failed to load products. Please try again.
        </div>
      )}

      {!isLoading && !error && products && products.length === 0 && (
        <div className="text-center py-24 border-2 border-dashed rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">No products found</h2>
          <p className="text-muted-foreground">
            Add your products in the Shopify admin (BPC-157, TB-500, CJC-1295 + Ipamorelin, GHK-Cu,
            Recovery Protocol Bundle) and they'll appear here automatically.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products?.map((product) => {
          const node = product.node;
          const variant = node.variants.edges[0]?.node;
          const image = node.images.edges[0]?.node;
          const price = node.priceRange.minVariantPrice;
          return (
            <Card key={node.id} className="overflow-hidden flex flex-col">
              <Link to={`/store/${node.handle}`} className="block aspect-square bg-muted">
                {image && (
                  <img
                    src={image.url}
                    alt={image.altText || node.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                )}
              </Link>
              <CardContent className="p-4 flex flex-col flex-1">
                <Link to={`/store/${node.handle}`}>
                  <h3 className="font-semibold text-lg hover:text-primary line-clamp-2">
                    {node.title}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1 flex-1">
                  {node.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-bold">
                    {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
                  </span>
                  <Button
                    size="sm"
                    disabled={!variant || !variant.availableForSale || cartLoading}
                    onClick={() =>
                      variant &&
                      addItem({
                        product,
                        variantId: variant.id,
                        variantTitle: variant.title,
                        price: variant.price,
                        quantity: 1,
                        selectedOptions: variant.selectedOptions || [],
                      })
                    }
                  >
                    {cartLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add to cart"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
