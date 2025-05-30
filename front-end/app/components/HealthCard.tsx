import Link from "next/link";
import Image from "next/image";

interface SubTopic {
  label: string;
  href: string;
}

interface HealthCardProps {
  title: string;
  href: string;
  imageSrc: string;
  subTopics: SubTopic[];
}

export default function HealthCard({
  title,
  href,
  imageSrc,
  subTopics,
}: HealthCardProps) {
  return (
    <div className="flex flex-col">
      <Link href={href} className="rounded-lg transition-transform  group">
        <div className="w-100 h-70 relative">
          <Image src={imageSrc} alt={title} fill className="object-contain" />
        </div>
        <h3 className="text-black text-xl font-semibold flex items-center mb-7">
          {title}
          <svg
            className="w-5 h-5 ml-2 transform transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </h3>
      </Link>
      <div className="flex flex-wrap gap-2">
        {subTopics.map((topic, index) => (
          <Link
            key={index}
            href={topic.href}
            className="inline-flex items-center px-4 py-2 rounded-full border border-[#000000] text-sm text-[#333333] bg-[#F9FAFB] transition-colors group"
          >
            {topic.label}
            <svg
              className="w-4 h-4 ml-1 transform transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
