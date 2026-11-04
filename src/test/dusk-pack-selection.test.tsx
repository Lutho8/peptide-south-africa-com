import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { getProductBySlug } from "@/data/products";
import { DuskProductCard } from "@/pages/DuskCollectionPage";
const { addToCart }=vi.hoisted(()=>({addToCart:vi.fn()}));
vi.mock("@/context/CartContext",()=>({useCart:()=>({addToCart})}));
describe("DUSK pack purchasing",()=>{
  it("recommends the 3-pack and adds the selected 5-pack at its authoritative price",()=>{
    const product=getProductBySlug("selank")!;
    render(<MemoryRouter><DuskProductCard product={product} topic="Stress-response research" note="Research context" label="Core DUSK research" /></MemoryRouter>);
    expect(screen.getByRole("button",{name:"Selank 10 mg 3-Pack"})).toHaveAttribute("aria-pressed","true");
    fireEvent.click(screen.getByRole("button",{name:"Add Selank 10 mg 3-Pack to cart"}));
    expect(addToCart).toHaveBeenLastCalledWith(product,{variantLabel:"3-Pack",unitPrice:2037});
    fireEvent.click(screen.getByRole("button",{name:"Selank 10 mg 5-Pack"}));
    expect(screen.getByRole("button",{name:"Selank 10 mg 5-Pack"})).toHaveAttribute("aria-pressed","true");
    fireEvent.click(screen.getByRole("button",{name:"Add Selank 10 mg 5-Pack to cart"}));
    expect(addToCart).toHaveBeenLastCalledWith(product,{variantLabel:"5-Pack",unitPrice:3196});
    fireEvent.click(screen.getByRole("button",{name:"Buy 5-Pack now"}));
    expect(addToCart).toHaveBeenLastCalledWith(product,{variantLabel:"5-Pack",unitPrice:3196,silent:true});
    fireEvent.click(screen.getByRole("button",{name:"Selank 10 mg Single Vial"}));
    fireEvent.click(screen.getByRole("button",{name:"Add Selank 10 mg Single Vial to cart"}));
    expect(addToCart).toHaveBeenLastCalledWith(product,{variantLabel:"Single Vial",unitPrice:799});
  });
});
