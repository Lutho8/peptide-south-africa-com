const STORAGE_SLOT = "psa_partner_attribution_v1";
export type PartnerAttribution={code:string;campaign:string|null;method:"entered_code"|"referral_click"|"qr"};
export function capturePartnerAttribution():PartnerAttribution|null{
  if(typeof window==="undefined")return null;
  const params=new URLSearchParams(window.location.search); const raw=params.get("partner");
  if(raw&&/^[A-Za-z0-9_-]{3,80}$/.test(raw)){const value={code:raw.toUpperCase(),campaign:params.get("campaign")?.slice(0,64)||null,method:(params.get("via")==="qr"?"qr":"referral_click") as PartnerAttribution["method"]}; try{localStorage.setItem(STORAGE_SLOT,JSON.stringify(value));}catch{/* storage can be blocked */} return value;}
  try{const stored=JSON.parse(localStorage.getItem(STORAGE_SLOT)||"null"); return stored&&/^[A-Z0-9_-]{3,80}$/.test(stored.code)?stored:null;}catch{return null;}
}
