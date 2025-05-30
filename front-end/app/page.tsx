import Header from "./components/Header";
import ChatWidget from "./components/ChatWidget";
import HealthCard from "./components/HealthCard";
import AudioPlayer from "./components/AudioPlayer";

export default function Home() {
  const healthCards = [
    {
      title: "Healthy and fit",
      href: "/healthy-and-fit",
      bgColor: "bg-[#de2c38]",
      imageSrc: "/images/health-fitness.svg",
      subTopics: [
        { label: "Healthy eating", href: "/healthy-and-fit/healthy-eating" },
        { label: "Sleep well", href: "/healthy-and-fit/sleep-well" },
        { label: "Enjoy moving", href: "/healthy-and-fit/enjoy-moving" },
        {
          label: "Coping with illness",
          href: "/healthy-and-fit/coping-with-illness",
        },
        {
          label: "Smoking – alcohol – drugs – gambling",
          href: "/healthy-and-fit/addictions",
        },
      ],
    },
    {
      title: "Mentally strong",
      href: "/mentally-strong",
      bgColor: "bg-[#51c3ee]",
      imageSrc: "/images/mental-strength.svg",
      subTopics: [
        { label: "Less stress", href: "/mentally-strong/less-stress" },
        {
          label: "Standing up for yourself",
          href: "/mentally-strong/standing-up-for-yourself",
        },
        {
          label: "Dealing with setbacks",
          href: "/mentally-strong/dealing-with-setbacks",
        },
        { label: "Fit brain", href: "/mentally-strong/fit-brain" },
        {
          label: "Being happy with yourself",
          href: "/mentally-strong/being-happy-with-yourself",
        },
      ],
    },
    {
      title: "Meaningful life",
      href: "/meaningful-life",

      imageSrc: "/images/meaningful-life.svg",
      subTopics: [
        {
          label: "Thinking about your life",
          href: "/meaningful-life/thinking-about-your-life",
        },
        { label: "To work", href: "/meaningful-life/to-work" },
        { label: "To learn", href: "/meaningful-life/to-learn" },
        {
          label: "On your own two feet",
          href: "/meaningful-life/on-your-own-two-feet",
        },
        {
          label: "After retirement",
          href: "/meaningful-life/after-retirement",
        },
      ],
    },
  ];

  return (
    <>
      <Header />
      <main className="bg-[#f7f3ef]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center mb-8">
            <AudioPlayer />
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#2D2F6E] mb-4">
              Living healthier, step by step
            </h1>
            <p className="text-xl text-[#666666]">
              Everyone wants to be fit and healthy. You can do a lot about that.
              What step will you take?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {healthCards.map((card, index) => (
              <HealthCard key={index} {...card} />
            ))}
          </div>
        </div>
      </main>
      <ChatWidget />
    </>
  );
}
