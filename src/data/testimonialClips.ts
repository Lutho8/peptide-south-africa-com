export type TestimonialClip = {
  id: string;
  src: string;
  caption: string;
  tag: string;
};

export const TESTIMONIAL_CLIPS: TestimonialClip[] = [
  {
    id: "recovery",
    src: "https://player.vimeo.com/progressive_redirect/playback/1197885475/rendition/540p/file.mp4%20(540p).mp4?loc=external&signature=a0fce7e26dc59facdb80bc6c56a5895113743940b784b9b6d60c74628763c8a1",
    tag: "Recovery",
    caption: "Faster bounce-back between sessions",
  },
  {
    id: "longevity",
    src: "https://player.vimeo.com/progressive_redirect/playback/1198867017/rendition/360p/file.mp4%20%28360p%29.mp4?loc=external&signature=4b05aa047ec26a22abab970319ba306b9eaea53446dc535ea2886aeb688e850f",
    tag: "Longevity",
    caption: "Daily protocols for the long game",
  },
  {
    id: "weight-loss",
    src: "https://player.vimeo.com/progressive_redirect/playback/1197885503/rendition/540p/file.mp4%20(540p).mp4?loc=external&signature=63ade134ad600c601acbe85f9dab5c4ca74f6a810b0d24e8f8e5e3ac79c13884",
    tag: "Weight loss",
    caption: "Visceral fat loss without the guesswork",
  },
  {
    id: "performance",
    src: "https://player.vimeo.com/progressive_redirect/playback/1198867018/rendition/540p/file.mp4%20%28540p%29.mp4?loc=external&signature=3dfd6e072f8aa481e039919736121ac076907ea75363e54e9f5e6865d70e9ff1",
    tag: "Performance",
    caption: "Train harder, recover smarter",
  },
  {
    id: "sleep",
    src: "https://player.vimeo.com/progressive_redirect/playback/1197928742/rendition/540p/file.mp4%20%28540p%29.mp4?loc=external&signature=78ef70209070004774f30bc4532296b564b11d660adac0d7cd3986f1746c97a7",
    tag: "Sleep & recovery",
    caption: "Deeper sleep, sharper mornings",
  },
];
