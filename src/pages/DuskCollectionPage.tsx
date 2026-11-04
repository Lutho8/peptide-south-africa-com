import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowDown, ArrowRight, Moon, Plus, BookOpen, MessageCircle, Expand } from "lucide-react";
import SEO from "@/components/SEO";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useCart } from "@/context/CartContext";
import { getProductBySlug, type Product } from "@/data/products";
import ProductPicture from "@/components/ProductPicture";
import { vialFrame, VIAL_TEST_ID } from "@/lib/vialDesign";
import "./dusk.css";

const collection = [
  { slug: "epitalon", topic: "Circadian signalling", note: "The evening-rhythm question.", label: "Core DUSK research" },
  { slug: "pinealon", topic: "Neural resilience", note: "The cellular-resilience question.", label: "Core DUSK research" },
  { slug: "selank", topic: "Stress-response pathways", note: "The mental-noise question.", label: "Core DUSK research" },
  { slug: "semax", topic: "Neural adaptation", note: "A wider look at neuropeptide research.", label: "Extended collection" },
  { slug: "cerebrolysin", topic: "Peptide preparation research", note: "Explore the listing and its identity limitations.", label: "Extended collection" },
];
const charts = [
  { title: "The comparison", src: "/dusk/research-comparison.jpg", caption: "The founder’s comparison of three compounds. Half-lives, dose ranges and timing in this chart have not been independently validated for these products or for human use." },
  { title: "The blend hypothesis", src: "/dusk/combined-dusk-blend.jpg", caption: "An illustrative 5:1:1 model, not a clinically validated combination. The absorption curves, pre-sleep timing and cycle are hypotheses, not measured results or directions for use." },
  { title: "The sleep-stage model", src: "/dusk/dusk-timeline.jpg", caption: "A conceptual timeline. These charts do not establish changes in light sleep, deep sleep or REM. Sleep stages repeat through the night rather than following this single linear sequence." },
];
const faqs = [
  ["I’m new to peptides. Where do I begin?", "Peptides are short chains of amino acids. Researchers investigate how particular chains interact with biological signals. Begin with the compound identity, the study model and the limits of the evidence. A promising laboratory result is not a proven benefit in a person."],
  ["Is DUSK one blended product?", "No. DUSK is a collection of five separately sold research products. Epithalon, Pinealon and Selank appear in the founder’s blend hypothesis; Semax and Cerebrolysin extend the research collection. Ordering from this page does not create a premixed blend or a validated protocol."],
  ["Has the DUSK sleep hypothesis been clinically tested?", "No clinical validation is presented for this combination, ratio, timing or cycle. The founder’s personal observations cannot establish cause and effect, safety or effectiveness. No underlying personal sleep dataset is published on this page."],
  ["Can these products be used to treat sleep or anxiety problems?", "These listings are for lawful laboratory research only, not human use or consumption. They are not offered as sleep or anxiety treatments. Persistent sleep or anxiety symptoms should be discussed with a qualified healthcare professional."],
  ["What does the price include?", "The single-vial base price is shown for each compound. The recommended 3-pack saves 15%; a 5-pack saves 20%. Pack totals use the same whole-rand rounding as the rest of our store. Each vial contains the stated strength; pack size changes the number of vials, not their strength. BAC water is sold separately. Delivery is R89 below R1,500, with free delivery on merchandise totals of R1,500 or more after discounts and paid add-ons."],
  ["What documentation is available?", "Matching-strength analytical documentation for these new listings is pending. No purity, sterility or clinical-equivalence claim is made here. Review each product record and ask us about identity and batch documentation before ordering."],
];

export function DuskProductCard({product,topic,note,label}:{product:Product;topic:string;note:string;label:string}) {
  const [selectedPack,setSelectedPack]=useState<1|3|5>(3);
  const {addToCart}=useCart();
  const navigate=useNavigate();
  const {frame,bar,dot}=vialFrame("md");
  const selected=product.variants!.find(variant=>variant.pack===selectedPack)!;
  const savings=product.price*selectedPack-selected.price;
  const money=(value:number)=>`R${value.toLocaleString("en-ZA",{maximumFractionDigits:0})}`;
  return <article data-testid={`dusk-product-${product.slug}`}>
    <Link to={`/product/${product.slug}`} className={frame} data-testid={VIAL_TEST_ID}><span aria-hidden className={bar}/><span aria-hidden className={dot}/><ProductPicture src={product.image} sources={product.imageSources} alt={product.name} loading="lazy" className="h-full w-full object-cover" /></Link>
    <div className="dusk-product-copy"><p className="dusk-eyebrow">{label}</p><h3><Link to={`/product/${product.slug}`}>{product.name}</Link></h3><p className="dusk-product-topic">{topic}</p><p>{note}</p>
      <p className="dusk-base-price">Single-vial price: {money(product.price)}</p>
      <div className="dusk-pack-options" role="group" aria-label={`Choose a pack for ${product.name}`}>
        {([3,5,1] as const).map(pack=>{const variant=product.variants!.find(v=>v.pack===pack)!;return <button key={pack} type="button" aria-pressed={selectedPack===pack} onClick={()=>setSelectedPack(pack)} aria-label={`${product.name} ${variant.label}`}><span><strong>{variant.label}</strong><small>{pack===3?"Recommended · 15% off":pack===5?"Best value · 20% off":"One vial"}</small></span><b>{money(variant.price)}</b></button>;})}
      </div>
      <p className="dusk-price" aria-live="polite">{money(selected.price)}<span> / {selected.label}</span></p>
      <p className="dusk-pack-saving">{savings>0 ? `Save ${money(savings)} · R${(selected.price/selectedPack).toFixed(2)} per vial · ${product.strength} each` : `1 vial · ${product.strength} per vial`}</p>
      <p className="dusk-delivery">{selected.price>=1500 ? 'Free delivery included' : `Delivery R89 · Total ${money(selected.price+89)}`} · EFT payment</p>
      <button type="button" className="dusk-button" onClick={()=>addToCart(product,{variantLabel:selected.label,unitPrice:selected.price})} aria-label={`Add ${product.name} ${selected.label} to cart`}>Add {selected.label} <Plus size={17}/></button><button type="button" className="dusk-buy-now" onClick={()=>{addToCart(product,{variantLabel:selected.label,unitPrice:selected.price,silent:true});navigate('/checkout');}}>Buy {selected.label} now <ArrowRight size={16}/></button><Link className="dusk-detail-link" to={`/product/${product.slug}`}>View product details <ArrowRight size={14}/></Link><Link className="dusk-detail-link" to={`/blog/${product.slug === "epitalon" ? "epithalon" : product.slug}-peptide-research-south-africa`}>Read the research guide <ArrowRight size={14}/></Link><p className="dusk-documentation">Matching-strength documentation pending</p>
    </div>
  </article>;
}

export default function DuskCollectionPage() {
  const [activeChart, setActiveChart] = useState(0);
  const [enlarged, setEnlarged] = useState(false);
  const chart = charts[activeChart];
  return <div className="dusk-page">
    <SEO title="DUSK Collection — A Question About Rest" description="Discover the story behind DUSK. Explore Epithalon, Pinealon, Selank, Semax and Cerebrolysin, with research context, clear limitations and single-vial ZAR prices." path="/dusk" image={getProductBySlug("selank")?.image} />
    <section className="dusk-hero">
      <div className="dusk-wrap dusk-hero-grid">
        <div>
          <Link to="/shop?category=Longevity" className="dusk-eyebrow">Wellness &amp; Longevity / New collection</Link>
          <p className="dusk-wordmark">DUSK</p>
          <h1>The day slows down.<br /><em>The questions begin.</em></h1>
          <p className="dusk-intro">What connects stress, our internal clock and the way we rest? A personal question became a closer look at peptide research.</p>
          <div className="dusk-actions"><a className="dusk-button" href="#collection">Choose your pack <ArrowRight size={18} /></a><a className="dusk-text-link" href="#story">Read the story <ArrowDown size={16} /></a></div>
          <p className="dusk-small dusk-hero-notice">Five separate research products. 3-packs save 15%; 5-packs save 20%.<br />Laboratory research only · not for human use.</p>
        </div>
        <div className="dusk-orbit" aria-hidden="true"><div className="dusk-orbit-ring" /><div className="dusk-moon" /><span className="dusk-orbit-label">A different perspective<br />on the evening.</span><span className="dusk-orbit-foot">CURIOSITY MEETS RESEARCH / 01</span></div>
      </div>
    </section>
    <div className="dusk-index"><div className="dusk-wrap"><a href="#collection">01 / Shop DUSK</a><a href="#story">02 / The story</a><a href="#research">03 / The evidence</a><a href="#charts">04 / The charts</a></div></div>
    <section id="collection" className="dusk-shop dusk-section"><div className="dusk-wrap">
      <div className="dusk-section-head"><div><p className="dusk-eyebrow">Meet the DUSK Collection</p><h2>One collection.<br /><em>Five lines of enquiry.</em></h2></div><p>Separate vials. Clear strengths. Choose a recommended 3-pack, a 5-pack for the best price per vial, or a single vial. No premixed DUSK blend is offered.</p></div>
      <div className="dusk-products">{collection.map(item=>{const product=getProductBySlug(item.slug);return product ? <DuskProductCard key={item.slug} product={product} topic={item.topic} note={item.note} label={item.label} /> : null;})}</div>
      <div className="dusk-mix"><div><p className="dusk-eyebrow">Your research, your selection</p><h3>Prefer a mixed 5-pack?</h3><p>Choose five eligible vials across the catalogue and save 20% with the existing Pick &amp; Mix offer.</p></div><Link className="dusk-button" to="/build-your-stack">Build your 5-pack <ArrowRight size={17}/></Link></div>
      <p className="dusk-shop-foot">Prices include VAT. BAC water sold separately. Delivery R89 below R1,500; free from R1,500 after discounts and paid add-ons. Research use only.</p>
    </div></section>
    <section id="story" className="dusk-wrap dusk-section dusk-story">
      <div><p className="dusk-eyebrow">A note from Lutho / Founder</p><h2>A personal question.<br /><em>A closer look<br />at rest.</em></h2></div>
      <div className="dusk-prose"><p>“I started paying closer attention to my sleep. Over three months of personal tracking, I found myself asking what happens before the night begins — and how daytime stress follows us into it.”</p><p>That curiosity became DUSK: a collection shaped by reading about circadian rhythms, stress signalling and neural resilience.</p><p>“My hypothesis centres on the transition into sleep. Could that window help us understand what follows? It is a question I’m exploring, not a result I can promise.”</p><p className="dusk-signature">Lutho <span>Founder, Peptide South Africa</span></p><div className="dusk-note">Every person is different. Personal tracking and blood markers need clinical context; they cannot establish a safe peptide dose or prove a treatment works.</div></div>
    </section>
    <section id="research" className="dusk-evidence dusk-section"><div className="dusk-wrap">
      <div className="dusk-section-head"><div><p className="dusk-eyebrow">Start with what is known</p><h2>Three research threads.<br /><em>Different levels of evidence.</em></h2></div><p>The original DUSK idea brings together Epithalon, Pinealon and Selank. Their individual studies do not validate a combined sleep protocol.</p></div>
      <div className="dusk-evidence-grid">
        <article><span className="dusk-pill">Animal research</span><span className="dusk-number">01</span><h3>Epithalon</h3><p className="dusk-card-sub">The internal-clock question</p><p>In older rhesus monkeys, researchers reported changes in evening melatonin and cortisol rhythms. That does not demonstrate better sleep in people.</p><a href="https://pubmed.ncbi.nlm.nih.gov/11550036/" target="_blank" rel="noreferrer">Read the original study <ArrowRight size={15} /></a></article>
        <article><span className="dusk-pill">Limited human research</span><span className="dusk-number">02</span><h3>Selank</h3><p className="dusk-card-sub">The stress-response question</p><p>A small study of 62 patients compared Selank with medazepam for anxiety symptoms. It was not a trial of DUSK or proof of improved sleep architecture.</p><a href="https://pubmed.ncbi.nlm.nih.gov/18454096/" target="_blank" rel="noreferrer">Read the original study <ArrowRight size={15} /></a></article>
        <article><span className="dusk-pill">Cell &amp; animal research</span><span className="dusk-number">03</span><h3>Pinealon</h3><p className="dusk-card-sub">The neural-resilience question</p><p>Laboratory work explores oxidative stress and cell survival. Direct evidence for sleep improvement remains limited; a melatonin-support claim is not established by this study.</p><a href="https://pubmed.ncbi.nlm.nih.gov/21978084/" target="_blank" rel="noreferrer">Read the original study <ArrowRight size={15} /></a></article>
      </div>
    </div></section>
    <section id="charts" className="dusk-wrap dusk-section">
      <div className="dusk-section-head"><div><p className="dusk-eyebrow">Inside the founder’s notebook</p><h2>See the thinking.<br /><em>Keep the limits in view.</em></h2></div><p>The supplied charts document an exploratory model. Their dose, half-life, route and cycle details are unverified and should not be followed as instructions.</p></div>
      <div className="dusk-chart-tabs" role="group" aria-label="Research chart selection">{charts.map((c,i)=><button key={c.src} type="button" aria-pressed={activeChart===i} onClick={()=>setActiveChart(i)}>{String(i+1).padStart(2,"0")} / {c.title}</button>)}</div>
      <figure className="dusk-chart"><button type="button" className="dusk-chart-image" onClick={()=>setEnlarged(true)} aria-label={`Enlarge ${chart.title}`}><img src={chart.src} width="2048" height="1374" loading="lazy" alt={`${chart.title}: founder-supplied, unvalidated research hypothesis chart`} /><span><Expand size={16} /> View full size</span></button><figcaption><BookOpen size={21} /><p>{chart.caption}</p></figcaption></figure>
      <Dialog open={enlarged} onOpenChange={setEnlarged}><DialogContent className="max-h-[95vh] max-w-[96vw] overflow-auto"><DialogTitle>{chart.title} — unvalidated founder model</DialogTitle><img src={chart.src} alt={`${chart.title} full-size research hypothesis`} /><p className="text-sm">{chart.caption}</p></DialogContent></Dialog>
    </section>
    <section className="dusk-wrap dusk-section dusk-faq"><div><p className="dusk-eyebrow">A clearer starting point</p><h2>Good questions<br /><em>come first.</em></h2><a className="dusk-whatsapp" href="https://wa.me/27721242377?text=Hi%20Lutho%2C%20I%27m%20exploring%20the%20DUSK%20Collection.%20Can%20you%20help%20with%20product%20and%20batch%20documentation%3F" target="_blank" rel="noreferrer"><MessageCircle size={20}/> Ask about the collection <ArrowRight size={17}/></a></div><div>{faqs.map(([question,answer])=><details key={question}><summary>{question}<Plus size={18}/></summary><p>{answer}</p></details>)}</div></section>
    <div className="dusk-mobile-shop"><a href="#collection">Choose your DUSK pack <ArrowRight size={17}/></a><span>3-pack saves 15% · 5-pack saves 20%</span></div>
    <section className="dusk-closing"><div className="dusk-wrap"><Moon size={32}/><h2>Stay curious.<br /><em>Follow the evidence.</em></h2><p>DUSK begins with a question. Explore the research, understand its limits and review the product records.</p><a href="#collection" className="dusk-button">Explore DUSK <ArrowRight size={18}/></a><p className="dusk-small">Not medical advice. Supplied for lawful laboratory research only.<br />Not for human use or consumption.</p></div></section>
  </div>;
}
