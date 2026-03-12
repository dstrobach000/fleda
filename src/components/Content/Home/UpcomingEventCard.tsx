import Image from "next/image";
import GlowButton from "@/components/BuildingBlocks/Buttons/GlowButton";
import { formatProgramEventDate } from "@/utils/dateFormat";

export type UpcomingEventCardItem = {
  isoDate: string;
  time: string;
  performers: string;
  imageSrc: string;
  buttonLabel?: string;
};

type UpcomingEventCardProps = {
  item: UpcomingEventCardItem;
};

export default function UpcomingEventCard({ item }: UpcomingEventCardProps) {
  return (
    <article className="w-full">
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <Image
          src={item.imageSrc}
          alt={item.performers}
          fill
          sizes="(min-width: 768px) 25vw, 50vw"
          className="object-cover"
        />

        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <GlowButton
              link="#"
              glowColor="bg-orange-500"
              floating={false}
              className="!px-4 !py-2 text-sm sm:text-base whitespace-nowrap"
            >
              {item.buttonLabel ?? "PŘEDPRODEJ"}
            </GlowButton>
          </div>
        </div>
      </div>

      <div className="mt-3 text-left text-sm font-light leading-tight text-black sm:text-base">
        <p>{item.performers}</p>
        <p className="mt-1">
          {formatProgramEventDate(item.isoDate)}
          {item.time ? `, ${item.time}` : ""}
        </p>
      </div>
    </article>
  );
}
