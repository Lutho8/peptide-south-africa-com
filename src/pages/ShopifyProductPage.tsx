import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShopifyCartDrawer from "@/components/shopify/ShopifyCartDrawer";
import { PRODUCT_BY_HANDLE_QUERY, storefrontApiRequest } from "@/lib/shopify";
import { useShopifyCartStore } from "@/stores/shopifyCartStore";

export default function ShopifyProductPage() {
  const { handle } = useParams<{ handle: string }>();
  const addItem = useShopifyCartStore((s) => s.addItem);
  const cartLoading = useShopifyCartStore((s) => s.isLoading);

  const { data, isLoading } = useQuery({
    queryKey: ["shopify-product", handle],
    queryFn: async () => {
      const res = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
      return res?.data?.productByHandle;
    },
    enabled: !!handle,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground mb-4">Product not found.</p>
        <Link to="/store">
          <Button variant="outline">Back to store</Button>
        </Link>
      </div>
    );
  }

  const variant = data.variants.edges[0]?.node;
  const image = data.images.edges[0]?.node;
  const productWrapper = { node: data };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/store"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to store
        </Link>
        <ShopifyCartDrawer />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="aspect-square bg-muted rounded-lg overflow-hidden">
          {image && (
            <img
              src={image.url}
              alt={image.altText || data.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-primary">{data.title}</h1>
          {variant && (
            <p className="text-3xl font-bold mt-4">
              {variant.price.currencyCode} {parseFloat(variant.price.amount).toFixed(2)}
            </p>
          )}
          <p className="mt-6 whitespace-pre-line text-muted-foreground">{data.description}</p>
          <Button
            size="lg"
            className="mt-8 w-full md:w-auto"
            disabled={!variant || !variant.availableForSale || cartLoading}
            onClick={() =>
              variant &&
              addItem({
                product: productWrapper as any,
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
      </div>
    </div>
  );
}
