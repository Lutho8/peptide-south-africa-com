import type { BlogPost } from "./types";
import { post as p1 } from "./posts/peptide-protocol-tracker";
import { post as p2 } from "./posts/bpc-157-protocol-cape-town";
import { post as p3 } from "./posts/how-to-track-peptide-cycles";
import { post as p4 } from "./posts/peptide-bloodwork-markers-sa";
import { post as p5 } from "./posts/peptide-workshop-cape-town";
import { post as p6 } from "./posts/longevity-biohacker-cape-town";
import { post as p7 } from "./posts/bpc-157-tb-500-stack-guide";
import { post as p8 } from "./posts/cjc-1295-ipamorelin-protocol";
import { post as p9 } from "./posts/peptide-community-south-africa";
import { post as p10 } from "./posts/research-peptides-cape-town";
import { post as p11 } from "./posts/bpc-157-south-africa";
import { post as p12 } from "./posts/buy-peptides-cape-town";
import { post as p13 } from "./posts/peptide-tracker-app";
import { post as p14 } from "./posts/peptide-dosage-calculator";
import { post as p15 } from "./posts/tirzepatide-vs-semaglutide-comparison";
import { post as p16 } from "./posts/retatrutide-triumph-1-phase-3-results";

export const posts: BlogPost[] = [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16];


export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getRelated(slugs: string[]): BlogPost[] {
  return slugs.map((s) => posts.find((p) => p.slug === s)).filter((p): p is BlogPost => !!p);
}
