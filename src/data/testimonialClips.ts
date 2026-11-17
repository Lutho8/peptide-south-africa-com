export type TestimonialClip = {
  id: string;
  src: string;
  caption: string;
  tag: string;
};

export const TESTIMONIAL_CLIPS: TestimonialClip[] = [
  {
    id: "recovery",
    src: "/videos/testimonials/recovery-v1.mp4",
    tag: "Personal experience",
    caption: "A customer reflects on changing their approach",
  },
  {
    id: "longevity",
    src: "/videos/testimonials/longevity-v1.mp4",
    tag: "Busy routines",
    caption: "A customer talks about balancing two jobs",
  },
  {
    id: "weight-loss",
    src: "/videos/testimonials/weight-loss-v2.mp4",
    tag: "Training & sleep",
    caption: "An archive recording from a brand partnership",
  },
  {
    id: "performance",
    src: "/videos/testimonials/performance-v1.mp4",
    tag: "Customer process",
    caption: "A customer recalls their intake and delivery",
  },
  {
    id: "sleep",
    src: "/videos/testimonials/sleep-v1.mp4",
    tag: "Postpartum experience",
    caption: "A customer reflects on life after pregnancy",
  },
];
