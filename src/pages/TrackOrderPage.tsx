import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';

type Result = {status:string;total:number;currency:string};
export default function TrackOrderPage() {
 const [result,setResult]=useState<Result|null>(null);
 const [message,setMessage]=useState('Checking your order…');
 useEffect(()=>{
   const token=window.location.hash.slice(1);
   if (!token) {setMessage('Open the secure tracking link in your order confirmation email. If you need help, contact us.');return;}
   fetch('/api/guest-order-status',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token}),referrerPolicy:'no-referrer'})
    .then(async r=>{const data=await r.json();if(!r.ok) throw new Error(data.error || 'Tracking temporarily unavailable.');setResult(data);setMessage('');})
    .catch(e=>setMessage(e instanceof Error ? e.message : 'Tracking temporarily unavailable.'));
 },[]);
 return <><SEO title="Track your order" description="Check your order status" path="/track-order" noindex/><div className="container py-20"><div className="mx-auto max-w-md rounded-2xl border bg-card p-7"><h1 className="font-display text-3xl font-bold">Track your order</h1>{message && <p role="status" className="mt-5 text-muted-foreground">{message}</p>}{result && <div className="mt-5 space-y-3"><p>Order status: <strong>{result.status === 'pending' ? 'Awaiting EFT payment' : result.status}</strong></p><p>Total: <strong>R{Number(result.total).toFixed(2)}</strong></p><p className="text-sm text-muted-foreground">Payment is confirmed only after the matching deposit is verified.</p></div>}<p className="mt-6 text-sm"><a className="text-primary underline" href="mailto:support@peptide-south-africa.com">Contact support</a> · <Link className="text-primary underline" to="/shop">Continue shopping</Link></p></div></div></>;
}
